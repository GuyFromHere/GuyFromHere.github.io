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
var timer; 
var cellCount;
var Game = new Object();

// LOG & DEBUG FUNCTIONS
function resetLog() {
    const logDiv = document.getElementById("log");
    logDiv.innerHTML = "";
}

function addLog(text) {
    const logDiv = document.getElementById("log");
    logDiv.innerHTML += ('<p>' + text + '</p>');
}

// TIMER FUNCTIONS
function pad(val) {
    return val > 9 ? val : "0" + val;
}

function timer(sec) {
    setInterval(function () {
        document.getElementById("seconds").innerHTML = pad(++sec % 60);
        document.getElementById("minutes").innerHTML = pad(parseInt(sec / 60, 10));
    }, 1000);
}

function resetTimer () {
    clearInterval(timer);
}

// EVENT HANDLERS
document.addEventListener('click', function(e) {
    //e = e || window.event;
    var target = e.target || e.srcElement,
    text = target.textContent || target.innerText;
    if ( target.className == 'cell' ) {
        sweep(target.id, Game.difficulty )
    }
}, false);

/* document.addEventListener('contextmenu', function(e) {
    //e = e || window.event;
    var target = e.target || e.srcElement,
    text = target.textContent || target.innerText;
    addLog(target.className);
    if ( target.className == 'flag-cell' ) {
        target.className = 'mystery-cell';
        target.innerHTML = '?';
        changeScore(1);
    } else if ( target.className == 'cell') {
        target.className = 'flag-cell';
        target.innerHTML = '<img src="public/img/flag.png" class="flag-png">'
        changeScore(-1);
    } else if ( target.className == 'mystery-cell' ) {
        target.className = 'cell';
        target.innerHTML = '';
    }
    e.preventDefault();
}, false); */

function changeScore(num) {
    Game.mines += num;
    document.getElementById('mines-remaining').innerHTML = Game.mines;
}

function bestTimes() {
    const minutes = document.getElementById('minutes');
    const seconds = document.getElementById('seconds');
    var timeTable = document.getElementById('best-time');
    var timeTableRow = document.createElement('tr');
    var timeTableCell = document.createElement('td');
    timeTableCell.innerHTML = (minutes.innerHTML + ':' + seconds.innerHTML);
    timeTableRow.appendChild(timeTableCell);
    timeTable.appendChild(timeTableRow);
}

function flag(id) {
    const cell = document.getElementById(id);
    if ( cell.className == 'flag-cell' ) {
        cell.className = 'mystery-cell';
        cell.innerHTML = '?';
        changeScore(1);
    } else if ( cell.className == 'cell') {
        cell.className = 'flag-cell';
        cell.innerHTML = '<img src="public/img/flag.png" class="flag-png">'
        changeScore(-1);
    } else if ( cell.className == 'mystery-cell' ) {
        cell.className = 'cell';
        cell.innerHTML = '';
    }
}

function sweep(id, difficulty) {
    if ( cellDictionary[id].isMine) {
        resetTimer();
        var gameOver = document.getElementById('game-over');
        gameOver.showModal();
        var cell = document.getElementById(id);
        cell.className = 'boom';
        cell.innerHTML = "X";
    } else {
        checkSurroundingCells(id, difficulty);
    }  
}

function getRandomNumber(num) {
    var random = Math.floor(Math.random() * num);
    return random;
}

function seedMines(difficulty) {
    var mineCounter = 1;
    do {
        var randomX = getRandomNumber(cellIndex[difficulty]); 
        var randomY = getRandomNumber(cellIndex[difficulty]);
        if ( !cellDictionary[randomX + ' ' + randomY].isMine ) {
            cellDictionary[randomX + ' ' + randomY].isMine = true;
            mineCounter++;
        }
    }
    while (mineCounter <= mineCount[difficulty] );
}

function checkSurroundingCells(id, difficulty) {
    const cell = document.getElementById(id);
    if ( cell.innerHTML == "" || cell.innerHTML == "?" ) {
        for (var x = Math.max(cellDictionary[id].posX-1,0);x<=Math.min(cellDictionary[id].posX+1,(cellIndex[difficulty]-1));x++) {
            for (var y = Math.max(cellDictionary[id].posY-1,0);y<=Math.min(cellDictionary[id].posY+1,(cellIndex[difficulty]-1));y++) {
                if ( cellDictionary[x + ' ' + y].isMine) { cellDictionary[id].count++; }
            }
        }
        if (cellDictionary[id].count > 0) {
            document.getElementById(id).className = 'clear';
            document.getElementById(id).innerHTML = cellDictionary[id].count;
            Game.remainingCells -= 1;
        } else {
            document.getElementById(id).className = 'clear';
            Game.remainingCells -= 1;
            for (var x = Math.max(cellDictionary[id].posX-1,0);x <=Math.min(cellDictionary[id].posX+1,(cellIndex[difficulty]-1));x++) {
                for (var y = Math.max(cellDictionary[id].posY-1,0);y <= Math.min(cellDictionary[id].posY+1,(cellIndex[difficulty]-1));y++) {
                    if (document.getElementById(x + ' ' + y).className == 'cell') {
                        checkSurroundingCells(x + ' ' + y, difficulty);
                    }  
                } 
            }
        }
    }
    if ( Game.remainingCells == 12 && Game.mines == 0 ) {
        var winner = document.getElementById('you-win');
        alert('there');
        resetTimer();
        bestTimes();
        winner.showModal();
    }
}

function buildBoard() {
    resetLog();
    resetTimer();
    var sec = 0;
    Game.difficulty = getDifficulty();
    Game.mines = mineCount[Game.difficulty];
    Game.remainingCells = cellIndex[Game.difficulty] * cellIndex[Game.difficulty];
    document.getElementById('mines-remaining').innerHTML = Game.mines;

    var board = document.getElementById('board');
    board.innerHTML = "";
    board.className = "board";
    //board.setAttribute('oncontextmenu', 'javascript:selectCell();return false;');
    
    if (!Game.difficulty || Game.difficulty == 0) {
            //var difficulty = 0;
            board.classList.add('easy');
        } else if (Game.difficulty == 1) {
            board.classList.add('moderate');
        } else if (Game.difficulty == 2) {
            board.classList.add('hard');
    }

    for ( var x = 0; x < cellIndex[Game.difficulty]; x++) {
        for ( var y = 0; y < cellIndex[Game.difficulty]; y++) {
            var newNode = document.createElement('div');
            newNode.className = 'cell';
            newNode.id = (x + ' ' + y);
            newNode.innerHTML = "";
            newNode.setAttribute('oncontextmenu','javascript:flag(this.id);return false;');
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
    seedMines(Game.difficulty);
    
    timer = setInterval(function () {
        document.getElementById("seconds").innerHTML = pad(++sec % 60);
        document.getElementById("minutes").innerHTML = pad(parseInt(sec / 60, 10));
    }, 1000);

}