
const SIZE = 800; //must match size of cancs
const DOTS = 7;

var dots = [];

function initPos(dotsArray = dots){

    const MARGIN = 40;
    var y = MARGIN;

    dotsArray.clear();

    for(let i = 0; i < DOTS.length; i++){
        let x = MARGIN + i*((SIZE-2*MARGIN)/DOTS.length);
        dotsArray.push(new Dot("blue",x,y));
    }
    y = SIZE - MARGIN;
    for(let i = 0; i < DOTS.length; i++){
        let x = MARGIN + i*((SIZE-2*MARGIN)/DOTS.length);
        dotsArray.push(new Dot("blue",x,y));
    }
    return dotsArray;
}

function draw(canvasId = 'board',dotsArray=dots){
    const ctx = document.getElementById("board").getContext("2d");

    ctx.strokeWidth=2;
    ctx.strokeStyle='black';
    dotsArray.forEach(dot=>{
        
        ctx.fillStyle= dot.team;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();


    });
}

function Dot(team, x,y){
    let dot = {};
    dot.team=team;
    dot.x=x;
    dot.y=y;
    return dot;
}