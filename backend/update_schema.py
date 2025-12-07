from app.db.database import engine, Base
from app.models.models import Message
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_schema():
    logger.info("Dropping messages table...")
    try:
        Message.__table__.drop(engine)
        logger.info("Messages table dropped.")
    except Exception as e:
        logger.warning(f"Could not drop table (might not exist): {e}")

    logger.info("Recreating tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created/updated successfully.")

if __name__ == "__main__":
    update_schema()
