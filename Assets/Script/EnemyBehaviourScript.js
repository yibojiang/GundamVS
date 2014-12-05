
var life :float = 8;
var enemyModel :GameObject;
var explosion :GameObject;
var fireworks :GameObject;
var beamHitSE :GameObject;
var explosionSE :GameObject;
var flying = false;
var flySpeed :float = 20;
var downAnimation:AnimationClip;
var downTransform:Transform;
var downSmoke:ParticleEmitter;

public var detonator:GameObject;

private var explosionTime :float = 0;
private var explosing = false;

private var moveSpeed :float;
private var hidden:boolean = false;
private var goingDown:boolean = false;
private var downTime:float = 0;

function Start() {
    if (flying) {
        init();
        enemyModel.animation.CrossFade("MkII_Fly",0);
    }
}

function init() {
    var ran = Random.value;
    
    if (ran >= 0.75) {
        transform.position.x = 0;
        transform.position.z = Random.Range(0,2000);
        transform.position.y = Random.Range(20,150);
        
        if (transform.position.z >=1000) {
            transform.rotation = Quaternion.Euler(0,90-Random.Range(0,30),0);
        }
        else {
            transform.rotation = Quaternion.Euler(0,90+Random.Range(0,30),0);
        }
    }
    else if (ran >= 0.5) {
        transform.position.x = 2000;
        transform.position.z = Random.Range(0,2000);
        transform.position.y = Random.Range(20,150);
        
        if (transform.position.z >=1000) {
            transform.rotation = Quaternion.Euler(0,-90-Random.Range(0,30),0);
        }
        else {
            transform.rotation = Quaternion.Euler(0,-90+Random.Range(0,30),0);
        }
    }
    else if (ran >= 0.25) {
        transform.position.z = 0;
        transform.position.x = Random.Range(0,2000);
        transform.position.y = Random.Range(20,150);
        
        if (transform.position.x >=1000) {
            transform.rotation = Quaternion.Euler(0,-Random.Range(0,30),0);
        }
        else {
            transform.rotation = Quaternion.Euler(0,Random.Range(0,30),0);
        }
    }
    else {
        transform.position.z = 2000;
        transform.position.x = Random.Range(0,2000);
        transform.position.y = Random.Range(20,150);
        
        if (transform.position.x >=1000) {
            transform.rotation = Quaternion.Euler(0,180+Random.Range(0,30),0);
        }
        else {
            transform.rotation = Quaternion.Euler(0,180-Random.Range(0,30),0);
        }
    }
    
    moveSpeed = flySpeed + Random.Range(0,10);
}

function Update () {
	
	if (goingDown) {
    	var downMove:Vector3 = Vector3(0,0,60) * Time.deltaTime;
    	this.transform.Translate(downMove);
    	downTime += Time.deltaTime;
    	
    	if (downTime >=1.5) {
    		downSmoke.emit = false;
    		explosionThing();
    		goingDown = false;
    	}
   	}
    
    if (explosing) {
        explosionTime += Time.deltaTime;
        
        if (explosionTime > 8) {
            if (flying) {
                this.restart();
            }
            else {
                this.gameObject.SetActiveRecursively(false);
                var gundam:GameObject = UnityEngine.GameObject.Find("Gundam");
                var gundamScript = gundam.GetComponent(typeof(gundambehaviourscript));
                gundamScript.changeTarget();
            }
        }
        
        if (explosionTime >= 0.1 && !hidden) {
        	var childrenTrans :Component[] = this.gameObject.GetComponentsInChildren(Transform);
        	var childTrans :Component;
        	for (childTrans in childrenTrans) {
        		if (childTrans.gameObject.name == "MkII") {
        			childTrans.gameObject.SetActiveRecursively(false);
        			hidden = true;
        			break;
        		}
        	}
        }
        
        return;
    }

    if (flying && !goingDown && !explosing) {
       var movement:Vector3 = Vector3(0,0,moveSpeed) * Time.deltaTime;
    
       transform.Translate(movement);
       
       if (transform.position.x>2100 || transform.position.z>2100 || transform.position.x<-100 || transform.position.z<-100) {
           restart();
       }
    }
}


public function bulletHit (damage:float,bulletTransform:Transform) {
	downTransform = bulletTransform;
     life = life - damage;
     //Debug.Log("life: "+life);
     //beamHitSE.audio.Play();
     
     if (life <=0) {
     	goingDown = true;
        this.gameObject.rigidbody.Sleep();
        this.rigidbody.Sleep();
        enemyModel.animation.CrossFade("MkII_Down",0.2);
     	this.transform.rotation = Quaternion.Euler(downTransform.eulerAngles.x,downTransform.eulerAngles.y,downTransform.eulerAngles.z);
        //explosionThing();
        downSmoke.emit = true;
     }
}


function restart () {
    life = 8;
    goingDown = false;
    downTime = 0;
    this.gameObject.SetActiveRecursively(true);
    explosing = false;
    explosionTime = 0;
    this.rigidbody.WakeUp();
    
    this.transform.rotation = Quaternion.Euler(0,0,0);
    
    init();
    
    var childrenTrans :Component[] = this.gameObject.GetComponentsInChildren(Transform);
    var childTrans :Component;
    for (childTrans in childrenTrans) {
        if (childTrans.gameObject.name == "MkII") {
        	childTrans.gameObject.SetActiveRecursively(true);
        	hidden = false;
        	break;
        }
    }
    //this.transform.position = Vector3.zero;
    
    if (flying) {
    	enemyModel.animation.CrossFade("MkII_Fly",0);
    }
    else {
    	enemyModel.animation.CrossFade("MkII_Stand",0);
    }
}


function explosionThing () {
    if (explosing) return;
    explosing = true;
    var testTexture = UnityEngine.GameObject.Find("TestGUITexture");
    //testTexture.enemyDown();
    var textureScript = testTexture.GetComponent(typeof(TestTexture));
    textureScript.enemyDown();
    //Debug.Log("Destroy");
    //this.gameObject.SetActiveRecursively(false);
    //this.gameObject.active = false;
    //this.enemyModel.active = false;
    //var bigFireworks = Instantiate(fireworks, this.transform.position, this.transform.rotation);
    //var bigExplosion = Instantiate(explosion, Vector3(this.transform.position.x,this.transform.position.y-5,this.transform.position.z), this.transform.rotation);
    var exp : GameObject = Instantiate (detonator, Vector3(enemyModel.transform.position.x,enemyModel.transform.position.y-5,enemyModel.transform.position.z), Quaternion.identity);
    Destroy(exp, 10); 
    //this.gameObject.active = false;
}