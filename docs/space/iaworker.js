importScripts("constants.js","root.js", "ia.js","rhill-voronoi-core.min.js");

self.onmessage = function(e) {
  console.log('Launching IA thread');


  var bestMove = choseNextMove(e.data.team, e.data.board, e.data.dots /*action*/ );
  console.log('IA thread done, posting');
  postMessage(bestMove);
}

