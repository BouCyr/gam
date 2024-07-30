import * as C from "../constants.js";
import * as F from "../functions.js";

import * as R from "./result.js";

export function initMove(actionTeam){
    console.info("Starting a move");

    subType = C.CARD_MOVE;
    
    team = actionTeam;
    selectedDot = null;
    dest = null;
}
export function initLeap(actionTeam){

    console.info("Starting a leap");
    subType = C.CARD_LEAP;
    team = actionTeam;
    selectedDot = null;
    dest = null;
}
export function initAttack(actionTeam){

    console.info("Starting an attack");
    subType = C.CARD_ATTACK;
    team = actionTeam;
    selectedDot = null;
    dest = null;
}

var subType = C.CARD_MOVE;

var team;
var selectedDot = null;
var dest = null;



export function reset(){
    dest=null;
    selectedDot=null;
}


export function cancel(){
    if(dest){
        dest = null;
        console.info("Cancelling dest");
    }else if(selectedDot){
        selectedDot = null;
        console.info("Cancelling selected dot");
    }

}

export function select(dots, input){
    var output = whatIf(dots, input);
    if(output.valid){
        if(!selectedDot){
            selectedDot = output.selected[0];
            console.info(`We will move dot : ${selectedDot.id}`);
        } else if(!dest){
            dest = output.moves[0].dot;
            console.info(`We will move dot ${ selectedDot.id} to (${dest.x},${dest.y}) `);
        }
    }

    return output;

}

export function whatIf(dots, input){

    if(!selectedDot){
        //we are currently selecting the moved dot
        var nearestDot = F.dotInRange(dots, input);
        if(nearestDot && nearestDot.team === team ){
            return {
                valid: true,
                selected: [nearestDot],
                dotFilter: oneOnMyDot(team)
            }
        } else{
            return {
                valid: false,
                selected:[],
                dotFilter: oneOnMyDot(team)
            }
        }
    }else if(!dest){
        //we are selecting the dot destination ; validity of dest depends on subtype
        if(isDestValid(dots, input)){
            return {
                valid: true,
                selected: [selectedDot],
                moves:[new R.Move(selectedDot, input)],
                cellFilter: cellFilter(),
                done:true
            }
        }else{
            return {
                valid: false,
                selected: [selectedDot],
                cellFilter: cellFilter()
            }
        }
    }else{
        //AFAIK we should not be here ?
        return {
            done:true,
            valid: true,
            selectedDot: [selectedDot],
            moves:[new R.Move(selectedDot, dest)]
        }
    }
}

function anyDot(){ return ()=>true ;}
function oneOnMyDot(myTeam){ return (dot)=>{ return dot.team === myTeam;}}
function me(me) { return (dot)=> F.sameDot(dot, me); }

function isDestValid(dots, input){

    const nearestToDest = F.nearestDot(dots, input);

    return cellFilter()(nearestToDest);
}

function cellFilter(){

    if(!selectedDot){
        console.error("Why do we check if a dest is valid when we do not have an origin ?");
        return () => false;
    }

    switch(subType){
        case C.CARD_ATTACK : return anyDot(); 
        case C.CARD_LEAP : return oneOnMyDot(team);
        case C.CARD_MOVE : return me(selectedDot);
        default : console.error("???"); return ()=>false;
    }
}