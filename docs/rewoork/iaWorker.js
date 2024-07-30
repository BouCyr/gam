
import * as C from "./constants.js";
import * as S from "./state.js";
import * as P from "./play.js";


self.onmessage = function(e) {
    //expectation : dots & who is playing

    console.log(e.data);
    var msg = e.data;

    //reinit a state
    S.iaInit(
        msg.card,
        msg.dots,
        msg.decks
    );


    P.init(msg.card);
    var outcome = P.whatIfISelect({x:-1, y:-1});
    
    var possibleOutcomes = [];
    testInputs(
        outcome.dotFilter,
        outcome.cellFilter,
        [],
        possibleOutcomes);

    console.log("?");
    console.log(possibleOutcomes);
}

function testInputs(
    dotFilter,
    cellFilter,
    previousInputs = [],
    outcomes = []){

    // first step : dot or cell ?
    if(dotFilter){

        P.reset();
        console.info(`We come from ${previousInputs.length} previous inputs.`);
        previousInputs.forEach(i => P.select(i));

        var dotsCandidate = S.dots.filter(dotFilter);
        console.info(`We now have ${dotsCandidate.length} dots to check.`);

        dotsCandidate.forEach(dot=>{

            var nextOutcome = P.select(dot);
            var inputs = [...previousInputs];
            inputs.push(dot);

            if(nextOutcome.done) {
                outcomes.push(nextOutcome);
                console.info("A full play was found : ");
                inputs.forEach(dot => console.info(` -selecting (${dot.x},${dot.y})` ))

            }else{
                testInputs(
                    nextOutcome.dotFilter,
                    nextOutcome.cellFilter, 
                    inputs, 
                    outcomes);
            }
        });

    }else if( cellFilter){
        //...
    }

}