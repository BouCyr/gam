

/* GAME STATE */
var board = document.getElementById("board");
var mouse = {};

var turn ;
var state = STATE_IDLE;
var dots = [];

var dotsHistory = [];


function start(){

    switchTurn();
    initPos();
    startLoop();

    board.addEventListener("mousemove", (e) => {
            var rect = board.getBoundingClientRect();

            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
    });

    board.addEventListener('contextmenu', event => event.preventDefault())

    board.addEventListener("mouseup", (e) => {

        if(e.button === 0){ //left click
            if(state === STATE_SELECT_DOT ){
                var nearest=dots.filter(d=>d.nearest)[0];
                if(nearest){
                    state = STATE_MOVE;
                    nearest.selected = true;
                }
            }else if(state == STATE_MOVE){
                mouse.commit = true;
            }
        }else{ //right click. If a dot was selected, un select
            if(state == STATE_MOVE){
                dots.forEach(dot => dot.selected=false);
                state = STATE_SELECT_DOT;
            }
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

    var moved = false;
    // actual move
    if(mouse.commit && selected && virtual && state === STATE_MOVE && validMove(selected, virtual)){
        moved = true;
        historizeDots(dotsHistory,turn, dots);
        selected.x = virtual.x;
        selected.y= virtual.y;
        selected.selected = false;

        state = STATE_SELECT_DOT;
        switchTurn();
    }
    mouse.commit=false;

    //the actual situation of the gameboard
    var voronoi = computeCells(dots);

    //check if dots are removed
    if(moved){


        var turnResult = checkDots(dots, voronoi)
        if(turnResult.update){
            //some are removed
            dots = turnResult.dots;
            voronoi = computeCells(dots);
        }
    }

    //compute score
    var score = computeScore(voronoi);

    document.querySelector("#hero [score='borderPct']").innerHTML = Math.round((100*score.hero.border)/(SIZE*4));
    document.querySelector("#villain [score='borderPct']").innerHTML = Math.round((100*score.villain.border)/(SIZE*4));


    drawCells(voronoi);


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

   nearestToMouse();

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

function nearestToMouse(team=turn){
    document.getElementById("log").innerHTML = "(+"+mouse.x+","+mouse.y+")";

    dots.filter(d=>d.nearest).forEach(d=>{d.nearest=false;});


    return findNearestTo(team, mouse);
}

function findNearestTo(team, pos){

    var nearest = dots
        .filter(d => d.team === team)
        .filter(d => dist(d, pos) < 40)
        .sort((a,b)=>dist(pos,a)-dist(pos,b))[0];
    if(nearest)
        nearest.nearest=true;

    return nearest;
}




//TODO : update to tke the NEXT turn in param
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

function checkDots(dots, board){
    var result = {
        //will contain the dots AFTER the check (dots input ref will be updated as well)
        dots:[],
        //true if some dots were removed/added (?)
        update:false
        //TODO : game won ? or maybe when computing score ? maybe put score computing here ?
    }

    var workingDots = [];
    dots.forEach(dot=>workingDots.push(dot));



    //first all ENEMY dots ; this way if a move isolates both a 'mine' and a 'their', the 'thier' will be removed first (and the 'mine' may find a friendly neighbour back)
    var them = turn===TEAM_EVIL?TEAM_HERO:TEAM_EVIL;
    console.info("Checking if "+them+" has lonely dot ")
    workingDots.filter(dot => dot.team !== turn).forEach(theirDot => {
        if(hasNoFriendlyNeighbour(theirDot, board)){
            result.update=true;
            workingDots = removeDot(workingDots, theirDot);
        }else{
            result.dots.push(theirDot);
        }
    });
    console.info("Checking if "+turn+" has lonely dot ")
    workingDots.filter(dot => dot.team === turn).forEach(myDot=>{
        if(hasNoFriendlyNeighbour(myDot, board)){
            result.update=true;
            workingDots = removeDot(workingDots, myDot);
        }else{
            result.dots.push(myDot);
        }
    });

    return result;
}

function hasNoFriendlyNeighbour(dot, board){

    return board
        .cells.filter(cell => sameDot(dot, cell.site))[0] //find the cell corresponding to the dot
            .halfedges //consider the edges
            .map(he => (sameDot(he.site,he.edge.lSite))?he.edge.rSite:he.edge.lSite) // consider the opposing dot
            .filter(n=>n) // remove null dot (ie edge with the outside of the board)
            .every(n=>n.team !== dot.team) //check if every dots neighbouring the dot is for the outside team
}


function GO_BACK(){
    var previousState = dotsHistory[dotsHistory.length -1 ];

    dots = previousState.dots;
    dotsHistory = dotsHistory.slice(0,dotsHistory.length-1)


    switchTurn();
    //TODO : find the current action and revert to correct state.
    //right now we only have 'move'
    state = STATE_SELECT_DOT;
}





