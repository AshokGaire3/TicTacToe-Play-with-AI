from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from database.models import Base, Game, Move
import os

# Get the database path
db_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database')
db_path = os.path.join(db_dir, 'tictactoe.db')

# Create database directory if it doesn't exist
os.makedirs(db_dir, exist_ok=True)

# Create SQLite engine
engine = create_engine(f'sqlite:///{db_path}', echo=False)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize the database by creating all tables"""
    Base.metadata.create_all(bind=engine)
    print(f"Database initialized at: {db_path}")

def get_db() -> Session:
    """Get a database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_session() -> Session:
    """Get a database session (non-generator version for direct use)"""
    return SessionLocal()

