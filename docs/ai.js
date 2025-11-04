// Tic-Tac-Toe AI - JavaScript Implementation
// Ported from Python backend for GitHub Pages deployment

class TicTacToeAI {
    constructor() {
        // Empty constructor
    }

    // Get all possible moves
    getPossibleMoves(board) {
        const moves = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (board[r][c] === '') {
                    moves.push([r, c]);
                }
            }
        }
        return moves;
    }

    // Check for winner
    checkWinner(board) {
        const players = ['X', 'O'];
        for (const player of players) {
            // Check rows
            for (let i = 0; i < 3; i++) {
                if (board[i][0] === player && board[i][1] === player && board[i][2] === player) {
                    return player;
                }
            }
            // Check columns
            for (let i = 0; i < 3; i++) {
                if (board[0][i] === player && board[1][i] === player && board[2][i] === player) {
                    return player;
                }
            }
            // Check diagonals
            if (board[0][0] === player && board[1][1] === player && board[2][2] === player) {
                return player;
            }
            if (board[0][2] === player && board[1][1] === player && board[2][0] === player) {
                return player;
            }
        }
        return null;
    }

    // Check if board is full
    isBoardFull(board) {
        return this.getPossibleMoves(board).length === 0;
    }

    // Find winning move
    findWinningMove(board, player) {
        const moves = this.getPossibleMoves(board);
        for (const [r, c] of moves) {
            board[r][c] = player;
            if (this.checkWinner(board) === player) {
                board[r][c] = '';
                return [r, c];
            }
            board[r][c] = '';
        }
        return null;
    }

    // Find blocking move
    findBlockingMove(board, aiPlayer) {
        const opponent = aiPlayer === 'O' ? 'X' : 'O';
        return this.findWinningMove(board, opponent);
    }

    // Find center move
    findCenterMove(board) {
        if (board[1][1] === '') {
            return [1, 1];
        }
        return null;
    }

    // Find corner move
    findCornerMove(board) {
        const corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
        const available = corners.filter(([r, c]) => board[r][c] === '');
        if (available.length > 0) {
            return available[Math.floor(Math.random() * available.length)];
        }
        return null;
    }

    // Easy mode: Random moves with occasional strategy
    easyMove(board, aiPlayer) {
        const moves = this.getPossibleMoves(board);
        if (moves.length === 0) return null;

        // 70% chance to take winning move
        const winning = this.findWinningMove(board, aiPlayer);
        if (winning && Math.random() < 0.7) {
            return winning;
        }

        // 50% chance to block
        const blocking = this.findBlockingMove(board, aiPlayer);
        if (blocking && Math.random() < 0.5) {
            return blocking;
        }

        // 30% chance to try center or corners
        if (Math.random() < 0.3) {
            const center = this.findCenterMove(board);
            if (center && Math.random() < 0.5) {
                return center;
            }
            const corner = this.findCornerMove(board);
            if (corner && Math.random() < 0.5) {
                return corner;
            }
        }

        // Pure random
        return moves[Math.floor(Math.random() * moves.length)];
    }

    // Medium mode: Limited depth with heuristics
    mediumMove(board, aiPlayer) {
        const moves = this.getPossibleMoves(board);
        if (moves.length === 0) return null;

        // 85% chance to block
        const blocking = this.findBlockingMove(board, aiPlayer);
        if (blocking && Math.random() < 0.85) {
            return blocking;
        }

        // 90% chance to take winning move
        const winning = this.findWinningMove(board, aiPlayer);
        if (winning && Math.random() < 0.9) {
            return winning;
        }

        // Use heuristic evaluation
        const moveScores = [];
        for (const [r, c] of moves) {
            board[r][c] = aiPlayer;
            const score = this.heuristicEvaluate(board, aiPlayer);
            moveScores.push({ move: [r, c], score });
            board[r][c] = '';
        }

        moveScores.sort((a, b) => b.score - a.score);

        // 35% chance to pick suboptimal move
        if (moveScores.length > 1 && Math.random() < 0.35) {
            const topCount = Math.min(4, moveScores.length);
            const topMoves = moveScores.slice(0, topCount);
            return topMoves[Math.floor(Math.random() * topMoves.length)].move;
        }

        return moveScores[0].move;
    }

    // Heuristic evaluation for medium mode
    heuristicEvaluate(board, aiPlayer) {
        const opponent = aiPlayer === 'O' ? 'X' : 'O';
        let score = 0;

        // Check all lines
        const lines = [
            [[0, 0], [0, 1], [0, 2]], // Row 0
            [[1, 0], [1, 1], [1, 2]], // Row 1
            [[2, 0], [2, 1], [2, 2]], // Row 2
            [[0, 0], [1, 0], [2, 0]], // Col 0
            [[0, 1], [1, 1], [2, 1]], // Col 1
            [[0, 2], [1, 2], [2, 2]], // Col 2
            [[0, 0], [1, 1], [2, 2]], // Diagonal
            [[0, 2], [1, 1], [2, 0]]  // Anti-diagonal
        ];

        for (const line of lines) {
            let aiCount = 0, oppCount = 0, emptyCount = 0;
            for (const [r, c] of line) {
                if (board[r][c] === aiPlayer) aiCount++;
                else if (board[r][c] === opponent) oppCount++;
                else emptyCount++;
            }

            // Two in a row with open end
            if (aiCount === 2 && emptyCount === 1) score += 5;
            if (aiCount === 1 && emptyCount === 2) score += 1;
            if (oppCount === 2 && emptyCount === 1) score += 4; // Block
            if (oppCount === 1 && emptyCount === 2) score -= 1;
        }

        // Center control
        if (board[1][1] === aiPlayer) score += 3;
        else if (board[1][1] === opponent) score -= 2;

        // Corners
        const corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
        for (const [r, c] of corners) {
            if (board[r][c] === aiPlayer) score += 1;
            else if (board[r][c] === opponent) score -= 1;
        }

        return score;
    }

    // Hard mode: Minimax with alpha-beta pruning
    minimax(board, depth, alpha, beta, isMaximizing, aiPlayer) {
        const winner = this.checkWinner(board);
        const opponent = aiPlayer === 'O' ? 'X' : 'O';

        if (winner === aiPlayer) return 10 - depth;
        if (winner === opponent) return depth - 10;
        if (this.isBoardFull(board)) return 0;

        const moves = this.getPossibleMoves(board);
        if (moves.length === 0) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (const [r, c] of moves) {
                board[r][c] = aiPlayer;
                const score = this.minimax(board, depth + 1, alpha, beta, false, aiPlayer);
                board[r][c] = '';
                bestScore = Math.max(bestScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (const [r, c] of moves) {
                board[r][c] = opponent;
                const score = this.minimax(board, depth + 1, alpha, beta, true, aiPlayer);
                board[r][c] = '';
                bestScore = Math.min(bestScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return bestScore;
        }
    }

    // Find best move using minimax
    findBestMove(board, aiPlayer) {
        let bestScore = -Infinity;
        let move = null;

        const moves = this.getPossibleMoves(board);
        for (const [r, c] of moves) {
            board[r][c] = aiPlayer;
            const score = this.minimax(board, 0, -Infinity, Infinity, false, aiPlayer);
            board[r][c] = '';

            if (score > bestScore) {
                bestScore = score;
                move = [r, c];
            }
        }

        return move;
    }

    // Get best move based on difficulty
    getBestMove(board, aiPlayer = 'O', difficulty = 'hard') {
        // Create deep copy
        const boardCopy = board.map(row => [...row]);

        difficulty = difficulty.toLowerCase();

        if (difficulty === 'easy') {
            return this.easyMove(boardCopy, aiPlayer);
        } else if (difficulty === 'medium') {
            return this.mediumMove(boardCopy, aiPlayer);
        } else if (difficulty === 'hard') {
            return this.findBestMove(boardCopy, aiPlayer);
        } else {
            return this.findBestMove(boardCopy, aiPlayer);
        }
    }
}

