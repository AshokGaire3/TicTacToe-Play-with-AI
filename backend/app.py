from flask import Flask, render_template, request, jsonify
import logging
import os
import sys

# Add backend directory to path for imports
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Add parent directory to path for database imports
parent_dir = os.path.dirname(backend_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from tictactoe_ai import TicTacToeAI
from database.db import init_db, get_db_session
from database.models import Game, Move

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Initialize database
init_db()

# Configure Flask to use frontend folder
app = Flask(__name__, 
            template_folder=os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'templates'),
            static_folder=os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'static'))

game_ai = TicTacToeAI()

def normalize_board(board):
    """Convert empty strings to spaces for backend compatibility"""
    if not isinstance(board, list):
        return board
    normalized = []
    for row in board:
        if isinstance(row, list):
            normalized.append([' ' if cell == '' else cell for cell in row])
        else:
            normalized.append(row)
    return normalized

def denormalize_board(board):
    """Convert spaces to empty strings for frontend compatibility"""
    if not isinstance(board, list):
        return board
    denormalized = []
    for row in board:
        if isinstance(row, list):
            denormalized.append(['' if cell == ' ' else cell for cell in row])
        else:
            denormalized.append(row)
    return denormalized

@app.after_request
def set_headers(response):
    """Set headers to disable CSP for development"""
    response.headers['Content-Security-Policy'] = "default-src 'self' 'unsafe-eval' 'unsafe-inline';"
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/move', methods=['POST'])
def make_move():
    try:
        data = request.json
        board = data['board']
        ai_player = data.get('ai_player', 'O')
        difficulty = data.get('difficulty', 'hard').lower()
        
        # Validate difficulty
        if difficulty not in ['easy', 'medium', 'hard']:
            difficulty = 'hard'  # Default to hard if invalid
        
        # Normalize board (empty string -> space)
        board = normalize_board(board)
        
        print("=== AI MOVE REQUEST ===")
        print(f"Board received: {board}")
        print(f"AI playing as: {ai_player}")
        print(f"Difficulty: {difficulty}")
        
        # Validate board structure
        if not isinstance(board, list) or len(board) != 3:
            return jsonify({'error': 'Invalid board structure'}), 400
            
        # Get the best move from AI based on difficulty
        print(f"Calling get_best_move with difficulty: {difficulty}...")
        move = game_ai.get_best_move(board, ai_player, difficulty)
        print(f"AI move result: {move}")
        
        if move:
            response = {
                'row': move[0],
                'col': move[1],
                'player': ai_player
            }
            print(f"AI responding with: {response}")
            return jsonify(response)
        else:
            print("No moves available - board might be full")
            return jsonify({'error': 'No moves available'}), 400
            
    except Exception as e:
        print(f"ERROR in make_move: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/check_game_state', methods=['POST'])
def check_game_state():
    try:
        data = request.json
        board = data['board']
        
        # Normalize board (empty string -> space)
        board = normalize_board(board)
        
        print("=== CHECKING GAME STATE ===")
        print(f"Board: {board}")
        
        winner = game_ai.check_winner(board)
        is_full = game_ai.is_board_full(board)
        
        print(f"Winner: {winner}, Is full: {is_full}")
        
        if winner:
            state = winner
        elif is_full:
            state = 'tie'
        else:
            state = 'ongoing'
            
        return jsonify({
            'game_state': state,
            'winner': winner,
            'is_board_full': is_full
        })
        
    except Exception as e:
        print(f"ERROR in check_game_state: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/reset', methods=['POST'])
def reset_game():
    """Returns an empty board"""
    empty_board = game_ai.create_board()
    # Denormalize for frontend (space -> empty string)
    empty_board = denormalize_board(empty_board)
    return jsonify({'board': empty_board})

@app.route('/start_game', methods=['POST'])
def start_game():
    """Initialize a new game session and return game_id"""
    try:
        data = request.json
        player_symbol = data.get('player_symbol', 'X')
        ai_symbol = data.get('ai_symbol', 'O')
        difficulty = data.get('difficulty', 'hard').lower()
        
        # Validate difficulty
        if difficulty not in ['easy', 'medium', 'hard']:
            difficulty = 'hard'
        
        # Create new game in database
        db = get_db_session()
        try:
            game = Game(
                player_symbol=player_symbol,
                ai_symbol=ai_symbol,
                difficulty=difficulty,
                result='ongoing'  # Will be updated when game ends
            )
            db.add(game)
            db.commit()
            db.refresh(game)
            game_id = game.id
            
            return jsonify({
                'game_id': game_id,
                'status': 'success'
            })
        finally:
            db.close()
            
    except Exception as e:
        print(f"ERROR in start_game: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/log_move', methods=['POST'])
def log_move():
    """Log a move (player or AI)"""
    try:
        data = request.json
        game_id = data.get('game_id')
        move_number = data.get('move_number')
        row = data.get('row')
        col = data.get('col')
        player = data.get('player')
        is_ai_move = data.get('is_ai_move', False)
        
        if game_id is None or move_number is None or row is None or col is None or player is None:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Save move to database
        db = get_db_session()
        try:
            move = Move(
                game_id=game_id,
                move_number=move_number,
                row=row,
                col=col,
                player=player,
                is_ai_move=1 if is_ai_move else 0
            )
            db.add(move)
            db.commit()
            
            return jsonify({
                'status': 'success',
                'move_id': move.id
            })
        finally:
            db.close()
            
    except Exception as e:
        print(f"ERROR in log_move: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/end_game', methods=['POST'])
def end_game():
    """Log game completion with result"""
    try:
        data = request.json
        game_id = data.get('game_id')
        winner = data.get('winner')  # 'X', 'O', or None for tie
        player_symbol = data.get('player_symbol', 'X')
        
        if game_id is None:
            return jsonify({'error': 'Missing game_id'}), 400
        
        # Determine result from winner and player_symbol
        if winner is None:
            result = 'tie'
        elif winner == player_symbol:
            result = 'win'
        else:
            result = 'loss'
        
        # Update game in database
        db = get_db_session()
        try:
            game = db.query(Game).filter(Game.id == game_id).first()
            if game:
                game.result = result
                game.winner = winner
                db.commit()
                
                return jsonify({
                    'status': 'success',
                    'result': result,
                    'winner': winner
                })
            else:
                return jsonify({'error': 'Game not found'}), 404
        finally:
            db.close()
            
    except Exception as e:
        print(f"ERROR in end_game: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/get_game_history', methods=['GET'])
def get_game_history():
    """Get game history (optional endpoint to view logged games)"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        db = get_db_session()
        try:
            games = db.query(Game).order_by(Game.created_at.desc()).limit(limit).all()
            
            result = []
            for game in games:
                moves = db.query(Move).filter(Move.game_id == game.id).order_by(Move.move_number).all()
                result.append({
                    'game_id': game.id,
                    'player_symbol': game.player_symbol,
                    'ai_symbol': game.ai_symbol,
                    'difficulty': game.difficulty,
                    'result': game.result,
                    'winner': game.winner,
                    'created_at': game.created_at.isoformat() if game.created_at else None,
                    'moves': [
                        {
                            'move_number': move.move_number,
                            'row': move.row,
                            'col': move.col,
                            'player': move.player,
                            'is_ai_move': bool(move.is_ai_move)
                        }
                        for move in moves
                    ]
                })
            
            return jsonify({
                'games': result,
                'count': len(result)
            })
        finally:
            db.close()
            
    except Exception as e:
        print(f"ERROR in get_game_history: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/debug/ai')
def debug_ai():
    """Debug endpoint to test AI directly"""
    test_board = [
        ['X', ' ', ' '],
        [' ', 'O', ' '],
        [' ', ' ', ' ']
    ]
    move = game_ai.get_best_move(test_board, 'O')
    return jsonify({
        'test_board': test_board,
        'ai_move': move,
        'winner': game_ai.check_winner(test_board),
        'possible_moves': game_ai.get_possible_moves(test_board)
    })

if __name__ == '__main__':
    # Get port from environment variable or default to 5001
    port = int(os.environ.get('PORT', 5001))
    # Only enable debug in development
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=port)