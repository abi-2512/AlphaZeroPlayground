const ROWS = 6;
const COLS = 7;
let board = [];
let currentPlayer = null;
let gameOver = false;
let humanPlayer = null;

const topRowDiv = document.getElementById("topRow");
const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");
const newGameBtn = document.getElementById("newGameBtn");

// Create top row (for clickable columns)
for (let col = 0; col < 7; col++) {
  const topCell = document.createElement("div");
  topCell.classList.add("top-cell");
  topCell.dataset.col = col;
  topRowDiv.appendChild(topCell);
}

// Create board grid (6 rows × 7 columns)
for (let row = 0; row < 6; row++) {
  for (let col = 0; col < 7; col++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.row = row;
    cell.dataset.col = col;
    boardDiv.appendChild(cell);
  }
}



function initBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  boardDiv.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.column = c;
      boardDiv.appendChild(cell);
    }
  }
}

function renderBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    const r = Math.floor(index / COLS);
    const c = index % COLS;
    const value = board[r][c];
    cell.innerHTML = "";
    if (value !== 0) {
      const disc = document.createElement("div");
      disc.classList.add("disc");
      disc.classList.add(value === 1 ? "red" : "yellow");
      cell.appendChild(disc);
    }
  });
}

function getColumnTopRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return null;
}

function isValidMove(col) {
  return board[0][col] === 0;
}

function makeMove(col, player) {
  const row = getColumnTopRow(col);
  if (row !== null) {
    board[row][col] = player;
    return { row, col };
  }
  return null;
}

function checkGameOver(row, col, player) {
  const directions = [
    [[-1, 0], [1, 0]],
    [[0, -1], [0, 1]],
    [[-1, -1], [1, 1]],
    [[-1, 1], [1, -1]],
  ];
  for (let [[dr1, dc1], [dr2, dc2]] of directions) {
    let count = 1;
    for (let d of [1, -1]) {
      let dr = d === 1 ? dr1 : dr2;
      let dc = d === 1 ? dc1 : dc2;
      let r = row + dr;
      let c = col + dc;
      while (
        r >= 0 &&
        r < ROWS &&
        c >= 0 &&
        c < COLS &&
        board[r][c] === player
      ) {
        count++;
        r += dr;
        c += dc;
      }
    }
    if (count >= 4) return true;
  }
  return false;
}

function sendMoveToAI() {
  fetch("https://alphazeroplayground.onrender.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ board, player: -humanPlayer })
  })
  .then(res => res.json())
  .then(data => {
    const { action, next_board, is_terminal, value, action_probs } = data;
  
    // Update your game board with the action
    board = next_board;
    renderBoard();
  
    // Show policy
    showMoveProbabilities(action_probs);
  
    // Handle end of game
    if (is_terminal) {
      statusText.textContent = value === 1 ? "AI wins!" :
                                value === 0 ? "It's a draw!" : "You win!";
      gameOver = true;
      newGameBtn.style.display = "inline-block";
    } else {
      currentPlayer = humanPlayer;
      statusText.textContent = "Your move";
    }
  });
}  

boardDiv.addEventListener("click", (e) => {
  if (gameOver) return;
  const col = parseInt(e.target.dataset.column);
  if (isNaN(col) || !isValidMove(col)) return;
  if (currentPlayer !== humanPlayer) return;

  const { row } = makeMove(col, humanPlayer);
  renderBoard();

  if (checkGameOver(row, col, humanPlayer)) {
    statusText.textContent = "You win!";
    gameOver = true;
    newGameBtn.style.display = "inline-block";
    return;
  }

  if (board[0].every((cell) => cell !== 0)) {
    statusText.textContent = "It's a draw!";
    gameOver = true;
    newGameBtn.style.display = "inline-block";
    return;
  }

  currentPlayer = -humanPlayer;
  statusText.textContent = "AI is thinking...";
  sendMoveToAI();
});

newGameBtn.addEventListener("click", () => {
  startGame();
});

function startGame() {
  initBoard();
  renderBoard();
  gameOver = false;
  newGameBtn.style.display = "none";
  humanPlayer = Math.random() < 0.5 ? 1 : -1;
  currentPlayer = 1;
  statusText.textContent =
    currentPlayer === humanPlayer ? "Your move" : "AI starts...";
  if (currentPlayer !== humanPlayer) {
    sendMoveToAI();
  }
}

function showMoveProbabilities(probs) {
  const topCells = document.querySelectorAll(".top-cell");
  topCells.forEach((cell, idx) => {
    const p = probs[idx];
    cell.textContent = p > 0.01 ? `${(p * 100).toFixed(1)}%` : "";
    cell.style.background = `rgba(21, 101, 192, ${p})`;  // heatmap color
  });
}

startGame();


