from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from functools import lru_cache
import torch
import numpy as np
import time

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

# --- Model loading ---
print("Loading AlphaZero models...")

tic_model = ResNet(TicTacToe(), num_resBlocks=4, num_hidden=64, device=device)
tic_model.load_state_dict(torch.load("model/model_tic_tac_toe.pt", map_location=device))
tic_model.eval()

connect4_model = ResNet(ConnectFour(), num_resBlocks=9, num_hidden=128, device=device)
connect4_model.load_state_dict(torch.load("model/model_connect4.pt", map_location=device))
connect4_model.eval()

print("Models loaded successfully.")

# --- Cache decorator (optional speed boost for repeated states) ---
@lru_cache(maxsize=512)
def cached_mcts_search(game_name: str, board_key: str, player: int):
    if game_name == "tictactoe":
        game = TicTacToe()
        model = tic_model
        args = {
            'C': 1,
            'dirichlet_epsilon': 0,
            'dirichlet_alpha': 0.03,
            'num_searches': 2,
        }
    else:
        game = ConnectFour()
        model = connect4_model
        args = {
            'C': 1,
            'dirichlet_epsilon': 0,
            'dirichlet_alpha': 0.03,
            'num_searches': 2,
        }

    mcts = MCTS(game, args, model)

    board_np = np.fromstring(board_key, sep=",").reshape(game.board_shape)
    board_perspective = game.change_perspective(board_np, player)
    action_probs = mcts.search(board_perspective)
    action = int(np.argmax(action_probs))
    next_state = game.get_next_state(board_np.copy(), action, player)
    value, is_terminal = game.get_value_and_terminated(next_state, action)

    return action, next_state.tolist(), is_terminal, value, action_probs.tolist()

def board_to_key(board: list[list[int]]) -> str:
    return ",".join(map(str, np.array(board).flatten().tolist()))

# --- TicTacToe endpoint ---
@app.post("/tictactoe/move")
def tictactoe_move(state: BoardState):
    try:
        board_key = board_to_key(state.board)
        start = time.time()
        action, next_board, is_terminal, value, action_probs = cached_mcts_search("tictactoe", board_key, state.player)
        print("TicTacToe inference time:", time.time() - start)
        return {
            "action": action,
            "next_board": next_board,
            "is_terminal": is_terminal,
            "value": value,
            "action_probs": action_probs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Connect Four endpoint ---
@app.post("/connect4/move")
def connect4_move(state: BoardState):
    try:
        board_key = board_to_key(state.board)
        start = time.time()
        action, next_board, is_terminal, value, action_probs = cached_mcts_search("connect4", board_key, state.player)
        print("ConnectFour inference time:", time.time() - start)
        return {
            "action": action,
            "next_board": next_board,
            "is_terminal": is_terminal,
            "value": value,
            "action_probs": action_probs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
