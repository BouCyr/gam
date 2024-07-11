import * as C from "./constants.js";
import * as F from "./functions.js";

const canvas = document.getElementById("board");

export function drawAll(dots, board){

    drawBoard(board);
    drawDots(dots);

}

function drawBoard(board){
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0,0, C.SIZE, C.SIZE);

    ctx.lineWidth=0.5;

    //first villains, then heros, then villains but dashed
    board.cells.filter(c => c.site && c.site.team === C.TEAM_VILLAIN)
        .forEach(cell => drawCell(ctx, cell, [], bgColor(cell.site.team) ));

    board.cells.filter(c => c.site && c.site.team === C.TEAM_HERO)
        .forEach(cell => drawCell(ctx, cell, [], bgColor(cell.site.team)));

    board.cells.filter(c => c.site && c.site.team === C.TEAM_VILLAIN)
        .forEach(cell => drawCell(ctx, cell, [15,15], 'rgba(111,111,111,0)' ));
}

function drawCell(ctx, cell, lineDash = [], fill){

    var shell = F.buildShell(cell);
    ctx.fillStyle= fill;

    ctx.setLineDash(lineDash);
    ctx.lineWidth = 3;
    ctx.strokeStyle= mainColor(cell.site.team);

    ctx.beginPath();
    ctx.moveTo(shell[0].x, shell[0].y)
    for(let i = 1; i <shell.length; i++){
       ctx.lineTo(shell[i].x, shell[i].y);
    }

    if(fill)
        ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawDots(dots){
    dots.forEach(dot=>drawDot(dot));
}

function drawDot(dot){
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111';
    var radius = 5;

    if(dot.selected || (dot.nearest && state === C.STATE_SELECT_DOT)){
        ctx.lineWidth=3;
        ctx.strokeStyle='#111';
        radius = 8
    }
    ctx.fillStyle = mainColor(dot.team);

    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}


function mainColor(team){
    return color(team, "1");
}
function bgColor(team){
    return color(team, "0.25");
}
function color(team, opacity){
    if(team === C.TEAM_VILLAIN){
        return 'rgb(255,105,50,'+opacity+")";
    }else{
        return 'rgb(50,50,255,'+opacity+")";
    }
}