from sqlalchemy import Column, Integer, String, Date, DateTime
from datetime import datetime

from app.database.base import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    employee_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)

    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)

    department = Column(String(100), nullable=True)
    designation = Column(String(100), nullable=True)

    date_of_joining = Column(Date, nullable=True)

    status = Column(
        String(20),
        nullable=False,
        default="Active"
    )

    manager = Column(String(100), nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )