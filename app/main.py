# app/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.domain.board import ShogiBoard

app = FastAPI()

# ← ここで盤インスタンスを作る（ルートの上にあることが大事）
board = ShogiBoard()

class PlaceReq(BaseModel):
    x: int   # 0..8
    y: int   # 0..8
    piece: str  # 例: "P", "K", "R" など

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/board")
def get_board():
    return {"board": board.board, "captured": board.captured}

@app.post("/place")
def place_piece(req: PlaceReq):
    if not (0 <= req.x < 9 and 0 <= req.y < 9):
        raise HTTPException(status_code=400, detail="out of bounds")
    if board.get_piece(req.x, req.y) is not None:
        raise HTTPException(status_code=400, detail="cell occupied")
    if not req.piece or not isinstance(req.piece, str):
        raise HTTPException(status_code=400, detail="invalid piece")

    board.place_piece(req.x, req.y, req.piece)
    return {"ok": True}
from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="web", html=True), name="static")
@app.delete("/reset")
def reset_board():
    """盤と持ち駒を初期状態（全部None、持ち駒空）に戻す"""
    global board
    board = ShogiBoard()
    return {"ok": True}
