from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ClientCreate(BaseModel):
    client_code: str
    client_name: str
    company_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    client_type: Optional[str] = None
    gstin: Optional[str] = None
    pan: Optional[str] = None
    address: Optional[str] = None
    assigned_employee_id: Optional[int] = None
    status: str = "Active"


class ClientUpdate(BaseModel):
    client_code: Optional[str] = None
    client_name: Optional[str] = None
    company_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    client_type: Optional[str] = None
    gstin: Optional[str] = None
    pan: Optional[str] = None
    address: Optional[str] = None
    assigned_employee_id: Optional[int] = None
    status: Optional[str] = None


class ClientResponse(BaseModel):
    id: int
    client_code: str
    client_name: str
    company_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    client_type: Optional[str]
    gstin: Optional[str]
    pan: Optional[str]
    address: Optional[str]
    assigned_employee_id: Optional[int]
    status: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {
        "from_attributes": True
    }