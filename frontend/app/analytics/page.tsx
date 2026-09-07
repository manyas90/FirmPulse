"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type AnalyticsData = {
  employees: {
    total: number;
    active: number;
    inactive: number;
  };

  clients: {
    total: number;
    active: number;
    inactive: number;
  };

  tasks: {
    total: number;
    completed: number;
    pending: number;
    in_progress: number;
    cancelled: number;
  };

  documents: {
    total: number;
    active: number;
    expired: number;
  };

  compliance: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };

  communications: {
    total: number;
    email: number;
    call: number;
    meeting: number;
    whatsapp: number;
  };

  employee_workload: {
    employee_id: number;
    employee_name: string;
    task_count: number;
  }[];
};

export default function AnalyticsPage() {
  const router = useRouter();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/analytics/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        return response.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load analytics data.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="page">
        <div className="loading">Loading Analytics...</div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: #f7f3eb;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
          }

          .loading {
            background: white;
            padding: 30px 45px;
            border-radius: 16px;
            font-size: 18px;
            font-weight: 600;
            color: #234d3c;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          }
        `}</style>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="page">
        <div className="error-box">
          <h2>Analytics Error</h2>
          <p>{error || "No analytics data available."}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: #f7f3eb;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
          }

          .error-box {
            background: white;
            padding: 35px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          }

          .error-box h2 {
            color: #a33a2b;
          }

          button {
            border: none;
            background: #234d3c;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
          }
        `}</style>
      </main>
    );
  }

  const maxWorkload = Math.max(
    ...data.employee_workload.map((item) => item.task_count),
    1
  );

  const maxTaskValue = Math.max(
    data.tasks.completed,
    data.tasks.pending,
    data.tasks.in_progress,
    data.tasks.cancelled,
    1
  );

  const maxCommunication = Math.max(
    data.communications.email,
    data.communications.call,
    data.communications.meeting,
    data.communications.whatsapp,
    1
  );

  return (
    <main className="page">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">F</div>
          <div>
            <div className="logo-name">FirmPulse</div>
            <div className="logo-subtitle">Practice Management</div>
          </div>
        </div>

        <nav>
          <button onClick={() => router.push("/")}>
            <span>⌂</span>
            Dashboard
          </button>

          <button onClick={() => router.push("/employees")}>
            <span>👥</span>
            Employees
          </button>

          <button onClick={() => router.push("/clients")}>
            <span>▣</span>
            Clients
          </button>

          <button onClick={() => router.push("/tasks")}>
            <span>✓</span>
            Tasks & Workload
          </button>

          <button onClick={() => router.push("/documents")}>
            <span>▤</span>
            Documents
          </button>

          <button onClick={() => router.push("/compliance")}>
            <span>▥</span>
            GST & Compliance
          </button>

          <button onClick={() => router.push("/timeline")}>
            <span>◷</span>
            Client Timeline
          </button>

          <button onClick={() => router.push("/communications")}>
            <span>✉</span>
            Communications
          </button>

          <button className="active">
            <span>▦</span>
            Analytics
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <section className="content">
        <header className="header">
          <div>
            <div className="eyebrow">FIRMPULSE ANALYTICS</div>
            <h1>Analytics</h1>
            <p>
              Monitor firm performance, workload and operational activity.
            </p>
          </div>

          <button
            className="back-button"
            onClick={() => router.push("/")}
          >
            ← Dashboard
          </button>
        </header>

        {/* SUMMARY CARDS */}
        <section className="cards">
          <div className="card">
            <div className="card-icon">👥</div>
            <div>
              <div className="card-label">Employees</div>
              <div className="card-value">{data.employees.total}</div>
              <div className="card-detail">
                {data.employees.active} active
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-icon">▣</div>
            <div>
              <div className="card-label">Clients</div>
              <div className="card-value">{data.clients.total}</div>
              <div className="card-detail">
                {data.clients.active} active
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-icon">✓</div>
            <div>
              <div className="card-label">Tasks</div>
              <div className="card-value">{data.tasks.total}</div>
              <div className="card-detail">
                {data.tasks.completed} completed
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-icon">▥</div>
            <div>
              <div className="card-label">Compliance</div>
              <div className="card-value">
                {data.compliance.total}
              </div>
              <div className="card-detail">
                {data.compliance.pending} pending
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-icon">✉</div>
            <div>
              <div className="card-label">Communications</div>
              <div className="card-value">
                {data.communications.total}
              </div>
              <div className="card-detail">Total communications</div>
            </div>
          </div>
        </section>

        {/* CHART ROW */}
        <section className="chart-grid">
          {/* TASK STATUS */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Task Status</h2>
                <p>Current task distribution</p>
              </div>
            </div>

            <div className="bars">
              <div className="bar-row">
                <span>Completed</span>
                <div className="bar-track">
                  <div
                    className="bar completed"
                    style={{
                      width: `${
                        (data.tasks.completed / maxTaskValue) * 100
                      }%`,
                    }}
                  />
                </div>
                <strong>{data.tasks.completed}</strong>
              </div>

              <div className="bar-row">
                <span>Pending</span>
                <div className="bar-track">
                  <div
                    className="bar pending"
                    style={{
                      width: `${
                        (data.tasks.pending / maxTaskValue) * 100
                      }%`,
                    }}
                  />
                </div>
                <strong>{data.tasks.pending}</strong>
              </div>

              <div className="bar-row">
                <span>In Progress</span>
                <div className="bar-track">
                  <div
                    className="bar progress"
                    style={{
                      width: `${
                        (data.tasks.in_progress / maxTaskValue) * 100
                      }%`,
                    }}
                  />
                </div>
                <strong>{data.tasks.in_progress}</strong>
              </div>

              <div className="bar-row">
                <span>Cancelled</span>
                <div className="bar-track">
                  <div
                    className="bar cancelled"
                    style={{
                      width: `${
                        (data.tasks.cancelled / maxTaskValue) * 100
                      }%`,
                    }}
                  />
                </div>
                <strong>{data.tasks.cancelled}</strong>
              </div>
            </div>
          </div>

          {/* COMPLIANCE */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Compliance</h2>
                <p>GST and compliance status</p>
              </div>
            </div>

            <div className="compliance-stats">
              <div className="status-box">
                <div className="status-number">
                  {data.compliance.completed}
                </div>
                <div>Completed</div>
              </div>

              <div className="status-box">
                <div className="status-number">
                  {data.compliance.pending}
                </div>
                <div>Pending</div>
              </div>

              <div className="status-box">
                <div className="status-number">
                  {data.compliance.overdue}
                </div>
                <div>Overdue</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECOND ROW */}
        <section className="chart-grid">
          {/* EMPLOYEE WORKLOAD */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Employee Workload</h2>
                <p>Tasks assigned to each employee</p>
              </div>
            </div>

            {data.employee_workload.length === 0 ? (
              <div className="empty">
                No employee workload data available.
              </div>
            ) : (
              <div className="workload-list">
                {data.employee_workload.map((employee) => (
                  <div
                    className="workload-row"
                    key={employee.employee_id}
                  >
                    <div className="employee-name">
                      {employee.employee_name}
                    </div>

                    <div className="workload-track">
                      <div
                        className="workload-bar"
                        style={{
                          width: `${
                            (employee.task_count / maxWorkload) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    <strong>{employee.task_count}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COMMUNICATIONS */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Communications</h2>
                <p>Communication activity by type</p>
              </div>
            </div>

            <div className="bars">
              <div className="bar-row">
                <span>Email</span>
                <div className="bar-track">
                  <div
                    className="bar"
                    style={{
                      width: `${
                        (data.communications.email /
                          maxCommunication) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <strong>{data.communications.email}</strong>
              </div>

              <div className="bar-row">
                <span>Call</span>
                <div className="bar-track">
                  <div
                    className="bar"
                    style={{
                      width: `${
                        (data.communications.call /
                          maxCommunication) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <strong>{data.communications.call}</strong>
              </div>

              <div className="bar-row">
                <span>Meeting</span>
                <div className="bar-track">
                  <div
                    className="bar"
                    style={{
                      width: `${
                        (data.communications.meeting /
                          maxCommunication) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <strong>{data.communications.meeting}</strong>
              </div>

              <div className="bar-row">
                <span>WhatsApp</span>
                <div className="bar-track">
                  <div
                    className="bar"
                    style={{
                      width: `${
                        (data.communications.whatsapp /
                          maxCommunication) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <strong>{data.communications.whatsapp}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* OVERVIEW */}
        <section className="overview">
          <div className="overview-item">
            <span>Active Employees</span>
            <strong>
              {data.employees.active} / {data.employees.total}
            </strong>
          </div>

          <div className="overview-item">
            <span>Active Clients</span>
            <strong>
              {data.clients.active} / {data.clients.total}
            </strong>
          </div>

          <div className="overview-item">
            <span>Active Documents</span>
            <strong>
              {data.documents.active} / {data.documents.total}
            </strong>
          </div>

          <div className="overview-item">
            <span>Expired Documents</span>
            <strong>{data.documents.expired}</strong>
          </div>

          <div className="overview-item">
            <span>Overdue Compliance</span>
            <strong>{data.compliance.overdue}</strong>
          </div>
        </section>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          display: flex;
          background: #f7f3eb;
          color: #26362f;
          font-family: Arial, Helvetica, sans-serif;
        }

        .sidebar {
          width: 245px;
          min-height: 100vh;
          background: #173d30;
          color: white;
          padding: 24px 16px;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 8px 30px;
        }

        .logo-mark {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #e7c77d;
          color: #173d30;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          font-weight: 800;
        }

        .logo-name {
          font-size: 20px;
          font-weight: 800;
        }

        .logo-subtitle {
          font-size: 10px;
          opacity: 0.7;
          margin-top: 2px;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        nav button {
          width: 100%;
          border: none;
          background: transparent;
          color: #dce8e2;
          padding: 12px 13px;
          border-radius: 9px;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        nav button:hover,
        nav button.active {
          background: #285947;
          color: white;
        }

        nav button span {
          width: 20px;
          text-align: center;
        }

        .content {
          margin-left: 245px;
          width: calc(100% - 245px);
          padding: 34px 38px 50px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
        }

        .eyebrow {
          color: #6f806f;
          font-size: 11px;
          letter-spacing: 2px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        h1 {
          margin: 0;
          font-size: 34px;
          color: #173d30;
        }

        .header p {
          margin: 8px 0 0;
          color: #778178;
          font-size: 14px;
        }

        .back-button {
          border: 1px solid #d8d0c1;
          background: white;
          color: #234d3c;
          padding: 10px 16px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 600;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .card {
          background: white;
          border: 1px solid #e8e1d5;
          border-radius: 15px;
          padding: 20px;
          display: flex;
          gap: 14px;
          align-items: center;
          box-shadow: 0 5px 20px rgba(45, 52, 47, 0.04);
        }

        .card-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: #edf4ef;
          color: #234d3c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
        }

        .card-label {
          font-size: 12px;
          color: #7c857e;
          margin-bottom: 5px;
        }

        .card-value {
          font-size: 25px;
          font-weight: 800;
          color: #173d30;
        }

        .card-detail {
          font-size: 11px;
          color: #718077;
          margin-top: 3px;
        }

        .chart-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .panel {
          background: white;
          border: 1px solid #e8e1d5;
          border-radius: 15px;
          padding: 24px;
          box-shadow: 0 5px 20px rgba(45, 52, 47, 0.04);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .panel h2 {
          margin: 0;
          font-size: 18px;
          color: #173d30;
        }

        .panel p {
          margin: 5px 0 0;
          color: #8a928c;
          font-size: 12px;
        }

        .bars {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .bar-row {
          display: grid;
          grid-template-columns: 95px 1fr 35px;
          gap: 10px;
          align-items: center;
          font-size: 12px;
        }

        .bar-row strong {
          text-align: right;
          color: #173d30;
        }

        .bar-track,
        .workload-track {
          height: 9px;
          background: #edf0eb;
          border-radius: 20px;
          overflow: hidden;
        }

        .bar {
          height: 100%;
          min-width: 0;
          background: #437b62;
          border-radius: 20px;
          transition: width 0.4s ease;
        }

        .bar.completed {
          background: #437b62;
        }

        .bar.pending {
          background: #d0a94e;
        }

        .bar.progress {
          background: #6489a0;
        }

        .bar.cancelled {
          background: #a56b62;
        }

        .compliance-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .status-box {
          padding: 20px 10px;
          border-radius: 12px;
          background: #f7f5ef;
          text-align: center;
          font-size: 12px;
          color: #727b75;
        }

        .status-number {
          font-size: 27px;
          font-weight: 800;
          color: #234d3c;
          margin-bottom: 5px;
        }

        .workload-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .workload-row {
          display: grid;
          grid-template-columns: 120px 1fr 35px;
          align-items: center;
          gap: 12px;
          font-size: 12px;
        }

        .employee-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .workload-bar {
          height: 100%;
          background: #437b62;
          border-radius: 20px;
        }

        .empty {
          text-align: center;
          padding: 35px 10px;
          color: #89918b;
          font-size: 13px;
        }

        .overview {
          background: white;
          border: 1px solid #e8e1d5;
          border-radius: 15px;
          padding: 20px 24px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 15px;
        }

        .overview-item {
          display: flex;
          flex-direction: column;
          gap: 7px;
          border-right: 1px solid #ece7dd;
        }

        .overview-item:last-child {
          border-right: none;
        }

        .overview-item span {
          font-size: 11px;
          color: #858e87;
        }

        .overview-item strong {
          font-size: 17px;
          color: #173d30;
        }

        @media (max-width: 1100px) {
          .cards {
            grid-template-columns: repeat(3, 1fr);
          }

          .overview {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 850px) {
          .sidebar {
            width: 190px;
          }

          .content {
            margin-left: 190px;
            width: calc(100% - 190px);
            padding: 25px;
          }

          .chart-grid {
            grid-template-columns: 1fr;
          }

          .cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .sidebar {
            display: none;
          }

          .content {
            margin-left: 0;
            width: 100%;
            padding: 20px;
          }

          .cards {
            grid-template-columns: 1fr;
          }

          .overview {
            grid-template-columns: 1fr 1fr;
          }

          .header {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </main>
  );
}