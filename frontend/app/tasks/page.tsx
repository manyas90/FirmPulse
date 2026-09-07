"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Employee = {
  id: number;
  employee_code: string;
  name: string;
  department?: string;
  designation?: string;
  status: string;
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
  created_at: string;
  updated_at: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");

  /* =========================
     FETCH DATA
  ========================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const [tasksResponse, employeesResponse] =
        await Promise.all([
          fetch(`${API_URL}/tasks/`, {
            cache: "no-store",
          }),
          fetch(`${API_URL}/employees/`, {
            cache: "no-store",
          }),
        ]);

      if (!tasksResponse.ok) {
        throw new Error("Failed to fetch tasks");
      }

      if (!employeesResponse.ok) {
        throw new Error("Failed to fetch employees");
      }

      const taskData = await tasksResponse.json();
      const employeeData = await employeesResponse.json();

      setTasks(taskData);
      setEmployees(employeeData);
    } catch (error) {
      console.error(error);
      alert("Unable to load task data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* =========================
     EMPLOYEE NAME
  ========================= */

  const getEmployeeName = (id?: number | null) => {
    if (!id) {
      return "Unassigned";
    }

    const employee = employees.find(
      (item) => item.id === id
    );

    return employee
      ? employee.name
      : "Unknown Employee";
  };

  /* =========================
     OVERDUE CHECK
  ========================= */

  const isOverdue = (task: Task) => {
    if (
      !task.due_date ||
      task.status === "Completed"
    ) {
      return false;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const due = new Date(task.due_date);

    due.setHours(0, 0, 0, 0);

    return due < today;
  };

  /* =========================
     STATISTICS
  ========================= */

  const statistics = useMemo(() => {
    const total = tasks.length;

    const pending = tasks.filter(
      (task) => task.status === "Pending"
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === "In Progress"
    ).length;

    const completed = tasks.filter(
      (task) => task.status === "Completed"
    ).length;

    const overdue = tasks.filter(
      (task) => isOverdue(task)
    ).length;

    return {
      total,
      pending,
      inProgress,
      completed,
      overdue,
    };
  }, [tasks]);

  /* =========================
     FILTER TASKS
  ========================= */

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        task.title
          .toLowerCase()
          .includes(searchText) ||
        (task.client_name || "")
          .toLowerCase()
          .includes(searchText) ||
        getEmployeeName(
          task.assigned_employee_id
        )
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
    employees,
  ]);

  /* =========================
     FORM RESET
  ========================= */

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setClientName("");
    setEmployeeId("");
    setPriority("Medium");
    setStatus("Pending");
    setDueDate("");
    setEditingTask(null);
  };

  /* =========================
     ADD TASK
  ========================= */

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  /* =========================
     EDIT TASK
  ========================= */

  const openEditModal = (task: Task) => {
    setEditingTask(task);

    setTitle(task.title);

    setDescription(
      task.description || ""
    );

    setClientName(
      task.client_name || ""
    );

    setEmployeeId(
      task.assigned_employee_id
        ? String(task.assigned_employee_id)
        : ""
    );

    setPriority(task.priority);

    setStatus(task.status);

    setDueDate(task.due_date || "");

    setShowModal(true);
  };

  /* =========================
     CLOSE MODAL
  ========================= */

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  /* =========================
     CREATE / UPDATE TASK
  ========================= */

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      alert("Task title is required.");
      return;
    }

    const payload = {
      title: title.trim(),

      description:
        description.trim() || null,

      client_name:
        clientName.trim() || null,

      assigned_employee_id: employeeId
        ? Number(employeeId)
        : null,

      priority,

      status,

      due_date: dueDate || null,
    };

    try {
      const url = editingTask
        ? `${API_URL}/tasks/${editingTask.id}`
        : `${API_URL}/tasks/`;

      const method = editingTask
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to save task"
        );
      }

      closeModal();

      await fetchData();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to save task."
      );
    }
  };

  /* =========================
     DELETE TASK
  ========================= */

  const deleteTask = async (
    task: Task
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${task.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/tasks/${task.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to delete task"
        );
      }

      await fetchData();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to delete task."
      );
    }
  };

  /* =========================
     EMPLOYEE WORKLOAD
  ========================= */

  const employeeWorkload =
    useMemo(() => {
      return employees.map(
        (employee) => {
          const employeeTasks =
            tasks.filter(
              (task) =>
                task.assigned_employee_id ===
                employee.id
            );

          const completed =
            employeeTasks.filter(
              (task) =>
                task.status ===
                "Completed"
            ).length;

          const pending =
            employeeTasks.filter(
              (task) =>
                task.status !==
                "Completed"
            ).length;

          const workload =
            employeeTasks.length === 0
              ? 0
              : Math.min(
                  employeeTasks.length *
                    20,
                  100
                );

          return {
            employee,
            total:
              employeeTasks.length,
            completed,
            pending,
            workload,
          };
        }
      );
    }, [employees, tasks]);

  return (
    <div className="appLayout">

      {/* =================================
          SIDEBAR
      ================================= */}

      <aside className="sidebar">

        {/* Logo */}

        <div className="sidebarLogo">

          <div className="logoIcon">
            F
          </div>

          <div>
            <h2>
              FirmPulse
            </h2>

            <span>
              Firm Management
            </span>
          </div>

        </div>

        {/* Navigation */}

        <nav className="sidebarNav">

          <a href="/dashboard">
            <span className="navIcon">
              ⌂
            </span>

            Dashboard
          </a>

          <a href="/employees">
            <span className="navIcon">
              👥
            </span>

            Employees
          </a>

          <a href="/clients">
            <span className="navIcon">
              ◉
            </span>

            Clients
          </a>

          <a
            href="/tasks"
            className="active"
          >
            <span className="navIcon">
              ✓
            </span>

            Tasks & Workload
          </a>

          <a href="/documents">
            <span className="navIcon">
              ▣
            </span>

            Documents
          </a>

          <a href="/compliance">
            <span className="navIcon">
              ✓
            </span>

            Compliance
          </a>

          <a href="/communications">
            <span className="navIcon">
              ✉
            </span>

            Communications
          </a>

          <a href="/analytics">
            <span className="navIcon">
              ▥
            </span>

            Analytics
          </a>

        </nav>

        {/* Bottom Sidebar */}

        <div className="sidebarBottom">

          <a href="/settings">

            <span className="navIcon">
              ⚙
            </span>

            Settings

          </a>

          <div className="userBox">

            <div className="avatar">
              A
            </div>

            <div>
              <strong>
                Admin
              </strong>

              <small>
                Administrator
              </small>
            </div>

          </div>

        </div>

      </aside>

      {/* =================================
          MAIN CONTENT
      ================================= */}

      <main className="page">

        {/* Header */}

        <div className="header">

          <div>

            <h1>
              Tasks & Workload
            </h1>

            <p>
              Manage tasks, deadlines and
              employee workload.
            </p>

          </div>

          <button
            className="primaryButton"
            onClick={
              openAddModal
            }
          >
            + Add Task
          </button>

        </div>

        {/* =================================
            STATISTICS
        ================================= */}

        <section className="statsGrid">

          <div className="statCard">

            <span>
              Total Tasks
            </span>

            <strong>
              {statistics.total}
            </strong>

          </div>

          <div className="statCard">

            <span>
              Pending
            </span>

            <strong>
              {statistics.pending}
            </strong>

          </div>

          <div className="statCard">

            <span>
              In Progress
            </span>

            <strong>
              {statistics.inProgress}
            </strong>

          </div>

          <div className="statCard">

            <span>
              Completed
            </span>

            <strong>
              {statistics.completed}
            </strong>

          </div>

          <div className="statCard overdueCard">

            <span>
              Overdue
            </span>

            <strong>
              {statistics.overdue}
            </strong>

          </div>

        </section>

        {/* =================================
            FILTERS
        ================================= */}

        <section className="filterCard">

          <input
            type="text"
            placeholder="Search task, client or employee..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >

            <option value="All">
              All Status
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Completed">
              Completed
            </option>

          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value
              )
            }
          >

            <option value="All">
              All Priority
            </option>

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>

          </select>

        </section>

        {/* =================================
            TASK TABLE
        ================================= */}

        <section className="tableCard">

          <div className="sectionTitle">

            <h2>
              Task List
            </h2>

            <span>
              {filteredTasks.length} tasks
            </span>

          </div>

          {loading ? (

            <div className="emptyState">
              Loading tasks...
            </div>

          ) : filteredTasks.length ===
            0 ? (

            <div className="emptyState">
              No tasks found.
            </div>

          ) : (

            <div className="tableWrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      Task
                    </th>

                    <th>
                      Client
                    </th>

                    <th>
                      Employee
                    </th>

                    <th>
                      Priority
                    </th>

                    <th>
                      Due Date
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredTasks.map(
                    (task) => (

                      <tr key={task.id}>

                        <td>

                          <div className="taskTitle">
                            {task.title}
                          </div>

                          {task.description && (

                            <div className="taskDescription">
                              {task.description}
                            </div>

                          )}

                        </td>

                        <td>
                          {task.client_name ||
                            "—"}
                        </td>

                        <td>
                          {getEmployeeName(
                            task.assigned_employee_id
                          )}
                        </td>

                        <td>

                          <span
                            className={`priority ${task.priority.toLowerCase()}`}
                          >
                            {task.priority}
                          </span>

                        </td>

                        <td>

                          <span
                            className={
                              isOverdue(
                                task
                              )
                                ? "overdueText"
                                : ""
                            }
                          >

                            {task.due_date
                              ? new Date(
                                  task.due_date
                                ).toLocaleDateString()
                              : "—"}

                          </span>

                        </td>

                        <td>

                          <span
                            className={`status ${task.status
                              .toLowerCase()
                              .replace(
                                " ",
                                "-"
                              )}`}
                          >
                            {task.status}
                          </span>

                        </td>

                        <td>

                          <div className="actions">

                            <button
                              onClick={() =>
                                openEditModal(
                                  task
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="deleteButton"
                              onClick={() =>
                                deleteTask(
                                  task
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* =================================
            EMPLOYEE WORKLOAD
        ================================= */}

        <section className="tableCard">

          <div className="sectionTitle">

            <div>

              <h2>
                Employee Workload
              </h2>

              <p>
                Current task distribution
                across employees.
              </p>

            </div>

          </div>

          {employeeWorkload.length ===
          0 ? (

            <div className="emptyState">
              No employees available.
            </div>

          ) : (

            <div className="tableWrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      Employee
                    </th>

                    <th>
                      Department
                    </th>

                    <th>
                      Total Tasks
                    </th>

                    <th>
                      Completed
                    </th>

                    <th>
                      Pending
                    </th>

                    <th>
                      Workload
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {employeeWorkload.map(
                    (item) => (

                      <tr
                        key={
                          item.employee.id
                        }
                      >

                        <td>

                          <strong>
                            {
                              item
                                .employee
                                .name
                            }
                          </strong>

                          <div className="employeeCode">
                            {
                              item
                                .employee
                                .employee_code
                            }
                          </div>

                        </td>

                        <td>
                          {
                            item.employee
                              .department ||
                            "—"
                          }
                        </td>

                        <td>
                          {item.total}
                        </td>

                        <td>
                          {item.completed}
                        </td>

                        <td>
                          {item.pending}
                        </td>

                        <td>

                          <div className="workloadBox">

                            <div className="progressTrack">

                              <div
                                className="progressBar"
                                style={{
                                  width: `${item.workload}%`,
                                }}
                              />

                            </div>

                            <span>
                              {
                                item.workload
                              }%
                            </span>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

      {/* =================================
          ADD / EDIT MODAL
      ================================= */}

      {showModal && (

        <div className="modalOverlay">

          <div className="modal">

            <div className="modalHeader">

              <div>

                <h2>

                  {editingTask
                    ? "Edit Task"
                    : "Add New Task"}

                </h2>

                <p>
                  Enter task information
                  below.
                </p>

              </div>

              <button
                className="closeButton"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >

              {/* Task title */}

              <label>

                Task Title *

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="Enter task title"
                  required
                />

              </label>

              {/* Description */}

              <label>

                Description

                <textarea
                  value={
                    description
                  }
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Enter task description"
                  rows={3}
                />

              </label>

              {/* Client */}

              <label>

                Client

                <input
                  value={
                    clientName
                  }
                  onChange={(event) =>
                    setClientName(
                      event.target.value
                    )
                  }
                  placeholder="Enter client name"
                />

              </label>

              {/* Employee */}

              <label>

                Assign Employee

                <select
                  value={
                    employeeId
                  }
                  onChange={(event) =>
                    setEmployeeId(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Unassigned
                  </option>

                  {employees.map(
                    (employee) => (

                      <option
                        key={
                          employee.id
                        }
                        value={
                          employee.id
                        }
                      >

                        {
                          employee.name
                        }{" "}
                        (
                        {
                          employee.employee_code
                        }
                        )

                      </option>

                    )
                  )}

                </select>

              </label>

              {/* Priority / Status */}

              <div className="formGrid">

                <label>

                  Priority

                  <select
                    value={
                      priority
                    }
                    onChange={(event) =>
                      setPriority(
                        event.target.value
                      )
                    }
                  >

                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                  </select>

                </label>

                <label>

                  Status

                  <select
                    value={
                      status
                    }
                    onChange={(event) =>
                      setStatus(
                        event.target.value
                      )
                    }
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                  </select>

                </label>

              </div>

              {/* Due date */}

              <label>

                Due Date

                <input
                  type="date"
                  value={
                    dueDate
                  }
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                />

              </label>

              {/* Buttons */}

              <div className="modalActions">

                <button
                  type="button"
                  className="secondaryButton"
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primaryButton"
                >

                  {editingTask
                    ? "Update Task"
                    : "Create Task"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================
          CSS
      ================================= */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .appLayout {
          min-height: 100vh;
          background: #f6f7f3;
        }

        /* =========================
           SIDEBAR
        ========================= */

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 245px;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          z-index: 100;
        }

        .sidebarLogo {
          height: 78px;
          padding: 0 22px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .logoIcon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #166534;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .sidebarLogo h2 {
          margin: 0;
          font-size: 19px;
          color: #17211b;
        }

        .sidebarLogo span {
          display: block;
          margin-top: 3px;
          color: #6b7280;
          font-size: 11px;
        }

        .sidebarNav {
          flex: 1;
          padding: 20px 12px;
          overflow-y: auto;
        }

        .sidebarNav a,
        .sidebarBottom > a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 13px;
          margin-bottom: 5px;
          border-radius: 8px;
          color: #4b5563;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .sidebarNav a:hover,
        .sidebarBottom > a:hover {
          background: #f0fdf4;
          color: #166534;
        }

        .sidebarNav a.active {
          background: #dcfce7;
          color: #166534;
          font-weight: 600;
        }

        .navIcon {
          width: 22px;
          min-width: 22px;
          text-align: center;
          font-size: 16px;
        }

        .sidebarBottom {
          padding: 14px 12px;
          border-top: 1px solid #e5e7eb;
        }

        .userBox {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
          padding: 10px;
          background: #f9fafb;
          border-radius: 9px;
        }

        .avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #166534;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .userBox strong {
          display: block;
          font-size: 13px;
          color: #17211b;
        }

        .userBox small {
          display: block;
          margin-top: 2px;
          color: #6b7280;
          font-size: 11px;
        }

        /* =========================
           MAIN PAGE
        ========================= */

        .page {
          min-height: 100vh;
          padding: 32px;
          margin-left: 245px;
          box-sizing: border-box;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        h1 {
          margin: 0;
          font-size: 32px;
          color: #17211b;
        }

        .header p,
        .sectionTitle p {
          margin: 6px 0 0;
          color: #6b7280;
        }

        .primaryButton {
          border: none;
          background: #166534;
          color: white;
          padding: 11px 18px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .primaryButton:hover {
          background: #14532d;
        }

        /* =========================
           STATISTICS
        ========================= */

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .statCard {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
        }

        .statCard span {
          color: #6b7280;
          font-size: 14px;
        }

        .statCard strong {
          display: block;
          margin-top: 8px;
          font-size: 28px;
          color: #17211b;
        }

        .overdueCard {
          border-color: #fecaca;
        }

        /* =========================
           FILTERS
        ========================= */

        .filterCard {
          display: flex;
          gap: 12px;
          background: white;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        input,
        select,
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          background: white;
          color: #17211b;
          outline: none;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #166534;
          box-shadow: 0 0 0 2px rgba(22, 101, 52, 0.08);
        }

        .filterCard input {
          flex: 1;
        }

        .filterCard select {
          width: 180px;
        }

        /* =========================
           TABLE
        ========================= */

        .tableCard {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          margin-bottom: 22px;
          overflow: hidden;
        }

        .sectionTitle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .sectionTitle h2 {
          margin: 0;
          font-size: 20px;
          color: #17211b;
        }

        .sectionTitle span {
          color: #6b7280;
          font-size: 14px;
        }

        .tableWrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 15px 18px;
          text-align: left;
          border-bottom: 1px solid #f0f0f0;
          white-space: nowrap;
        }

        th {
          background: #fafafa;
          color: #6b7280;
          font-size: 13px;
          font-weight: 600;
        }

        td {
          font-size: 14px;
          color: #374151;
        }

        tbody tr:hover {
          background: #fafcf9;
        }

        .taskTitle {
          font-weight: 600;
          color: #17211b;
        }

        .taskDescription {
          margin-top: 4px;
          color: #6b7280;
          font-size: 12px;
          max-width: 260px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* =========================
           BADGES
        ========================= */

        .priority,
        .status {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }

        .priority.high {
          background: #fee2e2;
          color: #991b1b;
        }

        .priority.medium {
          background: #fef3c7;
          color: #92400e;
        }

        .priority.low {
          background: #dcfce7;
          color: #166534;
        }

        .status.pending {
          background: #f3f4f6;
          color: #374151;
        }

        .status.in-progress {
          background: #dbeafe;
          color: #1e40af;
        }

        .status.completed {
          background: #dcfce7;
          color: #166534;
        }

        .overdueText {
          color: #dc2626;
          font-weight: 600;
        }

        /* =========================
           ACTIONS
        ========================= */

        .actions {
          display: flex;
          gap: 8px;
        }

        .actions button {
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 13px;
        }

        .actions button:hover {
          background: #f9fafb;
        }

        .actions .deleteButton {
          color: #dc2626;
        }

        /* =========================
           EMPLOYEE WORKLOAD
        ========================= */

        .employeeCode {
          color: #6b7280;
          font-size: 12px;
          margin-top: 3px;
        }

        .workloadBox {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 150px;
        }

        .progressTrack {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 99px;
          overflow: hidden;
        }

        .progressBar {
          height: 100%;
          background: #166534;
          border-radius: 99px;
        }

        .emptyState {
          padding: 50px;
          text-align: center;
          color: #6b7280;
        }

        /* =========================
           MODAL
        ========================= */

        .modalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          z-index: 1000;
        }

        .modal {
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
        }

        .modalHeader {
          display: flex;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .modalHeader h2 {
          margin: 0;
          color: #17211b;
        }

        .modalHeader p {
          margin: 5px 0 0;
          color: #6b7280;
        }

        .closeButton {
          border: none;
          background: transparent;
          font-size: 28px;
          cursor: pointer;
          height: 35px;
          color: #6b7280;
        }

        .closeButton:hover {
          color: #111827;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        textarea {
          resize: vertical;
        }

        .formGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .modalActions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
        }

        .secondaryButton {
          border: 1px solid #d1d5db;
          background: white;
          padding: 11px 18px;
          border-radius: 8px;
          cursor: pointer;
        }

        .secondaryButton:hover {
          background: #f9fafb;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 1200px) {

          .statsGrid {
            grid-template-columns:
              repeat(3, 1fr);
          }

        }

        @media (max-width: 900px) {

          .sidebar {
            position: relative;
            width: 100%;
            height: auto;
            min-height: auto;
          }

          .sidebarLogo {
            height: 70px;
          }

          .sidebarNav {
            display: flex;
            overflow-x: auto;
            padding: 10px;
            gap: 5px;
          }

          .sidebarNav a {
            min-width: max-content;
            margin: 0;
          }

          .sidebarBottom {
            display: none;
          }

          .page {
            margin-left: 0;
            padding: 24px;
          }

        }

        @media (max-width: 700px) {

          .page {
            padding: 20px;
          }

          .header {
            align-items: flex-start;
            gap: 15px;
            flex-direction: column;
          }

          .filterCard {
            flex-direction: column;
          }

          .filterCard select {
            width: 100%;
          }

          .statsGrid {
            grid-template-columns: 1fr;
          }

          .formGrid {
            grid-template-columns: 1fr;
          }

          .modal {
            padding: 20px;
          }

        }

      `}</style>

    </div>
  );
}