from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.risk_prediction import RiskPrediction
from app.models.client import Client
from app.models.task import Task
from app.schemas.risk_prediction import (
    RiskPredictionCreate,
    RiskPredictionResponse,
)


router = APIRouter(
    prefix="/risk-prediction",
    tags=["Risk Prediction"]
)


@router.get("/", response_model=list[RiskPredictionResponse])
def get_risk_predictions(
    db: Session = Depends(get_db)
):
    return (
        db.query(RiskPrediction)
        .order_by(RiskPrediction.risk_score.desc())
        .all()
    )


@router.get("/{prediction_id}", response_model=RiskPredictionResponse)
def get_risk_prediction(
    prediction_id: int,
    db: Session = Depends(get_db)
):
    prediction = (
        db.query(RiskPrediction)
        .filter(RiskPrediction.id == prediction_id)
        .first()
    )

    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="Risk prediction not found"
        )

    return prediction


@router.post("/", response_model=RiskPredictionResponse)
def create_risk_prediction(
    prediction: RiskPredictionCreate,
    db: Session = Depends(get_db)
):
    # Validate client
    if prediction.client_id is not None:
        client = (
            db.query(Client)
            .filter(Client.id == prediction.client_id)
            .first()
        )

        if not client:
            raise HTTPException(
                status_code=404,
                detail="Client not found"
            )

    # Validate task
    if prediction.task_id is not None:
        task = (
            db.query(Task)
            .filter(Task.id == prediction.task_id)
            .first()
        )

        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

    # Validate risk score
    if prediction.risk_score < 0 or prediction.risk_score > 100:
        raise HTTPException(
            status_code=400,
            detail="Risk score must be between 0 and 100"
        )

    new_prediction = RiskPrediction(
        client_id=prediction.client_id,
        task_id=prediction.task_id,
        risk_score=prediction.risk_score,
        risk_level=prediction.risk_level,
        risk_reason=prediction.risk_reason,
    )

    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)

    return new_prediction


@router.delete("/{prediction_id}")
def delete_risk_prediction(
    prediction_id: int,
    db: Session = Depends(get_db)
):
    prediction = (
        db.query(RiskPrediction)
        .filter(RiskPrediction.id == prediction_id)
        .first()
    )

    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="Risk prediction not found"
        )

    db.delete(prediction)
    db.commit()

    return {
        "message": "Risk prediction deleted successfully"
    }


# ---------------------------------------------------------
# Automatic Risk Calculation
# ---------------------------------------------------------

@router.post("/calculate/task/{task_id}")
def calculate_task_risk(
    task_id: int,
    db: Session = Depends(get_db)
):
    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    risk_score = 0
    reasons = []

    # 1. Task status
    if task.status == "Pending":
        risk_score += 20
        reasons.append("Task is pending")

    elif task.status == "In Progress":
        risk_score += 10
        reasons.append("Task is still in progress")

    elif task.status == "Cancelled":
        risk_score += 5
        reasons.append("Task is cancelled")

    # 2. Priority
    if task.priority == "High":
        risk_score += 25
        reasons.append("Task has high priority")

    elif task.priority == "Medium":
        risk_score += 10

    # 3. Due date
    if task.due_date:
        today = date.today()

        if task.due_date < today and task.status != "Completed":
            risk_score += 40
            reasons.append("Task is overdue")

        elif task.due_date == today and task.status != "Completed":
            risk_score += 25
            reasons.append("Task is due today")

    # Keep score between 0 and 100
    risk_score = min(risk_score, 100)

    # Risk level
    if risk_score >= 70:
        risk_level = "High"
    elif risk_score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Reason
    if not reasons:
        reasons.append("No major risk detected")

    risk_reason = ", ".join(reasons)

    prediction = RiskPrediction(
        client_id=None,
        task_id=task.id,
        risk_score=risk_score,
        risk_level=risk_level,
        risk_reason=risk_reason,
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return prediction