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

        ctx.beginPath();
        ctx.moveTo(dot.x-(CROSS_SIZE/2), dot.y-(CROSS_SIZE/2));
        ctx.lineTo(dot.x+(CROSS_SIZE/2), dot.y+(CROSS_SIZE/2));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(dot.x+(CROSS_SIZE/2), dot.y-(CROSS_SIZE/2));
        ctx.lineTo(dot.x-(CROSS_SIZE/2), dot.y+(CROSS_SIZE/2));
        ctx.stroke();

        ctx.lineWidth = 4;
        ctx.strokeStyle = 'red';

        ctx.beginPath();
        ctx.moveTo( 2 + dot.x-(CROSS_SIZE/2),  2 + dot.y-(CROSS_SIZE/2));
        ctx.lineTo(-2 + dot.x+(CROSS_SIZE/2), -2 + dot.y+(CROSS_SIZE/2));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-2+dot.x+(CROSS_SIZE/2), 2+ dot.y-(CROSS_SIZE/2));
        ctx.lineTo( 2+dot.x-(CROSS_SIZE/2),-2+ dot.y+(CROSS_SIZE/2));
        ctx.stroke();
    });
    

}

export function halo(dot, msSinceStart=0){
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.fillStyle = '#FFF2';

    const ANIM_DURATION = 1500; //ms
    var animePercent = ((msSinceStart%ANIM_DURATION)/ANIM_DURATION);
    
    var radius = C.SELECT_RANGE;
    //find a dash that works with radius (ie a plain divider wihtout remainder)
    var perimeter = 2*Math.PI*radius;
    var dashSize = perimeter/20;

    var offset = 2* dashSize*animePercent;
    ctx.lineDashOffset  = -1*offset;

    ctx.setLineDash([dashSize, dashSize]);

    
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius, 0  , 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset=0;
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

export function drawSwitch(origin, dest, msSinceStart=0){
   
    curveTo(origin, dest, msSinceStart);
    curveTo(dest, origin, msSinceStart);
}

function curveTo(origin, dest, msSinceStart=0){
    const ctx = canvas.getContext("2d");

    const DASH_SIZE = 5;
    const ANIM_DURATION = 500; //ms
    const GAP_TO_LINE = 20;

    var animePercent = (msSinceStart%ANIM_DURATION)/ANIM_DURATION;

    var dist = F.dist(dest, origin);

    var angle = F.calcAngle(origin, dest) ;
    ctx.translate(origin.x, origin.y);
    ctx.rotate(angle);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111';
    ctx.setLineDash([DASH_SIZE,DASH_SIZE]);

    ctx.beginPath();
    // 2* => the full cover the drawn dash and the empty space
    var offset = 2* DASH_SIZE*animePercent;
    ctx.lineDashOffset  = -1*offset;

    ctx.moveTo(0,0);
    ctx.quadraticCurveTo(0, GAP_TO_LINE,dist/2, GAP_TO_LINE );
    ctx.quadraticCurveTo(dist, GAP_TO_LINE,dist,0 );
    
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.resetTransform();
}

export function drawPath(origin, dest, msSinceStart=0){
    const ctx = canvas.getContext("2d");

    var DASH_SIZE = 5;
    const ANIM_DURATION = 500; //ms
    var animePercent = (msSinceStart%ANIM_DURATION)/ANIM_DURATION;

    var dist = F.dist(dest, origin);
    
    var angle = F.calcAngle(origin, dest) ;
    ctx.translate(origin.x, origin.y);
    ctx.rotate(angle);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111';
    ctx.setLineDash([DASH_SIZE,DASH_SIZE]);

    ctx.beginPath();

    //there is no dash offset i can find. Instead we just offset the start of the line
    // 2* => the full cover the drawn dash and the empty space
    var offset = 2* DASH_SIZE*animePercent;
    ctx.lineDashOffset  = -1*offset;

    ctx.moveTo(0,0);
    ctx.lineTo(dist,0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.resetTransform();

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