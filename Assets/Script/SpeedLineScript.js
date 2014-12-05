#pragma strict

var gundam:GameObject;
var speedLine:ParticleEmitter;

function Start () {
	speedLine.emit = false;
}

function Update () {
	this.gameObject.transform.position = gundam.transform.position;
	this.gameObject.transform.rotation = gundam.transform.rotation;
}

public function changeSpeedLine(enable:boolean) {
	speedLine.emit = enable;
}
