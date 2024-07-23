import * as S from "./state.js";
import * as UI from "./ui.js";
import * as C from "./constants.js";


export function start(){

    if(!S.dots || S.dots.length === 0){
        S.init();
    }
    UI.init();


    window.requestAnimationFrame(step);


}

function step(timestamp){

    if(timestamp < C.SKIP_FRAME){
        window.setTimeout(()=>window.requestAnimationFrame(step), 90)
    }

    update(timestamp);

    window.requestAnimationFrame(step);
}

function update(delta){
    UI.update();
}