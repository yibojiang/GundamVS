
var lifeTimer : float = 0.0; //The timer of life for this projectile.
var lifeTimerMax : float = 10.0; //The max amount of time that this shell will live.
var bulletSpeed :float = 200.0;
var target :GameObject;
var sparks :GameObject;
var damage :float = 1.0;
var beam:LineRenderer;
var beamLength:float = 140;
var beamEffect:GameObject;
private var currentBeamLength:float = 1;
private var isHitTarget:boolean = false;
private var autoGuide:boolean = true;

function Start () {
	beam.SetPosition(1,Vector3(0,0,currentBeamLength));
}

function Update () {
    lifeTimer += 1 * Time.deltaTime; //Adds one to the lifeTimer variable every second.
	//If lifeTimer is greater than or equal to lifeTimerMax.
	if(lifeTimer >= lifeTimerMax) {
		Destroy (gameObject); //This is rather self explaing. It states that this object will be destroyed.
    }
    
    var movement:Vector3 = Vector3(0,0,bulletSpeed) * Time.deltaTime;
    
    transform.Translate(movement);
    
    if (currentBeamLength < beamLength) {
    	currentBeamLength = currentBeamLength + bulletSpeed*Time.deltaTime;
    	beam.SetPosition(1,Vector3(0,0,currentBeamLength));
    }
    
    if (target && autoGuide) {
    	var rotation = Quaternion.LookRotation(target.transform.position - transform.position);
		transform.rotation = Quaternion.Slerp(transform.rotation, rotation, Time.deltaTime * 4);
		var distance = Mathf.Sqrt(Mathf.Pow((target.transform.position.x-transform.position.x),2)+Mathf.Pow((target.transform.position.y-transform.position.y),2)+Mathf.Pow((target.transform.position.z-transform.position.z),2));
		if (distance < 40) {
			autoGuide = false;
		}
    }
    
    if (beamEffect) {
    	beamEffect.transform.Rotate(0,0,600*Time.deltaTime);
    }
}


function OnCollisionEnter(collision : Collision) {
    if (collision.gameObject.name == "Enemy01" || collision.gameObject.name == "EnemyFly") {
    	autoGuide = false;
        //Debug.Log("Hit");
        this.rigidbody.Sleep();
        
        target = collision.gameObject;
        
        var enemyScript = target.GetComponent(typeof(EnemyBehaviourScript));
        
        if (enemyScript.life > 0) {
        	var hitSparks = Instantiate(sparks, this.transform.position, this.transform.rotation);
        }
        
        enemyScript.bulletHit(this.damage,this.transform);
        
        isHitTarget = true;
    }

}