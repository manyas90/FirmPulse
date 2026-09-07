from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CommunicationCreate(BaseModel):
    communication_code: str
    client_id: int
    communication_type: str = "Email"
    subject: str
    message: Optional[str] = None
    assigned_employee_id: Optional[int] = None
    communication_date: datetime


class CommunicationUpdate(BaseModel):
    communication_code: Optional[str] = None
    client_id: Optional[int] = None
    communication_type: Optional[str] = None
    subject: Optional[str] = None
    message: Optional[str] = None
    assigned_employee_id: Optional[int] = None
    communication_date: Optional[datetime] = None


class CommunicationResponse(BaseModel):
    id: int
    communication_code: str
    client_id: int
    communication_type: str
    subject: str
    message: Optional[str]
    assigned_employee_id: Optional[int]
    communication_date: datetime
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {
        "from_attributes": True
    }