import * as C from "./constants.js";
import * as S from "./state.js";
import * as O from "./objects.js";
import * as B from "./board.js";
import * as F from "./functions.js";
import * as SVG from "./cards/SVGs.js";

export var mouse = {x:0, y:0};

/*
setup UI
*/
export function init(){

    let canvas = document.getElementById("board");
    canvas.addEventListener("mousemove", (e) => move(e));
    canvas.addEventListener('contextmenu', event => event.preventDefault())
    canvas.addEventListener("mouseup", (e) => {

        if(e.button === 0){ //left click
            leftClick(e);
        }else{ //right click. If a dot was selected, un select
            rightClick(e);
        }
    });

    //reset buttons rsv rsh
    document.getElementById("rsv").addEventListener("click", (e)=>{ reset();});
    document.getElementById("rsh").addEventListener("click", (e)=>{ reset();});
}

function reset(){
    S.init();
    /*UI.*/init();
    [...document.querySelectorAll("dialog")].forEach(d => d.close());
}

export function update(){
    drawBoard();
    drawAction();

    if(isSwitchTurn()){
        drawTurn();
        drawDeck();
        drawScore();
    }
}

function leftClick(e){
    var expectedInput = S.expectedAction();
    if(expectedInput.type === C.ACTION_SELECT_DOT){
        //is a dot in range ?
        var selectable = dotInRange(expectedInput.filter)
        if(selectable){
            expectedInput.select(S.board,S.dots,selectable);
        }

    }else if(expectedInput.type === C.ACTION_SELECT_DEST){
        //highlight the allowed  cells
        var allowedCells = S.board.cells.filter(cell => expectedInput.filter(cell));

        //draw line & outcome board
        if(F.isPointInCells(mouse, allowedCells, S.dots)){
            var newBoard = expectedInput.outcome(S.dots, mouse);
            S.update(newBoard.cells.map(c=>c.site));

        }
    }
}

function rightClick(e){
    S.expectedAction().cancel();
}

function move(mouseEvent){
    let canvas = document.getElementById("board");
    var rect = canvas.getBoundingClientRect();

    mouse.x = mouseEvent.clientX - rect.left;
    mouse.y = mouseEvent.clientY - rect.top;

    document.getElementById("log").innerText = mouse.x+"/"+mouse.y;
}

function drawScore(){
    var scores = S.computeScore();

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

var first = true;
function drawDeck(){


    var displayed = new Set();
    document.querySelectorAll(".card")
        .forEach(card => displayed.add(card.id));


    var inDeck = new Set(S.getDeck().map(card => "card"+card.id));
    //the displayed deck includes the current card, that is not in S.getDeck()
    if(S.currentCard){
        inDeck.add("card"+S.currentCard().id);
    }

    
    //remove any cards not in deck anymore (should be )
    var removed = displayed.difference(inDeck);
    removed.forEach(cardId => {
        //opacity THEN disappear
        var cardToRemove = document.getElementById(cardId);
        cardToRemove.classList.add("fade");
        //transition css is set to 0.25s/250ms
        window.setTimeout(()=> { cardToRemove.remove();},250);
    });

    //add any card not displayed yet
    var added = inDeck.difference(displayed);

    //create an array of card
    var fullDeck = [];
    S.getDeck().forEach(c=>fullDeck.push(c));
    fullDeck.push(S.currentCard());
    //keep the added cards
    fullDeck.filter(c => added.has("card"+c.id))
        //and display them
        .forEach(c=>createCard(c, false));




    if(first) {
        cards.innerHTML = "";
        var stateDeck = S.getDeck();
        stateDeck.push(S.currentCard());
        stateDeck.forEach(card=>createCard(card));
        first = false;
    }
}
function createCard(card, append=true){
    var svg = document.createElement("svg");
    svg.classList.add("drawn");
    if(append)
        document.getElementById("cards").appendChild(svg);
    else
        document.getElementById("cards").prepend(svg);
    svg.outerHTML = SVG.getSvgForAction(card);
    window.setTimeout(()=> { svg.classList.remove("drawn");},100);
    
}

function isSwitchTurn(){
    var uiTurn =
        document.querySelector("body").classList.contains("turnH")
        ? C.TEAM_HERO
        : C.TEAM_VILLAIN;

    var stateTurn = S.turn;

    return stateTurn !== uiTurn;
}

function drawTurn(){
    if(S.turn === C.TEAM_HERO){
        document.querySelector("body").classList.add("turnH");
        document.querySelector("body").classList.remove("turnV");
    }else{
        document.querySelector("body").classList.add("turnV");
        document.querySelector("body").classList.remove("turnH");
    }
}

function drawBoard(){
    B.drawAll(S.board);
}

function drawAction(){
    var expectedInput = S.expectedAction();

    if(expectedInput.type === C.ACTION_SELECT_DOT){
        //is a dot in range ?
        var selectable = dotInRange(expectedInput.filter)
        if(selectable){
            B.drawDot(selectable, true);
        }
        //TODO : there could be an outcome of a dot selection (split/kill)
    }else if(expectedInput.type === C.ACTION_SELECT_DEST){
        //highlight the allowed  cells
        var allowedCells = S.board.cells.filter(cell => expectedInput.filter(cell));
        var forbiddenCells = S.board.cells.filter(cell => !expectedInput.filter(cell));
        B.drawCells(forbiddenCells, true);

        //draw line & outcome board
        if(F.isPointInCells(mouse, allowedCells, S.dots)){

            //the board if the action was played
            var potentialBoard = expectedInput.outcome(S.dots, mouse);
            B.drawBoard(potentialBoard);

            //cross any dots that would be removed if action was played
            var remainingDots = new Set( F.checkDeletion(S.turn, potentialBoard.cells.map(c=>c.site)));
            var allDots = new Set(potentialBoard.cells.map(c=>c.site));    
            var removedDots= allDots.difference(remainingDots);
            B.crossPoints(removedDots);
            //draw path 
            var virtual = new O.Dot(S.turn, mouse.x,mouse.y,"?");
            B.drawPath(expectedInput.selected, virtual);
        }
    }

   if(expectedInput.selected){
        B.drawDot(expectedInput.selected, true);
   }
}

function dotInRange(filter){
    var nearestDot = F.nearestDot( S.dots, mouse);

    if(!nearestDot){
        console.error("One dot should be nearest ?");
    }

    var distToMouse = F.dist(mouse, nearestDot);
    if(distToMouse > C.SELECT_RANGE){
        return null;
    }
    if(filter(nearestDot)){
        return nearestDot;
    }
    return null;
}
