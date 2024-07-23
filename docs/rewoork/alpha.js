import * as S from "./state.js";
import * as UI from "./ui.js";
import * as C from "./constants.js";
import * as INPUT from "./input.js";


export function start(){


    S.reset();
    UI.reset();
    INPUT.init();

    window.requestAnimationFrame(step);

}

function step(delta){

    if(delta < C.SKIP_FRAME){
        window.setTimeout(()=>window.requestAnimationFrame(step), 90)
    }

    update(delta);

    window.requestAnimationFrame(step);
}

function update(delta){
    UI.update(delta);
}