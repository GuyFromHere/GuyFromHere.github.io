// BUGS:
// -Clicking on a cell after it's already "swept".
// TODO:
// -Objects: do I need em? Seems like I could go all the way and make Board, Game, and Cell objects with built in functions and constructors...
//  OR I could just redo what I have without the Cell object because it's not doing a ton. 
// -Difficulty: I don't like how this is passed around. If I do go full-OOO this would be a property of the Game object.
// -Game Features: timer, score, etc. OOh maybe even a high score table for each difficulty...
// -Right click: add a question mark on second right click.
// -Presentation: Modal triggered on game over / won. imgs for flags and mines. Possibly even the tiles themselves. What can I animate with CSS? 

const cellIndex = [ 10, 20, 30 ]
const mineCount = [ 12, 50, 112]; 
var difficulty = 0;
var cellDictionary = {};
const debug = false;

var Game = new Object();

function resetLog() {
    const logDiv = document.getElementById("log");
    logDiv.innerHTML = "";
}

function addLog(text) {
    const logDiv = document.getElementById("log");
    logDiv.innerHTML += ('<p>' + text + '</p>');
}

function flag(id) {
    const cell = document.getElementById(id);
    if ( cell.className == 'flag-cell' ) {
        cell.className = 'mystery-cell';
        cell.innerHTML = '?';
    } else if ( cell.className == 'cell') {
        cell.className = 'flag-cell';
        cell.innerHTML = '<img src="public/img/flag.png" class="flag-png">'
    } else if ( cell.className == 'mystery-cell' ) {
        cell.className = 'cell';
        cell.innerHTML = '';
    }
}

function safe(id) {
    const element = document.getElementById(id);
    element.className = 'clear'; 
    element.innerHTML = cellDictionary[id].count;
}

function sweep(id, difficulty) {
    if ( cellDictionary[id].isMine) {
        var element = document.getElementById(id);
        var gameOver = document.getElementById('game-over');
        //addLog('show modal');
        gameOver.showModal();
        element.className = 'boom';
        element.innerHTML = "X";
    } else {
        checkSurroundingCells(id, difficulty);
    }  
}

function clear(id) {
    const element = document.getElementById(id);
    element.className = 'clear';
}

function getRandomNumber(num) {
    var random = Math.floor(Math.random() * num);
    return random;
}

function seedMines(difficulty) {
    var mineCounter = 0;
    do {
        var randomX = getRandomNumber(cellIndex[difficulty]); 
        var randomY = getRandomNumber(cellIndex[difficulty]);
        if ( !cellDictionary[randomX + ' ' + randomY].isMine ) {
            cellDictionary[randomX + ' ' + randomY].isMine = true;
            mineCounter++;
            if (debug) {
              let cell = document.getElementById(randomX + ' ' + randomY);
              cell.innerHTML = "X";
            }
        }
    }
    while (mineCounter <= mineCount[difficulty] );
}

function checkSurroundingCells(id, difficulty) {
    const cell = document.getElementById(id);
    if ( cell.innerHTML == "" || cell.innerHTML == "?" ) {
        for (var x = Math.max(cellDictionary[id].posX-1,0);x<=Math.min(cellDictionary[id].posX+1,(cellIndex[difficulty]-1));x++) {
            for (var y = Math.max(cellDictionary[id].posY-1,0);y<=Math.min(cellDictionary[id].posY+1,(cellIndex[difficulty]-1));y++) {
                if ( cellDictionary[x + ' ' + y].isMine) {
                    cellDictionary[id].count++;
                }
            }
        }
        if (cellDictionary[id].count > 0) {
            safe(id);
        } else {
            clear(id);
            for (var x = Math.max(cellDictionary[id].posX-1,0);x <=Math.min(cellDictionary[id].posX+1,(cellIndex[difficulty]-1));x++) {
                for (var y = Math.max(cellDictionary[id].posY-1,0);y <= Math.min(cellDictionary[id].posY+1,(cellIndex[difficulty]-1));y++) {
                    if (document.getElementById(x + ' ' + y).className == 'cell') {
                        checkSurroundingCells(x + ' ' + y, difficulty);
                    }  
                } 
            }
        }
    }
}

function buildBoard() {
    resetLog();
    var board = document.getElementById('board');
    board.innerHTML = "";
    board.className = "board";
    var difficulty = getDifficulty();
    
    if (!difficulty || difficulty == 0) {
            var difficulty = 0;
            board.classList.add('easy');
        } else if (difficulty == 1) {
            board.classList.add('moderate');
        } else if (difficulty == 2) {
            board.classList.add('hard');
    }
    for ( var x = 0; x < cellIndex[difficulty]; x++) {
        for ( var y = 0; y < cellIndex[difficulty]; y++) {
            var newNode = document.createElement('div');
            newNode.className = 'cell';
            newNode.id = (x + ' ' + y);
            newNode.innerHTML = "";
            newNode.setAttribute('oncontextmenu','javascript:flag(this.id);return false;');
            newNode.setAttribute('onclick','javascript:sweep(this.id, ' + difficulty + ');');
            let newCell = {
                id: newNode.id,
                posX: x,
                posY: y,
                count: 0,
                isMine: false
            }; 
            cellDictionary[newNode.id] = newCell;
            board.appendChild(newNode);
        }
    }
    seedMines(difficulty);
}

