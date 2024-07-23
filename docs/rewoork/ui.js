import * as C from "./constants.js";
import * as S from "./state.js";
import * as O from "./objects.js";
import * as B from "./drawBoard.js";
import * as F from "./functions.js";
import * as I from './input.js';
import * as P from './play.js';
//import * as SVG from "./cards/SVGs.js";

export function reset(){
    [...document.querySelectorAll("dialog")].forEach(d => d.close());
}


//update UI
export function update(msSinceStart){
    drawBoard();
    drawScore();
    drawAction(msSinceStart);

    
}



function drawScore(){
    var scores = S.score();

    document.querySelector("#hero [score='borderPct']").innerHTML = Math.round((100*scores.hero.border)/(C.SIZE*4));
    document.querySelector("#villain [score='borderPct']").innerHTML = Math.round((100*scores.villain.border)/(C.SIZE*4));

    //boolean logic could be simplified, but I want to keep things clear 
    if(scores.hero.win){
        endState(true);
    }
    if(scores.villain.win){
        endState(false);
    }
}

function endState(win){

    var popup = win?"HEROWIN":"VILLAINWIN";

    document.getElementById(popup).showModal();
    document.getElementById(popup).classList.add("blured");
}



function drawBoard(){
    B.drawAll(S.board);
}

function drawAction(msSinceStart){
  var mousePos = I.mouse;
  
  // this is an outcome
  var outcomeIfCommited = P.actionStatus(mousePos);

  // fobidden cells
  if(outcomeIfCommited.cellFilter){
    var forbidden = S.board.cells.filter(cell => !outcomeIfCommited.cellFilter(cell.site));
    B.drawCells(forbidden, true);
  }


  var dotsIfOutcome = S.applyOutcome(outcomeIfCommited, copyOf(S.dots));
  var board = F.computeCells(dotsIfOutcome);


  B.drawCells(board.cells);
  
  //check if some dots were removed because they were surrounded
  var removed = findRemovedDots(S.dots, dotsIfOutcome);
  B.crossPoints(removed);

  //moves
  if(outcomeIfCommited.moves && outcomeIfCommited.moves.length >0){
    outcomeIfCommited.moves.forEach(move => {
        B.drawPath(move.origin, move.dot);
    });
  }

  //selectable dot
  if(outcomeIfCommited.dotFilter){
    S.dots.filter(dot => outcomeIfCommited.dotFilter(dot)).forEach(dot => B.halo(dot, msSinceStart));
  }
  //selected dots
  if(outcomeIfCommited.selected && outcomeIfCommited.selected.length >0){
    outcomeIfCommited.selected.forEach(selectedDot => {
        B.drawDot(selectedDot, true);
    });
  }

}

function findRemovedDots(original, aftercheck){

  //we compare by id if some dots have moved
  return original.filter(dot =>{
    return aftercheck.filter(after => after.id === dot.id).length === 0
  });
}

function copyOf(dots){
  return dots.map(original => new O.Dot(original.team, original.x, original.y, original.id));
}
