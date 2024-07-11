import * as C from "./constants.js";

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

function samePoint(pA, pB){
    return (Math.abs(pA.x - pB.x) < C.EPSILON) && (Math.abs(pA.y-pB.y)<C.EPSILON);
}

function sameDot(pA, pB){
    return samePoint(pA,pB);
}

function dist(a,b){
        return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2))
}