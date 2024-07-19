import * as C from "./constants.js";
import * as O from "./objects.js";
import * as F from "./functions.js";
import * as A from "./states/Action.js";


export var turn = C.TEAM_VILLAIN;//first thing we do is switchturn, so hero will actually start
export var dots = [];
export var board;


export function init(){

    const MARGIN = 40;

    turn=C.TEAM_VILLAIN;

    let initialDots = [];

    var yB = MARGIN;
    var yR = C.SIZE - MARGIN;
    for(let i = 0; i < C.DOTS; i++){
        let x = MARGIN + i*((C.SIZE-2*MARGIN)/(C.DOTS-1));
        initialDots.push(new O.Dot(C.TEAM_HERO,x,yB));
        initialDots.push(new O.Dot(C.TEAM_VILLAIN,x,yR));
    }

    A.init();

    update(initialDots)
}
export function update(newDots){
    dots = newDots;
    
    board = F.computeCells(dots);
    switchTurn();

    
    var before = dots.length;
    dots = F.checkDeletion(turn, dots);
    var after  =dots.length;
    if(before !== after){
        board = F.computeCells(dots);
    }


}
export function expectedAction(){
    return A.nextAction;
}

function switchTurn(){
    let newTeam = turn === C.TEAM_VILLAIN ? C.TEAM_HERO : C.TEAM_VILLAIN;
    turn = newTeam;
    initNextAction();
}




//contains the NEXT cards (lowest index = next card)
var deck = [
    new O.DeckCard(C.TEAM_HERO, C.STATE_MOVE),
    new O.DeckCard(C.TEAM_VILLAIN, C.STATE_MOVE),
    new O.DeckCard(C.TEAM_HERO, C.STATE_LEAP),
    new O.DeckCard(C.TEAM_VILLAIN, C.STATE_LEAP)
];
var current = null;
export function currentCard(){
    return current;
}

// return the next cards (highest index = next card)
export function getDeck(){
    return deck.toReversed();

}
function initNextAction(){


    console.info("Action is done, setuping the next one")
    if(current)
        console.info("The DONE action was : '"+current.type+" by "+current.team+"'");
    else
        console.info("The was no previous action. are we initializing the game state ?");

    current = deck.shift();
    console.info("The NEW action will be : '"+current.type+" by "+current.team+"'");

    var newDraw = new O.DeckCard(current.team, current.type);
    console.info("new card has id : "+newDraw.id);
    deck.push(newDraw);
    A.initAction(turn,current.type);
}


/*
Check if any dot should be removed after a move.
This function is recursive, and order of the dots is important. Any removed dot cahnges the board, some some may/may not be surrounded once a dot is removed.
*/
export function checkDeletion(){


    var them = dots
                .filter(dot=>dot.team !== turn)
                .filter(dot=>F.isSurrounded(dot, board));

    if(them.length > 0){
        var removed = them[0];
        dots = dots.filter(d => d !== removed);
        board = F.computeCells(dots);
        
        checkDeletion();
        return;

    }
    var us = dots.filter(dot=>dot.team === turn)
               .filter(dot=>F.isSurrounded(dot, board));
    if(us.length > 0){
        var removed = us[0];
        dots = dots.filter(d => d !== removed);
        board=F.computeCells(dots);
        
        checkDeletion();
        return;
    }
}

export function computeScore(){
    //split between this and F.computeScore is useful for calculating move score for IA
    return F.computeScore(board);
}


