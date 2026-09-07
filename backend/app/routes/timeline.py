from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.timeline import Timeline
from app.models.client import Client
from app.models.employee import Employee
from app.schemas.timeline import (
    TimelineCreate,
    TimelineUpdate,
    TimelineResponse,
)


router = APIRouter(
    prefix="/timeline",
    tags=["Client Timeline"]
)


@router.get("/", response_model=list[TimelineResponse])
def get_timelines(
    db: Session = Depends(get_db),
):
    return (
        db.query(Timeline)
        .order_by(Timeline.event_date.desc())
        .all()
    )


@router.get(
    "/{timeline_id}",
    response_model=TimelineResponse
)
def get_timeline(
    timeline_id: int,
    db: Session = Depends(get_db),
):
    timeline = (
        db.query(Timeline)
        .filter(Timeline.id == timeline_id)
        .first()
    )

    if not timeline:
        raise HTTPException(
            status_code=404,
            detail="Timeline event not found"
        )

    return timeline


@router.post(
    "/",
    response_model=TimelineResponse
)
def create_timeline(
    data: TimelineCreate,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Timeline)
        .filter(
            Timeline.timeline_code
            == data.timeline_code
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Timeline code already exists"
        )

    client = (
        db.query(Client)
        .filter(Client.id == data.client_id)
        .first()
    )

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    if data.assigned_employee_id:
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

    timeline = Timeline(
        **data.model_dump()
    )

    db.add(timeline)
    db.commit()
    db.refresh(timeline)

    return timeline


@router.put(
    "/{timeline_id}",
    response_model=TimelineResponse
)
def update_timeline(
    timeline_id: int,
    data: TimelineUpdate,
    db: Session = Depends(get_db),
):
    timeline = (
        db.query(Timeline)
        .filter(Timeline.id == timeline_id)
        .first()
    )

    if not timeline:
        raise HTTPException(
            status_code=404,
            detail="Timeline event not found"
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

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

    if "assigned_employee_id" in update_data:
        employee_id = update_data[
            "assigned_employee_id"
        ]

        if employee_id:
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

    if "timeline_code" in update_data:
        existing = (
            db.query(Timeline)
            .filter(
                Timeline.timeline_code
                == update_data["timeline_code"],
                Timeline.id != timeline_id,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Timeline code already exists"
            )

    for key, value in update_data.items():
        setattr(timeline, key, value)

    db.commit()
    db.refresh(timeline)

    return timeline


@router.delete("/{timeline_id}")
def delete_timeline(
    timeline_id: int,
    db: Session = Depends(get_db),
):
    timeline = (
        db.query(Timeline)
        .filter(Timeline.id == timeline_id)
        .first()
    )

    if not timeline:
        raise HTTPException(
            status_code=404,
            detail="Timeline event not found"
        )

    db.delete(timeline)
    db.commit()

    return {
        "message": "Timeline event deleted successfully"
    }