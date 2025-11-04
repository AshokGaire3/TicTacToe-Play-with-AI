// Tic-Tac-Toe Game - Client-side implementation for GitHub Pages

class TicTacToeGame {
    constructor() {
        this.board = this.createEmptyBoard();
        this.humanPlayer = 'X';
        this.aiPlayer = 'O';
        this.gameActive = true;
        this.difficulty = 'hard';
        this.ai = new TicTacToeAI();
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
            if (this.gameActive) {
                this.resetGame();
            }
        });
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
    }

    handleCellClick(event) {
        if (!this.gameActive) {
            return;
        }
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        if (this.board[row][col] === '') {
            this.makeMove(row, col, this.humanPlayer);
        }
    }

    makeMove(row, col, player) {
        this.board[row][col] = player;
        this.updateDisplay();
        
        // Check game state
        const gameState = this.checkGameState();
        
        if (gameState !== 'ongoing') {
            this.gameActive = false;
            this.showGameResult(gameState);
            return;
        }
        
        // AI's turn
        if (this.gameActive && player === this.humanPlayer) {
            setTimeout(() => this.aiMove(), 300); // Small delay for better UX
        }
    }

    aiMove() {
        const difficultyNames = {
            'easy': 'Easy',
            'medium': 'Medium',
            'hard': 'Hard'
        };
        this.showMessage(`AI (${difficultyNames[this.difficulty]}) is thinking...`);
        
        // Get AI move
        const move = this.ai.getBestMove(this.board, this.aiPlayer, this.difficulty);
        
        if (move) {
            setTimeout(() => {
                this.makeMove(move[0], move[1], this.aiPlayer);
            }, 500);
        }
    }

    checkGameState() {
        const winner = this.ai.checkWinner(this.board);
        const isFull = this.ai.isBoardFull(this.board);
        
        if (winner) {
            return winner;
        } else if (isFull) {
            return 'tie';
        } else {
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
        
        document.getElementById('human-player').textContent = this.humanPlayer;
        document.getElementById('ai-player').textContent = this.aiPlayer;
    }

    resetGame() {
        this.board = this.createEmptyBoard();
        this.gameActive = true;
        this.updateDisplay();
        this.showMessage('');
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
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
});

