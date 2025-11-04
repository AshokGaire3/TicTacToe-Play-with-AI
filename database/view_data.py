#!/usr/bin/env python3
"""
Simple script to view logged game data from the database.
Usage: python database/view_data.py
"""

import sys
import os

# Add parent directory to path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from database.db import get_db_session
from database.models import Game, Move

def view_game_history(limit=10):
    """View recent game history"""
    db = get_db_session()
    try:
        games = db.query(Game).order_by(Game.created_at.desc()).limit(limit).all()
        
        print(f"\n{'='*80}")
        print(f"Recent Game History (showing {len(games)} games)")
        print(f"{'='*80}\n")
        
        for game in games:
            moves = db.query(Move).filter(Move.game_id == game.id).order_by(Move.move_number).all()
            
            print(f"Game ID: {game.id}")
            print(f"  Player: {game.player_symbol}, AI: {game.ai_symbol}")
            print(f"  Difficulty: {game.difficulty}")
            print(f"  Result: {game.result} (Winner: {game.winner if game.winner else 'None/Tie'})")
            print(f"  Date: {game.created_at}")
            print(f"  Total Moves: {len(moves)}")
            print(f"  Moves:")
            
            for move in moves:
                move_type = "AI" if move.is_ai_move else "Player"
                print(f"    Move {move.move_number}: {move_type} ({move.player}) at ({move.row}, {move.col})")
            
            print("-" * 80)
            
    finally:
        db.close()

def view_statistics():
    """View game statistics"""
    db = get_db_session()
    try:
        total_games = db.query(Game).count()
        wins = db.query(Game).filter(Game.result == 'win').count()
        losses = db.query(Game).filter(Game.result == 'loss').count()
        ties = db.query(Game).filter(Game.result == 'tie').count()
        
        total_moves = db.query(Move).count()
        ai_moves = db.query(Move).filter(Move.is_ai_move == 1).count()
        player_moves = db.query(Move).filter(Move.is_ai_move == 0).count()
        
        print(f"\n{'='*80}")
        print("Game Statistics")
        print(f"{'='*80}\n")
        print(f"Total Games: {total_games}")
        print(f"  Wins: {wins}")
        print(f"  Losses: {losses}")
        print(f"  Ties: {ties}")
        print(f"\nTotal Moves: {total_moves}")
        print(f"  Player Moves: {player_moves}")
        print(f"  AI Moves: {ai_moves}")
        print(f"{'='*80}\n")
        
    finally:
        db.close()

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='View logged game data')
    parser.add_argument('--limit', type=int, default=10, help='Number of games to show (default: 10)')
    parser.add_argument('--stats', action='store_true', help='Show statistics instead of game history')
    
    args = parser.parse_args()
    
    if args.stats:
        view_statistics()
    else:
        view_game_history(args.limit)

