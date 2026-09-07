from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.connection import get_db
from app.models.employee import Employee
from app.models.client import Client
from app.models.task import Task
from app.models.document import Document
from app.models.compliance import Compliance
from app.models.communication import Communication


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/")
def get_analytics(
    db: Session = Depends(get_db)
):
    # -------------------------
    # Employee statistics
    # -------------------------
    total_employees = db.query(Employee).count()

    active_employees = (
        db.query(Employee)
        .filter(Employee.status == "Active")
        .count()
    )

    inactive_employees = (
        db.query(Employee)
        .filter(Employee.status != "Active")
        .count()
    )

    # -------------------------
    # Client statistics
    # -------------------------
    total_clients = db.query(Client).count()

    active_clients = (
        db.query(Client)
        .filter(Client.status == "Active")
        .count()
    )

    inactive_clients = (
        db.query(Client)
        .filter(Client.status != "Active")
        .count()
    )

    # -------------------------
    # Task statistics
    # -------------------------
    total_tasks = db.query(Task).count()

    completed_tasks = (
        db.query(Task)
        .filter(Task.status == "Completed")
        .count()
    )

    pending_tasks = (
        db.query(Task)
        .filter(Task.status == "Pending")
        .count()
    )

    in_progress_tasks = (
        db.query(Task)
        .filter(Task.status == "In Progress")
        .count()
    )

    cancelled_tasks = (
        db.query(Task)
        .filter(Task.status == "Cancelled")
        .count()
    )

    # -------------------------
    # Document statistics
    # -------------------------
    total_documents = db.query(Document).count()

    active_documents = (
        db.query(Document)
        .filter(Document.status == "Active")
        .count()
    )

    expired_documents = (
        db.query(Document)
        .filter(Document.status == "Expired")
        .count()
    )

    # -------------------------
    # Compliance statistics
    # -------------------------
    total_compliances = db.query(Compliance).count()

    completed_compliances = (
        db.query(Compliance)
        .filter(Compliance.status == "Completed")
        .count()
    )

    pending_compliances = (
        db.query(Compliance)
        .filter(Compliance.status == "Pending")
        .count()
    )

    overdue_compliances = (
        db.query(Compliance)
        .filter(Compliance.status == "Overdue")
        .count()
    )

    # -------------------------
    # Communication statistics
    # -------------------------
    total_communications = (
        db.query(Communication).count()
    )

    email_communications = (
        db.query(Communication)
        .filter(
            Communication.communication_type == "Email"
        )
        .count()
    )

    call_communications = (
        db.query(Communication)
        .filter(
            Communication.communication_type == "Call"
        )
        .count()
    )

    meeting_communications = (
        db.query(Communication)
        .filter(
            Communication.communication_type == "Meeting"
        )
        .count()
    )

    whatsapp_communications = (
        db.query(Communication)
        .filter(
            Communication.communication_type == "WhatsApp"
        )
        .count()
    )

    # -------------------------
    # Employee workload
    # -------------------------
    employee_workload = (
        db.query(
            Employee.id,
            Employee.name,
            func.count(Task.id).label("task_count")
        )
        .outerjoin(
            Task,
            Task.assigned_employee_id == Employee.id
        )
        .group_by(
            Employee.id,
            Employee.name
        )
        .order_by(
            func.count(Task.id).desc()
        )
        .all()
    )

    workload = [
        {
            "employee_id": employee_id,
            "employee_name": employee_name,
            "task_count": task_count
        }
        for employee_id, employee_name, task_count
        in employee_workload
    ]

    return {
        "employees": {
            "total": total_employees,
            "active": active_employees,
            "inactive": inactive_employees
        },

        "clients": {
            "total": total_clients,
            "active": active_clients,
            "inactive": inactive_clients
        },

        "tasks": {
            "total": total_tasks,
            "completed": completed_tasks,
            "pending": pending_tasks,
            "in_progress": in_progress_tasks,
            "cancelled": cancelled_tasks
        },

        "documents": {
            "total": total_documents,
            "active": active_documents,
            "expired": expired_documents
        },

        "compliance": {
            "total": total_compliances,
            "completed": completed_compliances,
            "pending": pending_compliances,
            "overdue": overdue_compliances
        },

        "communications": {
            "total": total_communications,
            "email": email_communications,
            "call": call_communications,
            "meeting": meeting_communications,
            "whatsapp": whatsapp_communications
        },

        "employee_workload": workload
    }