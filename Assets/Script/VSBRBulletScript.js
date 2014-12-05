
var lifeTimer : float = 0.0; //The timer of life for this projectile.
var lifeTimerMax : float = 10.0; //The max amount of time that this shell will live.
var bulletSpeed :float = 300.0;
var target :GameObject;
var sparks :GameObject;
var damage :float = 1.0;

function Update () {
    lifeTimer += 1 * Time.deltaTime; //Adds one to the lifeTimer variable every second.
	//If lifeTimer is greater than or equal to lifeTimerMax.
	if(lifeTimer >= lifeTimerMax) {
		Destroy (gameObject); //This is rather self explaing. It states that this object will be destroyed.
    }
    
    var movement:Vector3 = Vector3(0,0,bulletSpeed) * Time.deltaTime;
    
    transform.Translate(movement);
}


function OnCollisionEnter(collision : Collision) {
    if (collision.gameObject.name == "Enemy01" || collision.gameObject.name == "EnemyFly") {
        //Debug.Log("Hit");
        this.rigidbody.Sleep();
        
        target = collision.gameObject;
        
        var enemyScript = target.GetComponent(typeof(EnemyBehaviourScript));
        //enemyScript.downTransform = this.transform;
        enemyScript.bulletHit(this.damage,this.transform);
        
        if (enemyScript.life > 0) {
        	var hitSparks = Instantiate(sparks, this.transform.position, this.transform.rotation);
        }
        
    }

}