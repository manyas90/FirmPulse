"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Employee = {
  id: number;
  employee_code: string;
  name: string;
  email: string;
  phone?: string | null;
  department?: string | null;
  designation?: string | null;
  date_of_joining?: string | null;
  status: string;
  manager?: string | null;
  created_at: string;
  updated_at: string;
};

type DemoTask = {
  id: number;
  title: string;
  client: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed";
  dueDate: string;
};

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Temporary workload data.
   *
   * Your current Employee API does not have a task endpoint yet,
   * so these tasks are only for the UI demonstration.
   *
   * Later we will replace this with real tasks from FastAPI.
   */
  const demoTasks: DemoTask[] = useMemo(
    () => [
      {
        id: 1,
        title: "GST Return Preparation",
        client: "ABC Industries Pvt. Ltd.",
        priority: "High",
        status: "In Progress",
        dueDate: "12 Sep 2026",
      },
      {
        id: 2,
        title: "Monthly Accounting Review",
        client: "Shree Enterprises",
        priority: "Medium",
        status: "Pending",
        dueDate: "15 Sep 2026",
      },
      {
        id: 3,
        title: "Bank Reconciliation",
        client: "Patil & Sons",
        priority: "Low",
        status: "Completed",
        dueDate: "05 Sep 2026",
      },
      {
        id: 4,
        title: "TDS Filing",
        client: "Global Tech Solutions",
        priority: "High",
        status: "In Progress",
        dueDate: "18 Sep 2026",
      },
      {
        id: 5,
        title: "Client Ledger Verification",
        client: "Shree Enterprises",
        priority: "Medium",
        status: "Pending",
        dueDate: "20 Sep 2026",
      },
    ],
    []
  );

  /* -----------------------------------------
     FETCH EMPLOYEE
  ----------------------------------------- */

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/employees/${params.id}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Employee not found");
        }

        const data: Employee = await response.json();

        setEmployee(data);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load employee information. Please make sure FastAPI is running."
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEmployee();
    }
  }, [params.id]);

  /* -----------------------------------------
     FORMAT DATE
  ----------------------------------------- */

  const formatDate = (date?: string | null) => {
    if (!date) return "Not provided";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* -----------------------------------------
     INITIALS
  ----------------------------------------- */

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  /* -----------------------------------------
     STATUS CLASS
  ----------------------------------------- */

  const getStatusClass = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === "active") {
      return "statusActive";
    }

    if (normalized === "on leave") {
      return "statusLeave";
    }

    return "statusInactive";
  };

  /* -----------------------------------------
     PRIORITY CLASS
  ----------------------------------------- */

  const getPriorityClass = (priority: string) => {
    if (priority === "High") return "priorityHigh";
    if (priority === "Medium") return "priorityMedium";
    return "priorityLow";
  };

  /* -----------------------------------------
     TASK STATUS CLASS
  ----------------------------------------- */

  const getTaskStatusClass = (status: string) => {
    if (status === "Completed") return "taskCompleted";
    if (status === "In Progress") return "taskProgress";
    return "taskPending";
  };

  /* -----------------------------------------
     WORKLOAD STATISTICS
  ----------------------------------------- */

  const totalTasks = demoTasks.length;

  const completedTasks = demoTasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgressTasks = demoTasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const pendingTasks = demoTasks.filter(
    (task) => task.status === "Pending"
  ).length;

  /* -----------------------------------------
     LOADING STATE
  ----------------------------------------- */

  if (loading) {
    return (
      <main className="employeePage">
        <div className="loadingContainer">
          <div className="spinner"></div>

          <h2>Loading employee...</h2>

          <p>
            Getting the latest employee information from FirmPulse.
          </p>
        </div>

        <style jsx>{`
          .employeePage {
            min-height: 100vh;
            background: #f7f4ec;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family:
              Inter, ui-sans-serif, system-ui, -apple-system,
              BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .loadingContainer {
            text-align: center;
            padding: 40px;
          }

          .spinner {
            width: 42px;
            height: 42px;
            border: 4px solid #dce5dc;
            border-top-color: #1f6b45;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 20px;
          }

          h2 {
            color: #18352a;
            margin: 0 0 8px;
          }

          p {
            color: #718078;
            margin: 0;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  /* -----------------------------------------
     ERROR STATE
  ----------------------------------------- */

  if (error || !employee) {
    return (
      <main className="employeePage">
        <div className="errorContainer">
          <div className="errorIcon">!</div>

          <h2>Employee not found</h2>

          <p>{error || "This employee does not exist."}</p>

          <button
            onClick={() => router.push("/employees")}
            className="backButton"
          >
            ← Back to Employees
          </button>
        </div>

        <style jsx>{`
          .employeePage {
            min-height: 100vh;
            background: #f7f4ec;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family:
              Inter, ui-sans-serif, system-ui, -apple-system,
              BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .errorContainer {
            background: white;
            border: 1px solid #e3e8e2;
            border-radius: 20px;
            padding: 45px;
            text-align: center;
            max-width: 480px;
            width: calc(100% - 40px);
            box-shadow: 0 15px 45px rgba(31, 62, 48, 0.08);
          }

          .errorIcon {
            width: 55px;
            height: 55px;
            border-radius: 50%;
            background: #fce9e7;
            color: #b64038;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            font-weight: 800;
            margin: 0 auto 18px;
          }

          h2 {
            color: #18352a;
            margin: 0 0 10px;
          }

          p {
            color: #718078;
            line-height: 1.6;
            margin-bottom: 25px;
          }

          .backButton {
            border: 0;
            background: #1f6b45;
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            font-weight: 700;
            cursor: pointer;
          }

          .backButton:hover {
            background: #18583a;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="employeePage">
      {/* =========================================
          HEADER
      ========================================= */}

      <header className="topbar">
        <div className="brandArea">
          <div className="logo">FP</div>

          <div>
            <h1>FirmPulse</h1>
            <p>Employee Management</p>
          </div>
        </div>

        <div className="topbarActions">
          <button
            className="backTopButton"
            onClick={() => router.push("/employees")}
          >
            ← Employees
          </button>

          <button
            className="dashboardButton"
            onClick={() => router.push("/")}
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <section className="content">
        {/* Breadcrumb */}

        <div className="breadcrumb">
          Dashboard <span>/</span> Employees <span>/</span>{" "}
          <strong>{employee.name}</strong>
        </div>

        {/* =========================================
            EMPLOYEE PROFILE
        ========================================= */}

        <section className="profileCard">
          <div className="profileMain">
            <div className="largeAvatar">
              {getInitials(employee.name)}
            </div>

            <div className="profileInfo">
              <div className="employeeCode">
                {employee.employee_code}
              </div>

              <h2>{employee.name}</h2>

              <p className="designation">
                {employee.designation || "Employee"}
              </p>

              <span
                className={`statusBadge ${
                  getStatusClass(employee.status)
                }`}
              >
                <span className="statusDot"></span>
                {employee.status}
              </span>
            </div>
          </div>

          <div className="profileActions">
            <button
              className="secondaryButton"
              onClick={() => router.push("/employees")}
            >
              Employee Directory
            </button>
          </div>
        </section>

        {/* =========================================
            INFORMATION CARDS
        ========================================= */}

        <section className="informationGrid">
          {/* Contact */}

          <div className="informationCard">
            <div className="cardIcon">✉</div>

            <div>
              <span className="cardLabel">EMAIL ADDRESS</span>

              <strong>{employee.email}</strong>

              <small>
                Primary employee communication
              </small>
            </div>
          </div>

          {/* Phone */}

          <div className="informationCard">
            <div className="cardIcon">☎</div>

            <div>
              <span className="cardLabel">PHONE NUMBER</span>

              <strong>
                {employee.phone || "Not provided"}
              </strong>

              <small>Contact information</small>
            </div>
          </div>

          {/* Department */}

          <div className="informationCard">
            <div className="cardIcon">▦</div>

            <div>
              <span className="cardLabel">DEPARTMENT</span>

              <strong>
                {employee.department || "Not assigned"}
              </strong>

              <small>Organizational department</small>
            </div>
          </div>

          {/* Joining Date */}

          <div className="informationCard">
            <div className="cardIcon">◷</div>

            <div>
              <span className="cardLabel">DATE OF JOINING</span>

              <strong>
                {formatDate(employee.date_of_joining)}
              </strong>

              <small>Employee joining date</small>
            </div>
          </div>
        </section>

        {/* =========================================
            WORK INFORMATION
        ========================================= */}

        <section className="workInfoCard">
          <div className="sectionTitle">
            <div>
              <span className="sectionEyebrow">
                EMPLOYEE PROFILE
              </span>

              <h3>Work Information</h3>

              <p>
                Basic organizational information for this
                employee.
              </p>
            </div>
          </div>

          <div className="workInfoGrid">
            <div className="workInfoItem">
              <span>Employee ID</span>
              <strong>{employee.employee_code}</strong>
            </div>

            <div className="workInfoItem">
              <span>Department</span>
              <strong>
                {employee.department || "Not assigned"}
              </strong>
            </div>

            <div className="workInfoItem">
              <span>Designation</span>
              <strong>
                {employee.designation || "Not assigned"}
              </strong>
            </div>

            <div className="workInfoItem">
              <span>Manager</span>
              <strong>
                {employee.manager || "Not assigned"}
              </strong>
            </div>

            <div className="workInfoItem">
              <span>Date of Joining</span>
              <strong>
                {formatDate(employee.date_of_joining)}
              </strong>
            </div>

            <div className="workInfoItem">
              <span>Current Status</span>
              <strong>{employee.status}</strong>
            </div>
          </div>
        </section>

        {/* =========================================
            WORKLOAD
        ========================================= */}

        <section className="workloadSection">
          <div className="sectionHeader">
            <div>
              <span className="sectionEyebrow">WORKLOAD</span>

              <h3>Task Overview</h3>

              <p>
                Current workload assigned to this employee.
              </p>
            </div>

            <div className="demoNotice">
              Demo workload
            </div>
          </div>

          <div className="workloadGrid">
            {/* Total */}

            <div className="workloadCard workloadPrimary">
              <div className="workloadIcon">▣</div>

              <div>
                <span>Total Tasks</span>
                <strong>{totalTasks}</strong>
                <small>Assigned tasks</small>
              </div>
            </div>

            {/* In Progress */}

            <div className="workloadCard">
              <div className="workloadIcon greenIcon">
                ↻
              </div>

              <div>
                <span>In Progress</span>
                <strong>{inProgressTasks}</strong>
                <small>Currently working</small>
              </div>
            </div>

            {/* Pending */}

            <div className="workloadCard">
              <div className="workloadIcon orangeIcon">
                ◷
              </div>

              <div>
                <span>Pending</span>
                <strong>{pendingTasks}</strong>
                <small>Waiting to start</small>
              </div>
            </div>

            {/* Completed */}

            <div className="workloadCard">
              <div className="workloadIcon blueIcon">
                ✓
              </div>

              <div>
                <span>Completed</span>
                <strong>{completedTasks}</strong>
                <small>Finished tasks</small>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            TASK TABLE
        ========================================= */}

        <section className="tasksCard">
          <div className="sectionHeader">
            <div>
              <span className="sectionEyebrow">
                ASSIGNED WORK
              </span>

              <h3>Assigned Tasks</h3>

              <p>
                Tasks currently associated with this employee.
              </p>
            </div>
          </div>

          <div className="tableWrapper">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Client</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {demoTasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div className="taskName">
                        <div className="taskIcon">✓</div>

                        <strong>{task.title}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="clientName">
                        {task.client}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`priorityBadge ${
                          getPriorityClass(task.priority)
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td>
                      <span className="dueDate">
                        {task.dueDate}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`taskStatus ${
                          getTaskStatusClass(task.status)
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =========================================
            FOOTER NOTE
        ========================================= */}

        <div className="footerNote">
          <span>●</span>

          Employee information is synchronized with the
          FirmPulse backend.
        </div>
      </section>

      {/* =========================================
          PAGE STYLES
      ========================================= */}

      <style jsx>{`
        .employeePage {
          min-height: 100vh;
          background: #f7f4ec;
          color: #18352a;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        /* TOPBAR */

        .topbar {
          height: 76px;
          background: #ffffff;
          border-bottom: 1px solid #e3e8e2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 34px;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .brandArea {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .logo {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #1f6b45;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .brandArea h1 {
          margin: 0;
          font-size: 18px;
          letter-spacing: -0.4px;
        }

        .brandArea p {
          margin: 2px 0 0;
          color: #829087;
          font-size: 12px;
        }

        .topbarActions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .backTopButton,
        .dashboardButton {
          border: 1px solid #dce4dc;
          background: white;
          color: #365044;
          border-radius: 9px;
          padding: 10px 15px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
        }

        .backTopButton:hover,
        .dashboardButton:hover {
          background: #f4f7f3;
        }

        /* CONTENT */

        .content {
          width: min(1250px, calc(100% - 48px));
          margin: 0 auto;
          padding: 28px 0 55px;
        }

        .breadcrumb {
          color: #7b8980;
          font-size: 13px;
          margin-bottom: 20px;
        }

        .breadcrumb span {
          margin: 0 8px;
          color: #b2bbb5;
        }

        .breadcrumb strong {
          color: #365044;
        }

        /* PROFILE */

        .profileCard {
          background: white;
          border: 1px solid #e2e8e2;
          border-radius: 20px;
          padding: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          box-shadow: 0 8px 30px rgba(31, 62, 48, 0.045);
        }

        .profileMain {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .largeAvatar {
          width: 88px;
          height: 88px;
          border-radius: 22px;
          background: #dfeee3;
          color: #1f6b45;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 27px;
          font-weight: 800;
        }

        .employeeCode {
          display: inline-block;
          background: #f0f4f0;
          color: #64736a;
          padding: 5px 9px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.7px;
          margin-bottom: 7px;
        }

        .profileInfo h2 {
          margin: 0;
          font-size: 29px;
          letter-spacing: -1px;
          color: #18352a;
        }

        .designation {
          margin: 5px 0 11px;
          color: #758279;
          font-size: 14px;
        }

        .statusBadge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }

        .statusDot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .statusActive {
          color: #28734c;
          background: #e8f5ec;
        }

        .statusLeave {
          color: #a9681c;
          background: #fff2df;
        }

        .statusInactive {
          color: #a44c46;
          background: #fcebea;
        }

        .secondaryButton {
          border: 1px solid #d6e0d8;
          background: #ffffff;
          color: #2d4b3c;
          border-radius: 9px;
          padding: 11px 16px;
          font-weight: 700;
          cursor: pointer;
        }

        .secondaryButton:hover {
          background: #f4f7f3;
        }

        /* INFORMATION */

        .informationGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-top: 18px;
        }

        .informationCard {
          background: white;
          border: 1px solid #e2e8e2;
          border-radius: 15px;
          padding: 19px;
          display: flex;
          gap: 13px;
          align-items: flex-start;
        }

        .cardIcon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #edf4ee;
          color: #286c49;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          flex-shrink: 0;
        }

        .informationCard > div:last-child {
          min-width: 0;
        }

        .cardLabel {
          display: block;
          color: #89958e;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.7px;
          margin-bottom: 5px;
        }

        .informationCard strong {
          display: block;
          color: #264235;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .informationCard small {
          display: block;
          color: #96a099;
          margin-top: 5px;
          font-size: 11px;
        }

        /* WORK INFORMATION */

        .workInfoCard,
        .workloadSection,
        .tasksCard {
          background: white;
          border: 1px solid #e2e8e2;
          border-radius: 18px;
          margin-top: 18px;
          overflow: hidden;
        }

        .sectionTitle,
        .sectionHeader {
          padding: 22px 24px;
          border-bottom: 1px solid #edf0ed;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .sectionEyebrow {
          color: #8a968f;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .sectionHeader h3,
        .sectionTitle h3 {
          margin: 5px 0 3px;
          color: #18352a;
          font-size: 19px;
        }

        .sectionHeader p,
        .sectionTitle p {
          margin: 0;
          color: #7e8b83;
          font-size: 12px;
        }

        .workInfoGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          padding: 8px 24px 20px;
        }

        .workInfoItem {
          padding: 17px 15px;
          border-bottom: 1px solid #edf0ed;
        }

        .workInfoItem span {
          display: block;
          color: #8a968f;
          font-size: 11px;
          margin-bottom: 6px;
        }

        .workInfoItem strong {
          color: #2b4639;
          font-size: 14px;
        }

        /* WORKLOAD */

        .demoNotice {
          background: #fff5dd;
          color: #96651f;
          border: 1px solid #f1dfb9;
          padding: 7px 10px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 700;
        }

        .workloadGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          padding: 18px 24px 24px;
        }

        .workloadCard {
          border: 1px solid #e6ebe6;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .workloadPrimary {
          background: #f0f7f1;
          border-color: #dbe9dd;
        }

        .workloadIcon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: #dceee0;
          color: #236743;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          font-weight: 800;
        }

        .greenIcon {
          background: #e6f4ea;
          color: #26744a;
        }

        .orangeIcon {
          background: #fff0dc;
          color: #a6671e;
        }

        .blueIcon {
          background: #e8f0f7;
          color: #47718d;
        }

        .workloadCard span {
          display: block;
          color: #7e8b83;
          font-size: 11px;
          margin-bottom: 3px;
        }

        .workloadCard strong {
          display: block;
          font-size: 25px;
          color: #203d30;
        }

        .workloadCard small {
          color: #99a39d;
          font-size: 10px;
        }

        /* TASK TABLE */

        .tableWrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
        }

        th {
          text-align: left;
          padding: 13px 22px;
          background: #fafbf9;
          color: #8a968f;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          border-bottom: 1px solid #e9ede9;
        }

        td {
          padding: 15px 22px;
          border-bottom: 1px solid #edf0ed;
          font-size: 13px;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        tbody tr:hover {
          background: #fbfcfa;
        }

        .taskName {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .taskIcon {
          width: 31px;
          height: 31px;
          border-radius: 8px;
          background: #edf4ee;
          color: #2c714b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
        }

        .taskName strong {
          color: #294538;
          font-size: 13px;
        }

        .clientName {
          color: #68776e;
        }

        .priorityBadge,
        .taskStatus {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
        }

        .priorityHigh {
          background: #fce8e6;
          color: #b34b43;
        }

        .priorityMedium {
          background: #fff1dc;
          color: #a26720;
        }

        .priorityLow {
          background: #edf1ef;
          color: #66756d;
        }

        .taskCompleted {
          background: #e6f4ea;
          color: #28734c;
        }

        .taskProgress {
          background: #e8f0f7;
          color: #47718d;
        }

        .taskPending {
          background: #fff1dc;
          color: #a26720;
        }

        .dueDate {
          color: #64736a;
        }

        /* FOOTER */

        .footerNote {
          margin-top: 20px;
          color: #89958e;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .footerNote span {
          color: #2c8a56;
          font-size: 8px;
        }

        /* RESPONSIVE */

        @media (max-width: 1000px) {
          .informationGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .workloadGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .workInfoGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .topbar {
            padding: 0 17px;
          }

          .dashboardButton {
            display: none;
          }

          .content {
            width: calc(100% - 28px);
            padding-top: 20px;
          }

          .profileCard {
            align-items: flex-start;
            flex-direction: column;
            padding: 21px;
          }

          .profileMain {
            align-items: flex-start;
          }

          .largeAvatar {
            width: 68px;
            height: 68px;
            border-radius: 17px;
            font-size: 21px;
          }

          .profileInfo h2 {
            font-size: 23px;
          }

          .informationGrid {
            grid-template-columns: 1fr;
          }

          .workInfoGrid {
            grid-template-columns: 1fr;
            padding-left: 15px;
            padding-right: 15px;
          }

          .workloadGrid {
            grid-template-columns: 1fr;
            padding-left: 15px;
            padding-right: 15px;
          }

          .sectionHeader,
          .sectionTitle {
            padding: 18px;
            align-items: flex-start;
          }

          .demoNotice {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .topbar {
            height: 68px;
          }

          .brandArea p {
            display: none;
          }

          .backTopButton {
            padding: 9px 11px;
          }

          .profileMain {
            gap: 13px;
          }

          .informationCard {
            padding: 15px;
          }
        }
      `}</style>
    </main>
  );
}