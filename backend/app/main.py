from fastapi import FastAPI
from sqlalchemy import text

from app.database.connection import engine
from app.database.base import Base

# Import models so SQLAlchemy registers them
from app.models.client import Client
from app.models.employee import Employee
from app.models.task import Task
from app.models.document import Document
from app.models.compliance import Compliance
from app.models.timeline import Timeline
from app.models.communication import Communication

from app.routes.client import router as client_router
from app.routes.employee import router as employee_router
from app.routes.task import router as task_router
from app.routes.document import router as document_router
from app.routes.compliance import router as compliance_router
from app.routes.timeline import router as timeline_router
from app.routes.communication import router as communication_router
from app.routes.analytics import router as analytics_router
from app.routes.risk_prediction import router as risk_prediction_router

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="FirmPulse API",
    description="Backend API for FirmPulse",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all database tables
Base.metadata.create_all(bind=engine)


# Register routes
app.include_router(client_router)
app.include_router(employee_router)
app.include_router(task_router)
app.include_router(document_router)
app.include_router(compliance_router)
app.include_router(timeline_router)
app.include_router(communication_router)
app.include_router(analytics_router)
app.include_router(risk_prediction_router)
@app.get("/")
def root():
    return {
        "message": "FirmPulse API is running",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/database-test")
def database_test():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            value = result.scalar()

        return {
            "database": "connected",
            "test_result": value
        }

    except Exception as error:
        return {
            "database": "connection_failed",
            "error": str(error)
        }