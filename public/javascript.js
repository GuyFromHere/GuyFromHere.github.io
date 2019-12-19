const cellIndex = [10, 20, 30];
const mineCount = [12, 50, 112];
const difficulty = 0;
const cellDictionary = {};

var timer;
const Game = new Object();

// LOG & DEBUG FUNCTIONS
function resetLog() {
  const logDiv = document.getElementById("log");
  logDiv.innerHTML = "";
}

function addLog(text) {
  const logDiv = document.getElementById("log");
  logDiv.innerHTML += "<p>" + text + "</p>";
}

// TIMER FUNCTIONS
function pad(val) {
  return val > 9 ? val : "0" + val;
}

function resetTimer() {
  clearInterval(timer);
}

// EVENT HANDLERS
document.addEventListener(
  "click",
  function(e) {
    const target = e.target || e.srcElement;
    //text = target.textContent || target.innerText;
    if (target.className == "cell") {
      sweep(target.id, Game.difficulty);
    }
  },
  false
);

function changeScore(num) {
  Game.mines += num;
  Game.remainingCells += num;
  document.getElementById("mines-remaining").innerHTML = Game.mines;
  if (Game.remainingCells == 0 && Game.mines == 0) {
    var winner = document.getElementById("you-win");
    resetTimer();
    bestTimes();
    winner.showModal();
  }
}

function bestTimes() {
  const minutes = document.getElementById("minutes");
  const seconds = document.getElementById("seconds");
  const timeTable = document.getElementById("best-time");
  const timeTableRow = document.createElement("tr");
  const timeTableCell = document.createElement("td");
  timeTableCell.innerHTML = minutes.innerHTML + ":" + seconds.innerHTML;
  timeTableRow.appendChild(timeTableCell);
  timeTable.appendChild(timeTableRow);
}

function flag(id) {
  const cell = document.getElementById(id);
  if (cell.className == "flag-cell") {
    cell.className = "mystery-cell";
    cell.style.backgroundImage = "";
    cell.innerHTML = "?";
    changeScore(1);
  } else if (cell.className == "cell") {
    cell.className = "flag-cell";
    cell.innerHTML = '<img src="public/img/flag.png" class="flagpng">';
    changeScore(-1);
  } else if (cell.className == "mystery-cell") {
    cell.className = "cell";
    cell.innerHTML = "";
  }
}

function sweep(id, difficulty) {
  if (cellDictionary[id].isMine) {
    resetTimer();
    const gameOver = document.getElementById("game-over");
    gameOver.showModal();
    let cell = document.getElementById(id);
    cell.className = "boom";
    cell.innerHTML = "X";
  } else {
    checkSurroundingCells(id, difficulty);
  }
}

function getRandomNumber(num) {
  let random = Math.floor(Math.random() * num);
  return random;
}

function seedMines(difficulty) {
  let mineCounter = 1;
  do {
    let randomX = getRandomNumber(cellIndex[difficulty]);
    let randomY = getRandomNumber(cellIndex[difficulty]);
    if (!cellDictionary[randomX + " " + randomY].isMine) {
      cellDictionary[randomX + " " + randomY].isMine = true;
      mineCounter++;
    }
  } while (mineCounter <= mineCount[difficulty]);
}

function checkSurroundingCells(id, difficulty) {
  const cell = document.getElementById(id);
  if (cell.innerHTML == "" || cell.innerHTML == "?") {
    for (
      let x = Math.max(cellDictionary[id].posX - 1, 0);
      x <= Math.min(cellDictionary[id].posX + 1, cellIndex[difficulty] - 1);
      x++
    ) {
      for (
        let y = Math.max(cellDictionary[id].posY - 1, 0);
        y <= Math.min(cellDictionary[id].posY + 1, cellIndex[difficulty] - 1);
        y++
      ) {
        if (cellDictionary[x + " " + y].isMine) {
          cellDictionary[id].count++;
        }
      }
    }
    if (cellDictionary[id].count > 0) {
      document.getElementById(id).className = "clear";
      document.getElementById(id).innerHTML = cellDictionary[id].count;
      Game.remainingCells -= 1;
    } else {
      document.getElementById(id).className = "clear";
      Game.remainingCells -= 1;
      for (
        let x = Math.max(cellDictionary[id].posX - 1, 0);
        x <= Math.min(cellDictionary[id].posX + 1, cellIndex[difficulty] - 1);
        x++
      ) {
        for (
          let y = Math.max(cellDictionary[id].posY - 1, 0);
          y <= Math.min(cellDictionary[id].posY + 1, cellIndex[difficulty] - 1);
          y++
        ) {
          if (document.getElementById(x + " " + y).className == "cell") {
            checkSurroundingCells(x + " " + y, difficulty);
          }
        }
      }
    }
  }
}

function buildBoard() {
  resetLog();
  resetTimer();
  let sec = 0;
  Game.difficulty = getDifficulty();
  Game.mines = mineCount[Game.difficulty];
  Game.remainingCells = cellIndex[Game.difficulty] * cellIndex[Game.difficulty];
  document.getElementById("mines-remaining").innerHTML = Game.mines;

  const board = document.getElementById("board");
  board.innerHTML = "";
  board.className = "board";

  if (!Game.difficulty || Game.difficulty == 0) {
    //var difficulty = 0;
    board.classList.add("easy");
  } else if (Game.difficulty == 1) {
    board.classList.add("moderate");
  } else if (Game.difficulty == 2) {
    board.classList.add("hard");
  }

  for (let x = 0; x < cellIndex[Game.difficulty]; x++) {
    for (let y = 0; y < cellIndex[Game.difficulty]; y++) {
      const newNode = document.createElement("div");
      newNode.className = "cell";
      newNode.id = x + " " + y;
      newNode.innerHTML = "";
      newNode.setAttribute(
        "oncontextmenu",
        "javascript:flag(this.id);return false;"
      );
      const newCell = {
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

  timer = setInterval(function() {
    document.getElementById("seconds").innerHTML = pad(++sec % 60);
    document.getElementById("minutes").innerHTML = pad(parseInt(sec / 60, 10));
    // BUG: changeScore does not detect when a game ends on a non-flag tile.
    // Adding the following to count remaining cells every second as a (not-great) workaround
    if (Game.remainingCells == 0 && Game.mines == 0) {
      var winner = document.getElementById("you-win");
      resetTimer();
      bestTimes();
      winner.showModal();
    }
  }, 1000);
}
