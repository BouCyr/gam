import * as P from "./play.js";

/**
 * Receiving and dispatching user input
 */


/**
 * Last known position of the mouse cursor (in canvas coord)
 */
export var mouse = {x:0, y:0};

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
}

function leftClick(e){
    
    P.click(mouse);
}

function rightClick(e){
    P.cancel(mouse);
}

function move(mouseEvent){
    let canvas = document.getElementById("board");
    var rect = canvas.getBoundingClientRect();

    mouse.x = mouseEvent.clientX - rect.left;
    mouse.y = mouseEvent.clientY - rect.top;
}