import * as C from "../constants.js";
import * as MOVE from "./move.js";
import * as LEAP from "./leap.js";


export function init(){
    nextAction=idle();
}

/**
represents an expected user action - RN select a dot or select a position

type= is a string (C.ACTION_*)
cancel is function ()=>X that resets the action
filterFunction is (cell)=>Y/N or (dot)=>Y/N
selectFunction allows a select (dot)=>X
outcomeFuction is (dots, dot)=>updatedBoard
*/
export function Action(actionType, cancelFunction, filterFunction, selectFunction, outcomeFunction){
    var action = {
        type:actionType,
        cancel:cancelFunction,
        filter:filterFunction,
        select:selectFunction,
        outcome:outcomeFunction
    }

    return action;
}

function idle(){
    return new Action(
        C.ACTION_NONE, //type
        ()=>[], //nothing to cancel
        ()=>{}, //no dtos nor celles can be selected
        ()=>{}, //nothing will be done on select
        ()=>{}, //no outcome (TODO : return initial board ?)
    );
}

export var nextAction = idle();
export function setNextAction(action){
    nextAction = action;
}

//TODO : maybe dots & board ?
export function initAction(team, key){
    if(key === C.IDLE_KEY){
        nextAction = idle();
    }
    if(key === C.STATE_MOVE){
        MOVE.init(team);
        nextAction = MOVE.nextAction;
    }
    if(key === C.STATE_LEAP){
        LEAP.init(team);
        nextAction = LEAP.nextAction;
    }
}

