from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.communication import Communication
from app.models.client import Client
from app.models.employee import Employee

from app.schemas.communication import (
    CommunicationCreate,
    CommunicationUpdate,
    CommunicationResponse,
)


router = APIRouter(
    prefix="/communications",
    tags=["Communications"]
)


# GET ALL COMMUNICATIONS
@router.get(
    "/",
    response_model=list[CommunicationResponse]
)
def get_communications(
    db: Session = Depends(get_db)
):
    communications = (
        db.query(Communication)
        .order_by(
            Communication.communication_date.desc()
        )
        .all()
    )

    return communications


# GET SINGLE COMMUNICATION
@router.get(
    "/{communication_id}",
    response_model=CommunicationResponse
)
def get_communication(
    communication_id: int,
    db: Session = Depends(get_db)
):
    communication = (
        db.query(Communication)
        .filter(
            Communication.id == communication_id
        )
        .first()
    )

    if not communication:
        raise HTTPException(
            status_code=404,
            detail="Communication not found"
        )

    return communication


# CREATE COMMUNICATION
@router.post(
    "/",
    response_model=CommunicationResponse
)
def create_communication(
    data: CommunicationCreate,
    db: Session = Depends(get_db)
):
    # Check duplicate communication code
    existing = (
        db.query(Communication)
        .filter(
            Communication.communication_code
            == data.communication_code
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Communication code already exists"
        )

    # Check client exists
    client = (
        db.query(Client)
        .filter(
            Client.id == data.client_id
        )
        .first()
    )

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    # Check employee exists
    if data.assigned_employee_id is not None:

        employee = (
            db.query(Employee)
            .filter(
                Employee.id
                == data.assigned_employee_id
            )
            .first()
        )

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Employee not found"
            )

    communication = Communication(
        **data.model_dump()
    )

    db.add(communication)
    db.commit()
    db.refresh(communication)

    return communication


# UPDATE COMMUNICATION
@router.put(
    "/{communication_id}",
    response_model=CommunicationResponse
)
def update_communication(
    communication_id: int,
    data: CommunicationUpdate,
    db: Session = Depends(get_db)
):
    communication = (
        db.query(Communication)
        .filter(
            Communication.id == communication_id
        )
        .first()
    )

    if not communication:
        raise HTTPException(
            status_code=404,
            detail="Communication not found"
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    # Check client if being updated
    if "client_id" in update_data:

        client = (
            db.query(Client)
            .filter(
                Client.id
                == update_data["client_id"]
            )
            .first()
        )

        if not client:
            raise HTTPException(
                status_code=404,
                detail="Client not found"
            )

    # Check employee if being updated
    if "assigned_employee_id" in update_data:

        employee_id = update_data[
            "assigned_employee_id"
        ]

        if employee_id is not None:

            employee = (
                db.query(Employee)
                .filter(
                    Employee.id == employee_id
                )
                .first()
            )

            if not employee:
                raise HTTPException(
                    status_code=404,
                    detail="Employee not found"
                )

    # Check duplicate communication code
    if "communication_code" in update_data:

        existing = (
            db.query(Communication)
            .filter(
                Communication.communication_code
                == update_data[
                    "communication_code"
                ],
                Communication.id != communication_id
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Communication code already exists"
            )

    # Apply updates
    for key, value in update_data.items():
        setattr(
            communication,
            key,
            value
        )

    db.commit()
    db.refresh(communication)

    return communication


# DELETE COMMUNICATION
@router.delete(
    "/{communication_id}"
)
def delete_communication(
    communication_id: int,
    db: Session = Depends(get_db)
):
    communication = (
        db.query(Communication)
        .filter(
            Communication.id == communication_id
        )
        .first()
    )

    if not communication:
        raise HTTPException(
            status_code=404,
            detail="Communication not found"
        )

    db.delete(communication)
    db.commit()

    return {
        "message": "Communication deleted successfully"
    }