#!/usr/bin/env python3
"""
Script to save game history data from the API to a file.
Can save as JSON or CSV format.

This script uses Python's built-in urllib, so no extra dependencies are required.
"""

import urllib.request
import urllib.error
import json
import csv
import sys
import os
from datetime import datetime
import argparse

def save_game_history_json(url, output_file=None, limit=10):
    """Fetch game history and save as JSON file"""
    try:
        if limit is None or limit == 0:
            # For large limits, use a very high number (API default is 10)
            # Note: To get all games, you may need to adjust this or use pagination
            full_url = f"{url}/get_game_history?limit=1000"
        else:
            full_url = f"{url}/get_game_history?limit={limit}"
        with urllib.request.urlopen(full_url) as response:
            data = json.loads(response.read().decode())
        
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"game_history_{timestamp}.json"
        
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"✅ Game history saved to: {output_file}")
        print(f"   Total games: {data.get('count', 0)}")
        return output_file
        
    except urllib.error.URLError as e:
        print(f"❌ Error fetching game history: {e}")
        print(f"   Make sure the server is running at {url}")
        return None
    except Exception as e:
        print(f"❌ Error saving file: {e}")
        return None

def save_game_history_csv(url, output_file=None, limit=None):
    """Fetch game history and save as CSV file"""
    try:
        # Use the export endpoint for CSV
        full_url = f"{url}/export_game_history?format=csv"
        if limit:
            full_url += f"&limit={limit}"
        
        with urllib.request.urlopen(full_url) as response:
            csv_data = response.read()
        
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"game_history_{timestamp}.csv"
        
        with open(output_file, 'wb') as f:
            f.write(csv_data)
        
        print(f"✅ Game history saved to: {output_file}")
        return output_file
        
    except urllib.error.URLError as e:
        print(f"❌ Error fetching game history: {e}")
        print(f"   Make sure the server is running at {url}")
        return None
    except Exception as e:
        print(f"❌ Error saving file: {e}")
        return None

def save_game_history_custom_csv(base_url, output_file=None, limit=10):
    """Fetch game history and convert to CSV manually"""
    try:
        full_url = f"{base_url}/get_game_history?limit={limit}"
        with urllib.request.urlopen(full_url) as response:
            data = json.loads(response.read().decode())
        games = data.get('games', [])
        
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"game_history_{timestamp}.csv"
        
        # Write CSV
        with open(output_file, 'w', newline='') as f:
            writer = csv.writer(f)
            # Header
            writer.writerow([
                'game_id', 'player_symbol', 'ai_symbol', 'difficulty',
                'result', 'winner', 'created_at', 'move_number',
                'row', 'col', 'player', 'is_ai_move'
            ])
            
            # Data rows
            for game in games:
                moves = game.get('moves', [])
                if moves:
                    for move in moves:
                        writer.writerow([
                            game['game_id'],
                            game['player_symbol'],
                            game['ai_symbol'],
                            game['difficulty'],
                            game['result'],
                            game.get('winner', ''),
                            game.get('created_at', ''),
                            move['move_number'],
                            move['row'],
                            move['col'],
                            move['player'],
                            1 if move['is_ai_move'] else 0
                        ])
                else:
                    # Game with no moves
                    writer.writerow([
                        game['game_id'],
                        game['player_symbol'],
                        game['ai_symbol'],
                        game['difficulty'],
                        game['result'],
                        game.get('winner', ''),
                        game.get('created_at', ''),
                        '', '', '', '', ''
                    ])
        
        print(f"✅ Game history saved to: {output_file}")
        print(f"   Total games: {len(games)}")
        return output_file
        
    except urllib.error.URLError as e:
        print(f"❌ Error fetching game history: {e}")
        print(f"   Make sure the server is running at {base_url}")
        return None
    except Exception as e:
        print(f"❌ Error saving file: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(
        description='Save game history data from TicTacToe API',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Save last 10 games as JSON
  python save_game_history.py --format json --limit 10

  # Save all games as CSV
  python save_game_history.py --format csv

  # Save to specific file
  python save_game_history.py --format json --output my_history.json --limit 50

  # Use custom URL
  python save_game_history.py --url http://localhost:5001 --format csv
        """
    )
    parser.add_argument(
        '--url',
        default='http://localhost:5001',
        help='Base URL of the API (default: http://localhost:5001)'
    )
    parser.add_argument(
        '--format',
        choices=['json', 'csv'],
        default='json',
        help='Output format (default: json)'
    )
    parser.add_argument(
        '--output', '-o',
        help='Output file name (default: auto-generated with timestamp)'
    )
    parser.add_argument(
        '--limit',
        type=int,
        default=10,
        help='Number of games to retrieve (default: 10, use 0 for all)'
    )
    
    args = parser.parse_args()
    
    base_url = args.url.rstrip('/')
    
    if args.format == 'json':
        # For JSON, use the limit as-is (0 means use high limit to get many games)
        limit = args.limit if args.limit > 0 else None
        save_game_history_json(base_url, args.output, limit)
    else:  # csv
        # For CSV, None means no limit parameter (export all)
        limit = None if args.limit == 0 else args.limit
        save_game_history_csv(base_url, args.output, limit)

if __name__ == '__main__':
    main()

