from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Game(Base):
    """Model to store game information"""
    __tablename__ = 'games'
    
    id = Column(Integer, primary_key=True)
    player_symbol = Column(String(1))  # 'X' or 'O'
    ai_symbol = Column(String(1))  # 'X' or 'O'
    difficulty = Column(String(10))  # 'easy', 'medium', 'hard'
    result = Column(String(10))  # 'win', 'loss', 'tie'
    winner = Column(String(1), nullable=True)  # 'X', 'O', or None for tie
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to moves
    moves = relationship("Move", back_populates="game", cascade="all, delete-orphan")

class Move(Base):
    """Model to store individual moves"""
    __tablename__ = 'moves'
    
    id = Column(Integer, primary_key=True)
    game_id = Column(Integer, ForeignKey('games.id'), nullable=False)
    move_number = Column(Integer)  # Sequential move number (1, 2, 3, ...)
    row = Column(Integer)  # Row position (0-2)
    col = Column(Integer)  # Column position (0-2)
    player = Column(String(1))  # 'X' or 'O'
    is_ai_move = Column(Integer)  # 1 for AI, 0 for player
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to game
    game = relationship("Game", back_populates="moves")

