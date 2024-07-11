import * as C from "./constants.js";
import * as S from "./state.js";
import * as O from "./objects.js";
import * as B from "./board.js";

export var mouse = {x:0, y:0};

export function init(){



    let canvas = document.getElementById("board");
    canvas.addEventListener("mousemove", (e) => move(e));
    canvas.addEventListener('contextmenu', event => event.preventDefault())
    canvas.addEventListener("mouseup", (e) => {

        if(e.button === 0){ //left click

        }else{ //right click. If a dot was selected, un select

        }

    });

}

export function update(){
    handleTurn();
    handleBoard();
}

function leftClick(e){

}

function rightClick(e){

}

function move(mouseEvent){
    let canvas = document.getElementById("board");
    var rect = canvas.getBoundingClientRect();

    mouse.x = mouseEvent.clientX - rect.left;
    mouse.y = mouseEvent.clientY - rect.top;

    document.getElementById("log").innerText = mouse.x+"/"+mouse.y;
}

function handleTurn(){
    if(S.turn === C.TEAM_HERO){
        document.querySelector("body").classList.add("turnH");
        document.querySelector("body").classList.remove("turnV");
    }else{
        document.querySelector("body").classList.add("turnV");
        document.querySelector("body").classList.remove("turnH");
    }
}

function handleBoard(){
    B.drawAll(S.dots, S.board);
}