import * as C from "./constants.js";
import * as O from "./objects.js";
import * as F from "./functions.js";


export var turn;
export var dots = [];
export var board;


export function init(){

    const MARGIN = 40;

    dots.length = 0;

    var yB = MARGIN;
    var yR = C.SIZE - MARGIN;
    for(let i = 0; i < C.DOTS; i++){
        let x = MARGIN + i*((C.SIZE-2*MARGIN)/(C.DOTS-1));
        dots.push(new O.Dot(C.TEAM_HERO,x,yB));
        dots.push(new O.Dot(C.TEAM_VILLAIN,x,yR));
    }

    board = F.computeCells(dots);
    switchTurn(C.TEAM_HERO);

    postUpdate();
}

function switchTurn(newTeam){

    if(!newTeam){
        newTeam === C.TEAM_VILLAIN ? C.TEAM_HERO : C.TEAM_VILLAIN;
    }
    turn = newTeam;

}


function postUpdate(){

}

