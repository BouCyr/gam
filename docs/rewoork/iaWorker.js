
import * as C from "./constants.js";
import * as S from "./state.js";
import * as P from "./play.js";
import * as F from "./functions.js";


self.onmessage = function(e) {

    var startTime = performance.now()


    //expectation : dots & who is playing  
    var msg = e.data;

    const playingteam = msg.card.team;
    console.info(`Launching IA for ${playingteam}`);
    //reinit a state
    S.iaInit(
        msg.card,
        msg.dots,
        msg.decks
    );
    P.init(msg.card);
    const scoreBefore = F.computeScore(S.dots);

    //dummy check well outisde the select range to grab the initial filters
    var outcome = P.whatIfISelect({x:-2*C.SELECT_RANGE, y:-2*C.SELECT_RANGE});

    var dotFilter = outcome.dotFilter;
    var cellFilter = outcome.cellFilter;


    var inputCandidates = getCandidates( dotFilter, cellFilter);

    var plays = [];
    console.info(P.status());
    inputCandidates.forEach(candidate => {
        //reinit state ; it has been mutated by our action below
        S.iaInit(
            msg.card,
            msg.dots,
            msg.decks
        );
        P.init(msg.card);
        var whatIf2 = P.whatIfISelect({x:-2*C.SELECT_RANGE, y:-2*C.SELECT_RANGE});
        var secondCandidates = getCandidates(
            whatIf2.dotFilter,
            whatIf2.cellFilter
        );
        secondCandidates.forEach(candidate2 => {
            S.iaInit(
                msg.card,
                msg.dots,
                msg.decks
            );
            P.init(msg.card);
            P.select(candidate);
            P.select(candidate2); //will update state and so on
            console.info(P.status());

            var score = F.computeScore(S.dots);
            var deltaScore = F.deltaScores(scoreBefore, score);
            plays.push({
                plays: [candidate, candidate2],
                delta: deltaScore,
                evaluation : evaluateOutcome(playingteam, deltaScore)
            })
        });
    });



    var endTime = performance.now()
    console.log(`IA computation took ${endTime - startTime} milliseconds`)
 }

 //#region INPUTS 
 function getCandidates( dotFilter, cellFilter){
    if(dotFilter){
        return possibleDots(dotFilter);
    }else if(cellFilter){
        return possiblePoints(cellFilter);
    }else{
        console.warn("neiher dot nor cell?");
        return [];
    }
 }

 function possibleDots( dotFilter){
    return S.dots.filter(dot => dotFilter(dot))
 }

 function possiblePoints( cellFilter){
    var result = [];
    const GRANULARITY = 3;

    for(let x = 0 ; x < C.SIZE ; x += GRANULARITY){
        for(let y = 0 ; y < C.SIZE ; y += GRANULARITY){
            var point = {x:x, y:y};
            if(cellFilter(point)){
                result.push(point);
            }
        }
    }
    return result;
 }
 //#endregion

 //#region SCORING

 function evaluateOutcome(meTeam, delta){

    const myDelta = meTeam === C.TEAM_HERO ? delta.hero : delta.villain;
    const theirDelta = meTeam === C.TEAM_HERO ? delta.villain : delta.hero;

    var borderScore =  myDelta.border; // -2400 -> 2400
    var dotsScore = (myDelta.dots - theirDelta.dots)*3000;
    var winScore = (myDelta.win 
        ? 2*(C.DOTS*2*3000) 
        : (theirDelta.win 
            ? -2*(C.DOTS*2*3000) 
            : 0));

    return borderScore+dotsScore+winScore;



 }

 //#endregion