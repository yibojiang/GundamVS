#pragma strict
import System.Collections.Generic;

var emitList:List.<ParticleSystem>;


function StartEmit(){
	var i:int;
	for(i=0;i<emitList.Count;i++){
		emitList[i].Play();
	}
}

function PauseEmit(){
	var i:int;
	for(i=0;i<emitList.Count;i++){
		emitList[i].Stop();
	}
}