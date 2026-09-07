from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.compliance import Compliance
from app.models.client import Client
from app.models.employee import Employee
from app.schemas.compliance import (
    ComplianceCreate,
    ComplianceUpdate,
    ComplianceResponse,
)


router = APIRouter(
    prefix="/compliance",
    tags=["Compliance"]
)


# ---------------------------------------------------------
# GET ALL COMPLIANCE RECORDS
# ---------------------------------------------------------
@router.get(
    "/",
    response_model=List[ComplianceResponse]
)
def get_compliances(
    db: Session = Depends(get_db)
):
    return (
        db.query(Compliance)
        .order_by(Compliance.due_date.asc())
        .all()
    )


# ---------------------------------------------------------
# GET SINGLE COMPLIANCE RECORD
# ---------------------------------------------------------
@router.get(
    "/{compliance_id}",
    response_model=ComplianceResponse
)
def get_compliance(
    compliance_id: int,
    db: Session = Depends(get_db)
):
    compliance = (
        db.query(Compliance)
        .filter(Compliance.id == compliance_id)
        .first()
    )

    if not compliance:
        raise HTTPException(
            status_code=404,
            detail="Compliance record not found."
        )

    return compliance


# ---------------------------------------------------------
# CREATE COMPLIANCE RECORD
# ---------------------------------------------------------
@router.post(
    "/",
    response_model=ComplianceResponse,
    status_code=status.HTTP_201_CREATED
)
def create_compliance(
    compliance_data: ComplianceCreate,
    db: Session = Depends(get_db)
):

    # Check duplicate compliance code
    existing = (
        db.query(Compliance)
        .filter(
            Compliance.compliance_code
            == compliance_data.compliance_code
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Compliance code already exists."
        )

    # Check client
    if compliance_data.client_id is not None:

        client = (
            db.query(Client)
            .filter(Client.id == compliance_data.client_id)
            .first()
        )

        if not client:
            raise HTTPException(
                status_code=400,
                detail="Client not found."
            )

    # Check employee
    if compliance_data.assigned_employee_id is not None:

        employee = (
            db.query(Employee)
            .filter(
                Employee.id
                == compliance_data.assigned_employee_id
            )
            .first()
        )

        if not employee:
            raise HTTPException(
                status_code=400,
                detail="Assigned employee not found."
            )

    compliance = Compliance(
        compliance_code=compliance_data.compliance_code,
        compliance_name=compliance_data.compliance_name,
        compliance_type=compliance_data.compliance_type,
        client_id=compliance_data.client_id,
        assigned_employee_id=compliance_data.assigned_employee_id,
        due_date=compliance_data.due_date,
        filing_date=compliance_data.filing_date,
        frequency=compliance_data.frequency,
        status=compliance_data.status,
        priority=compliance_data.priority,
        remarks=compliance_data.remarks,
    )

    db.add(compliance)
    db.commit()
    db.refresh(compliance)

    return compliance


# ---------------------------------------------------------
# UPDATE COMPLIANCE RECORD
# ---------------------------------------------------------
@router.put(
    "/{compliance_id}",
    response_model=ComplianceResponse
)
def update_compliance(
    compliance_id: int,
    compliance_data: ComplianceUpdate,
    db: Session = Depends(get_db)
):

    compliance = (
        db.query(Compliance)
        .filter(Compliance.id == compliance_id)
        .first()
    )

    if not compliance:
        raise HTTPException(
            status_code=404,
            detail="Compliance record not found."
        )

    update_data = compliance_data.model_dump(
        exclude_unset=True
    )

    # Check duplicate code
    if "compliance_code" in update_data:

        existing = (
            db.query(Compliance)
            .filter(
                Compliance.compliance_code
                == update_data["compliance_code"],
                Compliance.id != compliance_id
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Compliance code already exists."
            )

    # Check client
    if (
        "client_id" in update_data
        and update_data["client_id"] is not None
    ):

        client = (
            db.query(Client)
            .filter(
                Client.id == update_data["client_id"]
            )
            .first()
        )

        if not client:
            raise HTTPException(
                status_code=400,
                detail="Client not found."
            )

    # Check employee
    if (
        "assigned_employee_id" in update_data
        and update_data["assigned_employee_id"] is not None
    ):

        employee = (
            db.query(Employee)
            .filter(
                Employee.id
                == update_data["assigned_employee_id"]
            )
            .first()
        )

        if not employee:
            raise HTTPException(
                status_code=400,
                detail="Assigned employee not found."
            )

    # Apply changes
    for field, value in update_data.items():
        setattr(compliance, field, value)

    db.commit()
    db.refresh(compliance)

    return compliance


# ---------------------------------------------------------
# DELETE COMPLIANCE RECORD
# ---------------------------------------------------------
@router.delete(
    "/{compliance_id}"
)
def delete_compliance(
    compliance_id: int,
    db: Session = Depends(get_db)
):

    compliance = (
        db.query(Compliance)
        .filter(Compliance.id == compliance_id)
        .first()
    )

    if not compliance:
        raise HTTPException(
            status_code=404,
            detail="Compliance record not found."
        )

    db.delete(compliance)
    db.commit()

    return {
        "message": "Compliance record deleted successfully."
    }