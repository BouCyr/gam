
var iaWorker = new Worker("./iaworker.js");
iaWorker.onmessage = (e)=>{

    console.log("Received result from IA background thread")
    var move = e.data;

    var text = move.type+" "+move.from.x+"/"+move.from.y+" "+move.to.x+"/"+move.to.y;

    document.getElementById("ia").innerHTML = text;
}
iaWorker.onerror = function (e) {
    console.log("Error ia compute", e);
};

function launchIA(team, board, dots){
    iaWorker.postMessage({
        team:team,
        board:board,
        dots:dots
    });
}


var board = document.getElementById("board");
var mouse = {};

var turn ;
var state = STATE_IDLE;
var dots = [];

const forbiddenVillain = forbiddenPattern(bgColor(TEAM_EVIL));
const forbiddenHero = forbiddenPattern(bgColor(TEAM_HERO));

function start(){

    switchTurn();
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



function startLoop(){
    window.requestAnimationFrame(step);
}

function step(timeStamp){

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
        switchTurn();
    }
    mouse.commit=false;

    //the actual situation of the gameboard
    var voronoi = computeCells(dots);

    //compute score
    var score = computeScore(voronoi);

    document.querySelector("#hero [score='borderPct']").innerHTML = Math.round((100*score.hero.border)/(SIZE*4));
    document.querySelector("#villain [score='borderPct']").innerHTML = Math.round((100*score.villain.border)/(SIZE*4));


    drawCells(voronoi);

    //TODO remove
//    if(state === STATE_MOVE){
//
//        choseNextMove(turn,voronoi, dots);
//        choseNextMove(turn,    computeCells(dots), dots);
//    }

    if(selected && virtual && state === STATE_MOVE && validMove(selected, virtual)){

        //current board

        //find the selected cell
        var selectedCell = voronoi.cells.filter(cell => cell.site.selected)[0];
        drawCells(voronoi, oneCellAllowedBgFunction(selectedCell));


        //voronoi if the player plays this move

        //remove the selected/moved one...
        var virtualDots = dots.filter(d => !d.selected);
        //...and replace it by the moved dot
        virtualDots.push(virtual);
        //compute voronoi
        var virtualVoronoi = computeCells(virtualDots);
        //redraw (opacity will be screwed up, but whatever)
        drawCells(virtualVoronoi);
    }else{
        //regular idle drawing
        drawCells(voronoi);
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





function switchTurn(){

    if((!turn) || (turn === TEAM_EVIL)){
        turn = TEAM_HERO;
        document.querySelector("body").classList.add("turnH");
        document.querySelector("body").classList.remove("turnV");
    }else{
        turn = TEAM_EVIL;
        document.querySelector("body").classList.add("turnV");
        document.querySelector("body").classList.remove("turnH");
    }

}



