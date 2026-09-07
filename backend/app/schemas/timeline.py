from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TimelineCreate(BaseModel):
    timeline_code: str
    client_id: int
    event_type: str
    title: str
    description: Optional[str] = None
    assigned_employee_id: Optional[int] = None
    event_date: datetime


class TimelineUpdate(BaseModel):
    timeline_code: Optional[str] = None
    client_id: Optional[int] = None
    event_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_employee_id: Optional[int] = None
    event_date: Optional[datetime] = None


class TimelineResponse(BaseModel):
    id: int
    timeline_code: str
    client_id: int
    event_type: str
    title: str
    description: Optional[str]
    assigned_employee_id: Optional[int]
    event_date: datetime
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {
        "from_attributes": True
    }