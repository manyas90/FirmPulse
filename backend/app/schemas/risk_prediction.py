from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class RiskPredictionCreate(BaseModel):
    client_id: Optional[int] = None
    task_id: Optional[int] = None
    risk_score: float
    risk_level: str
    risk_reason: Optional[str] = None


class RiskPredictionResponse(BaseModel):
    id: int
    client_id: Optional[int]
    task_id: Optional[int]
    risk_score: float
    risk_level: str
    risk_reason: Optional[str]
    predicted_at: Optional[datetime]
    created_at: Optional[datetime]

    model_config = {
        "from_attributes": True
    }