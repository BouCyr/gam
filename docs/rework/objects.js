import * as C from "./constants.js";
import * as F from "./functions.js";

export function Dot(team, x,y, name){
    let dot = {};
    dot.team=team;
    dot.x=x;
    dot.y=y;

    if(!name){
        name = getDotName(team);
    }

    dot.name = name;

    dot.copy = (nx,ny)=>{
        return new Dot(dot.team,nx,ny,name);
    }

    return dot;
}

var dotCountPerTeam = new Map();
dotCountPerTeam.set(C.TEAM_VILLAIN, 0);
dotCountPerTeam.set(C.TEAM_HERO, 0);

function getDotName(team){
    const current = dotCountPerTeam.get(team);

    var catalog = team === C.TEAM_HERO ? C.HERO_NAMES : C.VILLAIN_NAMES;

    var name = catalog[current%catalog.length];
    dotCountPerTeam.set(team, current+1);

    return name+dotCountPerTeam.get(team);
}


export function DeckCard( team, type, id = F.uniqueId()){
    return {
        team:team,
        id:id,
        type:type
    }
}


export function Score(){
    var score = {
        hero: {
            border:0,
            dots:0,
            win:false
        },
        villain: {
            border:0,
            dots:0,
            win:false
        }
    };

    return score;
}