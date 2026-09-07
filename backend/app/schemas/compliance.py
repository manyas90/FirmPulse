from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class ComplianceCreate(BaseModel):
    compliance_code: str
    compliance_name: str
    compliance_type: str = "GST"

    client_id: Optional[int] = None
    assigned_employee_id: Optional[int] = None

    due_date: date
    filing_date: Optional[date] = None

    frequency: Optional[str] = None

    status: str = "Pending"
    priority: str = "Medium"

    remarks: Optional[str] = None


class ComplianceUpdate(BaseModel):
    compliance_code: Optional[str] = None
    compliance_name: Optional[str] = None
    compliance_type: Optional[str] = None

    client_id: Optional[int] = None
    assigned_employee_id: Optional[int] = None

    due_date: Optional[date] = None
    filing_date: Optional[date] = None

    frequency: Optional[str] = None

    status: Optional[str] = None
    priority: Optional[str] = None

    remarks: Optional[str] = None


class ComplianceResponse(BaseModel):
    id: int

    compliance_code: str
    compliance_name: str
    compliance_type: str

    client_id: Optional[int]
    assigned_employee_id: Optional[int]

    due_date: date
    filing_date: Optional[date]

    frequency: Optional[str]

    status: str
    priority: str

    remarks: Optional[str]

    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {
        "from_attributes": True
    }