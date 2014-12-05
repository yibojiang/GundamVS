

public var standAnimation:AnimationClip;
public var flyAnimation:AnimationClip;

var walkSpeed:float=30.0;
var flySpeed:float=80.0;
var upSpeed:float=30.0;
var rotSpeedY:float=50;
var rotateSpeed = 800.0;
var enemyForLooking:GameObject;
var enemyFly:GameObject;
var mCamera:GameObject;
var lookingAtEnemy:boolean=false;
var gundamModel:GameObject;
var booster:GameObject;
var speedLine:GameObject;
var boosterFlames:ParticleEmitter;
private var boosterTrail:TrailRenderer;

var joyStickLeft:Joystick;
var touchPadRight:Joystick;
var touchPadShoot:Joystick;
var touchPadShoot2:Joystick;
var groundMoveSmoke:ParticleEmitter;

var speedSmoothing = 10.0;

var vsbrBullet:GameObject;
var vsbrLeftPoint:GameObject;
var vsbrRightPoint:GameObject;

var vsbrHeatwave:GameObject;
var beamRifleBullet:GameObject;
var beamRifleShootPoint:GameObject;
var modelBody:GameObject;
var modelArm1:GameObject;
var modelArm2:GameObject;
var shoulder:GameObject;

var boostFlames:GameObject[];
var beamSaber:GameObject;

private var vsbrAutoRotate:boolean=false;

// The current move direction in x-z
private var moveDirection:Vector3 = Vector3.zero;
private var vecSpeed:Vector3 = Vector3.zero;
private var acceleration:Vector3 = Vector3.zero;

private var targetDirection:Vector3;
// The current vertical speed
private var verticalSpeed = 0.0;
// The current x-z move speed
private var moveSpeed = 0.0;
// Is the user pressing any keys?
private var isMoving = false;
// Are we moving backwards (This locks the camera to not do a 180 degree spin)
private var movingBack = false;

private var isFlying = false;

private var buttonRepeatTime:float = 0;

private var startRepeat = false;

private var startRepeatKey:RepeatKey;
private var targetRepeatKey:RepeatKey;

private var characterState:CharacterState;

private var stepTime:float = 0;
private var shootTime:float = 0;

private var stepH = 0;
private var stepV = 0;

var isGround:boolean;

private var prevTouchCount:int;
private var prevHAxis:float;
private var prevVAxis:float;

private var dropToGroundTime:float = 0;

private var shooting:boolean = false;

private var enemyStopped:GameObject;

private var movingShoot:boolean = false;
private var targetTransformRotX:float = 0;
private var targetTransformRotY:float = 0;
private var modelBodyRot:Quaternion;
private var modelArmRot:Quaternion;

var keyboard:boolean=false;
var controlIndex:int=0;

var ui_ios:GameObject;

var boost:Boost;

enum RepeatKey {
	Z = 0,
	Up = 1,
	Down = 2,
	Left = 3,
	Right = 4
}

enum CharacterState {
	Stand = 0,
	Walking = 1,
	Flying = 2,
	Steping = 3,
	Shooting = 4,
	Rising = 5,
	Droping = 6,
	DropToGround = 7,
	F91BackShoot = 8,
	F91SwordFight = 9
}

function Start() {
    Physics.gravity=Vector3(0,-30,0);
    characterState = CharacterState.Stand;
    //Debug.Log("OK");
    //wind.active = false;
    //booster.active = false;
    var gui:GUITexture = joyStickLeft.GetComponent(GUITexture);
    if (Screen.dpi >= 200) {
    	gui.pixelInset.width = 150;
    	gui.pixelInset.height = 150;
    }
    //Debug.Log(Screen.dpi);
    
    boosterTrail= booster.GetComponent(TrailRenderer);
    boosterTrail.time=0;
    
    isGround = true;
    groundMoveSmoke.emit = false;
    
    moveDirection = transform.TransformDirection(Vector3.forward);
    
    var state:AnimationState;
    for (state in gundamModel.animation) {
    	state.layer = 0;
    }
    gundamModel.animation["F91NormalShoot"].layer = 10;
    gundamModel.animation["F91NormalShoot"].weight = 1;
    //gundamModel.animation["F91NormalShoot"].blendMode = AnimationBlendMode.Additive;
    var trail:WeaponTrail = beamSaber.GetComponent("WeaponTrail") as WeaponTrail;
    trail.StartTrail(0.3f, 0.1f);
    trail.SetTime (0.3, 0, 1);
}

function Update () {

    if (Application.platform==RuntimePlatform.IPhonePlayer){
        ui_ios.SetActive(true);    
    }
    else{
        ui_ios.SetActive(false);       
    }
    


    var km:KeyboardManager=KeyboardManager.Instance();
	//var horizontalAxis:float=Input.GetAxis("Horizontal");
    //var verticalAxis:float=Input.GetAxis("Vertical");

    if (keyboard){
        var horizontalAxis:float=km.GetControllerDirection(0).x;
        var verticalAxis:float=km.GetControllerDirection(0).y;    
    }
    else{
        if (km.GetKeyAction("Left",keyboard,controlIndex)){
            horizontalAxis=-1;
        }

        if (km.GetKeyAction("Right",keyboard,controlIndex)){
            horizontalAxis=1;
        }

        if (km.GetKeyAction("Up",keyboard,controlIndex)){
            verticalAxis=1;
        }

        if (km.GetKeyAction("Down",keyboard,controlIndex)){
            verticalAxis=-1;
        }
    }
    
    
    var xSpeed:float=horizontalAxis*Mathf.Sqrt(horizontalAxis*horizontalAxis+verticalAxis*verticalAxis)*walkSpeed*Time.deltaTime;
    var zSpeed:float=verticalAxis*Mathf.Sqrt(horizontalAxis*horizontalAxis+verticalAxis*verticalAxis)*walkSpeed*Time.deltaTime;
    //var rotYSpeed:float=Input.GetAxis("Horizontal")*rotSpeedY*Time.deltaTime;
    var rotYSpeed:float=horizontalAxis*rotSpeedY*Time.deltaTime;
    
    var cRotX:float = mCamera.transform.eulerAngles.x;
    var cRotY:float = mCamera.transform.eulerAngles.y;
    var cRotZ:float = mCamera.transform.localRotation.z;
    
    modelBodyRot = modelBody.transform.rotation;
    modelArmRot = modelArm1.transform.rotation;
    
    targetTransformRotX = cRotX;
    targetTransformRotY = cRotY;
    
    if (characterState == CharacterState.DropToGround) {
        if (dropToGroundTime < 0.3) {
            dropToGroundTime = dropToGroundTime + Time.deltaTime;
        }
        else if (dropToGroundTime >= 0.3) {
            characterState = CharacterState.Stand;
            dropToGroundTime = 0;
            gundamModel.animation.CrossFade("TestAnimation",0.3);
        }
        
        return;
    }
    
    if (characterState == CharacterState.Stand) {
        if (isGround) {
        	
            if (isMoving) {
                gundamModel.animation.CrossFade("WalkAnimation",0.3);
            }
            else {
                gundamModel.animation.CrossFade("TestAnimation",0.2);
            }
            
            
        }
    }
    
    
    /*
    var camRotation:float;
    
    camRotation=mCamera.eulerAngles.y;
    */
    if (startRepeat) {
        if (buttonRepeatTime >= 0.4) {
            startRepeat = false;
            buttonRepeatTime = 0;
        }
        else {
            buttonRepeatTime = buttonRepeatTime + Time.deltaTime;
        }
    }
    
    if (characterState == CharacterState.Steping) {
        if (stepTime >= 1) {
            stepTime = 0;
            this.rigidbody.useGravity = true;
            changeSpeedLine(false);
            changeBoostFlames(false);
            if (isGround) {
                characterState = CharacterState.Stand;
                gundamModel.animation.CrossFade("TestAnimation",0.3);
            }
            else {
                characterState = CharacterState.Droping;
                gundamModel.animation.CrossFade("DropingAnimation",0.4);
            }
        }
        else {
            stepTime = stepTime + Time.deltaTime;
            
        }
    }
    
    
    
    if (characterState == CharacterState.Shooting) {
        if (vsbrAutoRotate) {
        	var targetRotX:Quaternion = Quaternion.Euler (10-cRotX, 180, 357);
			gundamModel.transform.localRotation = Quaternion.Slerp(gundamModel.transform.localRotation, targetRotX,Time.deltaTime * 5);
                                   
        	var targetRotY:Quaternion = Quaternion.Euler (transform.localRotation.x, cRotY, transform.localRotation.z);
        	transform.localRotation = Quaternion.Slerp(transform.localRotation, targetRotY,Time.deltaTime * 10);	
        }
        
        
        if (shootTime >= 1.4) {
            shootTime = 0;
            shooting = false;
            this.rigidbody.useGravity = true;
            if (isGround) {
                characterState = CharacterState.Stand;
                gundamModel.animation.CrossFade("TestAnimation",0.3);
            }
            else {
                characterState = CharacterState.Droping;
                gundamModel.animation.CrossFade("DropingAnimation",0.3);
            }
        }
        else {
            shootTime = shootTime + Time.deltaTime;
            
            if (shootTime > 0.5 && !shooting) {
                shooting = true;
                vsbrAutoRotate = false;
                
                VSBRShoot();
                
                gundamModel.animation.CrossFade("ShootingAnimation",0.3);
            }
            else if (shootTime > 0.9 && shooting) {
                gundamModel.animation.CrossFade("ShootAfterAnimation",0.4);
            }
        }
    }
    
    if (characterState == CharacterState.F91BackShoot) {
    	if (vsbrAutoRotate) {
        	var targetRotationX:Quaternion = Quaternion.Euler (cRotX, 180, 357);
			gundamModel.transform.localRotation = Quaternion.Slerp(gundamModel.transform.localRotation, targetRotationX,Time.deltaTime * 5);
                                   
        	var targetRotationY:Quaternion = Quaternion.Euler (transform.localRotation.x, cRotY+180, transform.localRotation.z);
        	transform.localRotation = Quaternion.Slerp(transform.localRotation, targetRotationY,Time.deltaTime * 10);	
        }
        
        
        if (shootTime >= 1.2) {
            shootTime = 0;
            shooting = false;
            this.rigidbody.useGravity = true;
            if (isGround) {
                characterState = CharacterState.Stand;
                gundamModel.animation.CrossFade("TestAnimation",0.2);
            }
            else {
                characterState = CharacterState.Droping;
                gundamModel.animation.CrossFade("DropingAnimation",0.2);
            }
        }
        else {
            shootTime = shootTime + Time.deltaTime;
            if (shootTime >= 0.2 && !gundamModel.animation.IsPlaying("F91BackShoot")) {
            	gundamModel.animation.CrossFade("F91BackShoot",0.1);
            	//var backShootSE:GameObject;
            	//backShootSE = GameObject.Find("ReadyShoot3");
                //backShootSE.audio.Play();
            }
            
            if (shootTime >= 0.6 && !shooting) {
                shooting = true;
                vsbrAutoRotate = false;
                
                beamRifleShoot();
            }
            
        }
        
    }
    
    if ( km.GetKeyActionDown("Boost",keyboard,controlIndex) || (prevTouchCount < touchPadRight.tapCount)) {
        if (startRepeat) {
            if (startRepeatKey == RepeatKey.Z) {
                isFlying = true;
                if (characterState == CharacterState.Shooting) {
                     shootTime = 0;
                     shooting = false;
                }
                if (characterState == CharacterState.F91BackShoot) {
                     shootTime = 0;
                     shooting = false;
                }
                characterState = CharacterState.Flying;
                buttonRepeatTime = 0;
                this.rigidbody.velocity=Vector3(0,0,0);
                startRepeat = false;
                gundamModel.animation.CrossFade("F91FlyAnimation");
                changeSpeedLine(true);
            }
            else {
                startRepeatKey = RepeatKey.Z;
                buttonRepeatTime = 0;
            }
        }
        else {
            startRepeat = true;
            startRepeatKey = RepeatKey.Z;
        }
        
        changeBoostFlames(true);
    }
    
    //var prevShootCount:int=touchPadShoot.tapCount;
    if ( km.GetKeyActionDown("Shoot2",keyboard,controlIndex) || ( touchPadShoot.tapCount>0 ) ) {
        if (characterState != CharacterState.Shooting && characterState != CharacterState.F91BackShoot) {
        	movingShoot = false;
        	shooting = false;
            gundamModel.animation.CrossFade("ShootAnimation");
            characterState = CharacterState.Shooting;
            vsbrAutoRotate = true;
            shootTime = 0;
            var readyShootSE:GameObject;
            var ran = Random.Range(0,7);
            if (ran <= 1) {
                readyShootSE = GameObject.Find("ReadyShoot");
                readyShootSE.audio.Play();
            }
            else if (ran <= 2) {
                readyShootSE = GameObject.Find("ReadyShoot1");
                readyShootSE.audio.Play();
            }
            else if (ran <= 3) {
                readyShootSE = GameObject.Find("ReadyShoot2");
                readyShootSE.audio.Play();
            }
            else if (ran <= 4) {
                readyShootSE = GameObject.Find("ReadyShoot3");
                readyShootSE.audio.Play();
            }
            else if (ran <= 5) {
                readyShootSE = GameObject.Find("ReadyShoot4");
                readyShootSE.audio.Play();
            }
            
            this.rigidbody.useGravity = false;
            this.rigidbody.velocity=Vector3(0,0,0);
            isFlying = false;
            
            changeSpeedLine(false);
            changeBoostFlames(false);
        }
    }
    
    if ( km.GetKeyActionDown("Shoot1",keyboard,controlIndex) || touchPadShoot2.tapCount>0 ) {
    //if ( km.GetKeyActionDown("c") || touchPadShoot2.tapCount>0 ) {
    	var targetCameraRotX = formatRot(targetTransformRotX);
    	var targetCameraRotY = formatRot(mCamera.transform.localRotation.eulerAngles.y);
    	
    	var gundamRotX = formatRot(this.transform.eulerAngles.x);
    	var gundamRotY = formatRot(this.transform.eulerAngles.y);
    	
    	var isBack:boolean = false;
    	
    	if (targetCameraRotY > 92 && targetCameraRotY < 268) {
    		isBack = true;
    	}
    	
        if (characterState != CharacterState.F91BackShoot && characterState != CharacterState.Shooting && isBack) {
            characterState = CharacterState.F91BackShoot;
            vsbrAutoRotate = true;
            shootTime = 0;
            
            this.rigidbody.useGravity = false;
            this.rigidbody.velocity=Vector3(0,0,0);
            isFlying = false;
            
            changeSpeedLine(false);
            changeBoostFlames(false);
        }
        else if (!isBack && !movingShoot && characterState != CharacterState.Shooting && characterState != CharacterState.F91BackShoot) {
        	movingShoot = true;
        	gundamModel.animation.CrossFade("F91NormalShoot",0.15);
        }
    }
    if (Input.GetKeyDown("v")) {
        if (characterState != CharacterState.Shooting && characterState != CharacterState.F91BackShoot && characterState != CharacterState.F91SwordFight) {
        	
        }
        
    }
    
    //if (Input.GetKeyUp("z") || (prevTouchCount > touchPadRight.tapCount)) {
    if ( km.GetKeyActionUp("Boost",keyboard,controlIndex) || (prevTouchCount > touchPadRight.tapCount)) {
        if (characterState == CharacterState.Flying) {
            isFlying = false;
            if (isGround) {
                characterState = CharacterState.Stand;
                gundamModel.animation.CrossFade("TestAnimation");
            }
            else {
                characterState = CharacterState.Droping;
                gundamModel.animation.CrossFade("DropingAnimation");
            }
        }    
        
        if (characterState == CharacterState.Rising) {
            if (isGround) {
                characterState = CharacterState.Stand;
                gundamModel.animation.CrossFade("TestAnimation");
            }
            else {
                characterState = CharacterState.Droping;
                gundamModel.animation.CrossFade("DropingAnimation");
            }
        }
        
        changeSpeedLine(false);
        changeBoostFlames(false);
        if (characterState != CharacterState.Shooting && characterState != CharacterState.Steping && characterState != CharacterState.F91BackShoot) {
            this.rigidbody.useGravity = true;
        }
    }
    
    
    //if (Input.GetKey("z")  || touchPadRight.tapCount > 0) {
    if ( km.GetKeyAction("Boost",keyboard,controlIndex) || touchPadRight.tapCount > 0) {
        
        this.rigidbody.useGravity = false;
        if (!isFlying) {
            if (characterState == CharacterState.Stand || 
                characterState == CharacterState.Walking || 
                characterState == CharacterState.Droping) 
            {
                characterState = CharacterState.Rising;
                gundamModel.animation.CrossFade("RisingAnimation",0.2);
            }
            
            if (characterState == CharacterState.Rising) {
                this.transform.Translate(0,upSpeed*Time.deltaTime,0,Space.World);
                this.rigidbody.velocity=Vector3(this.rigidbody.velocity.x,0,this.rigidbody.velocity.z);
            }
            
        }
        else {
            this.rigidbody.velocity=Vector3(0,0,0);
        }
    }
    
    if (characterState == CharacterState.Flying) {
		var target1 = Quaternion.Euler (-30, 180, 357);
		gundamModel.transform.localRotation = Quaternion.Slerp(gundamModel.transform.localRotation, target1,
                                   Time.deltaTime * 5);
        if (Camera.mainCamera.fieldOfView < 80) {
            Camera.mainCamera.fieldOfView += 0.5;
        }
    }
	else if (characterState != CharacterState.Shooting && characterState != CharacterState.F91BackShoot){
	    var target2 = Quaternion.Euler (0, 180, 357);
		gundamModel.transform.localRotation = Quaternion.Slerp(gundamModel.transform.localRotation, target2,
                                   Time.deltaTime * 5);
                                 
        if (Camera.mainCamera.fieldOfView > 60) {
            Camera.mainCamera.fieldOfView -= 0.5;
        }
	}
    
    if (lookingAtEnemy) {
        UpdateSmoothedMovementDirection();
        var movement:Vector3;
        if (characterState == CharacterState.Steping) {
            this.rigidbody.useGravity = false;
            movement = targetDirection * moveSpeed + Vector3 (0, verticalSpeed, 0);
            movement *= Time.deltaTime;
            vecSpeed = movement;
            //movement = Vector3(targetDirection.x* moveSpeed, targetDirection.y* moveSpeed+verticalSpeed, targetDirection.z* moveSpeed);
        }
        else {
        	if (characterState != CharacterState.Droping && characterState != CharacterState.DropToGround && characterState != CharacterState.Rising && characterState != CharacterState.F91BackShoot) {
        		movement = moveDirection * moveSpeed + Vector3 (0, verticalSpeed, 0);
        		movement *= Time.deltaTime;
        		vecSpeed = movement;
        	}
            
            if (characterState == CharacterState.Rising || characterState == CharacterState.F91BackShoot) {
            	vecSpeed *= 0.98;
            }
            //movement = Vector3(moveDirection.x* moveSpeed, moveDirection.y* moveSpeed+verticalSpeed, moveDirection.z* moveSpeed);
        }
        
	    
	    //movement = Vector3(movement.x* Time.deltaTime, movement.y* Time.deltaTime, movement.z* Time.deltaTime);
        //Move(movement);
        transform.Translate(vecSpeed,Space.World);
        
        // Set rotation to the move direction
	    if (IsGrounded())
	    {
		    
		}
		
		if (characterState != CharacterState.Shooting && characterState != CharacterState.F91BackShoot){
		    transform.rotation = Quaternion.LookRotation(moveDirection);
		}
		
		
		mCamera.transform.LookAt(enemyForLooking.transform);
		
		//var rotation = Quaternion.LookRotation(enemyForLooking.transform.position - mCamera.transform.position);
		//mCamera.transform.rotation = Quaternion.Slerp(mCamera.transform.rotation, rotation, Time.deltaTime * 20);
    }
    else {
        var target = Quaternion.Euler (12, 0, 0);
        mCamera.transform.localRotation = Quaternion.Slerp(mCamera.transform.localRotation, target,
                                   Time.deltaTime * 5);
        transform.Rotate(0,rotYSpeed,0);
        transform.Translate(xSpeed,0,zSpeed);
    }
    
    StepAction();
    
    prevTouchCount = touchPadRight.tapCount;
    prevHAxis = joyStickLeft.position.x;
    prevVAxis = joyStickLeft.position.y;
    
    groundMoveSmoke.transform.position = Vector3(this.transform.position.x,3,this.transform.position.z);
    
    if (isGround && (characterState == CharacterState.Steping || characterState == CharacterState.Flying)) {
        groundMoveSmoke.emit = true;
    }
    else {
        groundMoveSmoke.emit = false;
    }
    
    var trail:WeaponTrail = beamSaber.GetComponent("WeaponTrail") as WeaponTrail;
    trail.Itterate(Time.time);
    trail.UpdateTrail(Time.time,0);
}

function LateUpdate () {
	var cRotX:float = mCamera.transform.eulerAngles.x;
    var cRotY:float = mCamera.transform.eulerAngles.y;
    var cRotZ:float = mCamera.transform.localRotation.z;
    
	if (movingShoot) {
    	if (shootTime >= 0.7) {
            shootTime = 0;
            shooting = false;
            movingShoot = false;
            
        }
        else {
            shootTime = shootTime + Time.deltaTime;
            /*
            modelBody.transform.rotation = Quaternion.Slerp(modelBody.transform.rotation, 
            												Quaternion.Euler (modelBody.transform.rotation.x, cRotY, modelBody.transform.rotation.z),
            												Time.deltaTime * 10);
            */
			//modelArm1
			//modelArm2
            //moveDirection = Vector3.RotateTowards(moveDirection, targetDirection, rotateSpeed/2 * Mathf.Deg2Rad * Time.deltaTime, 1000);
            //moveDirection = moveDirection.normalized;
            //modelBody.transform.rotation = Quaternion.Euler (modelBody.transform.rotation.x, cRotY, modelBody.transform.rotation.z);
            if (shootTime <= 0.3) {
            	modelBody.transform.rotation = Quaternion.Slerp(modelBodyRot, 
            						Quaternion.Euler (modelBodyRot.eulerAngles.x, cRotY, modelBodyRot.eulerAngles.z),
            						Time.deltaTime * 10);
            }
            
            if (shootTime > 0.2 && !shooting) {
                shooting = true;
                
                this.beamRifleShoot();
            }
            
        }
    }
    else {
    	modelBody.transform.localRotation = Quaternion.Slerp(modelBody.transform.localRotation, 
            						Quaternion.Euler (5.3, 1.6, 359.5),
            						Time.deltaTime * 10);
    }
}

function StepAction ()
{
    if(characterState == CharacterState.Steping) return;
    if(characterState == CharacterState.Shooting) return;
    if(characterState == CharacterState.F91BackShoot) return;
    if(characterState == CharacterState.DropToGround) return;
    
    var keyPressed:boolean=false;
    
    if (Input.GetKeyDown (KeyCode.LeftArrow) || joyStickLeft.position.x-prevHAxis < -0.4){
		keyPressed = true;
		targetRepeatKey = RepeatKey.Left;
    }
    else if (Input.GetKeyDown (KeyCode.RightArrow) || joyStickLeft.position.x-prevHAxis > 0.4){
		keyPressed = true;
		targetRepeatKey = RepeatKey.Right;
    }
    else if (Input.GetKeyDown (KeyCode.UpArrow) || joyStickLeft.position.y-prevVAxis > 0.4){
		keyPressed = true;
		targetRepeatKey = RepeatKey.Up;
    }
    else if (Input.GetKeyDown (KeyCode.DownArrow) || joyStickLeft.position.y-prevVAxis < -0.4){
		keyPressed = true;
		targetRepeatKey = RepeatKey.Down;
    }
    
    if (!keyPressed) return;
    
    if (startRepeat) {
            if (startRepeatKey == targetRepeatKey) {
                isFlying = false;
                characterState = CharacterState.Steping;
                buttonRepeatTime = 0;
                this.rigidbody.velocity = Vector3(0,0,0);
                startRepeat = false;
                gundamModel.animation.CrossFade("StepUpAnimation",0.1);
                stepTime = 0;
                
                if (startRepeatKey == RepeatKey.Left) {
                    stepH = -1;
                    stepV = 0;
                }
                else if (startRepeatKey == RepeatKey.Right) {
                    stepH = 1;
                    stepV = 0;
                }
                else if (startRepeatKey == RepeatKey.Up) {
                    stepH = 0;
                    stepV = 1;
                }
                else if (startRepeatKey == RepeatKey.Down) {
                    stepH = 0;
                    stepV = -1;
                }
                
                changeSpeedLine(true);
	            changeBoostFlames(true);
            }
            else {
                startRepeatKey = targetRepeatKey;
                buttonRepeatTime = 0;
            }
    }
    else {
            startRepeat = true;
            startRepeatKey = targetRepeatKey;
    }
}

function UpdateSmoothedMovementDirection ()
{
    var km:KeyboardManager=KeyboardManager.Instance();
    
    if (!keyboard){
        var horizontalAxis:float=km.GetControllerDirection(0).x;
        var verticalAxis:float=km.GetControllerDirection(0).y;    
    }
    else{
        if (km.GetKeyAction("Left",keyboard,controlIndex)){
            horizontalAxis=-1;
        }

        if (km.GetKeyAction("Right",keyboard,controlIndex)){
            horizontalAxis=1;
        }

        if (km.GetKeyAction("Up",keyboard,controlIndex)){
            verticalAxis=1;
        }

        if (km.GetKeyAction("Down",keyboard,controlIndex)){
            verticalAxis=-1;
        }
    }
    

	var cameraTransform = mCamera.transform;
	//var grounded = IsGrounded();
	
	// Forward vector relative to the camera along the x-z plane	
	var forward = cameraTransform.TransformDirection(Vector3.forward);
	
	forward.y = 0;
	
	forward = forward.normalized;

	// Right vector relative to the camera
	// Always orthogonal to the forward vector
	var right = Vector3(forward.z, 0, -forward.x);
    var v:float;
    var h:float;
    //if (Mathf.Abs (Input.GetAxisRaw("Vertical")) >= Mathf.Abs (joyStickLeft.position.y)) {
    if (Mathf.Abs ( verticalAxis ) >= Mathf.Abs (joyStickLeft.position.y)) {
        v = verticalAxis;
    }
    else {
        v = joyStickLeft.position.y; 
    }
                
    //if (Mathf.Abs (Input.GetAxisRaw("Horizontal")) >= Mathf.Abs (joyStickLeft.position.x)) {
    if (Mathf.Abs ( horizontalAxis ) >= Mathf.Abs (joyStickLeft.position.x)) {
        //h = Input.GetAxisRaw("Horizontal");
        h = horizontalAxis;
    }
    else {
        h = joyStickLeft.position.x;
    }
    
    if (characterState == CharacterState.Shooting) {
        h = 0;
        v = 0;
    }
    
	//var v = Mathf.Max(Mathf.Abs (Input.GetAxisRaw("Vertical")), Mathf.Abs (joyStickLeft.position.y));
	//var h = Mathf.Max(Mathf.Abs (Input.GetAxisRaw("Horizontal")), Mathf.Abs (joyStickLeft.position.x));
	
	//v = joyStickLeft.position.y;
	//h = joyStickLeft.position.x;

	// Are we moving backwards or looking backwards
	if (v < -0.2)
		movingBack = true;
	else
		movingBack = false;
	
	var wasMoving = isMoving;
	isMoving = Mathf.Abs (h) > 0.1 || Mathf.Abs (v) > 0.1;
		
	// Target direction relative to the camera
	
	if (isFlying) {
	    if (Mathf.Abs (h) < 0.1 && Mathf.Abs (v) < 0.1) {
	        targetDirection = moveDirection;
	    }
	    else {
	        targetDirection = h * right + v * forward;
	    }
	}
	else if (characterState == CharacterState.Steping) {
	    targetDirection = stepH * right + stepV * forward;
	}
	else if (characterState == CharacterState.Shooting) {
	    if (vsbrAutoRotate) {
	    	targetDirection = 0 * right + 1 * forward;
	    }
	    
	}
	else if (characterState == CharacterState.F91BackShoot) {
	    if (vsbrAutoRotate) {
	    	targetDirection = 0 * right - 1 * forward;
	    }
	    
	}
	else if (characterState == CharacterState.Droping || characterState == CharacterState.DropToGround) {
	    targetDirection = moveDirection;
	}
	else {
	    targetDirection = h * right + v * forward;
	}
	
	
	if (targetDirection != Vector3.zero)
	{
		    if (isFlying) {
			    moveDirection = Vector3.RotateTowards(moveDirection, targetDirection, rotateSpeed/10 * Mathf.Deg2Rad * Time.deltaTime, 1000);
			}
			else if (characterState == CharacterState.Droping) {
			
			}
			else if (characterState == CharacterState.Rising) {
				moveDirection = Vector3.RotateTowards(moveDirection, targetDirection, rotateSpeed/4 * Mathf.Deg2Rad * Time.deltaTime, 1000);	
			}
			else if (characterState == CharacterState.Steping) {
			    
			}
			else if (characterState == CharacterState.F91BackShoot) {
				moveDirection = Vector3.RotateTowards(moveDirection, targetDirection, rotateSpeed/2 * Mathf.Deg2Rad * Time.deltaTime, 1000);	
			}
			else {
			    moveDirection = Vector3.RotateTowards(moveDirection, targetDirection, rotateSpeed * Mathf.Deg2Rad * Time.deltaTime, 1000);
			}
			
				
			moveDirection = moveDirection.normalized;
	}
		
		// Smooth the speed based on the current target direction
	var curSmooth = speedSmoothing * Time.deltaTime;
		
		// Choose target speed
		//* We want to support analog input but make sure you cant walk faster diagonally than just forward or sideways
	var targetSpeed = Mathf.Min(targetDirection.magnitude, 1.0);
	    
	if (isFlying) {
	    targetSpeed *= flySpeed;
	}
	else if (characterState == CharacterState.Steping) {
		targetSpeed *= flySpeed;
	}
	else if (characterState == CharacterState.Shooting) {
	    targetSpeed *=0;
	}
	else {
	    targetSpeed *= walkSpeed;
	}
		
	moveSpeed = Mathf.Lerp(moveSpeed, targetSpeed, curSmooth);
}

function VSBRShoot() {
    //var targetRotation = Quaternion.Euler(gundamModel.transform.eulerAngles.x,transform.eulerAngles.y,transform.eulerAngles.z); 
    
    var vsbrBulletL:GameObject = Instantiate(vsbrBullet, vsbrLeftPoint.transform.position, transform.rotation);
    //vsbrBulletL.transform.rotation.x = gundamModel.transform.rotation.x;
    //vsbrBulletL.transform.Rotate(gundamModel.transform.rotation.x,vsbrBulletL.transform.rotation.y,vsbrBulletL.transform.rotation.z);
    vsbrBulletL.transform.LookAt(enemyForLooking.transform);
    //vsbrBulletL.transform.rotation.y = transform.rotation.y;
    //vsbrBulletL.transform.rotation.z = transform.rotation.z;
    //vsbrBulletL.transform.Rotate(vsbrBulletL.transform.eulerAngles.x,transform.eulerAngles.y,transform.eulerAngles.z);
    vsbrBulletL.transform.rotation = Quaternion.Euler(vsbrBulletL.transform.eulerAngles.x,transform.eulerAngles.y,transform.eulerAngles.z);
    
    var vsbrBulletR:GameObject = Instantiate(vsbrBullet, vsbrRightPoint.transform.position, transform.rotation);
    vsbrBulletR.transform.LookAt(enemyForLooking.transform);
    //vsbrBulletR.transform.Rotate(gundamModel.transform.rotation.x,vsbrBulletR.transform.rotation.y,vsbrBulletR.transform.rotation.z);
    //vsbrBulletR.transform.rotation.y = transform.rotation.y;
    //vsbrBulletR.transform.rotation.z = transform.rotation.z;
    //vsbrBulletR.transform.Rotate(vsbrBulletR.transform.eulerAngles.x,transform.eulerAngles.y,transform.eulerAngles.z);
    vsbrBulletR.transform.rotation = Quaternion.Euler(vsbrBulletR.transform.eulerAngles.x,transform.eulerAngles.y,transform.eulerAngles.z);
    
    var vsbrHeatwaveL:GameObject = Instantiate(vsbrHeatwave, vsbrLeftPoint.transform.position, Quaternion.identity);
    var vsbrHeatwaveR:GameObject = Instantiate(vsbrHeatwave, vsbrRightPoint.transform.position, Quaternion.identity);
    
    var shootSE = GameObject.Find("Shoot");
    shootSE.audio.Play();
}

function beamRifleShoot() {
    var beamRifleBulletM:GameObject = Instantiate(beamRifleBullet, beamRifleShootPoint.transform.position, transform.rotation);
    beamRifleBulletM.transform.LookAt(enemyForLooking.transform);
    beamRifleBulletM.transform.rotation = Quaternion.Euler(beamRifleBulletM.transform.eulerAngles.x,beamRifleBulletM.transform.eulerAngles.y,transform.eulerAngles.z);
    
    var beamRifleHeatwave:GameObject = Instantiate(vsbrHeatwave, beamRifleShootPoint.transform.position, Quaternion.identity);
    
    var shootSE = GameObject.Find("RX78Rifle");
    shootSE.audio.Play();
    
    var bulletScript = beamRifleBulletM.GetComponent(typeof(BeamRifleBullet));
    bulletScript.target = enemyForLooking;
}

function OnCollisionEnter(collision : Collision) {
    if (collision.gameObject.CompareTag ("Ground") ) {
        //Debug.Log("Hit");
        if (!isGround) {
            isGround = true;
            
        }
        
        if (characterState == CharacterState.Droping) {
            var landSE = GameObject.Find("Landed");
            landSE.audio.Play();
            //characterState = CharacterState.Stand;
            //gundamModel.animation.CrossFade("TestAnimation",0.2);
            dropToGroundTime = 0;
            characterState = CharacterState.DropToGround;
            gundamModel.animation.CrossFade("DropToGroundAnimation",0.2);
            
            vecSpeed = Vector3.zero;
        }
    }
    else if (collision.gameObject.tag == "BeamGun") {
        TestTexture.gunNumber++;
        Destroy (collision.gameObject);
        //Debug.Log("Hit Gun");
    }
}


function OnCollisionExit(collision : Collision) {
    if (collision.gameObject.name == "Terrain") {
        if (isGround) {
            isGround = false;
        }
        
    }
}

function GetSpeed () {
	return moveSpeed;
}

function IsGrounded () {
	return isGround;
}

function GetDirection () {
	return moveDirection;
}

function IsMovingBackwards () {
	return movingBack;
}

function IsMoving ()  : boolean
{

    var km:KeyboardManager=KeyboardManager.Instance();
    var dir:Vector2=Vector2.zero;
    if (!keyboard){
        dir=km.GetControllerDirection(0);
        
    }
    else{
        if (km.GetKeyAction("Left",keyboard,controlIndex)){
            dir.x=-1;
        }

        if (km.GetKeyAction("Right",keyboard,controlIndex)){
            dir.x=1;
        }

        if (km.GetKeyAction("Up",keyboard,controlIndex)){
            dir.y=1;
        }

        if (km.GetKeyAction("Down",keyboard,controlIndex)){
            dir.y=-1;
        }
    }

    var result:boolean=(dir!=Vector2.zero);
    Debug.Log("IsMoving: "+result);

    return (dir!=Vector2.zero);

	//return Mathf.Abs(Input.GetAxisRaw("Vertical")) + Mathf.Abs(Input.GetAxisRaw("Horizontal")) > 0.5;

}

function formatRot(rot:float):float {
	while (rot > 360) {
		rot = rot -360;
	}
	while (rot < -360) {
		rot = rot + 360;
	}
	
	return rot;
}

public function changeTarget () {
    enemyStopped = enemyForLooking;
    enemyForLooking = enemyFly;
}

function changeBoostFlames(enable:boolean) {
	var singleFlame:GameObject;
	for (singleFlame in boostFlames) {
		var flameScript = singleFlame.GetComponent(typeof(BoostFlameScript));
		flameScript.boost = enable;
	}
	
	boosterFlames.emit = enable;
    if (enable){
        boost.StartEmit();    
    }
    else{
        boost.PauseEmit();       
    }
    
}

function changeSpeedLine(enable:boolean) {
	var speedLineScript = speedLine.GetComponent(typeof(SpeedLineScript));
	speedLineScript.changeSpeedLine(enable);
	
	if (enable) {
        speedLineScript.gameObject.SetActive(true);
		boosterTrail.time=0.3;
	}
	else {
        speedLineScript.gameObject.SetActive(false);
		boosterTrail.time=0;
	}
}
