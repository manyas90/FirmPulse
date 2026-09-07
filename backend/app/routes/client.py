from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.client import Client
from app.models.employee import Employee

from app.schemas.client import (
    ClientCreate,
    ClientUpdate,
    ClientResponse
)


router = APIRouter(
    prefix="/clients",
    tags=["Clients"]
)


# =========================================================
# CREATE CLIENT
# =========================================================

@router.post("/", response_model=ClientResponse)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db)
):
    # Check client code
    existing_client = db.query(Client).filter(
        Client.client_code == client.client_code
    ).first()

    if existing_client:
        raise HTTPException(
            status_code=400,
            detail="Client code already exists"
        )

    # Check assigned employee
    if client.assigned_employee_id is not None:

        employee = db.query(Employee).filter(
            Employee.id == client.assigned_employee_id
        ).first()

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Assigned employee not found"
            )

    new_client = Client(
        **client.model_dump()
    )

    db.add(new_client)
    db.commit()
    db.refresh(new_client)

    return new_client


# =========================================================
# GET ALL CLIENTS
# =========================================================

@router.get("/", response_model=list[ClientResponse])
def get_clients(
    db: Session = Depends(get_db)
):
    return db.query(Client).all()


# =========================================================
# GET SINGLE CLIENT
# =========================================================

@router.get(
    "/{client_id}",
    response_model=ClientResponse
)
def get_client(
    client_id: int,
    db: Session = Depends(get_db)
):
    client = db.query(Client).filter(
        Client.id == client_id
    ).first()

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    return client


# =========================================================
# UPDATE CLIENT
# =========================================================

@router.put(
    "/{client_id}",
    response_model=ClientResponse
)
def update_client(
    client_id: int,
    client_data: ClientUpdate,
    db: Session = Depends(get_db)
):
    client = db.query(Client).filter(
        Client.id == client_id
    ).first()

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    update_data = client_data.model_dump(
        exclude_unset=True
    )

    # Check assigned employee
    if (
        "assigned_employee_id" in update_data
        and update_data["assigned_employee_id"] is not None
    ):

        employee = db.query(Employee).filter(
            Employee.id ==
            update_data["assigned_employee_id"]
        ).first()

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Assigned employee not found"
            )

    # Check client code
    if "client_code" in update_data:

        existing_client = db.query(Client).filter(
            Client.client_code ==
            update_data["client_code"],
            Client.id != client_id
        ).first()

        if existing_client:
            raise HTTPException(
                status_code=400,
                detail="Client code already exists"
            )

    for key, value in update_data.items():
        setattr(client, key, value)

    db.commit()
    db.refresh(client)

    return client


# =========================================================
# DELETE CLIENT
# =========================================================

@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db)
):
    client = db.query(Client).filter(
        Client.id == client_id
    ).first()

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    db.delete(client)
    db.commit()

    return {
        "message": "Client deleted successfully"
    }