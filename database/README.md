# Database Folder

This folder contains the database implementation for tracking game data.

## Current Status

✅ **Database is now implemented!** The Tic-Tac-Toe game now tracks:
- All player moves (position, player, move number)
- All AI moves (position, player, move number)
- Game results (win/loss/tie, winner)
- Game metadata (difficulty, player/AI symbols, timestamps)

## Database Setup

The database uses **SQLite** with **SQLAlchemy** ORM. The database file (`tictactoe.db`) is automatically created in this folder when the application first runs.

### Installation

Make sure you have the required dependencies installed:

```bash
pip install -r requirements.txt
```

This will install:
- Flask==3.0.0
- Werkzeug==3.0.1
- SQLAlchemy==2.0.23

## Database Schema

### Games Table
Stores game sessions with:
- `id`: Primary key
- `player_symbol`: Player's symbol ('X' or 'O')
- `ai_symbol`: AI's symbol ('X' or 'O')
- `difficulty`: Game difficulty ('easy', 'medium', 'hard')
- `result`: Game result ('win', 'loss', 'tie')
- `winner`: Winner symbol ('X', 'O', or None for tie)
- `created_at`: Timestamp when game started

### Moves Table
Stores individual moves with:
- `id`: Primary key
- `game_id`: Foreign key to games table
- `move_number`: Sequential move number (1, 2, 3, ...)
- `row`: Row position (0-2)
- `col`: Column position (0-2)
- `player`: Player symbol ('X' or 'O')
- `is_ai_move`: 1 for AI moves, 0 for player moves
- `created_at`: Timestamp when move was made

## API Endpoints

The backend provides the following endpoints for game logging:

### `/start_game` (POST)
Initialize a new game session.
- Request body: `{player_symbol, ai_symbol, difficulty}`
- Response: `{game_id, status}`

### `/log_move` (POST)
Log a move (player or AI).
- Request body: `{game_id, move_number, row, col, player, is_ai_move}`
- Response: `{status, move_id}`

### `/end_game` (POST)
Log game completion with result.
- Request body: `{game_id, winner, player_symbol}`
- Response: `{status, result, winner}`

### `/get_game_history` (GET)
Retrieve game history (optional).
- Query params: `limit` (default: 10)
- Response: `{games: [...], count: N}`

## Viewing Logged Data

### Using the View Script

A Python script is provided to view logged game data:

```bash
# View recent game history (default: 10 games)
python database/view_data.py

# View more games
python database/view_data.py --limit 20

# View statistics
python database/view_data.py --stats
```

### Using the API Endpoint

You can also query game history via the API:

```bash
curl http://localhost:5001/get_game_history?limit=10
```

### Direct Database Access

The database file is located at `database/tictactoe.db`. You can use any SQLite client to query it directly:

```bash
sqlite3 database/tictactoe.db

# Example queries:
SELECT * FROM games;
SELECT * FROM moves WHERE game_id = 1;
SELECT COUNT(*) FROM games WHERE result = 'win';
```

## How It Works

1. **Game Start**: When a game begins (page load or reset), the frontend calls `/start_game` to create a new game session and receives a `game_id`.

2. **Move Logging**: Every time a move is made (player or AI), the frontend calls `/log_move` with the move details.

3. **Game End**: When the game ends (win, loss, or tie), the frontend calls `/end_game` to record the final result.

4. **Data Storage**: All data is automatically stored in the SQLite database for future analysis.

## Example Usage

```python
from database.db import get_db_session
from database.models import Game, Move

# Get database session
db = get_db_session()

# Query games
games = db.query(Game).filter(Game.result == 'win').all()

# Query moves for a game
moves = db.query(Move).filter(Move.game_id == 1).order_by(Move.move_number).all()

# Close session
db.close()
```

## Notes

- The database is automatically initialized when the Flask app starts
- The database file (`tictactoe.db`) is created automatically if it doesn't exist
- All game data persists across application restarts
- The database uses SQLite, which is perfect for local development and small to medium deployments
- For production deployments with high traffic, consider migrating to PostgreSQL or MySQL
