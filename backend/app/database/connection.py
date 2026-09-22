import logging
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from app.config import settings

logger = logging.getLogger("cinebook.database")

def get_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("sqlite"):
        engine = create_engine(
            db_url,
            connect_args={"check_same_thread": False},
            echo=False
        )
        
        # Configure SQLite for concurrency & foreign keys
        @event.listens_for(engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA synchronous=NORMAL")
            cursor.execute("PRAGMA busy_timeout=5000")
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()
            
        logger.info("Configured SQLite with WAL mode and foreign key enforcement")
        return engine
    else:
        # PostgreSQL
        engine = create_engine(
            db_url,
            pool_size=20,
            max_overflow=10,
            pool_pre_ping=True,
            echo=False
        )
        logger.info("Configured PostgreSQL connection pool")
        return engine

engine = get_engine()
