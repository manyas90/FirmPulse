from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.document import Document
from app.models.client import Client
from app.models.employee import Employee
from app.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.get("/", response_model=list[DocumentResponse])
def get_documents(
    db: Session = Depends(get_db)
):
    return (
        db.query(Document)
        .order_by(Document.id.desc())
        .all()
    )


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return document


@router.post(
    "/",
    response_model=DocumentResponse,
    status_code=201
)
def create_document(
    document_data: DocumentCreate,
    db: Session = Depends(get_db)
):
    existing = (
        db.query(Document)
        .filter(
            Document.document_code ==
            document_data.document_code
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Document code already exists"
        )

    if document_data.client_id is not None:
        client = (
            db.query(Client)
            .filter(Client.id == document_data.client_id)
            .first()
        )

        if not client:
            raise HTTPException(
                status_code=400,
                detail="Client not found"
            )

    if document_data.assigned_employee_id is not None:
        employee = (
            db.query(Employee)
            .filter(
                Employee.id ==
                document_data.assigned_employee_id
            )
            .first()
        )

        if not employee:
            raise HTTPException(
                status_code=400,
                detail="Employee not found"
            )

    document = Document(
        **document_data.model_dump()
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


@router.put(
    "/{document_id}",
    response_model=DocumentResponse
)
def update_document(
    document_id: int,
    document_data: DocumentUpdate,
    db: Session = Depends(get_db)
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    update_data = document_data.model_dump(
        exclude_unset=True
    )

    if "document_code" in update_data:
        existing = (
            db.query(Document)
            .filter(
                Document.document_code ==
                update_data["document_code"],
                Document.id != document_id
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Document code already exists"
            )

    if "client_id" in update_data:
        client_id = update_data["client_id"]

        if client_id is not None:
            client = (
                db.query(Client)
                .filter(Client.id == client_id)
                .first()
            )

            if not client:
                raise HTTPException(
                    status_code=400,
                    detail="Client not found"
                )

    if "assigned_employee_id" in update_data:
        employee_id = update_data[
            "assigned_employee_id"
        ]

        if employee_id is not None:
            employee = (
                db.query(Employee)
                .filter(Employee.id == employee_id)
                .first()
            )

            if not employee:
                raise HTTPException(
                    status_code=400,
                    detail="Employee not found"
                )

    for field, value in update_data.items():
        setattr(document, field, value)

    db.commit()
    db.refresh(document)

    return document


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    db.delete(document)
    db.commit()

    return {
        "message": "Document deleted successfully"
    }