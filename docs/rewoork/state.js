import * as C from "./constants.js";
import * as F from "./functions.js";
import * as O from "./objects.js";
import * as P from "./play.js";

export var turn = C.TEAM_NOONE;
export var dots = [];
export var currentCard = null;
export const decks = new Map();


export function deck(team){
    if(!decks.get(team))
        decks.set(team, []);
    return decks.get(team);
}


/**
 * Init the (brand new) state to a pristine state to allow IA computation
 * 
 * @param {O.DeckCard} iaCurrentCard 
 * @param {O.Dot[]} allDots 
 * @param {Map(tea, O.DeckCard[])} allDecks 
 */
export function iaInit(iaCurrentCard, allDots, allDecks){
    turn = iaCurrentCard.team;
    currentCard = iaCurrentCard;
    dots = allDots;
    decks.set(C.TEAM_HERO, allDecks.get(C.TEAM_HERO));
    decks.set(C.TEAM_VILLAIN, allDecks.get(C.TEAM_VILLAIN));
    initTurn();
}


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


    
    addCardToDeck(C.TEAM_HERO, C.CARD_SWITCH);
    addCardToDeck(C.TEAM_HERO, C.CARD_MOVE);
    addCardToDeck(C.TEAM_HERO, C.CARD_ATTACK);
    addCardToDeck(C.TEAM_HERO, C.CARD_LEAP);
    addCardToDeck(C.TEAM_HERO, C.CARD_SPLIT);

    addCardToDeck(C.TEAM_VILLAIN, C.CARD_SWITCH);
    addCardToDeck(C.TEAM_VILLAIN, C.CARD_MOVE);
    addCardToDeck(C.TEAM_VILLAIN, C.CARD_ATTACK);
    addCardToDeck(C.TEAM_VILLAIN, C.CARD_LEAP);
    addCardToDeck(C.TEAM_VILLAIN, C.CARD_SPLIT);

    turn = C.TEAM_NOONE;

    //start the first turn
    startNewTurn(initialDots)
}
function addCardToDeck(deckTeam, cardType){
    deck(deckTeam).push(new O.DeckCard(deckTeam, cardType));
}

export function startNewTurn(newDots = dots){
    
    dots = newDots;
    
    let newTeam = turn !== C.TEAM_HERO ? C.TEAM_HERO : C.TEAM_VILLAIN;

    turn = newTeam;
    //draw the next card...
    currentCard = deck(newTeam).shift();
    
    //... and add a copy of it back into the queue  
    deck(newTeam).push(new O.DeckCard(currentCard.team, currentCard.type));
    initTurn();
}
/**
 * init the turn once the state is set
 * 
 * May be called by 'startNewturn) (main loop) or by iaInit(on stete clone for ia computation)
 */
export function initTurn(){
 
    P.init(currentCard);

    turnNotDrawn = true;
}

// Allow UI to know if a turn has just begun (so deck and score are not redrawn at each frames, only on turn switch)
let turnNotDrawn = true;
export function isFirstDrawSinceNewTurn(){
    let newTurn = turnNotDrawn;
    turnNotDrawn=false;
    return newTurn;

}

export function score(){
    //split between this and F.computeScore is useful for calculating move score for IA
    return F.computeScore(dots);
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