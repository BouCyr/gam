import * as P from "./play.js";
import * as S from "./state.js";

/**
 * Receiving and dispatching user input
 */

const worker = new Worker('./iaWorker.js', { type: 'module' });
worker.onerror = (data) => {
    console.error(data);
};

/**
 * Last known position of the mouse cursor (in canvas coord)
 */
export var mouse = {x:0, y:0};

var uiDisabled = false;

/*
setup UI
*/
export function init(){

    let canvas = document.getElementById("board");
    canvas.addEventListener("mousemove", (e) => move(e));
    canvas.addEventListener('contextmenu', event => event.preventDefault()); //disable context menu, right click will have its own meaining -ie cancel)


    canvas.addEventListener("mouseup", (e) => {

        if(e.button === 0){ //left click
            leftClick(e);
        }else{ //right click. If a dot was selected, unselect...
            rightClick(e);
        }
    });

    //reset buttons rsv rsh
    document.getElementById("rsv").addEventListener("click", (e)=>{ reset();});
    document.getElementById("rsh").addEventListener("click", (e)=>{ reset();});

    document.getElementById("iaLaunch").addEventListener("click", (e)=>{ iaLaunch(); });
}

function leftClick(e){
    if(!uiDisabled) {
        var outcome = P.select(mouse);
    }
}

function rightClick(e){
    if(!uiDisabled) {
        P.cancel(mouse);
    }
}

function move(mouseEvent){
    let canvas = document.getElementById("board");
    var rect = canvas.getBoundingClientRect();

    mouse.x = mouseEvent.clientX - rect.left;
    mouse.y = mouseEvent.clientY - rect.top;
}


function disableInput(){
    document.getElementById("theBody").classList.add("iaWaiting");
    uiDisabled = true;
}
function enableInput(){
    document.getElementById("theBody").classList.remove("iaWaiting");
    uiDisabled = false;
}

function iaLaunch(){
    
    console.log("Launching IA");
    disableInput();

    var start  = performance.now();

    worker.postMessage({
        dots  : S.dots,
        card  : S.currentCard,
        decks : S.decks
    });

    worker.onmessage = (msg)=>{
        var time = performance.now() - start;
        console.info(`IA returned result in ${time}ms`)

        msg.data.plays.forEach(play => P.select(play));
        enableInput();

    };
    worker.onerror = (x)=>{
        var time = performance.now() - start;
        console.info(`IA returned error in ${time}ms`)
        document.getElementById("theBody").classList.remove("iaWaiting");
        enableInput();
    };
    

}