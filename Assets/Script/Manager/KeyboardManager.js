#pragma strict
import InControl;
private static var instance : KeyboardManager;
 
public static function Instance() : KeyboardManager
{
    if (instance == null)
        instance =GameObject.FindObjectOfType(KeyboardManager) as KeyboardManager;
    return instance;
}

class KeyboardMap{
	var action:String;
	var codes:KeyCode[];
}

class ConsoleMap{
	var action:String;
	var code:InputControlType;
}

var keyboardMap:KeyboardMap[];
var consoleMap:ConsoleMap[];



function Start(){

	InputManager.Setup();

}

function GetControllerDirection(_controlIndex:int):Vector2{
	
	var device:InputDevice;
	if (_controlIndex<InputManager.Devices.Count){
		device=InputManager.Devices[_controlIndex];
	}

	if (device!=null){
		return device.Direction;
	}
	else{
		return Vector2.zero;
	}

	
}


function GetKeyActionDown(_action:String,_keyboard:boolean,_controlIndex:int):boolean{
	var i:int;
	if (!_keyboard){
		var device:InputDevice;
		if (_controlIndex<InputManager.Devices.Count){
			device=InputManager.Devices[_controlIndex];
		}

		if (device!=null){
			for (i=0;i<consoleMap.Length;i++){
				if (_action==consoleMap[i].action ){

					var control:InputControl=device.GetControl(consoleMap[i].code );
					//Debug.Log(control);
					if ( control.WasPressed){
						return true;
					}
					else{
						return false;
					}
				}
			}	
		}

		return false;
	}
	

	
	for (i=0;i<keyboardMap.Length;i++){
		if (_action==keyboardMap[i].action ){
			if (Input.GetKeyDown(keyboardMap[i].codes[_controlIndex] )){
				return true;
			}
			else{
				return false;	
			}
			
		}
	}
	return false;	
}

function GetKeyActionUp(_action:String,_keyboard:boolean,_controlIndex:int):boolean{
	var i:int;
	if (!_keyboard){
		var device:InputDevice;
		if (_controlIndex<InputManager.Devices.Count){
			device=InputManager.Devices[_controlIndex];
		}

		if (device!=null){
			for (i=0;i<consoleMap.Length;i++){
				if (_action==consoleMap[i].action ){

					var control:InputControl=device.GetControl(consoleMap[i].code );
					//Debug.Log(control);
					if ( control.WasReleased ){
						return true;
					}
					else{
						return false;
					}
				}
			}	
		}

		return false;
	}
	

	
	for (i=0;i<keyboardMap.Length;i++){
		if (_action==keyboardMap[i].action ){
			if (Input.GetKeyUp(keyboardMap[i].codes[_controlIndex] )){
				return true;
			}
			else{
				return false;	
			}
			
		}
	}
	return false;	
}


function GetKeyAction(_action:String,_keyboard:boolean,_controlIndex:int):boolean{

	var i:int;
	if (!_keyboard){
		var device:InputDevice;
		if (_controlIndex<InputManager.Devices.Count){
			device=InputManager.Devices[_controlIndex];
		}

		if (device!=null){
			for (i=0;i<consoleMap.Length;i++){
				if (_action==consoleMap[i].action ){

					var control:InputControl=device.GetControl(consoleMap[i].code );

					if ( control.IsPressed){
						return true;
					}
					else{
						return false;
					}
				}
			}	
		}
		
		return false;
	}

	for (i=0;i<keyboardMap.Length;i++){
		if (_action==keyboardMap[i].action ){
			if (Input.GetKey(keyboardMap[i].codes[_controlIndex] )){
				return true;
			}
			else{
				return false;	
			}
			
		}
	}
	return false;	
}

function GetKeyName(_action:String,_controlIndex):String{
	var i:int;
	for (i=0;i<keyboardMap.Length;i++){
		if (_action==keyboardMap[i].action ){
			return keyboardMap[i].codes[_controlIndex].ToString();
		}
	}
	return "Key not Config";
}

function Update(){
	InputManager.Update();
	//Debug.Log(GetKeyAction("Pickup",0));

	
}