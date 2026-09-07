from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class DocumentCreate(BaseModel):
    document_code: str
    document_name: str
    document_type: Optional[str] = None
    client_id: Optional[int] = None
    assigned_employee_id: Optional[int] = None
    description: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    status: str = "Active"


class DocumentUpdate(BaseModel):
    document_code: Optional[str] = None
    document_name: Optional[str] = None
    document_type: Optional[str] = None
    client_id: Optional[int] = None
    assigned_employee_id: Optional[int] = None
    description: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    status: Optional[str] = None


class DocumentResponse(BaseModel):
    id: int
    document_code: str
    document_name: str
    document_type: Optional[str]
    client_id: Optional[int]
    assigned_employee_id: Optional[int]
    description: Optional[str]
    issue_date: Optional[date]
    expiry_date: Optional[date]
    status: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {
        "from_attributes": True
    }