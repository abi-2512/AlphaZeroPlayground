
# ♟️ AlphaZero Playground

Play against real AlphaZero agents in **Tic Tac Toe** and **Connect Four**, trained completely from scratch using **MCTS + ResNet** and **self-play reinforcement learning**.

✅ Web-based UI  
🧠 PyTorch AlphaZero backend  
☁️ Deployed on Render

---

## 🌐 Live Demo

- **Frontend**: [https://alphazero-playground-frontend.onrender.com](https://alphazero-playground-frontend.onrender.com)  
- **Backend API**: [https://alphazero-playground-backend.onrender.com](https://alphazero-playground-backend.onrender.com)

> ⚠️ May take ~10s on first load due to cold start and MCTS on CPU.

---

## 🕹️ Features

- ✅ Play against AlphaZero in Tic Tac Toe & Connect Four  
- 🎯 View predicted move probabilities from MCTS  
- 🧠 Real self-play agents — no hardcoded logic or rules  
- 🛠️ Modular codebase (games, network, MCTS, backend separated)

---

## 🧠 How It Works

This project implements a simplified version of **AlphaZero**:

- **ResNet**: Custom residual network for policy + value prediction  
- **MCTS**: Monte Carlo Tree Search guided by the network  
- **Self-play training**: No human data, only reinforcement learning  
- **Inference**: Each move runs MCTS with multiple simulations

---

## 📁 Project Structure

alphazero-playground/
├── backend/
│   ├── main.py              # FastAPI app
│   └── model/
│       ├── game.py          # Game logic (Tic Tac Toe, Connect Four)
│       ├── network.py       # ResNet definition
│       ├── alpha\_zero.py    # MCTS logic
│       ├── model\_tic\_tac\_toe.pt
│       └── model\_connect4.pt
├── frontend/
│   ├── index.html           # Landing page
│   ├── tictactoe.html       # Game UI
│   ├── connect4.html
│   ├── tictactoe.js         # Game logic (AJAX → FastAPI)
│   ├── connect4.js
│   └── styles/
├── requirements.txt
└── README.md


---

## 🛠️ Local Setup

### ✅ Prerequisites

- Python 3.9+
- Node.js (optional, only for advanced static serving)

---

### 📦 Backend (FastAPI)

# Clone the repo
git clone https://github.com/yourusername/alphazero-playground.git
cd alphazero-playground/backend

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload


> Visit: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) to test endpoints

---

### 🌐 Frontend

bash
cd ../frontend
open index.html


Or run a simple static server:

# With Python 3
python -m http.server 8001

> Make sure to update the JS files with correct backend URL if testing locally.

---

## 🚀 Deployment on Render

### 🧠 Backend (FastAPI)

1. Create a **Web Service** on [Render](https://render.com/)
2. Root directory: `backend`
3. Start Command:

   uvicorn main:app --host 0.0.0.0 --port 10000
   
4. Add `model_tic_tac_toe.pt` and `model_connect4.pt` to `backend/model/`
5. Add any necessary environment settings (e.g. `PORT=10000`)

---

### 🌐 Frontend (Static Site)

1. Create a **Static Site** on Render
2. Root directory: `frontend`
3. Build command: *(leave blank)*
4. Publish directory: `frontend`
5. In `tictactoe.js` and `connect4.js`, change API URLs to match backend Render URL.

---

## ⚠️ Performance Notes

This is a **real AlphaZero** implementation using full MCTS:

* Each move uses 4–8 tree search simulations
* Every simulation queries a ResNet for policy + value
* Hosted on free-tier CPU → \~2–6s per move

### ⚡ Optimization Ideas

* TorchScript / ONNX export for model inference
* Reduce number of MCTS searches for faster demo
* Async queue + background worker
* Replace MCTS with policy-only inference for quick response mode

---




## 🙋 FAQ

**Q: Why is it slow?**
A: Each move runs real MCTS with a deep neural network on CPU. This is not a heuristic bot — it's actual AlphaZero inference.

**Q: Can it run faster?**
A: Yes — quantization, GPU, or switching to policy-only inference would help.

**Q: Is this really AlphaZero?**
A: It follows the core principles: self-play, MCTS-guided search, deep network with policy & value heads, and no prior knowledge.

---

## 🤝 Contributing

Pull requests welcome! You can help with:

* UI/UX improvements
* Add more games (Chess, Gomoku, etc.)
* TorchScript/ONNX export
* Add backend job queue for async inference

---

## 🧾 License

MIT License — use freely for learning, modification, and extension.

---

## 👤 Author

**\Abde Abitalib Merchant**
MS in Computer Science @ USC
Passionate about AI, education, and building cool stuff.

---

## 🌍 Let’s Connect

* GitHub: [github.com/yourusername](https://github.com/yourusername)
* LinkedIn: [linkedin.com/in/yourusername](https://linkedin.com/in/yourusername)


