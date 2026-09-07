from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from datetime import datetime

from app.database.base import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)

    client_code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    client_name = Column(
        String(150),
        nullable=False
    )

    company_name = Column(
        String(150),
        nullable=True
    )

    email = Column(
        String(150),
        nullable=True
    )

    phone = Column(
        String(20),
        nullable=True
    )

    client_type = Column(
        String(50),
        nullable=True
    )

    gstin = Column(
        String(20),
        nullable=True
    )

    pan = Column(
        String(20),
        nullable=True
    )

    address = Column(
        Text,
        nullable=True
    )

    assigned_employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True
    )

    status = Column(
        String(20),
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