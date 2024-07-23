import * as C from "./constants.js";
import * as S from "./state.js";
import * as MOVE from "./plays/move.js";
import * as SPLIT from "./plays/split.js";
/**
 * handles UI for the current action
 */




var action;

/**
 * (re)sets the state to handle the action
 * @param {*} deckCard 
 */
export function init(deckCard){
    action = fromCard(deckCard);

    console.log("Action initialized");
}

export function actionStatus(mouse){
    var outcome = action.sampleInput(S.dots, mouse);
    //TODO : surrounded dots

    return outcome;
}
export function click(mouse){
    var outcome =  action.commitInput(S.dots, mouse);
    //TODO : surrounded dots
    if(outcome.done == true){
        S.onActionDone(outcome);
    }

    return outcome;
}
export function cancel(mouse){
    return action.cancel();
}

function fromCard(deckCard){
    switch(deckCard.type){
        case C.CARD_MOVE    : MOVE.initMove(deckCard.team);   return MOVE;
        case C.CARD_LEAP    : MOVE.initLeap(deckCard.team);   return MOVE;
        case C.CARD_ATTACK  : MOVE.initAttack(deckCard.team); return MOVE;
        case C.CARD_SPLIT   : SPLIT.init(deckCard.team);      return SPLIT;
                default:
    }
}





