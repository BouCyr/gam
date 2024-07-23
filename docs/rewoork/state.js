import * as C from "./constants.js";
import * as F from "./functions.js";
import * as O from "./objects.js";
import * as P from "./play.js";

export var turn = C.TEAM_NOONE;
export var dots = [];
export var board;
export var nextCards = [];
export var currentCard = null;


/*
* (re) init the board to its initial position
*/
export function reset(){

    const MARGIN = 40;

    let initialDots = [];

    var yB = MARGIN;
    var yR = C.SIZE - MARGIN;
    for(let i = 0; i < C.DOTS; i++){
        let x = MARGIN + i*((C.SIZE-2*MARGIN)/(C.DOTS-1));
        initialDots.push(new O.Dot(C.TEAM_HERO,x,yB));
        initialDots.push(new O.Dot(C.TEAM_VILLAIN,x,yR));
    }

    nextCards = [
        new O.DeckCard(C.TEAM_HERO, C.CARD_MOVE),
        new O.DeckCard(C.TEAM_VILLAIN, C.CARD_MOVE),
        new O.DeckCard(C.TEAM_HERO, C.CARD_LEAP),
        new O.DeckCard(C.TEAM_VILLAIN, C.CARD_LEAP),
        new O.DeckCard(C.TEAM_HERO, C.CARD_SPLIT),
        new O.DeckCard(C.TEAM_VILLAIN, C.CARD_SPLIT)
    ];

    turn = C.TEAM_NOONE;

    //start the first turn
    startNewTurn(initialDots)
}

export function startNewTurn(newDots =dots){
    
    dots = newDots;
    board = F.computeCells(dots);
    
    let newTeam = turn !== C.TEAM_HERO ? C.TEAM_HERO : C.TEAM_VILLAIN;

    turn = newTeam;
    //draw the next card...
    currentCard = nextCards.shift();
    P.init(currentCard);
    //... and add a copy of it back into the queue  
    nextCards.push(new O.DeckCard(currentCard.team, currentCard.type));

    var deck = nextCards.reduce((acc, it)=>acc+", "+it.type+" by "+it.team, "");
    console.info("deck is : "+deck);
    
}

export function score(){
    //split between this and F.computeScore is useful for calculating move score for IA
    return F.computeScore(board);
}

export function onActionDone(outcome){
    dots = applyOutcome(outcome, dots);
    startNewTurn();
}

export function applyOutcome(outcome, onDots = dots){

    if(outcome.moves && outcome.moves.length > 0){
        
        var moves = outcome.moves;
        var origins = moves.map(m => m.origin);
        //keep the one that did not move
        onDots = onDots.filter(dot => !dotInArr(dot, origins));
        moves.map(m=>m.dot).forEach(movedDot => onDots.push(movedDot));
    }


    //remove any surrounded points
    return F.checkDeletion(turn, onDots);
    

}

function dotInArr(dot, arr){
    return arr.filter(dotInArr => F.samePoint(dot, dotInArr)).length > 0;
    
}