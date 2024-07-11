import * as constants from "./constants.js";

export function Dot(team, x,y, name){
    let dot = {};
    dot.team=team;
    dot.x=x;
    dot.y=y;

    if(!name){
        name = getName(team);
    }

    dot.name = name;
    return dot;
}

var dotCountPerTea = new Map();
dotCountPerTea.set(constants.TEAM_VILLAIN, 0);
dotCountPerTea.set(constants.TEAM_HERO, 0);

function getName(team){
    const current = dotCountPerTea.get(team);

    var catalog = team === constants.TEAM_HERO?constants.HERO_NAMES:constants.VILLAIN_NAMES;

    var name = catalog[current%catalog.length];
    dotCountPerTea.set(team, current+1);

    return name;

}
