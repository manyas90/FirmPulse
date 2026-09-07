from datetime import date, datetime
from pydantic import BaseModel, EmailStr
from typing import Optional


class EmployeeBase(BaseModel):
    employee_code: str
    name: str
    email: EmailStr
    phone: Optional[str] = None

    department: Optional[str] = None
    designation: Optional[str] = None

    date_of_joining: Optional[date] = None

    status: str = "Active"

    manager: Optional[str] = None


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    department: Optional[str] = None
    designation: Optional[str] = None

    date_of_joining: Optional[date] = None
    status: Optional[str] = None
    manager: Optional[str] = None


class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True