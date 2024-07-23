import * as C from "../constants.js";


export function getSvgForAction(card){


    const teamClass = (card.team==C.TEAM_VILLAIN?"villain":"hero");

    switch(card.type){
        case C.STATE_MOVE   : return moveSvg(teamClass, card);
        case C.STATE_LEAP   : return leapSvg(teamClass, card);
        case C.STATE_SPLIT  : return splitSvg(teamClass, card);
        default             : return wat(teamClass, card);
    }
}



function wat(teamClass, card){
return  `
<svg style="width: 75px; height:110px;" >
    <text class="cardLabel" dominant-baseline="text-bottom" text-anchor="middle" x="50%" y="50%">?${card.type}?</text>
</svg>
`;
}


function splitSvg(teamClass, card){
    return `
    <svg class="card ${teamClass}" id="card${card.id}">
        <!-- SPLIT : replace a dot by two dots around the relaxation point-->
        <!-- their area -->
        <polygon class="adv" points="-10,-10 -10,50 90,5 90,-10"/>
        <!-- my area -->
        <polygon class="mine" points="-10,130 -10,50 90,5 90,130"/>
        <!-- their border-->
        <line class="adv" stroke-width="3" x1="-10" x2="90" y1="50" y2="5"/>
        <!-- my border-->
        <line class="mine" stroke-dasharray="15 15" stroke-width="3" x1="-10" x2="90" y1="50" y2="5"/>


        <!--move-->
        <line stroke="black" stroke-width="1" x1="35" x2="15" y1="80" y2="60"/>
        <!--move-->
        <line stroke="black" stroke-width="1" x1="35" x2="55" y1="80" y2="100"/>

        <!-- one of their point -->
        <circle class="active adv" cx="47" cy="0" r="5" stroke="black" stroke-width="2"/>
        <!-- first split -->
        <circle class="active mine" cx="15" cy="60" r="5" stroke="black" stroke-width="2"/>
        <!-- second split -->
        <circle class="active mine" cx="55" cy="100" r="5" stroke="black" stroke-width="2"/>
        <!-- origin -->
        <circle class="active mine" cx="35" cy="80" r="8" stroke="black" stroke-width="3"/>
        <text class="cardLabel" dominant-baseline="text-bottom" text-anchor="middle" x="50%" y="110px">SPLIT</text>
    </svg>
    `;
}

function leapSvg(teamClass, card){
    return `
    <svg class="card ${teamClass}" id="card${card.id}">
        <!-- LEAP : can GO in any place I own-->
        <!-- their area -->
        <polygon class="adv" points="-10,-10 -10,50 90,5 90,-10"/>
        <!-- my area -->
        <polygon class="mine" points="-10,130 -10,50 90,5 90,130"/>
        <!-- their border-->
        <line class="adv" stroke-width="3" x1="-10" x2="90" y1="50" y2="5"/>
        <!-- my border-->
        <line class="mine" stroke-dasharray="15 15" stroke-width="3" x1="-10" x2="90" y1="50" y2="5"/>
        <!-- inner border-->
        <line class="mine" stroke-width="3" x1="-10" x2="90" y1="75" y2="70"/>

        <!--move-->
        <line stroke="black" stroke-width="1" x1="35" x2="50" y1="55" y2="90"/>

        <!-- one of their point -->
        <circle class="active adv" cx="47" cy="0" r="5" stroke="black" stroke-width="2"/>
        <!-- another point -->
        <circle class="active mine" cx="70" cy="48" r="5" stroke="black" stroke-width="2"/>
        <!-- dest -->
        <circle class="active mine" cx="35" cy="55" r="5" stroke="black" stroke-width="2"/>
        <!-- origin -->
        <circle class="active mine" cx="50" cy="90" r="8" stroke="black" stroke-width="3"/>


        <text class="cardLabel" dominant-baseline="text-bottom" text-anchor="middle" x="50%" y="110px">LEAP</text>
    </svg>
    `;
}

function moveSvg(teamClass, card) {

return `
    <svg class="card ${teamClass}" id="card${card.id}">
        <!-- MOVE : can GO in any place in the selected area-->
        <!-- their area -->
        <polygon class="adv" points="-10,-10 -10,50 90,5 90,-10"/>
        <!-- my area -->
        <polygon class="mine" points="-10,130 -10,50 90,5 90,130"/>
        <!-- their border-->
        <line class="adv" stroke-width="3" x1="-10" x2="90" y1="50" y2="5"/>
        <!-- my border-->
        <line class="mine" stroke-dasharray="15 15" stroke-width="3" x1="-10" x2="90" y1="50" y2="5"/>
        <!-- inner border-->
        <line class="mine" stroke-width="3" x1="-10" x2="90" y1="75" y2="70"/>

        <!--move-->
        <line stroke="black" stroke-width="1" x1="15" x2="50" y1="85" y2="90"/>


        <!-- one of their point -->
        <circle class="active adv" cx="47" cy="0" r="5" stroke="black" stroke-width="2"/>
        <!-- another point -->
        <circle class="active mine" cx="70" cy="48" r="5" stroke="black" stroke-width="2"/>
        <!-- dest -->
        <circle class="active mine" cx="15" cy="85" r="5" stroke="black" stroke-width="2"/>
        <!-- origin -->
        <circle class="active mine" cx="50" cy="90" r="8" stroke="black" stroke-width="3"/>

        <text class="cardLabel" dominant-baseline="text-bottom" text-anchor="middle" x="50%" y="110px">MOVE</text>
    </svg>
`;
}

