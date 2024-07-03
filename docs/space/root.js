
const EPSILON = 0.00000000001;

var board = document.getElementById("board");

var mouse = {};

const SIZE = 600; //must match size of cancs
const DOTS = 5;

const TEAM_EVIL = "red";
const TEAM_HERO = "blue";

const STATE_IDLE = "idle"
const STATE_SELECT_DOT = "select";
const STATE_MOVE = "move";

var turn = TEAM_HERO;


var state = STATE_IDLE;
var dots = [];



function start(){
    initPos();
    startLoop();

    board.addEventListener("mousemove", (e) => {
            var rect = board.getBoundingClientRect();

            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
    });

    board.addEventListener("mouseup", (e) => {

        if(state === STATE_SELECT_DOT ){
            var nearest=dots.filter(d=>d.nearest)[0];
            if(nearest){
                state = STATE_MOVE;
                nearest.selected = true;
            }
        }else if(state == STATE_MOVE){
            mouse.commit = true;
        }

    });

    state=STATE_SELECT_DOT;

}

function initPos(dotsArray = dots){

    const MARGIN = 40;

    dotsArray.length = 0;

    var yB = MARGIN;
    var yR = SIZE - MARGIN;
    for(let i = 0; i < DOTS; i++){
        let x = MARGIN + i*((SIZE-2*MARGIN)/(DOTS-1));
        dotsArray.push(new Dot(TEAM_HERO,x,yB));
        dotsArray.push(new Dot(TEAM_EVIL,x,yR));
    }
    return dotsArray;
}

function startLoop(){
    window.requestAnimationFrame(step);
}

function step(timeStamp){

//    var startTime = performance.now()
//    var logTime = (step = "step") => {
//        console.log(step+" (ms): ", performance.now()-startTime);
//    }

    if(timeStamp < 90){
        window.setTimeout(()=>window.requestAnimationFrame(step), 90)
    }

    var ctx = board.getContext('2d');
    ctx.clearRect(0,0, SIZE, SIZE);

    var virtual = {};
    virtual.x = mouse.x;
    virtual.y = mouse.y;
    virtual.team=turn;
    virtual.virtual = true;

    var selected = dots.filter(d=>d.selected)[0];

    // actual move
    if(mouse.commit && selected && virtual && state === STATE_MOVE && validMove(selected, virtual)){
        selected.x = virtual.x;
        selected.y= virtual.y;
        selected.selected = false;

        state = STATE_SELECT_DOT;
        turn = (turn === TEAM_HERO ? TEAM_EVIL : TEAM_HERO);
    }
    mouse.commit=false;

    //the actual situation of the gameboard
    var voronoi = computeCells(dots);

    //compute score
    var outsideEdges = voronoi.edges.filter(e => (!e.lSite)||(!e.rSite));
    var evilScore = 0;
    var heroScore = 0;
    outsideEdges.forEach(e => {
        var score = dist(e.va, e.vb);
        if((e.lSite && e.lSite.team === TEAM_EVIL)){
            evilScore += score;
        }else{
            heroScore += score;
        }
    });

    document.querySelector("#hero [score='borderPct']").innerHTML = Math.round((100*heroScore)/(SIZE*4));
    document.querySelector("#villain [score='borderPct']").innerHTML = Math.round((100*evilScore)/(SIZE*4));


    drawCells(voronoi);

    if(selected && virtual && state === STATE_MOVE && validMove(selected, virtual)){

        var virtualDots = dots.filter(d => !d.selected);
        virtualDots.push(virtual);

        //voronoi if the player plays this move
        var virtualVoronoi = computeCells(virtualDots);
        drawCells(virtualVoronoi);
    }

    findNearest();

    if(selected && virtual && state === STATE_MOVE && validMove(selected, virtual)){
        ctx.lineWidth=1;
        ctx.strokeStyle = "black"
        ctx.beginPath();
        ctx.moveTo(selected.x,selected.y);
        ctx.lineTo(virtual.x,virtual.y);
        ctx.stroke();
    }
    drawDots();
    if(selected && virtual && state === STATE_MOVE && validMove(selected, virtual)){
        drawDot(virtual);
    }
//    logTime("end");
    window.requestAnimationFrame(step);
}

function validMove(origin, dest, dotsArray = dots){
    return samePoint(origin, dots.sort((d,e) => dist(dest,d)-dist(dest,e) )[0]);
}

function findNearest(team=turn){
    document.getElementById("log").innerHTML = "(+"+mouse.x+","+mouse.y+")";


    dots.filter(d=>d.nearest).forEach(d=>{d.nearest=false;});

    var nearest = dots
        .filter(d => d.team === team)
        .filter(d => dist(d, mouse) < 40)
        .sort((a,b)=>dist(mouse,a)-dist(mouse,b))[0];
    if(nearest)
        nearest.nearest=true;

    return nearest;
}

function computeCells(dotsArray = dots){
    var voronoi = new Voronoi();
    var bbox = {xl: 0, xr: SIZE, yt: 0, yb: SIZE};

    var diagram = voronoi.compute(dotsArray, bbox);

    return diagram;
}





function drawCells(vDiag, fill = true){
    const ctx = board.getContext("2d");

    ctx.lineWidth=0.5;

    //first villains, then heros, then villains but dashed
    vDiag.cells.filter(c => c.site && c.site.team === TEAM_EVIL)
        .forEach(cell => drawCell(ctx, cell, [], fill ));

    vDiag.cells.filter(c => c.site && c.site.team === TEAM_HERO)
        .forEach(cell => drawCell(ctx, cell, [], fill));

    vDiag.cells.filter(c => c.site && c.site.team === TEAM_EVIL)
        .forEach(cell => drawCell(ctx, cell, [15,15], fill));
}

function drawCell(ctx, cell, lineDash = [], fill=true){

    var shell = buildShell(cell);

    ctx.fillStyle= bgColor(cell.site.team);

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

function buildShell(cell){

    var edges = cell.halfedges.map(he=>he.edge);
    var first = edges.splice(0,1)[0];
    var tail = first.va;
    var head = first.vb;

    var points = [];
    points.push(tail,head);

    while(!samePoint(tail, head)){
        //find the remaining edge that share head
        var nextEdge = edges.filter(e => samePoint(head,e.va)||samePoint(head, e.vb))[0];


        head = samePoint(head,nextEdge.va)?nextEdge.vb:nextEdge.va;
        points.push(head);
        edges.splice(edges.indexOf(nextEdge),1);


    }

    return points;
}


function samePoint(pA, pB){

    return (Math.abs(pA.x - pB.x) < EPSILON) && (Math.abs(pA.y-pB.y)<EPSILON);
}



function drawDots(canvasId = 'board',dotsArray=dots){
    dotsArray.forEach(dot=>drawDot(dot));
}

function drawDot(dot){
    const ctx = board.getContext("2d");

    ctx.lineWidth=2;
    ctx.strokeStyle='#111';
    var radius = 5;
    if(dot.selected || (dot.nearest && state === STATE_SELECT_DOT)){
        ctx.lineWidth=3;
        ctx.strokeStyle='#111';
        radius = 8
    }
    ctx.fillStyle= mainColor(dot.team);

    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function Dot(team, x,y){
    let dot = {};
    dot.team=team;
    dot.x=x;
    dot.y=y;
    return dot;
}

function mainColor(team){
    return color(team, "1");
}
function bgColor(team){
    return color(team, "0.25");
}
function color(team, opacity){
    if(team === TEAM_EVIL){
        return 'rgb(255,105,50,'+opacity+")";
    }else{
        return 'rgb(50,50,255,'+opacity+")";
    }
}

function dist(a,b){
        return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2))
}