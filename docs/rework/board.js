import * as C from "./constants.js";
import * as F from "./functions.js";

const canvas = document.getElementById("board");



export function drawAll(board){
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0, C.SIZE, C.SIZE);
    drawBoard(board);
    drawDots(board.cells.map(cell => cell.site));

}

export function drawBoard(board){

    drawCells(board.cells)
}

export function drawCells(cells, forbidden = false) {
    const ctx = canvas.getContext("2d");
    ctx.lineWidth=0.5;

    //first villains, then heros, then villains but dashed
    cells.filter(c => c.site && c.site.team === C.TEAM_VILLAIN)
        .forEach(cell => drawCell(ctx, cell, [], forbidden ? forbiddenVillain : bgColor(cell.site.team) ));

    cells.filter(c => c.site && c.site.team === C.TEAM_HERO)
        .forEach(cell => drawCell(ctx, cell, [], forbidden ? forbiddenHero :  bgColor(cell.site.team)));

    cells.filter(c => c.site && c.site.team === C.TEAM_VILLAIN)
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

export function crossPoints(points){
    
    const CROSS_SIZE = 15;
    
    const ctx = canvas.getContext("2d");

    points.forEach(dot => {

        ctx.lineWidth = 9;
        ctx.strokeStyle = '#111';

        var origin = dot.copy(dot.x-(CROSS_SIZE/2), dot.y-(CROSS_SIZE/2));
        var dest =   dot.copy(dot.x+(CROSS_SIZE/2), dot.y+(CROSS_SIZE/2));
        ctx.beginPath();
        ctx.moveTo(origin.x,origin.y);
        ctx.lineTo(dest.x,dest.y);
        ctx.stroke();

        var origin = dot.copy(dot.x+(CROSS_SIZE/2), dot.y-(CROSS_SIZE/2));
        var dest =   dot.copy(dot.x-(CROSS_SIZE/2), dot.y+(CROSS_SIZE/2));
        ctx.beginPath();
        ctx.moveTo(origin.x,origin.y);
        ctx.lineTo(dest.x,dest.y);
        ctx.stroke();

        ctx.lineWidth = 4;
        ctx.strokeStyle = 'red';

        var origin = dot.copy( 2 + dot.x-(CROSS_SIZE/2),  2 + dot.y-(CROSS_SIZE/2));
        var dest =   dot.copy(-2 + dot.x+(CROSS_SIZE/2), -2 + dot.y+(CROSS_SIZE/2));
        ctx.beginPath();
        ctx.moveTo(origin.x,origin.y);
        ctx.lineTo(dest.x,dest.y);
        ctx.stroke();

        var origin = dot.copy(-2+dot.x+(CROSS_SIZE/2), 2+ dot.y-(CROSS_SIZE/2));
        var dest =   dot.copy( 2+dot.x-(CROSS_SIZE/2),-2+ dot.y+(CROSS_SIZE/2));
        ctx.beginPath();
        ctx.moveTo(origin.x,origin.y);
        ctx.lineTo(dest.x,dest.y);
        ctx.stroke();
        /*
        // 4 in UI...
        ctx.lineWidth = 15;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = "red";

        //TL->DR
        ctx.beginPath();
        ctx.moveTo(point.x-CROSS_SIZE, point.y-CROSS_SIZE);
        ctx.moveTo(point.x+CROSS_SIZE, point.y+CROSS_SIZE);
        ctx.stroke();
        //TR->DL
        ctx.beginPath()
        ctx.moveTo(point.x+CROSS_SIZE, point.y-CROSS_SIZE);
        ctx.moveTo(point.x-CROSS_SIZE, point.y+CROSS_SIZE);
        ctx.fill();
        ctx.stroke();
        //then 3 in red*/
    });
    

}

export function drawDot(dot, emphasis){
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111';
    var radius = 5;

    if(emphasis){
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

export function drawPath(origin, dest){
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111';

    ctx.beginPath();
    ctx.moveTo(origin.x,origin.y);
    ctx.lineTo(dest.x,dest.y);
    ctx.stroke();

    drawDot(dest); //origin is selected, and will be drawn above

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


/*PATTERNS*/
const forbiddenVillain = forbiddenPattern(bgColor(C.TEAM_VILLAIN));
const forbiddenHero = forbiddenPattern(bgColor(C.TEAM_HERO));

function forbiddenPattern(color){
    const offscreen = new OffscreenCanvas(20, 20);
    const ctx =offscreen.getContext("2d");

    ctx.lineWidth=3;
    ctx.strokeStyle=color;

//    for(let i = -10; i += 6; i <= 16){
    let i = 0;
    {
        ctx.beginPath()
        ctx.moveTo(-2,-2);
        ctx.lineTo(22,22);
        ctx.stroke();
    }


    const pattern = ctx.createPattern(offscreen, 'repeat');
    return pattern;
}