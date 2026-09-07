from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime

from app.database.base import Base


class Communication(Base):
    __tablename__ = "communications"

    id = Column(Integer, primary_key=True, index=True)

    communication_code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    client_id = Column(
        Integer,
        ForeignKey("clients.id"),
        nullable=False
    )

    communication_type = Column(
        String(50),
        nullable=False,
        default="Email"
    )

    subject = Column(
        String(200),
        nullable=False
    )

    message = Column(
        Text,
        nullable=True
    )

    assigned_employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True
    )

    communication_date = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )