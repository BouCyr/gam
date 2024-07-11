var iaWorker = new Worker("./iaworker.js");
function launchIA(){
    state=STATE_IDLE;


    iaWorker.postMessage({
        team:turn,
        board:computeCells(dots),
        dots:dots
    });
}
iaWorker.onmessage = (e)=>{

    console.log("Received result from IA background thread")
    var move = e.data;
    var text = move.type+" "+move.from.x+"/"+move.from.y+" "+move.to.x+"/"+move.to.y;

    document.getElementById("ia").innerHTML = text;

    historizeDots(dotsHistory,turn, dots);

    var moved = dots.filter(dot => sameDot(dot, move.from))[0];
    moved.x = move.to.x;
    moved.y = move.to.y;
    state = STATE_SELECT_DOT;
    switchTurn();
}
iaWorker.onerror = function (e) {
    console.log("Error ia compute", e);
};



function choseNextMove(team, board, dots /*action*/ ){

    var start = performance.now();



    var moves = calcMoves(team, board, dots /*action*/);
    var bestMove = moves.sort((a,b)=> b.fitness-a.fitness)[0];
    var computationTime = performance.now() - start;


    console.info("best move found in "+computationTime+"ms")

    return bestMove;
}

function calcMoves(team, board, dots /*action*/){
    var moves = [];
    const start = performance.now();

    var counter = 0;
    //generate X candidates points on grid
    for(let x = 1 ; x <= SIZE; x+= 5){
        for(let y = 1 ; y <= SIZE; y+= 5){
            var move = calcMove(team, board, dots, new Dot(team, x,y));
            counter++;
            if(move) //else => not a valid move
                moves.push(move);
        }
    }
    //fill the rest of time with random points
    while((performance.now() - start)<MAX_IA_THINK_TIME_ms){
        const x = Math.random()*SIZE;
        const y = Math.random()*SIZE;
        var move = calcMove(team, board, dots, new Dot(team, x,y));
        counter++;
        if(move) //else => not a valid move
            moves.push(move);
    }

    console.info("moves considered : ", counter);
    return moves;
 }

 function calcMove(team, board, dots, virtual){
     //recherche du dot correspondant
     var nearestCell = board.cells.sort((a,b) => dist(virtual, a.site) - dist(virtual, b.site))[0];
     if(nearestCell.site.team !== team){
         //candidate is not in the team area
         return null;
     }
     var origin = nearestCell.site;

     // création du board si le coup est joué
     var updatedDots = dots.filter(c => !(sameDot(origin,c)));
     updatedDots.push(virtual);
     try{
        var updatedBoard = computeCells(updatedDots);
     }catch(e){
        console.error(e)
     }

     var scoreDelta = evaluateMove(team, board, updatedBoard);
     var result = new MoveFitness(origin, virtual, scoreDelta);
     return result;
 }

function MoveFitness(moved,to,fitness){
    var result = {};
    result.type="MOVE";
    result.from = moved;
    result.to = to;
    result.fitness = fitness;

    return result;
}

function evaluateMove(myTeam, originBoard, updatedBoard){

    //evaluate for VILLAIN
    var originScore = computeScore(originBoard);
    var updatedScore = computeScore(updatedBoard);

    var borderEvolution = updatedScore.villain.border - originScore.villain.border;
    var dotEvolution = (updatedScore.villain.dots - originScore.villain.dots) - (updatedScore.hero.dots - originScore.hero.dots)

    //reverse if actually evaluating an HERO score
    var factor = myTeam === TEAM_EVIL ? 1 : -1;
    return factor * (borderEvolution + 200*dotEvolution);

}