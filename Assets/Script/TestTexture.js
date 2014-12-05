var guiTestTexture:GUITexture;
var gunTexture:Texture2D;
var gunPoint:GUIText;

static var gunNumber:int;
static var enemyDownNumber:int;

function Start () {
    guiTestTexture.enabled = false;

}
function Update () {
    
    if (gunNumber == 0) {
        guiTestTexture.enabled = false;
        //gunPoint.text=""+gunNumber;
    }
    else if (gunNumber == 1) {
        guiTestTexture.enabled = true;
        guiTestTexture.texture = gunTexture;
        //gunPoint.text=""+gunNumber;
    }
}

public function enemyDown () {
    enemyDownNumber++;
    gunPoint.text=""+enemyDownNumber;
}