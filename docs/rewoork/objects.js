import * as F from "./functions.js";

/**
 * 
 * @param {A point with a team} team 
 * @param {*} x x coord
 * @param {*} y y coord
 * @param {*} id unique id
 * @returns obj
 */
export function Dot(team, x,y, id= F.uniqueId()){
    let dot = {};
    dot.team=team;
    dot.x=x;
    dot.y=y;
    dot.id=id;

    return dot;
}

/**
 * One of the next card to be played
 * @param {*} team the team that will play this card (from C.TEAM_*)
 * @param {*} type the card type (from C.CARD_*)
 * @returns a card
 */
export function DeckCard( team, type){
    return {
        team:team,
        id:F.uniqueId(),
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