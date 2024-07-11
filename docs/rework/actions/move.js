import * as C from "./constants.js";
import * as F from "./functions.js";


var team;
var nextAction;

export var selected;

export function nextAction(){
    return nextAction;
}

export function init(myTeam){
    team=myTeam;
    selected=null;
    nextAction = new Action(
        C.ACTION_SELECT_DOT,
        createDotFilter(myTeam)
    );
}

export function select(board, dots, dot){
    selected = dot;
    nextAction =  new Action(
         C.ACTION_SELECT_LOC,
         createMoveFilter(dot,board)
    );
}

export function unselect(board, dots, dot){
    init(team);
}

function Action(type, filterFunction){
    var action = {
        type:type,
        filter:filter
    }

    return action;
}

function createDotFilter(filterTeam) {

    //can select any dot o your team
    return dot => dot.team === filterTeam;
}

function createMoveFilter(selected, board){
    //can move to any point inside the selected dot's cell
    return (point)=>{

         var nearestCell = board.cells.sort((a,b) => dist(point, a.site) - dist(point, b.site))[0];

         return nearestCell && sameDot(nearestCell.site, selected);

    }
}
