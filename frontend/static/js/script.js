class TicTacToeGame {
    constructor() {
        this.board = this.createEmptyBoard();
        this.humanPlayer = 'X';
        this.aiPlayer = 'O';
        this.gameActive = true;
        this.difficulty = 'hard'; // Default difficulty
        this.gameId = null; // Track current game session
        this.moveNumber = 0; // Track move sequence
        this.initializeEventListeners();
        this.updateDisplay();
    }

    createEmptyBoard() {
        return [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];
    }

    initializeEventListeners() {
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('switch-sides').addEventListener('click', () => this.switchSides());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.showMessage(`Difficulty set to: ${e.target.value.toUpperCase()}`);
            // Restart game with new difficulty
            if (this.gameId) {
                this.resetGame();
            }
        });
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
    }

    async handleCellClick(event) {
        if (!this.gameActive) {
            console.log('Game not active');
            return;
        }
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        console.log(`Cell clicked: (${row}, ${col})`);
        console.log('Current board:', this.board);
        
        if (this.board[row][col] === '') {
            console.log('Making human move...');
            await this.makeMove(row, col, this.humanPlayer);
        } else {
            console.log('Cell already occupied');
        }
    }

    async makeMove(row, col, player) {
        try {
            console.log(`Making move: ${player} at (${row}, ${col})`);
            this.board[row][col] = player;
            this.updateDisplay();
            
            // Increment move number and log the move
            this.moveNumber++;
            const isAiMove = (player === this.aiPlayer);
            await this.logMove(row, col, player, isAiMove);
            
            // Check game state after move
            const gameState = await this.checkGameState();
            console.log('Game state after move:', gameState);
            
            if (gameState !== 'ongoing') {
                this.gameActive = false;
                await this.endGame(gameState);
                this.showGameResult(gameState);
                return;
            }
            
            // If it's AI's turn and game is still active
            if (this.gameActive && player === this.humanPlayer) {
                console.log('Triggering AI move...');
                await this.aiMove();
            }
        } catch (error) {
            console.error('Error in makeMove:', error);
            this.showMessage('Error making move');
        }
    }

    async aiMove() {
        try {
            const difficultyNames = {
                'easy': 'Easy',
                'medium': 'Medium',
                'hard': 'Hard'
            };
            this.showMessage(`AI (${difficultyNames[this.difficulty]}) is thinking...`);
            console.log('Sending AI move request...');
            console.log('Board sent to AI:', this.board);
            console.log('Difficulty:', this.difficulty);
            
            const response = await fetch('/move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    board: this.board,
                    ai_player: this.aiPlayer,
                    difficulty: this.difficulty
                })
            });
            
            console.log('AI response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('AI response data:', data);
            
            if (data.error) {
                throw new Error(`AI error: ${data.error}`);
            }
            
            if (data.row !== undefined && data.col !== undefined) {
                console.log(`AI moving to: (${data.row}, ${data.col})`);
                await this.makeMove(data.row, data.col, this.aiPlayer);
            } else {
                throw new Error('Invalid AI response: missing row or col');
            }
            
        } catch (error) {
            console.error('Error getting AI move:', error);
            this.showMessage('AI Error: ' + error.message);
            // Reset game state on error
            this.gameActive = false;
        }
    }

    async checkGameState() {
        try {
            console.log('Checking game state...');
            const response = await fetch('/check_game_state', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    board: this.board
                })
            });
            
            if (!response.ok) {
                throw new Error(`Game state check failed: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Game state response:', data);
            
            const gameState = data.game_state;
            
            if (gameState === 'ongoing') {
                this.showMessage('Your turn!');
            } else {
                this.gameActive = false;
                this.showGameResult(gameState);
            }
            
            return gameState;
            
        } catch (error) {
            console.error('Error checking game state:', error);
            return 'ongoing';
        }
    }

    showGameResult(gameState) {
        let message = '';
        if (gameState === 'tie') {
            message = "It's a tie!";
        } else if (gameState === this.humanPlayer) {
            message = "Congratulations! You win!";
        } else if (gameState === this.aiPlayer) {
            message = "AI wins! Better luck next time.";
        }
        console.log('Game result:', message);
        this.showMessage(message);
    }

    updateDisplay() {
        document.querySelectorAll('.cell').forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = this.board[row][col];
            cell.textContent = value || '';
            cell.className = `cell ${value.toLowerCase()}`;
        });
        
        // Update player display
        document.getElementById('human-player').textContent = this.humanPlayer;
        document.getElementById('ai-player').textContent = this.aiPlayer;
    }

    async resetGame() {
        try {
            console.log('Resetting game...');
            
            // End current game if it exists and is still active
            if (this.gameId && this.gameActive) {
                const gameState = await this.checkGameState();
                await this.endGame(gameState);
            }
            
            const response = await fetch('/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.board = data.board;
            } else {
                this.board = this.createEmptyBoard();
            }
            
            // Start a new game session
            await this.startGame();
            
            this.gameActive = true;
            this.moveNumber = 0;
            this.updateDisplay();
            this.showMessage('');
            
            console.log('Game reset complete');
            
        } catch (error) {
            console.error('Error resetting game:', error);
            this.board = this.createEmptyBoard();
            this.gameActive = true;
            this.moveNumber = 0;
            this.updateDisplay();
            this.showMessage('');
        }
    }

    switchSides() {
        [this.humanPlayer, this.aiPlayer] = [this.aiPlayer, this.humanPlayer];
        document.getElementById('human-player').textContent = this.humanPlayer;
        document.getElementById('ai-player').textContent = this.aiPlayer;
        this.resetGame();
    }

    showMessage(msg) {
        document.getElementById('message').textContent = msg;
    }

    async startGame() {
        /* Initialize a new game session in the database */
        try {
            const response = await fetch('/start_game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    player_symbol: this.humanPlayer,
                    ai_symbol: this.aiPlayer,
                    difficulty: this.difficulty
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.gameId = data.game_id;
                console.log('Game session started:', this.gameId);
            } else {
                console.error('Failed to start game session');
            }
        } catch (error) {
            console.error('Error starting game session:', error);
        }
    }

    async logMove(row, col, player, isAiMove) {
        /* Log a move to the database */
        if (!this.gameId) {
            console.warn('No game ID, skipping move log');
            return;
        }
        
        try {
            const response = await fetch('/log_move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game_id: this.gameId,
                    move_number: this.moveNumber,
                    row: row,
                    col: col,
                    player: player,
                    is_ai_move: isAiMove
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Move logged:', data);
            } else {
                console.error('Failed to log move');
            }
        } catch (error) {
            console.error('Error logging move:', error);
        }
    }

    async endGame(gameState) {
        /* Log game completion to the database */
        if (!this.gameId) {
            console.warn('No game ID, skipping game end log');
            return;
        }
        
        try {
            // Determine winner from game state
            let winner = null;
            if (gameState === 'X' || gameState === 'O') {
                winner = gameState;
            } else if (gameState === 'tie') {
                winner = null;
            }
            
            const response = await fetch('/end_game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game_id: this.gameId,
                    winner: winner,
                    player_symbol: this.humanPlayer
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Game ended and logged:', data);
            } else {
                console.error('Failed to log game end');
            }
        } catch (error) {
            console.error('Error logging game end:', error);
        }
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Tic-Tac-Toe game initialized');
    const game = new TicTacToeGame();
    // Start initial game session
    game.startGame();
});