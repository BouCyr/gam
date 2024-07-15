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

    if(!movedPoint){
        console.error("A point should be moved!!!");
        movedPoint = dots.filter(d => d.name===selected.name)[0];
    }
    unmovedPoints.push(movedPoint.copy(point.x,point.y));

    return F.computeCells(unmovedPoints);
}


function createDotFilter(filterTeam) {

    //can select any dot o your team
    return dot => dot.team === filterTeam;
}

function createMoveFilter(selected, board){
    //can move to any point inside one the team's cell
    return (cell)=>  cell.site.team === team;
}
