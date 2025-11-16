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
        document.getElementById('view-history-btn').addEventListener('click', () => this.showGameHistory());
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
        
        // History modal event listeners
        const modal = document.getElementById('history-modal');
        const closeBtn = document.querySelector('.close');
        const refreshBtn = document.getElementById('refresh-history-btn');
        const exportJsonBtn = document.getElementById('export-json-btn');
        const exportCsvBtn = document.getElementById('export-csv-btn');
        const historyLimit = document.getElementById('history-limit');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeHistoryModal());
        }
        if (modal) {
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeHistoryModal();
                }
            });
        }
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadGameHistory());
        }
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', () => this.exportHistory('json'));
        }
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => this.exportHistory('csv'));
        }
        if (historyLimit) {
            historyLimit.addEventListener('change', () => this.loadGameHistory());
        }
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

    async showGameHistory() {
        /* Show game history modal */
        const modal = document.getElementById('history-modal');
        modal.style.display = 'block';
        await this.loadGameHistory();
    }

    closeHistoryModal() {
        /* Close game history modal */
        const modal = document.getElementById('history-modal');
        modal.style.display = 'none';
    }

    async loadGameHistory() {
        /* Load and display game history */
        const historyList = document.getElementById('history-list');
        const historyLoading = document.getElementById('history-loading');
        const historyError = document.getElementById('history-error');
        const historyStats = document.getElementById('history-stats');
        const limit = document.getElementById('history-limit').value;

        historyLoading.style.display = 'block';
        historyError.textContent = '';
        historyList.innerHTML = '';
        historyStats.innerHTML = '';

        try {
            const response = await fetch(`/get_game_history?limit=${limit}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load history: ${response.status}`);
            }

            const data = await response.json();
            const games = data.games || [];

            // Display statistics
            this.displayHistoryStats(games, historyStats);

            // Display game list
            if (games.length === 0) {
                historyList.innerHTML = '<p class="no-games">No games found. Start playing to see your history!</p>';
            } else {
                games.forEach(game => {
                    const gameElement = this.createGameHistoryElement(game);
                    historyList.appendChild(gameElement);
                });
            }

            // Store games for export
            this.gameHistoryData = games;

        } catch (error) {
            console.error('Error loading game history:', error);
            historyError.textContent = `Error: ${error.message}`;
        } finally {
            historyLoading.style.display = 'none';
        }
    }

    displayHistoryStats(games, statsElement) {
        /* Display game statistics */
        if (games.length === 0) {
            statsElement.innerHTML = '<p>No games to display statistics.</p>';
            return;
        }

        const totalGames = games.length;
        const wins = games.filter(g => g.result === 'win').length;
        const losses = games.filter(g => g.result === 'loss').length;
        const ties = games.filter(g => g.result === 'tie').length;
        const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;

        const difficultyStats = {};
        games.forEach(game => {
            const diff = game.difficulty || 'unknown';
            if (!difficultyStats[diff]) {
                difficultyStats[diff] = { total: 0, wins: 0, losses: 0, ties: 0 };
            }
            difficultyStats[diff].total++;
            if (game.result === 'win') difficultyStats[diff].wins++;
            else if (game.result === 'loss') difficultyStats[diff].losses++;
            else if (game.result === 'tie') difficultyStats[diff].ties++;
        });

        let statsHTML = `
            <div class="stats-summary">
                <h3>Statistics</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Total Games:</span>
                        <span class="stat-value">${totalGames}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Wins:</span>
                        <span class="stat-value win">${wins}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Losses:</span>
                        <span class="stat-value loss">${losses}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Ties:</span>
                        <span class="stat-value tie">${ties}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Win Rate:</span>
                        <span class="stat-value">${winRate}%</span>
                    </div>
                </div>
        `;

        if (Object.keys(difficultyStats).length > 0) {
            statsHTML += '<h4>By Difficulty:</h4><div class="stats-grid">';
            Object.entries(difficultyStats).forEach(([diff, stats]) => {
                const diffWinRate = stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : 0;
                statsHTML += `
                    <div class="stat-item difficulty-stat">
                        <span class="stat-label">${diff.toUpperCase()}:</span>
                        <span class="stat-value">${stats.total} games (${stats.wins}W/${stats.losses}L/${stats.ties}T, ${diffWinRate}% win)</span>
                    </div>
                `;
            });
            statsHTML += '</div>';
        }

        statsHTML += '</div>';
        statsElement.innerHTML = statsHTML;
    }

    createGameHistoryElement(game) {
        /* Create HTML element for a single game in history */
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-history-item';
        
        const date = new Date(game.created_at);
        const dateStr = date.toLocaleString();
        const resultClass = game.result === 'win' ? 'win' : game.result === 'loss' ? 'loss' : 'tie';
        const resultText = game.result === 'win' ? 'Win' : game.result === 'loss' ? 'Loss' : 'Tie';
        const winnerText = game.winner ? ` (Winner: ${game.winner})` : ' (Tie)';
        
        gameDiv.innerHTML = `
            <div class="game-header">
                <span class="game-id">Game #${game.game_id}</span>
                <span class="game-date">${dateStr}</span>
                <span class="game-result ${resultClass}">${resultText}${winnerText}</span>
            </div>
            <div class="game-details">
                <span class="game-detail">Player: ${game.player_symbol}</span>
                <span class="game-detail">AI: ${game.ai_symbol}</span>
                <span class="game-detail">Difficulty: ${game.difficulty}</span>
                <span class="game-detail">Moves: ${game.moves.length}</span>
            </div>
            <div class="game-moves">
                ${game.moves.map((move, idx) => `
                    <span class="move-item ${move.is_ai_move ? 'ai-move' : 'player-move'}">
                        ${move.move_number}. ${move.player}@(${move.row},${move.col})
                    </span>
                `).join(' ')}
            </div>
        `;
        
        return gameDiv;
    }

    async exportHistory(format) {
        /* Export game history as JSON or CSV */
        if (!this.gameHistoryData || this.gameHistoryData.length === 0) {
            alert('No game history data to export. Please load history first.');
            return;
        }

        try {
            if (format === 'json') {
                this.exportAsJSON(this.gameHistoryData);
            } else if (format === 'csv') {
                await this.exportAsCSV(this.gameHistoryData);
            }
        } catch (error) {
            console.error('Error exporting history:', error);
            alert(`Error exporting history: ${error.message}`);
        }
    }

    exportAsJSON(data) {
        /* Export game history as JSON file */
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tictactoe_history_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async exportAsCSV(data) {
        /* Export game history as CSV file */
        try {
            // Fetch all game data for CSV export
            const response = await fetch('/export_game_history?format=csv');
            if (!response.ok) {
                throw new Error('Failed to export CSV');
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tictactoe_history_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            // Fallback: generate CSV from current data
            const csv = this.generateCSV(data);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tictactoe_history_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    generateCSV(data) {
        /* Generate CSV from game history data */
        const headers = ['game_id', 'player_symbol', 'ai_symbol', 'difficulty', 'result', 'winner', 'created_at', 'move_number', 'row', 'col', 'player', 'is_ai_move'];
        const rows = [];

        data.forEach(game => {
            if (game.moves && game.moves.length > 0) {
                game.moves.forEach(move => {
                    rows.push([
                        game.game_id,
                        game.player_symbol,
                        game.ai_symbol,
                        game.difficulty,
                        game.result,
                        game.winner || '',
                        game.created_at,
                        move.move_number,
                        move.row,
                        move.col,
                        move.player,
                        move.is_ai_move ? '1' : '0'
                    ]);
                });
            } else {
                // Game with no moves
                rows.push([
                    game.game_id,
                    game.player_symbol,
                    game.ai_symbol,
                    game.difficulty,
                    game.result,
                    game.winner || '',
                    game.created_at,
                    '', '', '', '', ''
                ]);
            }
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Tic-Tac-Toe game initialized');
    const game = new TicTacToeGame();
    // Start initial game session
    game.startGame();
});