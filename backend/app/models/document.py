from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from datetime import datetime

from app.database.base import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    document_code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    document_name = Column(String(200), nullable=False)

    document_type = Column(String(100), nullable=True)

    client_id = Column(
        Integer,
        ForeignKey("clients.id"),
        nullable=True
    )

    assigned_employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True
    )

    description = Column(Text, nullable=True)

    issue_date = Column(Date, nullable=True)

    expiry_date = Column(Date, nullable=True)

    status = Column(
        String(30),
        nullable=False,
        default="Active"
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