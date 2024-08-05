import chess
import chess.pgn
from io import StringIO

def check_pgn(pgn_string: str, color: chess.Color) -> tuple[bool, str]:
    """
    fuction to check if pgn contains always just one variant for given color
    returns: tuple[bool, str(error move)]
    """
    pgn = StringIO(pgn_string)
    game = chess.pgn.read_game(pgn)

    if not game or game.errors:
        return False, "invalid pgn"
    def check_recursive(node):
        if len(node.variations) > 1 and node.turn() == color:
            return False, str(node.move)
        for node in node.variations:
            res, err_n = check_recursive(node)
            if not res: return False, err_n
        return True, ""

    return check_recursive(game)

def fens_from_pgn(pgn_string: str, color: chess.Color, start: int=0) -> dict:
    """
    function to generate fen positions along with correct moves from given pgn

    param pgn_string: pgn string, should be already checked by check_pgn
    param start: move number to start at
    retrurns: {fen: move}
    """
    pgn = StringIO(pgn_string)
    game = chess.pgn.read_game(pgn)
    if not game: 
        return False
    positions = {}
    
    board = game.board()

    def parse_recursive(node, depth=0):
        for index, move in enumerate(node.variations):
            board.push(move.move)
            # if depth >= start:
            #     if move.turn() == color:
            #         print(len(node.variations))
            #         positions[board.fen()] = node.variations[index+1].move
            if depth >= start:
                if move.turn() == color:
                    if move.variations:
                        positions[board.fen()] = move.variations[0].move
            parse_recursive(move, depth=depth+1)
            board.pop()

    parse_recursive(game)
    return positions