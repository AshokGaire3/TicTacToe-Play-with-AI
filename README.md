# Tic-Tac-Toe AI Game

A web-based Tic-Tac-Toe game featuring an intelligent AI opponent with three difficulty levels. The AI uses different algorithms for each difficulty: random moves with occasional strategy for Easy, limited-depth DFS with advanced heuristics for Medium, and full Minimax with Alpha-Beta Pruning for Hard. **All games are automatically logged to a database for analysis.**

## Project Structure

```
TicTacToe/
├── backend/           # Server-side code
│   ├── app.py        # Flask application and API routes
│   └── tictactoe_ai.py  # AI logic with multiple algorithms
│
├── frontend/         # Client-side code
│   ├── templates/    # HTML templates
│   │   └── index.html
│   └── static/       # Static assets
│       ├── js/
│       │   └── script.js  # Frontend game logic
│       └── css/
│           └── style.css  # Styling
│
└── database/         # Database code and models
    ├── models.py     # SQLAlchemy database models
    ├── db.py         # Database connection and initialization
    ├── view_data.py  # Script to view logged game data
    ├── tictactoe.db  # SQLite database (created automatically)
    └── README.md     # Database documentation

```

## Features

- **Three Difficulty Levels**: Easy, Medium, and Hard AI opponents
- **Smart AI Algorithms**: 
  - **Easy**: Random moves with occasional strategic play (70% win rate, 50% block rate)
  - **Medium**: Limited-depth DFS with advanced heuristics (85% block rate, 90% win rate)
  - **Hard**: Full Minimax with Alpha-Beta Pruning (unbeatable)
- **Game Data Logging**: All moves and game results are automatically tracked in a database
- **Player Switching**: Switch sides to play as either X or O
- **Real-time Updates**: Interactive UI with instant game state updates
- **Game State Detection**: Automatic win/lose/tie detection
- **Difficulty Selector**: Change AI difficulty on the fly
- **Responsive Design**: Clean and modern user interface
- **Game History**: View logged games and statistics

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd TicTacToe
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   
   This installs:
   - Flask 3.0.0
   - Werkzeug 3.0.1
   - SQLAlchemy 2.0.44 (for database functionality)

## Running the Application

1. **Navigate to the project directory:**
   ```bash
   cd /Users/TicTacToe
   ```

2. **Activate the virtual environment:**
   ```bash
   source venv/bin/activate
   ```

3. **Start the Flask server:**
   
   ```bash
   source venv/bin/activate && python3 backend/app.py
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:5001
   ```
   
   The database will be automatically initialized on first run. You'll see:
   ```
   Database initialized at: /tictactoe.db
   * Running on http://127.0.0.1:5001
   ```

## How to Play

1. Select your preferred difficulty level from the dropdown menu
2. Click on any empty cell to make your move
3. The AI will automatically respond with its move based on the selected difficulty
4. The game will detect wins, losses, or ties automatically
5. Use "New Game" to restart with the current difficulty setting
6. Use "Switch Sides" to change which player you control

## AI Difficulty Levels & Algorithms

### 🟢 **Easy Mode - Random Moves with Occasional Strategy**
- **Algorithm**: Random moves with probabilistic strategic play
- **Strategy**: 
  - **70% chance** to take winning moves (sometimes misses them)
  - **50% chance** to block opponent wins (often misses them)
  - Mostly makes random moves
  - Occasionally prefers center or corners (30% chance)
- **Complexity**: O(n) where n = available moves
- **Play Style**: Mostly random; makes many mistakes intentionally
- **Beatable**: ✅ Yes - Designed to be easily beatable

### 🟡 **Medium Mode - Limited-Depth DFS with Advanced Heuristics**
- **Algorithm**: Limited-Depth Depth-First Search + Advanced Heuristics
- **Search Depth**: 2 moves ahead
- **Strategy**:
  - **85% chance** to block opponent wins (sometimes misses them)
  - **90% chance** to take winning moves (rarely misses)
  - Uses DFS with limited depth (2 moves)
  - Advanced heuristic evaluation considers:
    - **Threats**: Two-in-a-row with open ends (+5 points)
    - **Blocks**: Blocking opponent's immediate wins (+4 points)
    - **Potential**: One-in-a-row with two open ends (+1 point)
    - **Position**: Center control (+3 points), Corner positions (+1 each)
  - Combined scoring: 70% DFS score + 30% immediate heuristic value
  - **35% chance** to pick suboptimal move (from top 3-4 moves) for human-like play
- **Complexity**: O(b^d) where b = branching factor, d = depth (2)
- **Play Style**: Strategic but makes mistakes; balanced difficulty
- **Beatable**: ✅ Yes - Challenging but beatable with good strategy

### 🔴 **Hard Mode - Full Minimax with Alpha-Beta Pruning**
- **Algorithm**: Minimax with Alpha-Beta Pruning
- **Search Depth**: Full game tree (all possible moves)
- **Strategy**:
  - Explores entire game tree using minimax algorithm
  - Always chooses optimal move that maximizes AI's chances
  - Uses alpha-beta pruning to optimize search efficiency
  - Assumes opponent also plays optimally
- **Complexity**: O(b^m) with pruning, where b = branching factor, m = max depth
- **Play Style**: Optimal; never loses (best case: win, worst case: tie)
- **Beatable**: ❌ No - Will at best tie, will never lose

### Algorithm Comparison

| Difficulty | Algorithm | Win Rate | Block Rate | Suboptimal Behavior | Beatable? |
|------------|-----------|----------|------------|---------------------|-----------|
| **Easy** | Random + Strategy | 70% | 50% | Mostly random moves | ✅ Yes |
| **Medium** | Limited DFS + Heuristics | 90% | 85% | 35% suboptimal picks | ✅ Yes |
| **Hard** | Minimax + Alpha-Beta | 100% | 100% | None (always optimal) | ❌ No (ties) |

## API Endpoints

### `POST /move`
Get the AI's next move based on difficulty level.

**Request:**
```json
{
  "board": [["X", "", "O"], ["", "", ""], ["", "", ""]],
  "ai_player": "O",
  "difficulty": "medium"
}
```

**Parameters:**
- `board`: 3x3 array representing the game board (empty cells as `""` or `" "`)
- `ai_player`: Which player the AI is (`"X"` or `"O"`)
- `difficulty`: Difficulty level (`"easy"`, `"medium"`, or `"hard"`)

**Response:**
```json
{
  "row": 1,
  "col": 1,
  "player": "O"
}
```

### `POST /check_game_state`
Check the current game state (win, lose, tie, or ongoing).

**Request:**
```json
{
  "board": [["X", "X", "X"], ["", "", ""], ["", "", ""]]
}
```

**Response:**
```json
{
  "game_state": "X",
  "winner": "X",
  "is_board_full": false
}
```

**Game States:**
- `"ongoing"`: Game is still in progress
- `"X"` or `"O"`: That player won
- `"tie"`: Board is full with no winner

### `POST /reset`
Reset the game to get an empty board.

**Response:**
```json
{
  "board": [["", "", ""], ["", "", ""], ["", "", ""]]
}
```

### `POST /start_game`
Initialize a new game session for logging.

**Request:**
```json
{
  "player_symbol": "X",
  "ai_symbol": "O",
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "game_id": 1,
  "status": "success"
}
```

### `POST /log_move`
Log a move (player or AI) to the database.

**Request:**
```json
{
  "game_id": 1,
  "move_number": 1,
  "row": 0,
  "col": 0,
  "player": "X",
  "is_ai_move": false
}
```

### `POST /end_game`
Log game completion with result.

**Request:**
```json
{
  "game_id": 1,
  "winner": "X",
  "player_symbol": "X"
}
```

### `GET /get_game_history`
Retrieve game history (optional endpoint).

**Query Parameters:**
- `limit`: Number of games to retrieve (default: 10)

**Response:**
```json
{
  "games": [
    {
      "game_id": 1,
      "player_symbol": "X",
      "ai_symbol": "O",
      "difficulty": "medium",
      "result": "win",
      "winner": "X",
      "created_at": "2025-11-04T12:00:00",
      "moves": [...]
    }
  ],
  "count": 10
}
```

### `GET /debug/ai`
Debug endpoint to test AI directly (uses hard difficulty by default).

**Response:**
```json
{
  "test_board": [["X", " ", " "], [" ", "O", " "], [" ", " ", " "]],
  "ai_move": [2, 2],
  "winner": null,
  "possible_moves": [[0, 1], [0, 2], [1, 0], ...]
}
```

## Technical Details

### Easy Mode Implementation
```python
def easy_move_dfs_bfs(board, ai_player, max_depth=1):
    # 70% chance to take winning moves
    # 50% chance to block opponent wins
    # Mostly random moves
    # 30% chance to prefer center/corners
```

### Medium Mode Implementation
```python
def medium_move_limited_dfs(board, ai_player, max_depth=2):
    # 85% chance to block, 90% chance to take wins
    # Limited-depth DFS (2 moves ahead)
    # Advanced heuristics: threats, blocks, position
    # Combined scoring: 70% DFS + 30% immediate heuristic
    # 35% chance: pick from top 3-4 moves (suboptimal)
```

### Hard Mode Implementation
```python
def hard_move(board, ai_player):
    # Full minimax with alpha-beta pruning
    # Explores entire game tree
    # Always optimal play
```

## Technology Stack

- **Backend**: Python, Flask
- **Frontend**: HTML, CSS, JavaScript
- **AI Algorithms**: 
  - Depth-First Search (DFS)
  - Breadth-First Search (BFS)
  - Minimax Algorithm
  - Alpha-Beta Pruning
  - Heuristic Evaluation

## Algorithm Explanations

### Minimax Algorithm (Hard Mode)
The Minimax algorithm is a decision-making algorithm for turn-based games. It:
- Explores all possible game outcomes
- Assumes both players play optimally
- Maximizes the AI's score while minimizing the opponent's score
- Uses Alpha-Beta Pruning to cut off branches that won't affect the final decision

### Limited-Depth DFS (Medium Mode)
Instead of exploring the entire game tree, Medium mode:
- Limits search depth to 2 moves ahead
- Uses heuristic evaluation when depth limit is reached
- Evaluates board positions based on threats, blocks, and strategic positions
- Occasionally makes suboptimal moves for more human-like play

### Random Moves with Strategy (Easy Mode)
Easy mode uses a simple probabilistic approach:
- **70% chance** to take winning moves (sometimes misses them)
- **50% chance** to block opponent wins (often misses them)
- Mostly makes random moves
- Occasionally prefers center or corners (30% chance)
- Designed to be easily beatable

## Database & Game Logging

The game automatically logs all moves and game results to a SQLite database. Every time someone plays:

- **Game sessions** are created with player/AI symbols, difficulty, and result
- **All moves** are logged (position, player, move number, whether it's an AI move)
- **Game results** are saved (win/loss/tie, winner)

### Viewing Logged Data

**Using the view script:**
```bash
# View recent games (default: 10)
python3 database/view_data.py

# View more games
python3 database/view_data.py --limit 20

# View statistics
python3 database/view_data.py --stats
```

**Using the API:**
```bash
curl http://localhost:5001/get_game_history?limit=10
```

**Direct database access:**
The database file is located at `database/tictactoe.db`. You can use any SQLite client:
```bash
sqlite3 database/tictactoe.db
```

### Database Schema

- **Games Table**: Stores game sessions (player_symbol, ai_symbol, difficulty, result, winner, timestamp)
- **Moves Table**: Stores individual moves (game_id, move_number, row, col, player, is_ai_move, timestamp)

For more details, see `database/README.md`.

## Development

### Project Organization

- **backend/**: Contains all server-side logic including Flask routes and AI algorithms
- **frontend/**: Contains all client-side code including templates, JavaScript, and CSS
- **database/**: Reserved for future database integration

### Code Style

- Python follows PEP 8 conventions
- JavaScript uses ES6+ syntax
- HTML uses semantic markup

## Troubleshooting

### Port Already in Use
If port 5001 is already in use, modify `backend/app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5002)  # Change port number
```

### Module Not Found
Ensure you're in the correct directory and have activated your virtual environment:
```bash
cd /Users/ashokgaire/TicTacToe
source venv/bin/activate
pip install -r requirements.txt
```

### Difficulty Not Changing
If the difficulty doesn't seem to change:
- Make sure you've selected a difficulty from the dropdown
- Check browser console for any JavaScript errors
- Verify the Flask server is running and receiving requests

## Testing the Different Difficulties

### Testing Easy Mode
1. Select "Easy" from the dropdown
2. Play a game - you should notice the AI makes random-looking moves
3. Easy mode is beatable with basic strategy

### Testing Medium Mode
1. Select "Medium" from the dropdown
2. Play a game - AI should play strategically but make occasional mistakes
3. Medium mode is challenging but beatable

### Testing Hard Mode
1. Select "Hard" from the dropdown
2. Play a game - AI will play optimally
3. Hard mode is unbeatable (best you can do is tie)

## Future Enhancements

- [x] Game history and statistics tracking (✅ Implemented)
- [x] Production deployment configuration (✅ Implemented)
- [ ] Multiple difficulty presets within each level
- [ ] Online multiplayer mode
- [ ] User accounts and leaderboards
- [ ] Animation and sound effects
- [ ] Difficulty level explanations and tips
- [ ] Move history and undo functionality
- [ ] AI move visualization (showing AI's thought process)
- [ ] Web interface for viewing game history
- [ ] Export game data to CSV/JSON

## License

This project is open source and available for educational purposes.

## Acknowledgments

- Minimax algorithm and Alpha-Beta Pruning for optimal play
- DFS/BFS algorithms for search-based decision making
- Heuristic evaluation techniques for medium difficulty

---

**Enjoy playing Tic-Tac-Toe with AI! Try different difficulty levels to find your perfect challenge level.** 🎮
