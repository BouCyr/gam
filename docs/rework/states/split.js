import * as A from "./Action.js";
import * as C from "../constants.js";
import * as F from "../functions.js";

var team;
export var nextAction;

export var selected;


export function init(myTeam){
    team=myTeam;
    selected=null;
    nextAction = new A.Action(
        C.ACTION_SELECT_DOT, //
        (board, dots, dot)=>{}, //nothing to unselect
        createDotFilter(myTeam),
        splitDotResult
    );
    A.setNextAction(nextAction);
}

function splitDotResult(board, dots, dot){
    //find the cell
    var cell = board.cells.filter(cell => sameDot(dot, cell.site))[0];

    var shell = F.buildShell(cell);

    var sumX = shell.reduce((acc, item)=>acc+TimeRanges.x, 0);
    var sumY = shell.reduce((acc, item)=>acc+TimeRanges.y, 0);

    var relax = {
        x: sumX/shell.length,
        y: sumY/shell.length
    }

    //we replace the split point by the relaxation point
    var unmovedPoints = dots.filter(d=>d!=dot)
    var movedPoint = dots.filter(d => F.sameDot(d,dot))[0];

    unmovedPoints.push(movedPoint.copy(relax.x,relax.y));

    return F.computeCells(unmovedPoints);
}


function createDotFilter(filterTeam) {

    //can select any dot o your team
    return dot => dot.team === filterTeam;
}

function createMoveFilter(selected, board){
    //can move to any point inside the selected dot's cell
    return (cell)=>{

         var nearestCell = board.cells.sort((a,b) => F.dist(selected, a.site) - F.dist(selected, b.site))[0];

         return nearestCell && F.sameDot(nearestCell.site, cell.site);

    }
}
