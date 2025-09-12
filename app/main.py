from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from app.domain.board import ShogiBoard
import logging
from app.engine.kingsguard import shogi_engine
logger = logging.getLogger("uvicorn.error")

app = FastAPI()
board = ShogiBoard()
engine=shogi_engine

class PlaceReq(BaseModel):
    x: int
    y: int
    piece: int

@app.get("/board")
def get_board():
    return {"board": board.board, "captured": board.captured}

@app.post("/place")
def place_piece(req: PlaceReq):
    # 受け取りログ
    cur = None
    try:
        cur = board.get_piece(req.x, req.y)
    except Exception as e:
        logger.exception("IndexError before bounds check?")
        raise HTTPException(status_code=400, detail="internal: index error")

    logger.info("REQ x=%s y=%s piece=%s current=%s", req.x, req.y, req.piece, cur)

    # 1) 座標
    if not (0 <= req.x < 9 and 0 <= req.y < 9):
        logger.info("DENY: out of bounds")
        raise HTTPException(status_code=400, detail="out of bounds")

    # 2) 空き（空= None）
    if cur is not None:
        logger.info("DENY: cell occupied")
        raise HTTPException(status_code=400, detail="cell occupied")

    # 3) 駒ID（±1..±8）
    p = int(req.piece)
    if p == 0 or abs(p) > 8:
        logger.info("DENY: invalid piece range (p=%s)", p)
        raise HTTPException(status_code=400, detail="invalid piece range")

    # 4) 置く
    board.place_piece(req.x, req.y, p)
    pos_sente = engine.find_king(board.board, +1)
    pos_gote  = engine.find_king(board.board, -1)
    logger.info("Kings: sente=%s gote=%s", pos_sente, pos_gote)
    logger.info("OK: placed")
    return {"ok": True}

from fastapi.staticfiles import StaticFiles
app.mount("/static", StaticFiles(directory="web", html=True), name="static")

@app.delete("/reset")
def reset_board():
    global board
    board = ShogiBoard()
    logger.info("RESET BOARD")
    return {"ok": True}
