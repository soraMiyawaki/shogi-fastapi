from typing import Optional, List, Tuple
Board = List[List[Optional[int]]] 
class ShogiEngine:
    def find_king(self, board: Board,side_sign:int) -> Optional[Tuple[int, int]]:
        target_num=8*side_sign
        for row in range(9) :
            for column in range(9):
                if board[row][column]==target_num:
                    return (row,column)
        return None
shogi_engine= ShogiEngine()
                