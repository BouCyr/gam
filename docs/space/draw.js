
function drawDots(canvasId = 'board',dotsArray=dots){
    dotsArray.forEach(dot=>drawDot(dot));
}

function drawDot(dot){
    const ctx = board.getContext("2d");

    ctx.lineWidth=2;
    ctx.strokeStyle='#111';
    var radius = 5;
    if(dot.selected || (dot.nearest && state === STATE_SELECT_DOT)){
        ctx.lineWidth=3;
        ctx.strokeStyle='#111';
        radius = 8
    }
    ctx.fillStyle= mainColor(dot.team);

    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function drawCells(vDiag, fillFunction = defaultColorBgFunction ){
    const ctx = board.getContext("2d");

    ctx.lineWidth=0.5;

    //first villains, then heros, then villains but dashed
    vDiag.cells.filter(c => c.site && c.site.team === TEAM_EVIL)
        .forEach(cell => drawCell(ctx, cell, [], fillFunction ));

    vDiag.cells.filter(c => c.site && c.site.team === TEAM_HERO)
        .forEach(cell => drawCell(ctx, cell, [], fillFunction));

    vDiag.cells.filter(c => c.site && c.site.team === TEAM_EVIL)
        .forEach(cell => drawCell(ctx, cell, [15,15], noBgFunction));
}

function drawCell(ctx, cell, lineDash = [], fill){

    var shell = buildShell(cell);

//    ctx.fillStyle= bgColor(cell.site.team);
    ctx.fillStyle= fill(cell);

    ctx.setLineDash(lineDash);
    ctx.lineWidth = 3;
    ctx.strokeStyle= mainColor(cell.site.team);

    ctx.beginPath();
    ctx.moveTo(shell[0].x, shell[0].y)
    for(let i = 1; i <shell.length; i++){
       ctx.lineTo(shell[i].x, shell[i].y);
    }

    if(fill)
        ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
}


/**
* Returns the default fill for cell background (ie team color half opacity)
*/
function defaultColorBgFunction(cell){
    return bgColor(cell.site.team);
}

/**
* No background
*/
function noBgFunction(cell){
    return 'rgba(111,111,111,0)';
}


/**
* returns a function that apply the default for the input cell, and the forbidden pattern (of the correct team) for the other
*/
function oneCellAllowedBgFunction(allowed){

    return (cell)=>{
        if(cell == allowed){
            return defaultColorBgFunction(cell)
        }else{
            return cell.site.team === TEAM_EVIL ? forbiddenVillain:forbiddenHero;
        }
    }
}


function forbiddenPattern(color){
    const offscreen = new OffscreenCanvas(20, 20);
    const ctx =offscreen.getContext("2d");

    ctx.lineWidth=3;
    ctx.strokeStyle=color;

//    for(let i = -10; i += 6; i <= 16){
    let i = 0;
    {
        ctx.beginPath()
        ctx.moveTo(-2,-2);
        ctx.lineTo(22,22);
        ctx.stroke();
    }


    const pattern = ctx.createPattern(offscreen, 'repeat');
    return pattern;

}



function mainColor(team){
    return color(team, "1");
}
function bgColor(team){
    return color(team, "0.25");
}
function color(team, opacity){
    if(team === TEAM_EVIL){
        return 'rgb(255,105,50,'+opacity+")";
    }else{
        return 'rgb(50,50,255,'+opacity+")";
    }
}

