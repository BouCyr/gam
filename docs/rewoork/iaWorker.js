
import * as C from "./constants.js";
import * as S from "./state.js";
import * as P from "./play.js";
import * as F from "./functions.js";


const GRANULARITY = 10;

self.onmessage = function(e) {

    var startTime = performance.now()


    //expectation : dots & who is playing  
    var msg = e.data;

    const playingteam = msg.card.team;
    var startDate = new Date();
    console.info(`Launching IA for ${playingteam}, @ ${startDate}()`);
    //reinit a state
    S.iaInit(
        msg.card,
        msg.dots,
        msg.decks
    );
    P.init(msg.card);
    const scoreBefore = F.computeScore(S.dots);

    //dummy check well outside the select range to grab the initial filters
    var outcome = P.whatIfISelect({x:-2*C.SELECT_RANGE, y:-2*C.SELECT_RANGE});

    var dotFilter = outcome.dotFilter;
    var cellFilter = outcome.cellFilter;


    var inputCandidates = getCandidates( dotFilter, cellFilter);
    console.info(`${inputCandidates.length} candidates for first selection`);

    var plays = [];

    //some() will stop as soon as an execution return 'true'
    inputCandidates.some(candidate => {
        //reinit state ; it has been mutated by our action below
        S.iaInit(
            msg.card,
            msg.dots,
            msg.decks
        );
        P.init(msg.card);
        var whatIf2 = P.select(candidate);
        var secondCandidates = getCandidates(
            whatIf2.dotFilter,
            whatIf2.cellFilter
        );
        console.info(`${secondCandidates.length} candidates for second selection`);
        //some() will stop as soon as an execution return 'true'
        secondCandidates.some(candidate2 => {
            S.iaInit(
                msg.card,
                msg.dots,
                msg.decks
            );
            P.init(msg.card);
            P.select(candidate);
            var outcome = P.select(candidate2); //will update state and so on
            if(outcome.valid){
                //sometimes, an outcome is invalid for a valid candidate 
                //e.g. for split, cellFilter() indentifies the whole cell. Some part of it will be invalid (when mirror is outside the cell)
                var score = F.computeScore(S.dots);
                var deltaScore = F.deltaScores(scoreBefore, score);
                plays.push({
                    plays: [candidate, candidate2],
                    delta: deltaScore,
                    evaluation : evaluateOutcome(playingteam, deltaScore)
                });
            }


            return isComputationTimeout(startTime);
        });
        return isComputationTimeout(startTime);;
    });



    console.log(`IA computation took ${computationTimeMs(startTime)} milliseconds`);
    console.log(`IA evaluated ${plays.length} possibilities`);
    console.info(`${startDate} -> ${new Date}()`);

    //find besst play
    plays.sort((a,b)=>b.evaluation-a.evaluation)
    postMessage(plays[0]);
    return;
 }

function isComputationTimeout(startTime){
    var longerThanMax = computationTimeMs(startTime) > C.MAX_IA_THINK_TIME_ms;
    if(longerThanMax){
        console.info("IA thought for longer than max time ; breaking");
    }
    return longerThanMax;
}

function computationTimeMs(startTime){
    return performance.now() - startTime;
}

 //#region INPUTS 
 function getCandidates( dotFilter, cellFilter){
    if(dotFilter){
        return possibleDots(dotFilter);
    }else if(cellFilter){
        return possiblePoints(cellFilter);
    }else{
        console.warn("neither dot nor cell?");
        return [];
    }
 }

 function possibleDots( dotFilter){
    return S.dots.filter(dot => dotFilter(dot))
 }

 function possiblePoints( cellFilter){
    var result = [];

    for(let x = 0 ; x < C.SIZE ; x += GRANULARITY){
        for(let y = 0 ; y < C.SIZE ; y += GRANULARITY){
            var point = {x:x, y:y};
            var nearestDot = F.nearestDot(S.dots, point);
            if(cellFilter(nearestDot)){
                result.push(point);
            }
        }
    }
    F.shuffle(result);
    //TODO : add interesting points (between two dots/middle o two dots, voronoi vertices)
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