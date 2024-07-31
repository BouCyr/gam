import * as C from "../constants.js";
import * as F from "../functions.js";
import * as O from "../objects.js";

import * as R from "./result.js";

export function init(actionTeam){
    console.info("Starting a switch");
    
    firstDot = null;
    secondDot = null;
}


var firstDot = null;
var secondDot = null;

export function status(){
    return "switch :"+(firstDot?"x":"_")+"<->"+(secondDot?"x":"_");
}

export function cancel(){
    if(secondDot){
        secondDot = null;
        console.info("Cancelling secondDot");
    }else if(firstDot){
        firstDot = null;
        console.info("Cancelling firstDot");
    }
}

export function reset(){
    firstDot=null;
    secondDot=null;
}

export function select(dots, input){
    var output = whatIf(dots, input);
    if(output.valid){
        if(!firstDot){
            firstDot = output.selected[0];
        } else if(!secondDot){
            secondDot = output.selected[1];
        }
    }

    return output;

}

export function whatIf(dots, input){
    var nearestDot = F.dotInRange(dots, input);
        
    if(!firstDot){
        //we are currently selecting the first dot ; any dot can do
        if(nearestDot && hasOppoNeighbour(nearestDot, dots)){
            return {
                valid: true,
                selected: [nearestDot],
                dotFilter: (dot)=>hasOppoNeighbour(dot, dots)
            }
        }else{
            return {
                valid: false,
                selected: [],
                dotFilter: (dot)=>hasOppoNeighbour(dot, dots)
            }
        }
    }else if(!secondDot){
        //we are selecting the second dot ; this 
        if(nearestDot && validSecondDot(dots, nearestDot)){
            return {
                done:true,
                valid: true,
                selected: [firstDot, nearestDot],
                moves:[new R.Move(firstDot, nearestDot),new R.Move(nearestDot, firstDot)],
                dotFilter: (dot)=>validSecondDot(dots, dot)
            }
        }else{
            return {
                valid: false,
                selected: [firstDot],
                dotFilter: (dot)=>validSecondDot(dots, dot)
            }
        }
    }else{
        //AFAIK we should not be here ?
        return {
            done:true,
            valid: true,
            selectedDot: [firstDot, secondDot]
        }
    }
}

function validSecondDot(dots, dot){
    if(!firstDot)
        return false;

    return F.areNeighbours(dots, firstDot, dot) && firstDot.team!==dot.team;
}

function hasOppoNeighbour(dot, dots){
    //if one the neighbour is of oppo team
    return F.neighbours(dots, dot).filter(n => n.team !== dot.team).length >0 ;
}
