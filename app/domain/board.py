# app/domain/board.py

class ShogiBoard:
    def __init__(self):
        # 9x9 の盤（空は None）
        self.board = [[None for _ in range(9)] for _ in range(9)]
        # 持ち駒
        self.captured = {"black": [], "white": []}

    def place_piece(self, x: int, y: int, piece: str):
        """指定のマスに駒を置く（x=0..8, y=0..8）"""
        self.board[y][x] = piece

    def get_piece(self, x: int, y: int):
        """指定マスの駒を取得"""
        return self.board[y][x]
