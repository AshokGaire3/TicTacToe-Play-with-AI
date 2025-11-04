import math
import random

class TicTacToeAI:
    def __init__(self):
        pass

    # --- 1. Board Representation and Game Logic ---

    def create_board(self):
        """Creates an empty 3x3 Tic-Tac-Toe board."""
        return [[' ' for _ in range(3)] for _ in range(3)]

    def print_board(self, board):
        """Prints the current board state."""
        print("\n")
        for r in range(3):
            print(f" {board[r][0]} | {board[r][1]} | {board[r][2]} ")
            if r < 2:
                print("---|---|---")
        print("\n")

    def get_possible_moves(self, board):
        """Returns a list of all empty (row, col) spots on the board."""
        moves = []
        for r in range(3):
            for c in range(3):
                if board[r][c] == ' ':
                    moves.append((r, c))
        return moves

    def check_winner(self, board):
        """Checks if there's a winner and returns the winner or None."""
        players = ['X', 'O']
        for player in players:
            # Check rows, columns, and diagonals
            for i in range(3):
                if all(board[i][j] == player for j in range(3)): 
                    return player  # Row
                if all(board[j][i] == player for j in range(3)): 
                    return player  # Column
            if all(board[i][i] == player for i in range(3)): 
                return player  # Diagonal
            if all(board[i][2-i] == player for i in range(3)): 
                return player  # Anti-diagonal
        return None

    def is_board_full(self, board):
        """Checks if the board has any empty spaces left."""
        return len(self.get_possible_moves(board)) == 0

    def get_game_state(self, board):
        """Returns the current game state: winner or 'tie' or None if ongoing."""
        winner = self.check_winner(board)
        if winner:
            return winner
        if self.is_board_full(board):
            return 'tie'
        return None

    # --- Helper Methods for Difficulty Levels ---

    def find_winning_move(self, board, player):
        """Finds a winning move for the given player, returns None if none exists."""
        moves = self.get_possible_moves(board)
        for r, c in moves:
            board[r][c] = player
            if self.check_winner(board) == player:
                board[r][c] = ' '
                return (r, c)
            board[r][c] = ' '
        return None

    def find_blocking_move(self, board, ai_player):
        """Finds a move to block the opponent from winning."""
        opponent = 'X' if ai_player == 'O' else 'O'
        return self.find_winning_move(board, opponent)

    def find_center_move(self, board):
        """Returns center position if available."""
        if board[1][1] == ' ':
            return (1, 1)
        return None

    def find_corner_move(self, board):
        """Returns a random corner move if available."""
        corners = [(0, 0), (0, 2), (2, 0), (2, 2)]
        available_corners = [c for c in corners if board[c[0]][c[1]] == ' ']
        return random.choice(available_corners) if available_corners else None

    # --- 2. AI Difficulty Levels ---

    def easy_move_dfs_bfs(self, board, ai_player, max_depth=1):
        """
        Easy difficulty: Random moves with occasional strategic play.
        Strategy: Mostly random moves, but sometimes takes wins or blocks losses.
        Designed to be beatable.
        """
        moves = self.get_possible_moves(board)
        if not moves:
            return None

        # Sometimes take winning moves (70% chance)
        winning = self.find_winning_move(board, ai_player)
        if winning and random.random() < 0.7:
            return winning
        
        # Sometimes block opponent's winning moves (50% chance)
        blocking = self.find_blocking_move(board, ai_player)
        if blocking and random.random() < 0.5:
            return blocking

        # Mostly just pick random moves (this is the easy part!)
        # Occasionally prefer center or corners, but mostly random
        if random.random() < 0.3:  # 30% chance to try center or corners
            center = self.find_center_move(board)
            if center and random.random() < 0.5:
                return center
            
            corner = self.find_corner_move(board)
            if corner and random.random() < 0.5:
                return corner

        # Pure random move (most common case for easy mode)
        return random.choice(moves)

    def simple_evaluate(self, board, ai_player):
        """Simple evaluation for easy mode DFS/BFS."""
        opponent = 'X' if ai_player == 'O' else 'O'
        score = 0
        
        # Check if someone wins
        winner = self.check_winner(board)
        if winner == ai_player:
            return 10
        if winner == opponent:
            return -10
        
        # Simple position score
        if board[1][1] == ai_player:  # Center control
            score += 2
        
        return score

    def easy_move(self, board, ai_player):
        """Easy difficulty wrapper - uses shallow DFS/BFS with randomness."""
        return self.easy_move_dfs_bfs(board, ai_player, max_depth=1)

    def advanced_heuristic_evaluate(self, board, ai_player):
        """
        Advanced heuristic evaluation for medium mode.
        Scores based on:
        - Two-in-a-row with open ends (threats)
        - Blocking opponent's immediate wins
        - Center control
        - Corner positions
        """
        opponent = 'X' if ai_player == 'O' else 'O'
        score = 0
        
        # Check all lines (rows, columns, diagonals)
        lines = [
            # Rows
            [(0, 0), (0, 1), (0, 2)],
            [(1, 0), (1, 1), (1, 2)],
            [(2, 0), (2, 1), (2, 2)],
            # Columns
            [(0, 0), (1, 0), (2, 0)],
            [(0, 1), (1, 1), (2, 1)],
            [(0, 2), (1, 2), (2, 2)],
            # Diagonals
            [(0, 0), (1, 1), (2, 2)],
            [(0, 2), (1, 1), (2, 0)]
        ]
        
        for line in lines:
            ai_count = sum(1 for r, c in line if board[r][c] == ai_player)
            opp_count = sum(1 for r, c in line if board[r][c] == opponent)
            empty_count = sum(1 for r, c in line if board[r][c] == ' ')
            
            # AI has two in a row with open end (threat)
            if ai_count == 2 and empty_count == 1:
                score += 5  # Strong threat
            
            # AI has one with two open ends (potential)
            if ai_count == 1 and empty_count == 2:
                score += 1
            
            # Block opponent's two-in-a-row (blocking immediate win)
            if opp_count == 2 and empty_count == 1:
                score += 4  # Must block
            
            # Opponent has one with two open ends (defensive)
            if opp_count == 1 and empty_count == 2:
                score -= 1
        
        # Center control
        if board[1][1] == ai_player:
            score += 3
        elif board[1][1] == opponent:
            score -= 2
        
        # Corner positions (for opening)
        corners = [(0, 0), (0, 2), (2, 0), (2, 2)]
        ai_corners = sum(1 for r, c in corners if board[r][c] == ai_player)
        opp_corners = sum(1 for r, c in corners if board[r][c] == opponent)
        score += ai_corners * 1
        score -= opp_corners * 1
        
        return score

    def medium_move_limited_dfs(self, board, ai_player, max_depth=2):
        """
        Medium difficulty: Limited-depth DFS with advanced heuristics.
        Strategy: Sometimes blocks/takes wins, uses DFS with limited depth (2 moves),
        evaluates with heuristics, and picks suboptimal moves more often (35% chance).
        """
        moves = self.get_possible_moves(board)
        if not moves:
            return None

        # Usually block immediate wins (85% chance)
        blocking = self.find_blocking_move(board, ai_player)
        if blocking and random.random() < 0.85:
            return blocking
        
        # Usually take immediate wins (90% chance)
        winning = self.find_winning_move(board, ai_player)
        if winning and random.random() < 0.9:
            return winning

        # Limited-depth DFS with heuristic evaluation
        move_scores = []
        
        for move in moves:
            r, c = move
            board[r][c] = ai_player
            
            # DFS search with limited depth
            score = self.dfs_search(board, 0, max_depth, False, ai_player)
            
            # Also consider immediate heuristic value
            immediate_score = self.advanced_heuristic_evaluate(board, ai_player)
            combined_score = score * 0.7 + immediate_score * 0.3
            
            move_scores.append((move, combined_score))
            board[r][c] = ' '
        
        # Sort by score
        move_scores.sort(key=lambda x: x[1], reverse=True)
        
        # 35% chance to pick suboptimal move (more mistakes than before)
        if len(move_scores) > 1 and random.random() < 0.35:
            # Pick randomly from top 3-4 moves (not always best)
            top_count = min(4, len(move_scores))
            top_moves = move_scores[:top_count]
            return random.choice(top_moves)[0]
        
        # Return best move based on heuristic + DFS
        return move_scores[0][0] if move_scores else random.choice(moves)

    def dfs_search(self, board, depth, max_depth, is_maximizing, ai_player):
        """
        Limited-depth DFS search with heuristic cutoff.
        """
        # Check terminal states
        winner = self.check_winner(board)
        opponent = 'X' if ai_player == 'O' else 'O'
        
        if winner == ai_player:
            return 10 - depth
        if winner == opponent:
            return depth - 10
        if self.is_board_full(board):
            return 0
        
        # If max depth reached, use heuristic evaluation
        if depth >= max_depth:
            return self.advanced_heuristic_evaluate(board, ai_player)
        
        moves = self.get_possible_moves(board)
        if not moves:
            return 0
        
        if is_maximizing:
            best_score = -math.inf
            for r, c in moves:
                board[r][c] = ai_player
                score = self.dfs_search(board, depth + 1, max_depth, False, ai_player)
                board[r][c] = ' '
                best_score = max(best_score, score)
            return best_score
        else:
            best_score = math.inf
            for r, c in moves:
                board[r][c] = opponent
                score = self.dfs_search(board, depth + 1, max_depth, True, ai_player)
                board[r][c] = ' '
                best_score = min(best_score, score)
            return best_score

    def medium_move(self, board, ai_player, max_depth=2):
        """
        Medium difficulty: Limited-depth DFS with advanced heuristics.
        """
        return self.medium_move_limited_dfs(board, ai_player, max_depth)

    def hard_move(self, board, ai_player):
        """
        Hard difficulty: Full minimax with alpha-beta pruning (unbeatable).
        Strategy: Always plays optimally using full game tree search.
        """
        return self.find_best_move(board, ai_player)

    # --- 3. The AI Brain (Minimax with Alpha-Beta Pruning) ---

    def minimax(self, board, depth, alpha, beta, is_maximizing, ai_player='O'):
        """
        Minimax algorithm with Alpha-Beta Pruning to find the best move.
        'is_maximizing' is True when it's the AI's turn, False for opponent's turn.
        'ai_player' specifies which player the AI is ('X' or 'O').
        """
        # Determine opponent
        opponent = 'X' if ai_player == 'O' else 'O'
        
        # Check for terminal states: win, lose, or draw
        winner = self.check_winner(board)
        if winner == ai_player:
            return 10 - depth  # AI wins, score is positive
        if winner == opponent:
            return depth - 10  # Opponent wins, score is negative
        if self.is_board_full(board):
            return 0  # Draw

        if is_maximizing:  # AI's turn - wants to maximize the score
            best_score = -math.inf
            for r, c in self.get_possible_moves(board):
                board[r][c] = ai_player
                score = self.minimax(board, depth + 1, alpha, beta, False, ai_player)
                board[r][c] = ' '
                best_score = max(score, best_score)
                alpha = max(alpha, score)
                if beta <= alpha:
                    break  # Alpha-beta pruning
            return best_score
        else:  # Opponent's turn - wants to minimize the score
            best_score = math.inf
            for r, c in self.get_possible_moves(board):
                board[r][c] = opponent
                score = self.minimax(board, depth + 1, alpha, beta, True, ai_player)
                board[r][c] = ' '
                best_score = min(best_score, score)
                beta = min(beta, score)
                if beta <= alpha:
                    break  # Alpha-beta pruning
            return best_score

    def find_best_move(self, board, ai_player='O'):
        """Finds the best move for the AI by calling the minimax algorithm."""
        best_score = -math.inf
        move = None
        
        for r, c in self.get_possible_moves(board):
            board[r][c] = ai_player
            # After AI makes a move, it's opponent's turn (minimizing)
            score = self.minimax(board, 0, -math.inf, math.inf, False, ai_player)
            board[r][c] = ' '
            
            if score > best_score:
                best_score = score
                move = (r, c)
        
        return move

    def get_best_move(self, board, ai_player='O', difficulty='hard'):
        """
        Public method to get the best move based on difficulty level.
        Difficulty options: 'easy', 'medium', 'hard'
        """
        # Create a deep copy to avoid modifying the original
        board_copy = [row[:] for row in board]
        
        difficulty = difficulty.lower()
        
        if difficulty == 'easy':
            return self.easy_move(board_copy, ai_player)
        elif difficulty == 'medium':
            return self.medium_move(board_copy, ai_player)
        elif difficulty == 'hard':
            return self.hard_move(board_copy, ai_player)
        else:
            # Default to hard if invalid difficulty
            return self.hard_move(board_copy, ai_player)

# Keep your original main function for testing
def main():
    """Main function to run the Tic-Tac-Toe game."""
    game = TicTacToeAI()
    board = game.create_board()
    print("Welcome to Tic-Tac-Toe! You are X, and the AI is O.")
    game.print_board(board)

    while True:
        # --- Player's Turn ---
        try:
            row, col = map(int, input("Enter your move (row col): ").split())
            if board[row][col] == ' ':
                board[row][col] = 'X'
            else:
                print("This spot is already taken! Try again.")
                continue
        except (ValueError, IndexError):
            print("Invalid input! Please enter row and col from 0-2.")
            continue

        game.print_board(board)

        if game.check_winner(board) == 'X':
            print("Congratulations! You win!")
            break
        if game.is_board_full(board):
            print("It's a draw!")
            break

        # --- AI's Turn ---
        print("AI is thinking...")
        ai_move = game.get_best_move(board, 'O', 'hard') # Changed to use get_best_move with difficulty
        if ai_move:
            board[ai_move[0]][ai_move[1]] = 'O'
            print(f"AI plays at ({ai_move[0]}, {ai_move[1]})")

        game.print_board(board)

        if game.check_winner(board) == 'O':
            print("AI wins! Better luck next time.")
            break
        if game.is_board_full(board):
            print("It's a draw!")
            break

if __name__ == "__main__":
    main()