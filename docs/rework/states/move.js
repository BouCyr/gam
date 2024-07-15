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
        C.ACTION_SELECT_DOT,
        unselect,
        createDotFilter(myTeam),
        selectStart
    );
    A.setNextAction(nextAction);
}

function selectStart(board, dots, dot){
    selected = dot;
    nextAction =  new A.Action(
         C.ACTION_SELECT_DEST,
         unselect,
         createMoveFilter(dot,board),
         ()=>{},
         moveResult
    );
    nextAction.selected = dot;
    A.setNextAction(nextAction);
}

function unselect(board, dots, dot){
    init(team);
}


export function moveResult(dots, point){
    //we replace the selected by the new point
    var unmovedPoints = dots.filter(d=>d!=selected)
    var movedPoint = dots.filter(d => F.sameDot(d,selected))[0];

    unmovedPoints.push(movedPoint.copy(point.x,point.y));

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
