from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from datetime import datetime

from app.database.base import Base


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)

    client_id = Column(
        Integer,
        ForeignKey("clients.id"),
        nullable=True
    )

    task_id = Column(
        Integer,
        ForeignKey("tasks.id"),
        nullable=True
    )

    risk_score = Column(
        Float,
        nullable=False,
        default=0
    )

    risk_level = Column(
        String(30),
        nullable=False,
        default="Low"
    )

    risk_reason = Column(
        Text,
        nullable=True
    )

    predicted_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )