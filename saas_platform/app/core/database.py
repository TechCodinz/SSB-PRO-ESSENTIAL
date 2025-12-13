"""
Sol Sniper Bot PRO - Database Connection
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os

from app.core.config import settings

# Force async SQLite URL if using SQLite
db_url = settings.DATABASE_URL
if "sqlite:///" in db_url and "+aiosqlite" not in db_url:
    db_url = db_url.replace("sqlite:///", "sqlite+aiosqlite:///")

# Create async engine - SQLite doesn't support pooling
is_sqlite = "sqlite" in db_url
engine_args = {
    "echo": settings.DEBUG,
}

if not is_sqlite:
    engine_args.update({
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20
    })

engine = create_async_engine(db_url, **engine_args)

# Session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


class Base(DeclarativeBase):
    """Base class for all models"""
    pass


async def get_db() -> AsyncSession:
    """Dependency for getting database session"""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
