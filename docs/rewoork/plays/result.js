import * as O from "../objects.js";
import * as F from "../functions.js";
import * as C from "../constants.js";

/*

an outomce has/may have the following fields:

done: true/false : if true, no more action is required for this play, outcome can be applied to state
valid : true/false (true is input can be applied)
selected: [] array of selected dots
moves: [] array of moved dots ; if a dot has an unknown ID, it is assumed to be created. a move is defined by : {origin:{x,y}, dot:{dot with dest x,y}}
spawn: [] array of dot ; they MUST have an unknown ID
delete: [] array of dot ; the MUST have a known ID ; delete overrodes select ; you cannot delete a moved dot
cellFilter: function that takes a dot in param and returns true/false if its cell is ok/nok
dotFilter: function that takes a dot in param and returns true/false if it is selectable or not


deletion caused by surrounding a dot will be computed at play.js level!

*/

export function Move( dot, dest){

    return {
        origin: {
            x: dot.x,
            y: dot.y
        },
        dot: dot.move(dest.x, dest.y)
    }

}