#pragma strict

@script ExecuteInEditMode()

var viewportPos:Vector2;


function LateUpdate () {
	var cam:Camera=CameraController.Instance().uiCam;
	var p : Vector3 = cam.ViewportToWorldPoint (Vector3 (viewportPos.x,viewportPos.y, cam.nearClipPlane));
	transform.position.x=p.x;
	transform.position.y=p.y;
}