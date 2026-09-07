"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
  created_at?: string;
  updated_at?: string;
};

type Task = {
  id: number;
  title: string;
  description?: string | null;
  client_name?: string | null;
  assigned_employee_id?: number | null;
  priority: string;
  status: string;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
};

type Compliance = {
  id: number;
  compliance_code: string;
  compliance_name: string;
  compliance_type: string;
  client_id?: number | null;
  assigned_employee_id?: number | null;
  due_date: string;
  filing_date?: string | null;
  frequency?: string | null;
  status: string;
  priority: string;
  remarks?: string | null;
  created_at?: string;
  updated_at?: string;
};

type Client = {
  id: number;
  client_name: string;
  company_name?: string | null;
  status: string;
};

type RiskPrediction = {
  id: number;
  task_id: number | null;
  client_id: number | null;
  risk_score: number;
  risk_level: string;
  risk_reason: string | null;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "employees", label: "Employees", icon: "👥" },
  { id: "clients", label: "Clients", icon: "▣" },
  { id: "tasks", label: "Tasks & Workload", icon: "✓" },
  { id: "documents", label: "Documents", icon: "▤" },
  { id: "compliance", label: "GST & Compliance", icon: "▥" },
  { id: "timeline", label: "Client Timeline", icon: "◷" },
  { id: "communications", label: "Communications", icon: "✉" },
  { id: "analytics", label: "Analytics", icon: "▦" },
  { id: "risk-prediction", label: "Risk Prediction", icon: "⚠" },
];

export default function Dashboard() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [compliances, setCompliances] = useState<Compliance[]>([]);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingCompliance, setLoadingCompliance] = useState(true);
  const [loadingRisk, setLoadingRisk] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [taskFilter, setTaskFilter] = useState("all");

  // ---------------------------------------------------------
  // FETCH DASHBOARD DATA
  // ---------------------------------------------------------

  async function loadDashboardData() {
    try {
      setRefreshing(true);

      const [
        employeesResponse,
        tasksResponse,
        complianceResponse,
        riskResponse,
        clientsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/employees/`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/tasks/`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/compliance/`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/risk-prediction/`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/clients/`, {
          cache: "no-store",
        }),
      ]);

      if (!employeesResponse.ok) {
        throw new Error("Failed to fetch employees");
      }

      if (!tasksResponse.ok) {
        throw new Error("Failed to fetch tasks");
      }

      if (!complianceResponse.ok) {
        throw new Error("Failed to fetch compliance");
      }

      if (!riskResponse.ok) {
        console.warn("Risk predictions unavailable");
      }

      if (!clientsResponse.ok) {
        throw new Error("Failed to fetch clients");
      }

      const employeesData = await employeesResponse.json();
      const tasksData = await tasksResponse.json();
      const complianceData = await complianceResponse.json();
      const riskData = riskResponse.ok ? await riskResponse.json() : [];
      const clientsData = await clientsResponse.json();

      setEmployees(employeesData);
      setTasks(tasksData);
      setCompliances(complianceData);
      setRiskPredictions(riskData);
      setClients(clientsData);
    } catch (error) {
      console.error("Dashboard data loading error:", error);
    } finally {
      setLoadingEmployees(false);
      setLoadingTasks(false);
      setLoadingCompliance(false);
      setLoadingRisk(false);
      setLoadingClients(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ---------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------

  function handleNavigation(id: string) {
    setMobileMenu(false);

    if (id === "dashboard") {
      router.push("/");
      return;
    }

    if (id === "employees") {
      router.push("/employees");
      return;
    }

    if (id === "clients") {
      router.push("/clients");
      return;
    }

    if (id === "tasks") {
      router.push("/tasks");
      return;
    }

    if (id === "documents") {
      router.push("/documents");
      return;
    }

    if (id === "compliance") {
      router.push("/compliance");
      return;
    }

    if (id === "timeline") {
      router.push("/timeline");
      return;
    }

    if (id === "communications") {
      router.push("/communications");
      return;
    }

    if (id === "analytics") {
      router.push("/analytics");
      return;
    }

    if (id === "risk-prediction") {
      router.push("/risk-prediction");
      return;
    }
    alert(`${id} module will be connected next.`);
  }

  // ---------------------------------------------------------
  // EMPLOYEE STATISTICS
  // ---------------------------------------------------------

  const activeEmployees = useMemo(() => {
    return employees.filter(
      (employee) =>
        employee.status?.toLowerCase() === "active"
    ).length;
  }, [employees]);

  const departmentCount = useMemo(() => {
    const departments = new Set(
      employees
        .map((employee) => employee.department)
        .filter(Boolean)
    );

    return departments.size;
  }, [employees]);

  // ---------------------------------------------------------
  // TASK STATISTICS
  // ---------------------------------------------------------

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status?.toLowerCase() === "pending"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status?.toLowerCase() === "in progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status?.toLowerCase() === "completed"
  ).length;

  const today = new Date();

  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date) return false;

    if (task.status?.toLowerCase() === "completed") {
      return false;
    }

    const dueDate = new Date(task.due_date);

    return dueDate < today;
  }).length;

  // ---------------------------------------------------------
  // COMPLIANCE STATISTICS
  // ---------------------------------------------------------

  const complianceDue = useMemo(() => {
    const now = new Date();

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(
      sevenDaysFromNow.getDate() + 7
    );

    return compliances.filter((compliance) => {
      if (!compliance.due_date) {
        return false;
      }

      if (
        compliance.status?.toLowerCase() ===
        "completed"
      ) {
        return false;
      }

      const dueDate = new Date(compliance.due_date);

      return (
        dueDate <= sevenDaysFromNow
      );
    }).length;
  }, [compliances]);

  // ---------------------------------------------------------
  // SEARCH
  // ---------------------------------------------------------

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) {
      return employees;
    }

    const query = search.toLowerCase();

    return employees.filter((employee) => {
      return (
        employee.name?.toLowerCase().includes(query) ||
        employee.employee_code?.toLowerCase().includes(query) ||
        employee.department?.toLowerCase().includes(query) ||
        employee.designation?.toLowerCase().includes(query)
      );
    });
  }, [employees, search]);

  // ---------------------------------------------------------
  // UPCOMING TASKS
  // ---------------------------------------------------------

  const filteredTasks = useMemo(() => {
    if (taskFilter === "all") return tasks;
    return tasks.filter((task) => task.status?.toLowerCase() === taskFilter);
  }, [tasks, taskFilter]);

  const upcomingTasks = useMemo(() => {
    return [...filteredTasks]
      .filter(
        (task) =>
          task.status?.toLowerCase() !== "completed"
      )
      .sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;

        return (
          new Date(a.due_date).getTime() -
          new Date(b.due_date).getTime()
        );
      })
      .slice(0, 5);
  }, [filteredTasks]);

  const activeClients = useMemo(
    () => clients.filter((client) => client.status?.toLowerCase() === "active").length,
    [clients]
  );

  const highRiskPredictions = useMemo(() => {
    return riskPredictions
      .filter((prediction) => prediction.risk_level?.toLowerCase() === "high")
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 5);
  }, [riskPredictions]);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return { employees: [], tasks: [] };
    return {
      employees: employees.filter((e) => `${e.name} ${e.employee_code} ${e.department || ""}`.toLowerCase().includes(q)).slice(0, 4),
      tasks: tasks.filter((t) => `${t.title} ${t.client_name || ""} ${t.status}`.toLowerCase().includes(q)).slice(0, 4),
    };
  }, [search, employees, tasks]);

  // ---------------------------------------------------------
  // EMPLOYEE NAME
  // ---------------------------------------------------------

  function getEmployeeName(
    employeeId?: number | null
  ) {
    if (!employeeId) {
      return "Unassigned";
    }

    const employee = employees.find(
      (item) => item.id === employeeId
    );

    return employee?.name || "Unknown Employee";
  }

  // ---------------------------------------------------------
  // DATE FORMAT
  // ---------------------------------------------------------

  function formatDate(date?: string | null) {
    if (!date) {
      return "No due date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ---------------------------------------------------------
  // STATUS CLASS
  // ---------------------------------------------------------

  function getStatusClass(status: string) {
    const value = status.toLowerCase();

    if (value === "completed") {
      return "status completed";
    }

    if (value === "in progress") {
      return "status progress";
    }

    return "status pending";
  }

  // ---------------------------------------------------------
  // PRIORITY CLASS
  // ---------------------------------------------------------

  function getPriorityClass(priority: string) {
    const value = priority.toLowerCase();

    if (value === "high") {
      return "priority high";
    }

    if (value === "low") {
      return "priority low";
    }

    return "priority medium";
  }

  return (
    <>
      <div className="app-shell">

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside
          className={`sidebar ${
            mobileMenu ? "sidebar-open" : ""
          }`}
        >
          <div className="brand">
            <div className="brand-logo">F</div>

            <div>
              <div className="brand-name">FirmPulse</div>
              <div className="brand-subtitle">
                Practice Management
              </div>
            </div>
          </div>

          <div className="workspace">
            <span>WORKSPACE</span>
          </div>

          <nav className="navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  handleNavigation(item.id)
                }
                className={`nav-item ${
                  item.id === "dashboard"
                    ? "active"
                    : ""
                }`}
              >
                <span className="nav-icon">
                  {item.icon}
                </span>

                <span>{item.label}</span>

                {item.id === "tasks" && (
                  <span className="nav-count">
                    {pendingTasks + inProgressTasks}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="help-box">
              <div className="help-icon">?</div>

              <div>
                <strong>Need help?</strong>
                <p>Contact support</p>
              </div>
            </div>

            <div className="user-profile">
              <div className="avatar">
                MA
              </div>

              <div className="user-info">
                <strong>Admin</strong>
                <span>Administrator</span>
              </div>

              <button className="more-button">
                ⋮
              </button>
            </div>
          </div>
        </aside>

        {/* =====================================================
            MAIN AREA
        ===================================================== */}

        <main className="main">

          {/* HEADER */}

          <header className="header">

            <button
              className="mobile-menu-button"
              onClick={() =>
                setMobileMenu(!mobileMenu)
              }
            >
              ☰
            </button>

            <div className="header-search">
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search employees, tasks..."
              />
            </div>

            {showSearchResults && search.trim() && (
              <div className="search-results">
                <div className="search-results-title">Quick results</div>
                {searchResults.employees.map((employee) => (
                  <button key={`e-${employee.id}`} onClick={() => { setShowSearchResults(false); setSearch(""); router.push(`/employees/${employee.id}`); }}>
                    <span className="result-avatar">{employee.name?.charAt(0)?.toUpperCase()}</span>
                    <span><strong>{employee.name}</strong><small>{employee.department || "Employee"}</small></span>
                  </button>
                ))}
                {searchResults.tasks.map((task) => (
                  <button key={`t-${task.id}`} onClick={() => { setShowSearchResults(false); setSearch(""); handleNavigation("tasks"); }}>
                    <span className="result-icon">✓</span>
                    <span><strong>{task.title}</strong><small>{task.status} · {task.client_name || "No client"}</small></span>
                  </button>
                ))}
                {!searchResults.employees.length && !searchResults.tasks.length && <div className="no-results">No matching records.</div>}
              </div>
            )}

            <div className="header-actions">

              <button
                className="icon-button"
                onClick={loadDashboardData}
                title="Refresh"
              >
                {refreshing ? "↻" : "⟳"}
              </button>

              <button
                className="icon-button"
                title="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                ♢
                {highRiskPredictions.length > 0 && <span className="notification-dot" />}
              </button>

              <div className="header-user">
                <div className="avatar small">
                  MA
                </div>

                <div>
                  <strong>Admin</strong>
                  <span>Administrator</span>
                </div>
              </div>
            </div>

            {showNotifications && (
              <div className="notification-panel">
                <div className="notification-header"><strong>Attention</strong><button onClick={() => setShowNotifications(false)}>×</button></div>
                {highRiskPredictions.length ? highRiskPredictions.slice(0, 3).map((risk) => (
                  <button className="notification-item" key={risk.id} onClick={() => handleNavigation("risk-prediction")}>
                    <span className="notification-risk">!</span>
                    <span><strong>High-risk task #{risk.task_id ?? "—"}</strong><small>{risk.risk_reason || "Immediate attention recommended"}</small></span>
                  </button>
                )) : <div className="no-results">No urgent alerts.</div>}
              </div>
            )}
          </header>

          {/* =====================================================
              CONTENT
          ===================================================== */}

          <section className="content">

            {/* PAGE TITLE */}

            <div className="page-heading">

              <div>
                <div className="eyebrow">
                  MONDAY · 7 SEPTEMBER 2026
                </div>

                <h1>Good morning, Admin</h1>

                <p>
                  Here&apos;s what&apos;s happening across
                  your practice today.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={() =>
                  handleNavigation("tasks")
                }
              >
                <span>+</span>
                Create Task
              </button>
            </div>

            {/* =================================================
                KPI CARDS
            ================================================= */}

            <div className="kpi-grid">

              {/* EMPLOYEES */}

              <div
                className="kpi-card clickable"
                onClick={() =>
                  handleNavigation("employees")
                }
              >
                <div className="kpi-top">
                  <span>Total Employees</span>

                  <span className="kpi-icon">
                    👥
                  </span>
                </div>

                <div className="kpi-number">
                  {loadingEmployees
                    ? "..."
                    : employees.length}
                </div>

                <div className="kpi-description">
                  <span className="green-text">
                    {activeEmployees}
                  </span>{" "}
                  active employees
                </div>
              </div>

              {/* ACTIVE CLIENTS */}

              <div
                className="kpi-card clickable"
                onClick={() => handleNavigation("clients")}
              >
                <div className="kpi-top">
                  <span>Active Clients</span>

                  <span className="kpi-icon">
                    ◉
                  </span>
                </div>

                <div className="kpi-number">
                  {loadingClients ? "..." : activeClients}
                </div>

                <div className="kpi-description">
                  Current active clients
                </div>
              </div>

              {/* TASKS */}

              <div
                className="kpi-card clickable"
                onClick={() =>
                  handleNavigation("tasks")
                }
              >
                <div className="kpi-top">
                  <span>Pending Tasks</span>

                  <span className="kpi-icon">
                    ✓
                  </span>
                </div>

                <div className="kpi-number">
                  {loadingTasks
                    ? "..."
                    : pendingTasks}
                </div>

                <div className="kpi-description">
                  <span className="orange-text">
                    {inProgressTasks}
                  </span>{" "}
                  in progress
                </div>
              </div>

              {/* COMPLIANCE */}

              <div
                className="kpi-card clickable"
                onClick={() =>
                  handleNavigation("compliance")
                }
              >
                <div className="kpi-top">
                  <span>Compliance Due</span>

                  <span className="kpi-icon">
                    !
                  </span>
                </div>

                <div className="kpi-number">
                  {loadingCompliance ? "..." : complianceDue}
                </div>

                <div className="kpi-description">
                  Upcoming compliance items
                </div>
              </div>

            </div>

            {/* =================================================
                TASK OVERVIEW
            ================================================= */}

            <div className="section-grid">

              {/* UPCOMING WORK */}

              <div className="panel large-panel">

                <div className="panel-header">

                  <div>
                    <h2>Upcoming Work</h2>

                    <p>
                      Tasks that need attention
                    </p>
                  </div>

                  <div className="panel-header-actions">
                    <div className="filter-tabs" aria-label="Task filters">
                      {[
                        ["all", "All"],
                        ["pending", "Pending"],
                        ["in progress", "In progress"],
                        ["completed", "Done"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          className={taskFilter === value ? "active" : ""}
                          onClick={() => setTaskFilter(value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <button
                      className="text-button"
                      onClick={() => handleNavigation("tasks")}
                    >
                      All tasks →
                    </button>
                  </div>

                </div>

                <div className="task-list">

                  {loadingTasks ? (
                    <div className="empty-state">
                      Loading tasks...
                    </div>
                  ) : upcomingTasks.length === 0 ? (
                    <div className="empty-state">
                      No upcoming tasks.
                    </div>
                  ) : (
                    upcomingTasks.map((task) => (
                      <div
                        className="task-row"
                        key={task.id}
                      >

                        <div className="task-main">

                          <div className="task-title">
                            {task.title}
                          </div>

                          <div className="task-meta">
                            {task.client_name ||
                              "No client"}{" "}
                            ·{" "}
                            {getEmployeeName(
                              task.assigned_employee_id
                            )}
                          </div>

                        </div>

                        <div className="task-right">

                          <span
                            className={getPriorityClass(
                              task.priority
                            )}
                          >
                            {task.priority}
                          </span>

                          <span
                            className={getStatusClass(
                              task.status
                            )}
                          >
                            {task.status}
                          </span>

                          <span className="task-date">
                            {formatDate(
                              task.due_date
                            )}
                          </span>

                        </div>

                      </div>
                    ))
                  )}

                </div>
              </div>

              {/* TASK SUMMARY */}

              <div className="panel summary-panel">

                <div className="panel-header">
                  <div>
                    <h2>Task Summary</h2>
                    <p>Current workload</p>
                  </div>
                </div>

                <div className="summary-list">

                  <div className="summary-item">
                    <span>Total Tasks</span>
                    <strong>{totalTasks}</strong>
                  </div>

                  <div className="summary-item">
                    <span>Pending</span>
                    <strong>{pendingTasks}</strong>
                  </div>

                  <div className="summary-item">
                    <span>In Progress</span>
                    <strong>
                      {inProgressTasks}
                    </strong>
                  </div>

                  <div className="summary-item">
                    <span>Completed</span>
                    <strong>
                      {completedTasks}
                    </strong>
                  </div>

                  <div className="summary-item danger">
                    <span>Overdue</span>
                    <strong>{overdueTasks}</strong>
                  </div>

                </div>

              </div>

            </div>

            <div className="panel risk-panel">

              <div className="panel-header">

                <div>
                  <h2>⚠ High Risk Tasks</h2>
                  <p>Tasks that may require immediate attention</p>
                </div>

                <button
                  className="text-button"
                  onClick={() => handleNavigation("risk-prediction")}
                >
                  View all →
                </button>

              </div>

              {loadingRisk ? (
                <div className="empty-state">
                  Loading risk predictions...
                </div>
              ) : highRiskPredictions.length === 0 ? (
                <div className="empty-state">
                  No high-risk tasks detected.
                </div>
              ) : (
                <div className="risk-list">
                  {highRiskPredictions.map((risk) => (
                    <div className="risk-row" key={risk.id}>
                      <div className="risk-main">
                        <div className="risk-title">
                          Task #{risk.task_id ?? "—"}
                        </div>
                        <div className="risk-reason">
                          {risk.risk_reason || "High risk detected"}
                        </div>
                      </div>
                      <div className="risk-score">
                        Risk {risk.risk_score}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* =================================================
                WORKFORCE
            ================================================= */}

            <div className="panel">

              <div className="panel-header">

                <div>
                  <h2>Workforce Overview</h2>

                  <p>
                    Employee status and departments
                  </p>
                </div>

                <button
                  className="text-button"
                  onClick={() =>
                    handleNavigation("employees")
                  }
                >
                  View employees →
                </button>

              </div>

              <div className="workforce-stats">

                <div className="workforce-stat">
                  <div className="stat-label">
                    Total Employees
                  </div>

                  <div className="stat-value">
                    {employees.length}
                  </div>
                </div>

                <div className="workforce-stat">
                  <div className="stat-label">
                    Active
                  </div>

                  <div className="stat-value green-text">
                    {activeEmployees}
                  </div>
                </div>

                <div className="workforce-stat">
                  <div className="stat-label">
                    Departments
                  </div>

                  <div className="stat-value">
                    {departmentCount}
                  </div>
                </div>

              </div>

              {/* EMPLOYEE TABLE */}

              <div className="table-wrapper">

                <table>

                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {loadingEmployees ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="table-empty"
                        >
                          Loading employees...
                        </td>
                      </tr>
                    ) : filteredEmployees.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="table-empty"
                        >
                          No employees found.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees
                        .slice(0, 6)
                        .map((employee) => (
                          <tr
                            key={employee.id}
                            onClick={() =>
                              router.push(
                                `/employees/${employee.id}`
                              )
                            }
                            className="employee-row"
                          >

                            <td>

                              <div className="employee-cell">

                                <div className="employee-avatar">
                                  {employee.name
                                    ?.charAt(0)
                                    ?.toUpperCase()}
                                </div>

                                <div>
                                  <strong>
                                    {employee.name}
                                  </strong>

                                  <span>
                                    {
                                      employee.employee_code
                                    }
                                  </span>
                                </div>

                              </div>

                            </td>

                            <td>
                              {employee.department ||
                                "—"}
                            </td>

                            <td>
                              {employee.designation ||
                                "—"}
                            </td>

                            <td>

                              <span
                                className={`employee-status ${
                                  employee.status
                                    ?.toLowerCase() ===
                                  "active"
                                    ? "active-status"
                                    : "inactive-status"
                                }`}
                              >
                                {employee.status}
                              </span>

                            </td>

                          </tr>
                        ))
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <div className="quick-section">

              <div>
                <h2>Quick Actions</h2>
                <p>
                  Frequently used FirmPulse actions
                </p>
              </div>

              <div className="quick-actions">

                <button
                  onClick={() =>
                    handleNavigation("employees")
                  }
                >
                  <span>👥</span>
                  <strong>
                    Manage Employees
                  </strong>
                  <small>
                    Add or update employees
                  </small>
                </button>

                <button
                  onClick={() =>
                    handleNavigation("tasks")
                  }
                >
                  <span>✓</span>
                  <strong>Create Task</strong>
                  <small>
                    Assign work to employees
                  </small>
                </button>

                <button
                  onClick={() =>
                    handleNavigation("clients")
                  }
                >
                  <span>▣</span>
                  <strong>Manage Clients</strong>
                  <small>
                    View client information
                  </small>
                </button>

                <button
                  onClick={() =>
                    handleNavigation("documents")
                  }
                >
                  <span>▤</span>
                  <strong>Documents</strong>
                  <small>
                    Manage client documents
                  </small>
                </button>

              </div>

            </div>

          </section>

        </main>

      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .app-shell {
          min-height: 100vh;
          background: #f7f5ef;
          color: #1e2a24;
          display: flex;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }

        /* SIDEBAR */

        .sidebar {
          width: 250px;
          background: #18352b;
          color: white;
          min-height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          z-index: 50;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 20px;
        }

        .brand-logo {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: #d8f36d;
          color: #18352b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
        }

        .brand-name {
          font-size: 19px;
          font-weight: 750;
        }

        .brand-subtitle {
          font-size: 11px;
          color: #a9bdb4;
          margin-top: 3px;
        }

        .workspace {
          padding: 8px 20px 10px;
          font-size: 10px;
          letter-spacing: 1.4px;
          color: #789088;
          font-weight: 700;
        }

        .navigation {
          display: flex;
          flex-direction: column;
          padding: 0 12px;
          gap: 4px;
        }

        .nav-item {
          border: none;
          background: transparent;
          color: #b7c8c1;
          padding: 11px 12px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          gap: 11px;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
          transition: 0.2s;
        }

        .nav-item:hover {
          background: #24483b;
          color: white;
        }

        .nav-item.active {
          background: #d8f36d;
          color: #18352b;
          font-weight: 700;
        }

        .nav-icon {
          width: 22px;
          text-align: center;
          font-size: 15px;
        }

        .nav-count {
          margin-left: auto;
          background: #365a4b;
          color: #dce9e4;
          padding: 2px 7px;
          border-radius: 10px;
          font-size: 10px;
        }

        .nav-item.active .nav-count {
          background: #18352b;
          color: white;
        }

        .sidebar-bottom {
          margin-top: auto;
          padding: 16px;
        }

        .help-box {
          display: flex;
          gap: 10px;
          padding: 12px;
          border-radius: 10px;
          background: #214238;
          margin-bottom: 15px;
        }

        .help-icon {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          background: #33594b;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 12px;
        }

        .help-box strong {
          font-size: 12px;
        }

        .help-box p {
          margin: 3px 0 0;
          color: #9eb3aa;
          font-size: 10px;
        }

        .user-profile {
          border-top: 1px solid #2d5044;
          padding-top: 15px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #d8f36d;
          color: #18352b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 750;
          font-size: 12px;
        }

        .avatar.small {
          width: 34px;
          height: 34px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .user-info strong {
          font-size: 12px;
        }

        .user-info span {
          font-size: 10px;
          color: #8fa69d;
          margin-top: 2px;
        }

        .more-button {
          margin-left: auto;
          border: none;
          background: transparent;
          color: #9eb3aa;
          cursor: pointer;
          font-size: 18px;
        }

        /* MAIN */

        .main {
          margin-left: 250px;
          width: calc(100% - 250px);
          min-height: 100vh;
        }

        .header {
          position: relative;
          height: 70px;
          background: #fffefa;
          border-bottom: 1px solid #e5e1d7;
          display: flex;
          align-items: center;
          padding: 0 30px;
        }

        .header-search {
          width: 340px;
          height: 38px;
          background: #f5f3ed;
          border: 1px solid #e6e2d8;
          border-radius: 8px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          gap: 8px;
          color: #8a938e;
        }

        .header-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 12px;
          color: #27352e;
        }

        .header-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .icon-button {
          width: 35px;
          height: 35px;
          border: 1px solid #e3dfd5;
          background: #fffefa;
          border-radius: 8px;
          cursor: pointer;
          position: relative;
          font-size: 16px;
        }

        .icon-button:hover {
          background: #f2f0e8;
        }

        .notification-dot {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 6px;
          height: 6px;
          background: #d8f36d;
          border-radius: 50%;
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 8px;
        }

        .header-user strong {
          display: block;
          font-size: 11px;
        }

        .header-user span {
          display: block;
          font-size: 9px;
          color: #8b948f;
          margin-top: 2px;
        }

        .mobile-menu-button {
          display: none;
        }

        /* CONTENT */

        .content {
          padding: 30px;
          max-width: 1500px;
          margin: 0 auto;
        }

        .page-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 25px;
        }

        .eyebrow {
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: 700;
          color: #78837d;
          margin-bottom: 8px;
        }

        .page-heading h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.5px;
        }

        .page-heading p {
          margin: 7px 0 0;
          color: #7c857f;
          font-size: 13px;
        }

        .primary-button {
          border: none;
          background: #18352b;
          color: white;
          padding: 11px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .primary-button:hover {
          background: #24483b;
        }

        .primary-button span {
          font-size: 18px;
        }

        /* KPI */

        .kpi-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .kpi-card {
          background: #fffefa;
          border: 1px solid #e5e1d7;
          border-radius: 12px;
          padding: 18px;
          min-height: 135px;
        }

        .kpi-card.clickable {
          cursor: pointer;
          transition: 0.2s;
        }

        .kpi-card.clickable:hover {
          transform: translateY(-2px);
          border-color: #b7c8a3;
          box-shadow:
            0 5px 18px rgba(24, 53, 43, 0.06);
        }

        .kpi-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #6e7973;
          font-size: 11px;
          font-weight: 650;
        }

        .kpi-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #f0f4e3;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3f5b4c;
        }

        .kpi-number {
          margin-top: 13px;
          font-size: 29px;
          font-weight: 780;
          letter-spacing: -1px;
        }

        .kpi-description {
          margin-top: 5px;
          color: #8a928d;
          font-size: 10px;
        }

        .green-text {
          color: #4d8065;
          font-weight: 700;
        }

        .orange-text {
          color: #b7773d;
          font-weight: 700;
        }

        /* PANELS */

        .section-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 2fr)
            minmax(260px, 1fr);
          gap: 18px;
          margin-bottom: 20px;
        }

        .panel {
          background: #fffefa;
          border: 1px solid #e5e1d7;
          border-radius: 12px;
          margin-bottom: 20px;
          overflow: hidden;
        }

        .section-grid .panel {
          margin-bottom: 0;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          border-bottom: 1px solid #ece8df;
        }

        .panel-header h2 {
          margin: 0;
          font-size: 15px;
        }

        .panel-header p {
          margin: 4px 0 0;
          font-size: 10px;
          color: #8a938d;
        }

        .text-button {
          border: none;
          background: transparent;
          color: #4d8065;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .text-button:hover {
          text-decoration: underline;
        }

        /* TASK LIST */

        .task-row {
          padding: 15px 20px;
          border-bottom: 1px solid #eeeae2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .task-row:last-child {
          border-bottom: none;
        }

        .task-title {
          font-size: 12px;
          font-weight: 700;
        }

        .task-meta {
          color: #8a938d;
          font-size: 10px;
          margin-top: 5px;
        }

        .task-right {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .priority,
        .status {
          padding: 4px 7px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 700;
        }

        .priority.high {
          background: #f8e4de;
          color: #a54e39;
        }

        .priority.medium {
          background: #f5ecd9;
          color: #99713b;
        }

        .priority.low {
          background: #e4eee8;
          color: #4e7963;
        }

        .status.pending {
          background: #f4eee0;
          color: #97733e;
        }

        .status.progress {
          background: #e1ebf1;
          color: #537087;
        }

        .status.completed {
          background: #e3eee7;
          color: #4e7862;
        }

        .task-date {
          color: #737e78;
          font-size: 10px;
          min-width: 90px;
          text-align: right;
        }

        .empty-state {
          padding: 35px;
          text-align: center;
          color: #8b948f;
          font-size: 12px;
        }

        /* SUMMARY */

        .summary-list {
          padding: 8px 20px 15px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #eeeae2;
          font-size: 11px;
          color: #69736e;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-item strong {
          font-size: 14px;
          color: #25352d;
        }

        .summary-item.danger strong {
          color: #a9533d;
        }

        /* WORKFORCE */

        .workforce-stats {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          border-bottom: 1px solid #e9e5dc;
        }

        .workforce-stat {
          padding: 16px 20px;
          border-right: 1px solid #e9e5dc;
        }

        .workforce-stat:last-child {
          border-right: none;
        }

        .stat-label {
          color: #89918c;
          font-size: 10px;
        }

        .stat-value {
          margin-top: 5px;
          font-size: 22px;
          font-weight: 750;
        }

        /* TABLE */

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 12px 20px;
          background: #faf8f3;
          color: #8a938d;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.7px;
        }

        td {
          padding: 13px 20px;
          border-top: 1px solid #eeeae2;
          font-size: 11px;
          color: #59645e;
        }

        .employee-row {
          cursor: pointer;
          transition: 0.15s;
        }

        .employee-row:hover {
          background: #fafbf6;
        }

        .employee-cell {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .employee-avatar {
          width: 31px;
          height: 31px;
          border-radius: 8px;
          background: #e7eddc;
          color: #456250;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
        }

        .employee-cell strong {
          display: block;
          font-size: 11px;
          color: #27352e;
        }

        .employee-cell span {
          display: block;
          color: #9aa19d;
          font-size: 9px;
          margin-top: 2px;
        }

        .employee-status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 700;
        }

        .active-status {
          background: #e2eee6;
          color: #4c7960;
        }

        .inactive-status {
          background: #eeeae5;
          color: #77736e;
        }

        .table-empty {
          text-align: center;
          padding: 30px;
          color: #8c958f;
        }

        /* RISK PREDICTION */

        .risk-panel {
          margin-bottom: 20px;
        }

        .risk-list {
          padding: 0 20px;
        }

        .risk-row {
          padding: 15px 0;
          border-bottom: 1px solid #eeeae2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .risk-row:last-child {
          border-bottom: none;
        }

        .risk-title {
          font-size: 12px;
          font-weight: 700;
          color: #27352e;
        }

        .risk-reason {
          margin-top: 5px;
          color: #8a938d;
          font-size: 10px;
        }

        .risk-score {
          flex-shrink: 0;
          padding: 6px 10px;
          border-radius: 20px;
          background: #f8e1e1;
          color: #a53d3d;
          font-size: 10px;
          font-weight: 700;
        }

        /* QUICK ACTIONS */

        .quick-section {
          margin-top: 4px;
          margin-bottom: 30px;
        }

        .quick-section h2 {
          margin: 0;
          font-size: 15px;
        }

        .quick-section p {
          margin: 4px 0 14px;
          color: #8a938d;
          font-size: 10px;
        }

        .quick-actions {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 12px;
        }

        .quick-actions button {
          border: 1px solid #e5e1d7;
          background: #fffefa;
          border-radius: 10px;
          padding: 15px;
          text-align: left;
          cursor: pointer;
          transition: 0.2s;
        }

        .quick-actions button:hover {
          border-color: #b9c7a6;
          transform: translateY(-2px);
        }

        .quick-actions span {
          display: block;
          margin-bottom: 12px;
          font-size: 19px;
        }

        .quick-actions strong {
          display: block;
          font-size: 11px;
          color: #27352e;
        }

        .quick-actions small {
          display: block;
          margin-top: 5px;
          color: #8a938d;
          font-size: 9px;
        }

        .pulse-strip {
          display: flex; justify-content: space-between; align-items: center; gap: 20px;
          background: #18352b; color: white; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;
        }
        .pulse-copy { display: flex; align-items: center; gap: 10px; font-size: 11px; }
        .pulse-copy span:last-child { color: #9fb5ab; }
        .pulse-live { color: #d8f36d !important; font-size: 9px; font-weight: 800; letter-spacing: .7px; }
        .pulse-metrics { display: flex; gap: 25px; }
        .pulse-metrics div { min-width: 65px; }
        .pulse-metrics strong { display: block; font-size: 17px; }
        .pulse-metrics span { color: #9fb5ab; font-size: 9px; }
        .panel-actions { display: flex; align-items: center; gap: 12px; }
        .filter-tabs { display: flex; gap: 3px; background: #f4f2eb; padding: 3px; border-radius: 7px; }
        .filter-tabs button { border: 0; background: transparent; color: #7c857f; padding: 5px 7px; border-radius: 5px; font-size: 9px; cursor: pointer; }
        .filter-tabs button.active { background: white; color: #18352b; font-weight: 800; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
        .risk-panel { margin-bottom: 20px; }
        .risk-list { padding: 0 20px; }
        .risk-row { width: 100%; border: 0; border-bottom: 1px solid #eeeae2; background: transparent; padding: 14px 0; display: flex; align-items: center; gap: 12px; text-align: left; cursor: pointer; }
        .risk-row:last-child { border-bottom: 0; }
        .risk-row:hover { background: #fffaf6; }
        .risk-main { flex: 1; }
        .risk-main strong, .risk-main small { display: block; }
        .risk-main strong { font-size: 11px; color: #27352e; }
        .risk-main small { margin-top: 4px; color: #8a938d; font-size: 9px; }
        .risk-score { min-width: 35px; padding: 5px 8px; border-radius: 20px; background: #f8e1e1; color: #a53d3d; font-size: 9px; font-weight: 800; text-align: center; }
        .success-empty { color: #4d8065; }
        .search-results, .notification-panel { position: absolute; z-index: 100; background: #fffefa; border: 1px solid #e5e1d7; border-radius: 10px; box-shadow: 0 12px 35px rgba(24,53,43,.12); }
        .search-results { left: 30px; top: 58px; width: 340px; padding: 7px; }
        .search-results-title { padding: 7px 9px; color: #89918c; font-size: 9px; text-transform: uppercase; letter-spacing: .8px; }
        .search-results button, .notification-item { width: 100%; border: 0; background: transparent; display: flex; align-items: center; gap: 9px; padding: 9px; border-radius: 7px; text-align: left; cursor: pointer; }
        .search-results button:hover, .notification-item:hover { background: #f6f5ef; }
        .search-results button strong, .notification-item strong { display: block; font-size: 10px; color: #27352e; }
        .search-results button small, .notification-item small { display: block; margin-top: 2px; color: #8a938d; font-size: 9px; }
        .result-avatar, .result-icon, .notification-risk { width: 28px; height: 28px; flex: 0 0 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; background: #e7eddc; color: #456250; }
        .notification-panel { right: 85px; top: 58px; width: 300px; padding: 7px; }
        .notification-header { display: flex; justify-content: space-between; padding: 8px; font-size: 11px; }
        .notification-header button { border: 0; background: transparent; font-size: 18px; cursor: pointer; color: #7b857f; }
        .notification-risk { background: #f8e1e1; color: #a53d3d; }
        .no-results { padding: 18px 10px; color: #8a938d; font-size: 10px; text-align: center; }

        /* RESPONSIVE */

        /* TYPOGRAPHY UPGRADE — clearer, larger, more interactive */
        body {
          font-size: 14px;
          line-height: 1.5;
        }
        .sidebar-logo { font-size: 18px !important; }
        .nav-item { font-size: 12px !important; min-height: 42px; }
        .header-search input { font-size: 13px !important; }
        .header-user strong { font-size: 12px !important; }
        .header-user span { font-size: 10px !important; }
        .eyebrow { font-size: 11px !important; }
        .page-heading h1 { font-size: 31px !important; }
        .page-heading p { font-size: 14px !important; line-height: 1.55; }
        .primary-button { font-size: 13px !important; padding: 12px 17px; }
        .kpi-top { font-size: 12px !important; }
        .kpi-number { font-size: 31px !important; }
        .kpi-description { font-size: 11px !important; line-height: 1.45; }
        .panel-header h2, .quick-section h2 { font-size: 17px !important; }
        .panel-header p, .quick-section p { font-size: 11px !important; line-height: 1.45; }
        .text-button { font-size: 12px !important; }
        .task-title { font-size: 14px !important; line-height: 1.35; }
        .task-meta { font-size: 11px !important; }
        .priority, .status { font-size: 10px !important; padding: 5px 8px; }
        .task-date { font-size: 11px !important; }
        .empty-state { font-size: 13px !important; }
        .summary-item { font-size: 12px !important; }
        .summary-item strong { font-size: 15px !important; }
        .stat-label { font-size: 11px !important; }
        .stat-value { font-size: 24px !important; }
        th { font-size: 10px !important; }
        td { font-size: 12px !important; }
        .employee-cell strong { font-size: 12px !important; }
        .employee-cell span { font-size: 10px !important; }
        .employee-status { font-size: 10px !important; }
        .risk-title, .risk-main strong { font-size: 13px !important; }
        .risk-reason, .risk-main small { font-size: 11px !important; }
        .risk-score { font-size: 10px !important; }
        .quick-actions strong { font-size: 12px !important; }
        .quick-actions small { font-size: 10px !important; }
        .pulse-copy { font-size: 12px !important; }
        .pulse-live { font-size: 10px !important; }
        .pulse-metrics strong { font-size: 19px !important; }
        .pulse-metrics span { font-size: 10px !important; }
        .filter-tabs button { font-size: 10px !important; padding: 6px 9px; }
        .search-results-title { font-size: 10px !important; }
        .search-results button strong, .notification-item strong { font-size: 11px !important; }
        .search-results button small, .notification-item small { font-size: 10px !important; }
        .notification-header { font-size: 12px !important; }
        .no-results { font-size: 11px !important; }

        /* POLISHED INTERACTION LAYER */
        .app-shell {
          background: radial-gradient(circle at 88% 0%, rgba(216,243,109,.10), transparent 24%), #f5f3ed;
        }
        .sidebar { box-shadow: 8px 0 30px rgba(24,53,43,.08); }
        .nav-item, .kpi-card, .panel, .quick-actions button, .icon-button, .text-button, .primary-button {
          transition: transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease;
        }
        .nav-item:hover { transform: translateX(3px); background: rgba(255,255,255,.09); }
        .nav-item.active { box-shadow: inset 3px 0 0 #d8f36d; }
        .kpi-card { position: relative; overflow: hidden; border: 1px solid rgba(24,53,43,.07); box-shadow: 0 10px 28px rgba(31,42,36,.045); }
        .kpi-card::after { content: ""; position: absolute; width: 90px; height: 90px; right: -35px; top: -35px; border-radius: 50%; background: rgba(216,243,109,.12); pointer-events: none; }
        .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 16px 34px rgba(31,42,36,.09); }
        .panel { border: 1px solid rgba(24,53,43,.07); box-shadow: 0 10px 28px rgba(31,42,36,.045); }
        .panel:hover { box-shadow: 0 14px 34px rgba(31,42,36,.065); }
        .panel-header-actions { display: flex; align-items: center; gap: 12px; }
        .filter-tabs { border: 1px solid #e5e1d7 !important; box-shadow: 0 2px 8px rgba(31,42,36,.04); }
        .filter-tabs button:hover { color: #18352b; background: rgba(255,255,255,.72); }
        .search-results, .notification-panel { border: 1px solid #e4e1d8; box-shadow: 0 18px 40px rgba(31,42,36,.12); animation: dropdownIn .16s ease-out; }
        .search-results button { transition: background .15s ease; }
        .search-results button:hover { background: #f4f7ee; }
        .notification-item:hover { background: #fff8f6; }
        .risk-row { transition: background .15s ease, transform .15s ease; }
        button.risk-row:hover { background: #fff8f6; transform: translateX(3px); }
        .quick-actions button { border: 1px solid #e6e2d9; }
        .quick-actions button:hover { transform: translateY(-3px); border-color: #cad7b1; box-shadow: 0 12px 25px rgba(31,42,36,.08); }
        .employee-row { transition: background .15s ease; cursor: pointer; }
        .employee-row:hover { background: #f6f8f2; }
        .primary-button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(24,53,43,.15); }
        .icon-button:hover { transform: translateY(-1px); background: #eef2e7; }
        @keyframes dropdownIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1100px) {

          .kpi-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .section-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }

        @media (max-width: 800px) {

          .sidebar {
            transform: translateX(-100%);
            transition: 0.25s;
          }

          .sidebar.sidebar-open {
            transform: translateX(0);
          }

          .main {
            margin-left: 0;
            width: 100%;
          }

          .mobile-menu-button {
            display: block;
            border: none;
            background: transparent;
            font-size: 21px;
            margin-right: 12px;
            cursor: pointer;
          }

          .header {
            padding: 0 15px;
          }

          .header-search {
            width: auto;
            flex: 1;
          }

          .header-user {
            display: none;
          }

          .content {
            padding: 20px 15px;
          }

          .page-heading {
            align-items: flex-start;
            gap: 15px;
            flex-direction: column;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .workforce-stats {
            grid-template-columns: 1fr;
          }

          .workforce-stat {
            border-right: none;
            border-bottom: 1px solid #e9e5dc;
          }

          .quick-actions {
            grid-template-columns: 1fr;
          }

          .pulse-strip { flex-direction: column; align-items: flex-start; }
          .pulse-metrics { width: 100%; justify-content: space-between; }
          .panel-actions { align-items: flex-end; flex-direction: column; }
          .panel-header-actions { width: 100%; flex-direction: column; align-items: stretch; }
          .panel-header-actions .text-button { align-self: flex-end; }
          .filter-tabs { width: 100%; }
          .filter-tabs button { flex: 1; }
          .search-results { left: 55px; right: 15px; width: auto; }
          .notification-panel { right: 15px; width: min(300px, calc(100vw - 30px)); }

          .task-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .task-right {
            justify-content: flex-start;
          }

        }

      `}</style>
    </>
  );
}