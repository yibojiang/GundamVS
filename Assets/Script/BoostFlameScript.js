#pragma strict

var boost:boolean = false;
private var flame:LineRenderer;
private var flameWidth:float = 2;
private var flameLength:float = 4;

function Start () {
	flame = this.gameObject.GetComponent(LineRenderer);
	boost = false;
	flameWidth = 0;
}

function Update () {
	if (boost) {
		if (!flame.enabled) {
			flame.enabled = true;
		}
		
		if (flameWidth < 2) {
			flameWidth = flameWidth + 0.1;
		}
		
		flame.SetWidth(flameWidth,flameWidth);
		
		if (flameLength >= 4) {
			flameLength = flameLength - 0.4;
		}
		else {
			flameLength = flameLength + 0.4;
		}
		
		flame.SetPosition(1,Vector3(0,0,flameLength));
	}
	else {
		if (flameWidth > 0) {
			flameWidth = flameWidth - 0.1;
		}
		
		flame.SetWidth(flameWidth,flameWidth);
		
		if (flame.enabled && flameWidth <= 0) {
			flame.enabled = false;
		}
	}
}