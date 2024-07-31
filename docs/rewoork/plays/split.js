import * as C from "../constants.js";
import * as F from "../functions.js";
import * as O from "../objects.js";

import * as R from "./result.js";

export function init(actionTeam){
    console.info("Starting a pslit");
    
    team = actionTeam;
    selectedDot = null;
    dest = null;
}


var team;
var selectedDot = null;
var dest = null;

export function status(){
    return "split :"+(selectedDot?"x":"_")+"->"+(dest?"x":"_");
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

export function reset(){
    selectedDot=null;
    dest=null;
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
                dotFilter: (dot)=>dot.team === team
            }
        } else{
            return {
                valid: false,
                selected:[],
                dotFilter: (dot)=>dot.team === team
            }
        }
    }else if(!dest){
        //we are selecting the dot destination ; validity of dest depends on subtype
        if(isDestValid(dots, input)){
            return {
                valid: true,
                selected: [selectedDot],
                moves:[new R.Move(selectedDot, input), new R.Move(selectedDot, mirror(input) )],
                cellFilter: isCellValid,
                done:true
            }
        }else{
            return {
                valid: false,
                selected: [selectedDot],
                cellFilter: isCellValid
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

function mirror(input){
    if(!selectedDot)
        return null;
    
    var deltaX = selectedDot.x - input.x;
    var deltaY = selectedDot.y - input.y;

    return new O.Dot(team, selectedDot.x + deltaX, selectedDot.y + deltaY)
}

function isCellValid(dot){
    return F.samePoint(dot, selectedDot);
}

/**
 * Dest is valid if both the mouse and the spawn are in the cell of the selected dot
 * @param {*} dots 
 * @param {*} input 
 * @returns 
 */
function isDestValid(dots, input){

    const nearestToDest = F.nearestDot(dots, input);
    if(!F.samePoint(nearestToDest, selectedDot)){
        return false;
    }
    
    const spawned = mirror(input);
    const nearestToMirror = F.nearestDot(dots, spawned);
    if(!F.samePoint(nearestToMirror, selectedDot)){
        return false;
    }
    if(!F.inBounds(spawned)){
        return false;
    }
    return true;
}
