import * as state from "./state.js";
import * as UI from "./ui.js";
import * as C from "./constants.js";


export function start(){

    if(!state.dots || state.dots.length === 0){
        state.init();
    }
    UI.init();


    window.requestAnimationFrame(step);


}

function update(delta){


    UI.update();

}

function step(timestamp){

    if(timestamp < C.SKIP_FRAME){
        window.setTimeout(()=>window.requestAnimationFrame(step), 90)
    }

    update(timestamp);

    window.requestAnimationFrame(step);
}