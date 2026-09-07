from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from datetime import datetime

from app.database.base import Base


class Compliance(Base):
    __tablename__ = "compliances"

    id = Column(Integer, primary_key=True, index=True)

    compliance_code = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    compliance_name = Column(
        String(200),
        nullable=False
    )

    compliance_type = Column(
        String(100),
        nullable=False,
        default="GST"
    )

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

    due_date = Column(
        Date,
        nullable=False
    )

    filing_date = Column(
        Date,
        nullable=True
    )

    frequency = Column(
        String(50),
        nullable=True
    )

    status = Column(
        String(30),
        nullable=False,
        default="Pending"
    )

    priority = Column(
        String(20),
        nullable=False,
        default="Medium"
    )

    remarks = Column(
        Text,
        nullable=True
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