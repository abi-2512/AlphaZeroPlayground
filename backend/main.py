from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import numpy as np
import time
import uvicorn

from model.game import TicTacToe, ConnectFour
from model.network import ResNet
from model.alpha_zero import MCTS

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class BoardState(BaseModel):
    board: list[list[int]]
    player: int

# --- Tic Tac Toe endpoint ---
@app.post("/tictactoe/move")
def tictactoe_move(state: BoardState):
    try:
        game = TicTacToe()
        model = ResNet(game, num_resBlocks=4, num_hidden=64, device=device)
        model.load_state_dict(torch.load("model/model_tic_tac_toe.pt", map_location=device))
        model.eval()
        args = {
            'C': 1,
            'dirichlet_epsilon': 0,
            'dirichlet_alpha': 0.03,
            'num_searches': 4,
        }
        mcts = MCTS(game, args, model)

        board_np = np.array(state.board)
        board_perspective = game.change_perspective(board_np, state.player)

        start = time.time()
        action_probs = mcts.search(board_perspective)
        print("TicTacToe search time:", time.time() - start)

        action = int(np.argmax(action_probs))
        next_state = game.get_next_state(board_np.copy(), action, state.player)
        value, is_terminal = game.get_value_and_terminated(next_state, action)

        return {
            "action": action,
            "next_board": next_state.tolist(),
            "is_terminal": is_terminal,
            "value": value,
            "action_probs": action_probs.tolist()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Connect Four endpoint ---
@app.post("/connect4/move")
def connect4_move(state: BoardState):
    try:
        game = ConnectFour()
        model = ResNet(game, num_resBlocks=9, num_hidden=128, device=device)
        model.load_state_dict(torch.load("model/model_connect4.pt", map_location=device))
        model.eval()
        args = {
            'C': 1,
            'dirichlet_epsilon': 0,
            'dirichlet_alpha': 0.03,
            'num_searches': 8,
        }
        mcts = MCTS(game, args, model)

        board_np = np.array(state.board)
        board_perspective = game.change_perspective(board_np, state.player)

        start = time.time()
        action_probs = mcts.search(board_perspective)
        print("ConnectFour search time:", time.time() - start)

        action = int(np.argmax(action_probs))
        next_state = game.get_next_state(board_np.copy(), action, state.player)
        value, is_terminal = game.get_value_and_terminated(next_state, action)

        return {
            "action": action,
            "next_board": next_state.tolist(),
            "is_terminal": is_terminal,
            "value": value,
            "action_probs": action_probs.tolist()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


