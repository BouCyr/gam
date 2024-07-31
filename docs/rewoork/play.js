import * as C from "./constants.js";
import * as S from "./state.js";

import * as MOVE from "./plays/move.js";
import * as SPLIT from "./plays/split.js";
import * as SWITCH from "./plays/switch.js";

/**
 * handles UI for the current action
 */




var action;

export function status(){
    return (action?action.status():"no_action");
}


/**
 * (re)sets the state to handle the action
 * @param {*} deckCard 
 */
export function init(deckCard){
    action = fromCard(deckCard);

    console.log("Action initialized");
}

export function whatIfISelect(mouse){
    var outcome = action.whatIf(S.dots, mouse);
    
    return outcome;
}
export function select(mouse){
    var outcome =  action.select(S.dots, mouse);
    
    if(outcome.done == true){
        S.onActionDone(outcome);
    }

    return outcome;
}
export function cancel(mouse){
    return action.cancel();
}
/** 
 * Used by IA to reset before trying another input
 */
export function reset(){
    return action.reset();
}

function fromCard(deckCard){
    switch(deckCard.type){
        case C.CARD_MOVE    : MOVE.initMove(deckCard.team);   return MOVE;
        case C.CARD_LEAP    : MOVE.initLeap(deckCard.team);   return MOVE;
        case C.CARD_ATTACK  : MOVE.initAttack(deckCard.team); return MOVE;
        case C.CARD_SPLIT   : SPLIT.init(deckCard.team);      return SPLIT;
        case C.CARD_SWITCH  : SWITCH.init(deckCard.team);     return SWITCH;
                default:
    }
}





