class ShogiRule:
   P, L, N, S, G, B, R, K = 1, 2, 3, 4, 5, 6, 7, 8
   PIECE_VECTORS = {
    P: [(-1, 0)],  # 歩：前に1マス

    L: [(-1, 0)],  # 香：前にまっすぐ（ただし滑走するので特別扱い）

    N: [(-2, -1), (-2, 1)],  # 桂：2上＋左右1

    S: [(-1,-1), (-1,0), (-1,1), (1,-1), (1,1)],  
    # 銀：前3方向＋後ろ斜め

    G: [(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,0)],  
    # 金：前3方向＋横＋後ろ直進

    K: [(-1,-1), (-1,0), (-1,1),
        (0,-1),         (0,1),
        (1,-1), (1,0), (1,1)],  
    # 王：8方向

    B: [(-1,-1), (-1,1), (1,-1), (1,1)],  
    # 角：斜め滑走

    R: [(-1,0), (1,0), (0,-1), (0,1)],  
    # 飛：縦横滑走
    }

   slider={
        L: True,  # 香
        B: True,  # 角
        R: True,  # 飛  
    }
   # 王の座標に対して王手を掛けれる駒化の探索
def sq_attaked(self,board:Board,kx:int,ky:int) -> bool:
    for row in range(9) :
        for column in range(9):
            action=ShogiRule[board[row][column]]
            for i in action:
                if (kx,ky)==(row,column)+i:
                    print(kx,ky)
                    return True
    return False  