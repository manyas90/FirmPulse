from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    client_name: Optional[str] = None
    assigned_employee_id: Optional[int] = None
    priority: str = "Medium"
    status: str = "Pending"
    due_date: Optional[date] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    client_name: Optional[str] = None
    assigned_employee_id: Optional[int] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    client_name: Optional[str]
    assigned_employee_id: Optional[int]
    priority: str
    status: str
    due_date: Optional[date]
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }