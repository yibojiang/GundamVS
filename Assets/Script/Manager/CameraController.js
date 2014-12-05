#pragma strict
import System.Collections.Generic;
var target:Transform;
var shaking:boolean;
var shakeStrength:float;
var cameraTransform:Transform;
var shakeTransform:Transform;
var perspFactor:float=0.45;

var targetFOV:float=80;

var cam:Camera;
var uiCam:Camera;

var factor:float=1;
var speedLineAnim:Animator;

var targets:List.<Transform>;

var offset:Vector3;


private static var instance : CameraController;
 
public static function Instance() : CameraController
{
    if (instance == null)
        instance =GameObject.FindObjectOfType(CameraController) as CameraController;
    return instance;
}

var slowMotion:boolean=false;
function DoSlowMotion(_timeScale:float,_duration:float){

	if (slowMotion){
		return;
	}


	speedLineAnim.gameObject.SetActive(true);
	slowMotion=true;
	var toggle:float=0;
	var prevTimeScale:float=Time.timeScale;

	Time.timeScale=_timeScale;
	yield WaitForSeconds(_duration*Time.timeScale );


	Time.timeScale=prevTimeScale;
	speedLineAnim.gameObject.SetActive(false);
	slowMotion=false;
}


function ShakeCamera(_strength:float){
	shakeStrength=_strength;
	shaking=true;
}

function StopShakeCamera(){
	shaking=false;
	shakeTransform.localPosition=Vector3(0,0,0);
}

function SlowMotion(_timeScale:float,_duration:float){
	StartCoroutine(DoSlowMotion(_timeScale,_duration) );
}

function ShakeCamera(_strength:float,_duration:float){
	StartCoroutine( DoShakeCamera(_strength,_duration) );
}

function DoShakeCamera(_strength:float,_duration:float){

	if (shaking){
		return;
	}

	ShakeCamera(_strength);
	yield WaitForSeconds(_duration);

	StopShakeCamera();
}


function BlurOff(){
	var blur:BlurEffect=GetComponent(BlurEffect) as BlurEffect;
	blur.enabled=false;
}

function BlurOn(){
	var blur:BlurEffect=GetComponent(BlurEffect) as BlurEffect;
	blur.enabled=true;	
}


function LightOn(){
	//var ge:GrayscaleEffect=GetComponent(GrayscaleEffect) as GrayscaleEffect;
	//ge.rampOffset=0;
}

function LightOff(){
	//var ge:GrayscaleEffect=GetComponent(GrayscaleEffect) as GrayscaleEffect;
	//ge.rampOffset=-0.05;
}

var inTraget:boolean=false;
function SetTarget(_targets:List.<Transform>,_duration:float){
	inTraget=true;
	targets.Clear();
	//targets.Add(_target);
	targets=_targets;
	yield WaitForSeconds(_duration);
	inTraget=false;
}

function LateUpdate () {
	//Debug.Log(Mathf.Tan(40.0/180*Mathf.PI));


	if (shaking){
		shakeTransform.localPosition=shakeStrength*Vector3(Random.value,Random.value,0);
	}
	
	/*
	//Get Center Position of all players
	var i:int;
	//Get left player
	var leftX:float=100000;
	var rightX:float=-100000;
	var downY:float=100000;
	var upY:float=-100000;
	var gm:GameManager=GameManager.Instance();
	
	
	
		if (!inTraget){
			targets.Clear();
			if (gm.characters.Count>0){
				for (i=0;i<gm.characters.Count;i++ ){
					targets.Add(gm.characters[i].transform);
				}
			}
			
			if(gm.apple!=null){
				targets.Add(gm.apple.transform);
			}
		}
		
		
		
		for (i=0;i<targets.Count;i++){
			if (targets[i].position.x<leftX){
				leftX=targets[i].position.x;
			}
			
			if (targets[i].position.x>rightX){
				rightX=targets[i].position.x;
			}
			
			if (targets[i].position.y<downY){
				downY=targets[i].position.y;
			}
			
			if (targets[i].position.y>upY){
				upY=targets[i].position.y;
			}
		}
	if (targets.Count>0){
		//if (GameManager.Instance().characters.Count>0){
			target.position.x=(leftX+rightX)/2+offset.x;
			target.position.y=(upY+downY)/2+offset.y;


			cameraTransform.position.x+=(target.position.x-cameraTransform.position.x)*Time.deltaTime*10;

			cameraTransform.position.y+=(target.position.y-cameraTransform.position.y)*Time.deltaTime*10;
		
			var hDist:float=(rightX-leftX)/2+1;
			
			var vDist:float=(upY-downY)+5;

			var dist:float=Mathf.Max(hDist,vDist);

			var rad:float=cam.fieldOfView*factor*Mathf.Deg2Rad;
			//Debug.Log("hdist: "+hDist+" deg: "+ rad*Mathf.Rad2Deg);
			var targetZ:float=-300-( dist / Mathf.Tan(rad ) );

			//var targetY:float=( vDist / Mathf.Tan(rad ) );
			cameraTransform.position.z+=(targetZ-cameraTransform.position.z)*Time.deltaTime*10;
			//cameraTransform.position.y+=(targetY-cameraTransform.position.y)*Time.deltaTime*10;

			
			//targetFOV=Mathf.Atan(dist/20.0)*Mathf.Rad2Deg*2;
			//targetFOV=Mathf.Clamp(targetFOV,50,150);
			//cam.fieldOfView+=(targetFOV-cam.fieldOfView)*Time.deltaTime*3;

		//}
	}
	*/
}