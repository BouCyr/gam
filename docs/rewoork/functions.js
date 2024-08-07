import * as C from "./constants.js";
import * as O from "./objects.js";


export function inBounds(point){
    return point.x >= 0 && point.x <= C.SIZE
        && point.y >= 0 && point.y <= C.SIZE;
}


export function computeScore(board){


    var score = new O.Score();

    //border occupation
    var outsideEdges = board.edges.filter(e => (!e.lSite)||(!e.rSite));
    outsideEdges.forEach(e => {
        var eScore = dist(e.va, e.vb);
        if((e.lSite && e.lSite.team === C.TEAM_VILLAIN)){
            score.villain.border += eScore;
        }else{
            score.hero.border += eScore;
        }
    });

    //win ?

    if(score.villain.border === 0 || (C.SIZE*4)===score.hero.border){ // rounding error sometimes ; never seen it on both side
        score.hero.win = true;
        console.info("HERO WINS");
    } else if(score.hero.border === 0 || (C.SIZE*4)===score.villain.border){
        score.villain.win = true;
        console.info("HERO LOSES");
    }

    //number of dots
    board.cells.map(cell=>cell.site).forEach(dot => dot.team===C.TEAM_VILLAIN?score.villain.dots++:score.hero.dots++);

    return score;
}

export function computeCells(dotsArray){
    var voronoi = new Voronoi();
    var bbox = {xl: 0, xr: C.SIZE, yt: 0, yb: C.SIZE};

    var diagram = voronoi.compute(dotsArray, bbox);

    return diagram;
}

export function buildShell(cell){

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

export function samePoint(pA, pB){
    return (Math.abs(pA.x - pB.x) < C.EPSILON) && (Math.abs(pA.y-pB.y)<C.EPSILON);
}

export function sameDot(pA, pB){
    return samePoint(pA,pB);
}

export function dist(a,b){
        return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2))
}

export function nearestDot(dots, pos){
    return dots.sort((a,b)=>{return dist(a,pos) - dist(b,pos);})[0];
}

export function dotInRange(dots, pos, range = C.SELECT_RANGE){
    var nearest = nearestDot( dots, pos);

    if(!nearest){
        console.error("One dot should be nearest ?");
    }
    var distToMouse = dist(pos, nearest);
    return distToMouse <= range ? nearest:null;
}


export function isPointInCell(point, cell, dots){
    var nearest = nearestDot(dots, point);
    return sameDot(nearest, cell.site)
}

export function isPointInCells(point, cells, dots){

    for(let i = 0 ; i < cells.length ; i++) {
        const cell=cells[i];
        if(isPointInCell(point, cell, dots)) {
            return true
        }
    }
    return false;
}


/*
Check if any dot should be removed after a move.
This function is recursive, and order of the dots is important. Any removed dot changes the board, some some may/may not be surrounded once a dot is removed.

The playing team is important as well (dots of the OTHER team are removed first, which can have consequences on the resulting board)

*/
export function checkDeletion(playingTeam, someDots){

    var aBoard = computeCells(someDots);

    //find the surrounded dots of the oppo
    var them = someDots
                .filter(dot=>dot.team !== playingTeam)
                .filter(dot=> isSurrounded(dot, aBoard));

    // some dots are surrounded
    if(them.length > 0){
        var removed = them[0];
        //remove the first one...
        var updated = someDots.filter(d => d !== removed);      
        //... and apply again (with one less dot)
        return checkDeletion(playingTeam, updated);

    }

    //idem with our team
    var us = someDots
               .filter(dot=>dot.team === playingTeam)
               .filter(dot=> isSurrounded(dot, aBoard));
    if(us.length > 0){
        var removed = us[0];
        var updated = someDots.filter(d => d !== removed);
        return checkDeletion(playingTeam, updated);
        
    }
    //these dots are not surrounded !
    return someDots;
}

export function isSurrounded(dot, board){

   return board
       .cells.filter(cell => sameDot(dot, cell.site))[0] //find the cell corresponding to the dot
           .halfedges //consider the edges
           .map(he => (sameDot(he.site,he.edge.lSite))?he.edge.rSite:he.edge.lSite) // consider the opposing dot
           .filter(n=>n) // remove null dot (ie edge with the outside of the board)
           .every(n=>n.team !== dot.team) //check if every dots neighbouring the dot is for the outside team
}

var currentId = 0;
export function uniqueId(){
    var increment = Math.floor(Math.random()*50);
    //in case two ids are requested at the same time, increment by a random number ; should be safe enough ?
    return (currentId+=increment);
}


/**
 * Return the neighbours of a dot
 * @param {Dot} dot 
 * @param {Dot[]} dots 
 * @returns the neighbours of dot
 */
export function neighbours(dots, dot){
    var voronoi = computeCells(dots);
    try{
    var dotCell = voronoi.cells.filter(cell => sameDot(dot, cell.site))[0];
    }catch{
        console.log("wat?");
    }
    return dotCell.halfedges.map(h=>h.edge)
        .filter(edge=>otherSide(dot, edge)) // ignore edges with the outside
        .map(edge=>otherSide(dot, edge));
}

export function areNeighbours(dots, dotA, dotB){
    return neighbours(dots, dotA).filter(n => samePoint(n, dotB)).length>0;
}

/**
 *  may return null if the edge is on the outside/buonds
  */
export function otherSide(dot, edge){
    if(!edge.lSite || !edge.rSite)
        return null;

    return samePoint(dot, edge.lSite)?edge.rSite:edge.lSite;
}

//in rad -Pi -> Pi
export function calcAngle(a, b) {
    var dx = b.x - a.x;	
    var dy = b.y - a.y; 
    return Math.atan2(dy, dx) ;
}