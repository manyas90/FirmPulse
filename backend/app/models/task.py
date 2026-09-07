from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from datetime import datetime

from app.database.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    client_name = Column(String(150), nullable=True)

    assigned_employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True
    )

    priority = Column(
        String(20),
        nullable=False,
        default="Medium"
    )

    status = Column(
        String(30),
        nullable=False,
        default="Pending"
    )

    due_date = Column(Date, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )