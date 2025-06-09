const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");
const newGameBtn = document.getElementById("newGameBtn");

let board = Array.from({ length: 3 }, () => Array(3).fill(0));
let currentPlayer = null;
let humanPlayer = null;
let gameOver = false;

function renderBoard(policy = null) {
  boardDiv.innerHTML = "";
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      const val = board[r][c];
      if (val === 1) {
        cell.textContent = "X";
        cell.classList.add("X");
      } else if (val === -1) {
        cell.textContent = "O";
        cell.classList.add("O");
      }

      // If a policy is passed in and the cell is empty
      if (policy && board[r][c] === 0) {
        const idx = r * 3 + c;
        const overlay = document.createElement("div");
        overlay.classList.add("policy-overlay");
        overlay.textContent = `${(policy[idx] * 100).toFixed(0)}%`;
        cell.appendChild(overlay);
      }

      cell.dataset.row = r;
      cell.dataset.col = c;
      boardDiv.appendChild(cell);
    }
  }
}


function getWinner() {
  const lines = [
    // Rows
    [[0,0], [0,1], [0,2]],
    [[1,0], [1,1], [1,2]],
    [[2,0], [2,1], [2,2]],
    // Columns
    [[0,0], [1,0], [2,0]],
    [[0,1], [1,1], [2,1]],
    [[0,2], [1,2], [2,2]],
    // Diagonals
    [[0,0], [1,1], [2,2]],
    [[0,2], [1,1], [2,0]]
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    const v1 = board[a[0]][a[1]];
    const v2 = board[b[0]][b[1]];
    const v3 = board[c[0]][c[1]];
    if (v1 !== 0 && v1 === v2 && v2 === v3) {
      return v1;
    }
  }
  return 0;
}

function isDraw() {
  return board.every(row => row.every(cell => cell !== 0));
}

function handleClick(e) {
  if (gameOver) return;
  const r = parseInt(e.target.dataset.row);
  const c = parseInt(e.target.dataset.col);
  if (isNaN(r) || isNaN(c)) return;
  if (board[r][c] !== 0) return;
  if (currentPlayer !== humanPlayer) return;

  board[r][c] = humanPlayer;
  renderBoard();

  const winner = getWinner();
  if (winner === humanPlayer) {
    statusText.textContent = "You win!";
    gameOver = true;
    newGameBtn.style.display = "inline-block";
    return;
  }
  if (isDraw()) {
    statusText.textContent = "It's a draw!";
    gameOver = true;
    newGameBtn.style.display = "inline-block";
    return;
  }

  currentPlayer = -humanPlayer;
  statusText.textContent = "AI is thinking...";
  sendToAI();
}

function sendToAI() {
  fetch("http://127.0.0.1:8000/tictactoe/move", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ board: board, player: -humanPlayer })
  })
  .then(res => res.json())
  .then(data => {
    const action = data.action;
    const row = Math.floor(action / 3);
    const col = action % 3;
  
    // Step 1: briefly show predicted move probabilities
    renderBoard(data.action_probs);
    statusText.textContent = "AI is thinking...";
  
    setTimeout(() => {
      // Step 2: make the AI move
      board[row][col] = -humanPlayer;
      renderBoard(); // no probabilities now
  
      if (data.is_terminal) {
        const val = data.value;
        statusText.textContent =
          val === 1 ? "AI wins!" : val === 0 ? "It's a draw!" : "You win!";
        gameOver = true;
        newGameBtn.style.display = "inline-block";
      } else {
        currentPlayer = humanPlayer;
        statusText.textContent = "Your move";
      }
    }, 800); // show policy overlay for 800ms
  });
}


function startGame() {
  board = Array.from({ length: 3 }, () => Array(3).fill(0));
  gameOver = false;
  humanPlayer = Math.random() < 0.5 ? 1 : -1;
  currentPlayer = 1;
  newGameBtn.style.display = "none";
  renderBoard();

  if (currentPlayer === humanPlayer) {
    statusText.textContent = "Your move";
  } else {
    statusText.textContent = "AI starts...";
    sendToAI();
  }
}

boardDiv.addEventListener("click", handleClick);
newGameBtn.addEventListener("click", startGame);

startGame();

