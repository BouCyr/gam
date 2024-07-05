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

function computeCells(dotsArray = dots){
    var voronoi = new Voronoi();
    var bbox = {xl: 0, xr: SIZE, yt: 0, yb: SIZE};

    var diagram = voronoi.compute(dotsArray, bbox);

    return diagram;
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

function sameDot(pA, pB){

    return samePoint(pA,pB);
}


function Dot(team, x,y){
    let dot = {};
    dot.team=team;
    dot.x=x;
    dot.y=y;
    return dot;
}


function dist(a,b){
        return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2))
}

function computeScore(board){


    var score = new Score();

    //border occupation
    var outsideEdges = board.edges.filter(e => (!e.lSite)||(!e.rSite));
    outsideEdges.forEach(e => {
        var eScore = dist(e.va, e.vb);
        if((e.lSite && e.lSite.team === TEAM_EVIL)){
            score.villain.border += eScore;
        }else{
            score.hero.border += eScore;
        }
    });

    //number of dots
    board.cells.map(cell=>cell.site).forEach(dot => dot.team===TEAM_EVIL?score.villain.dots++:score.hero.dots++);

    return score;
}

function Score(){
    var score = {};
    score.hero={};
    score.villain={};
    score.villain.border = 0;
    score.hero.border = 0;
    score.hero.dots=0;
    score.villain.dots=0;

    return score;
}