"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./employees.module.css";

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

type EmployeeForm = {
  employee_code: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  date_of_joining: string;
  status: string;
  manager: string;
};

const emptyForm: EmployeeForm = {
  employee_code: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  date_of_joining: "",
  status: "Active",
  manager: "",
};

export default function EmployeesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  /* -----------------------------------------
     FETCH EMPLOYEES
  ----------------------------------------- */

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/employees/`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the server. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /* -----------------------------------------
     FILTER OPTIONS
  ----------------------------------------- */

  const departments = useMemo(() => {
    const values = employees
      .map((employee) => employee.department)
      .filter(Boolean) as string[];

    return ["All", ...Array.from(new Set(values))];
  }, [employees]);

  /* -----------------------------------------
     FILTER EMPLOYEES
  ----------------------------------------- */

  const filteredEmployees = useMemo(() => {
    const query = search.toLowerCase().trim();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.employee_code.toLowerCase().includes(query) ||
        (employee.designation || "").toLowerCase().includes(query) ||
        (employee.department || "").toLowerCase().includes(query);

      const matchesDepartment =
        departmentFilter === "All" ||
        employee.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All" || employee.status === statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [
    employees,
    search,
    departmentFilter,
    statusFilter,
  ]);

  /* -----------------------------------------
     STATISTICS
  ----------------------------------------- */

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) =>
      employee.status.toLowerCase() === "active"
  ).length;

  const onLeaveEmployees = employees.filter(
    (employee) =>
      employee.status.toLowerCase() === "on leave"
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) =>
      employee.status.toLowerCase() === "inactive"
  ).length;

  /* -----------------------------------------
     OPEN ADD MODAL
  ----------------------------------------- */

  const openAddModal = () => {
    setEditingEmployee(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  /* -----------------------------------------
     OPEN EDIT MODAL
  ----------------------------------------- */

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);

    setForm({
      employee_code: employee.employee_code,
      name: employee.name,
      email: employee.email,
      phone: employee.phone || "",
      department: employee.department || "",
      designation: employee.designation || "",
      date_of_joining: employee.date_of_joining || "",
      status: employee.status || "Active",
      manager: employee.manager || "",
    });

    setShowDetails(false);
    setShowModal(true);
  };

  /* -----------------------------------------
     FORM INPUT
  ----------------------------------------- */

  const handleInputChange = (
    field: keyof EmployeeForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* -----------------------------------------
     SAVE EMPLOYEE
  ----------------------------------------- */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      let response: Response;

      if (editingEmployee) {
        const updateData = {
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          department: form.department || null,
          designation: form.designation || null,
          date_of_joining:
            form.date_of_joining || null,
          status: form.status,
          manager: form.manager || null,
        };

        response = await fetch(
          `${API_URL}/employees/${editingEmployee.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );
      } else {
        const createData = {
          employee_code: form.employee_code,
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          department: form.department || null,
          designation: form.designation || null,
          date_of_joining:
            form.date_of_joining || null,
          status: form.status,
          manager: form.manager || null,
        };

        response = await fetch(`${API_URL}/employees/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createData),
        });
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data?.detail ||
          "Unable to save employee.";

        throw new Error(
          Array.isArray(message)
            ? message.map((item: any) => item.msg).join(", ")
            : message
        );
      }

      setShowModal(false);
      setEditingEmployee(null);
      setForm(emptyForm);

      await fetchEmployees();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  /* -----------------------------------------
     DELETE EMPLOYEE
  ----------------------------------------- */

  const handleDelete = async (employee: Employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}?`
    );

    if (!confirmed) return;

    try {
      setDeleting(employee.id);
      setError("");

      const response = await fetch(
        `${API_URL}/employees/${employee.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Unable to delete employee."
        );
      }

      if (selectedEmployee?.id === employee.id) {
        setSelectedEmployee(null);
        setShowDetails(false);
      }

      await fetchEmployees();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Unable to delete employee."
      );
    } finally {
      setDeleting(null);
    }
  };

  /* -----------------------------------------
     EMPLOYEE DETAILS
  ----------------------------------------- */

  const openDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDetails(true);
  };

  /* -----------------------------------------
     FORMAT DATE
  ----------------------------------------- */

  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* -----------------------------------------
     STATUS CLASS
  ----------------------------------------- */

  const getStatusClass = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === "active") {
      return styles.statusActive;
    }

    if (normalized === "on leave") {
      return styles.statusLeave;
    }

    return styles.statusInactive;
  };

  /* -----------------------------------------
     INITIALS
  ----------------------------------------- */

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <main className={styles.page}>
      {/* -----------------------------------------
          SIDEBAR NAVIGATION
      ----------------------------------------- */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarLogo}>
          <div className={styles.sidebarLogoMark}>FP</div>
          <strong>FirmPulse</strong>
        </div>

        <div className={styles.sidebarSectionTitle}>Workspace</div>
        <nav className={styles.sidebarNav}>
          <Link href="/" className={styles.sidebarItem}>
            <span className={styles.sidebarIcon}>⌂</span><span>Dashboard</span>
          </Link>
          <Link href="/employees" className={`${styles.sidebarItem} ${styles.active}`}>
            <span className={styles.sidebarIcon}>👥</span><span>Employees</span>
          </Link>
          <Link href="/tasks" className={styles.sidebarItem}>
            <span className={styles.sidebarIcon}>✓</span><span>Tasks</span>
          </Link>
          <Link href="/clients" className={styles.sidebarItem}>
            <span className={styles.sidebarIcon}>▣</span><span>Clients</span>
          </Link>
          <Link href="/documents" className={styles.sidebarItem}>
            <span className={styles.sidebarIcon}>▤</span><span>Documents</span>
          </Link>
          <Link href="/compliance" className={styles.sidebarItem}>
            <span className={styles.sidebarIcon}>▦</span><span>Compliance</span>
          </Link>
          <Link href="/communications" className={styles.sidebarItem}>
            <span className={styles.sidebarIcon}>✉</span><span>Communications</span>
          </Link>
          <Link href="/analytics" className={styles.sidebarItem}>
            <span className={styles.sidebarIcon}>▥</span><span>Analytics</span>
          </Link>
          <Link href="/risk-prediction" className={styles.sidebarItem}>
            <span className={styles.sidebarIcon}>⚠</span><span>Risk Prediction</span>
          </Link>
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarProfile}>
            <div className={styles.sidebarProfileAvatar}>FP</div>
            <div>
              <strong>FirmPulse Workspace</strong>
              <span>Practice Management</span>
            </div>
          </div>
        </div>
      </aside>

      {/* -----------------------------------------
          TOP NAVIGATION
      ----------------------------------------- */}

      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => setSidebarOpen((value) => !value)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <div className={styles.brandArea}>
          <div className={styles.logo}>FP</div>

          <div>
            <h1>FirmPulse</h1>
            <p>Employee Management</p>
          </div>
        </div>

        <div className={styles.topbarRight}>
          <div className={styles.connection}>
            <span className={styles.connectionDot}></span>
            API Connected
          </div>

          <button
            className={styles.refreshButton}
            onClick={fetchEmployees}
            title="Refresh employees"
          >
            ↻
          </button>

          <button
            className={styles.addButton}
            onClick={openAddModal}
          >
            <span>+</span>
            Add Employee
          </button>
        </div>
      </header>

      <section className={`${styles.content} ${styles.withSidebar}`}>
        {/* -----------------------------------------
            PAGE HEADER
        ----------------------------------------- */}

        <div className={styles.pageHeader}>
          <div>
            <div className={styles.breadcrumb}>
              Dashboard <span>/</span> Employees
            </div>

            <h2>Employees</h2>

            <p>
              Manage your team, employee information and
              workforce status.
            </p>
          </div>

          <div className={styles.headerDate}>
            <span>WORKFORCE</span>
            <strong>{totalEmployees}</strong>
            <small>Total employees</small>
          </div>
        </div>

        {/* -----------------------------------------
            ERROR MESSAGE
        ----------------------------------------- */}

        {error && (
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>!</span>

            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>

            <button
              onClick={() => setError("")}
              className={styles.closeError}
            >
              ×
            </button>
          </div>
        )}

        {/* -----------------------------------------
            STAT CARDS
        ----------------------------------------- */}

        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statPrimary}`}>
            <div className={styles.statIcon}>👥</div>

            <div>
              <span>Total Employees</span>
              <strong>{totalEmployees}</strong>
              <small>Entire workforce</small>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={`${styles.statIcon} ${styles.iconGreen}`}
            >
              ✓
            </div>

            <div>
              <span>Active</span>
              <strong>{activeEmployees}</strong>
              <small>Currently working</small>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={`${styles.statIcon} ${styles.iconOrange}`}
            >
              ◷
            </div>

            <div>
              <span>On Leave</span>
              <strong>{onLeaveEmployees}</strong>
              <small>Temporarily away</small>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={`${styles.statIcon} ${styles.iconRed}`}
            >
              •
            </div>

            <div>
              <span>Inactive</span>
              <strong>{inactiveEmployees}</strong>
              <small>Not active</small>
            </div>
          </div>
        </div>

        {/* -----------------------------------------
            TOOLBAR
        ----------------------------------------- */}

        <section className={styles.employeeSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>Employee Directory</h3>
              <p>
                {filteredEmployees.length} employee
                {filteredEmployees.length !== 1 ? "s" : ""}{" "}
                shown
              </p>
            </div>

            <div className={styles.sectionActions}>
              <button
                className={styles.secondaryButton}
                onClick={openAddModal}
              >
                + New Employee
              </button>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search by name, code, email, department..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  className={styles.clearSearch}
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            <div className={styles.filterGroup}>
              <select
                value={departmentFilter}
                onChange={(event) =>
                  setDepartmentFilter(event.target.value)
                }
              >
                {departments.map((department) => (
                  <option
                    key={department}
                    value={department}
                  >
                    {department === "All"
                      ? "All Departments"
                      : department}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* -----------------------------------------
              TABLE
          ----------------------------------------- */}

          <div className={styles.tableWrapper}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <h4>Loading employees...</h4>
                <p>
                  Getting the latest employee information.
                </p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👥</div>

                <h4>
                  {employees.length === 0
                    ? "No employees yet"
                    : "No employees found"}
                </h4>

                <p>
                  {employees.length === 0
                    ? "Add your first employee to start building the directory."
                    : "Try changing your search or filters."}
                </p>

                {employees.length === 0 ? (
                  <button
                    className={styles.addButton}
                    onClick={openAddModal}
                  >
                    + Add First Employee
                  </button>
                ) : (
                  <button
                    className={styles.secondaryButton}
                    onClick={() => {
                      setSearch("");
                      setDepartmentFilter("All");
                      setStatusFilter("All");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Joining Date</th>
                    <th>Status</th>
                    <th className={styles.actionHeader}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className={styles.tableRow}
                    >
                      <td>
                        <button
                          className={styles.employeeCell}
                          onClick={() =>
                            openDetails(employee)
                          }
                        >
                          <div className={styles.avatar}>
                            {getInitials(employee.name)}
                          </div>

                          <div>
                            <strong>{employee.name}</strong>
                            <span>{employee.email}</span>
                          </div>
                        </button>
                      </td>

                      <td>
                        <span className={styles.employeeCode}>
                          {employee.employee_code}
                        </span>
                      </td>

                      <td>
                        <span className={styles.department}>
                          {employee.department || "—"}
                        </span>
                      </td>

                      <td>
                        <span className={styles.designation}>
                          {employee.designation || "—"}
                        </span>
                      </td>

                      <td>
                        <span className={styles.date}>
                          {formatDate(
                            employee.date_of_joining
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`${styles.status} ${getStatusClass(
                            employee.status
                          )}`}
                        >
                          <span></span>
                          {employee.status}
                        </span>
                      </td>

                      <td>
                        <div className={styles.rowActions}>
                          <button
                            className={styles.viewButton}
                            onClick={() =>
                              openDetails(employee)
                            }
                            title="View employee"
                          >
                            View
                          </button>

                          <button
                            className={styles.editButton}
                            onClick={() =>
                              openEditModal(employee)
                            }
                            title="Edit employee"
                          >
                            Edit
                          </button>

                          <button
                            className={styles.deleteButton}
                            onClick={() =>
                              handleDelete(employee)
                            }
                            disabled={
                              deleting === employee.id
                            }
                            title="Delete employee"
                          >
                            {deleting === employee.id
                              ? "..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </section>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalEyebrow}>
                  {editingEmployee
                    ? "EMPLOYEE PROFILE"
                    : "NEW TEAM MEMBER"}
                </span>

                <h3>
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add Employee"}
                </h3>

                <p>
                  {editingEmployee
                    ? "Update employee information."
                    : "Add a new employee to your workforce."}
                </p>
              </div>

              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className={styles.form}
            >
              <div className={styles.formGrid}>
                {/* Employee Code */}

                <div className={styles.formField}>
                  <label>
                    Employee ID
                    {!editingEmployee && (
                      <span>*</span>
                    )}
                  </label>

                  <input
                    type="text"
                    value={form.employee_code}
                    onChange={(event) =>
                      handleInputChange(
                        "employee_code",
                        event.target.value
                      )
                    }
                    placeholder="e.g. EMP-001"
                    required={!editingEmployee}
                    disabled={!!editingEmployee}
                  />
                </div>

                {/* Name */}

                <div className={styles.formField}>
                  <label>
                    Full Name <span>*</span>
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleInputChange(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>

                {/* Email */}

                <div className={styles.formField}>
                  <label>
                    Email Address <span>*</span>
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      handleInputChange(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="employee@company.com"
                    required
                  />
                </div>

                {/* Phone */}

                <div className={styles.formField}>
                  <label>Phone Number</label>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      handleInputChange(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                {/* Department */}

                <div className={styles.formField}>
                  <label>Department</label>

                  <input
                    type="text"
                    value={form.department}
                    onChange={(event) =>
                      handleInputChange(
                        "department",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Finance"
                  />
                </div>

                {/* Designation */}

                <div className={styles.formField}>
                  <label>Designation</label>

                  <input
                    type="text"
                    value={form.designation}
                    onChange={(event) =>
                      handleInputChange(
                        "designation",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Senior Accountant"
                  />
                </div>

                {/* Date */}

                <div className={styles.formField}>
                  <label>Date of Joining</label>

                  <input
                    type="date"
                    value={form.date_of_joining}
                    onChange={(event) =>
                      handleInputChange(
                        "date_of_joining",
                        event.target.value
                      )
                    }
                  />
                </div>

                {/* Status */}

                <div className={styles.formField}>
                  <label>Status</label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      handleInputChange(
                        "status",
                        event.target.value
                      )
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">
                      On Leave
                    </option>
                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                {/* Manager */}

                <div
                  className={`${styles.formField} ${styles.fullField}`}
                >
                  <label>Manager</label>

                  <input
                    type="text"
                    value={form.manager}
                    onChange={(event) =>
                      handleInputChange(
                        "manager",
                        event.target.value
                      )
                    }
                    placeholder="Manager name"
                  />
                </div>
              </div>

              <div className={styles.formFooter}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingEmployee
                    ? "Save Changes"
                    : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          EMPLOYEE DETAILS SIDE PANEL
      ===================================================== */}

      {showDetails && selectedEmployee && (
        <div
          className={styles.detailsOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowDetails(false);
            }
          }}
        >
          <aside className={styles.detailsPanel}>
            <div className={styles.detailsTop}>
              <span>EMPLOYEE DETAILS</span>

              <button
                className={styles.modalClose}
                onClick={() =>
                  setShowDetails(false)
                }
              >
                ×
              </button>
            </div>

            <div className={styles.profileHeader}>
              <div className={styles.largeAvatar}>
                {getInitials(
                  selectedEmployee.name
                )}
              </div>

              <h3>{selectedEmployee.name}</h3>

              <p>
                {selectedEmployee.designation ||
                  "Employee"}
              </p>

              <span
                className={`${styles.status} ${getStatusClass(
                  selectedEmployee.status
                )}`}
              >
                <span></span>
                {selectedEmployee.status}
              </span>
            </div>

            <div className={styles.profileSection}>
              <h4>Contact Information</h4>

              <div className={styles.detailItem}>
                <span>Email</span>
                <strong>
                  {selectedEmployee.email}
                </strong>
              </div>

              <div className={styles.detailItem}>
                <span>Phone</span>
                <strong>
                  {selectedEmployee.phone || "Not provided"}
                </strong>
              </div>
            </div>

            <div className={styles.profileSection}>
              <h4>Work Information</h4>

              <div className={styles.detailItem}>
                <span>Employee ID</span>
                <strong>
                  {selectedEmployee.employee_code}
                </strong>
              </div>

              <div className={styles.detailItem}>
                <span>Department</span>
                <strong>
                  {selectedEmployee.department ||
                    "Not assigned"}
                </strong>
              </div>

              <div className={styles.detailItem}>
                <span>Designation</span>
                <strong>
                  {selectedEmployee.designation ||
                    "Not assigned"}
                </strong>
              </div>

              <div className={styles.detailItem}>
                <span>Manager</span>
                <strong>
                  {selectedEmployee.manager ||
                    "Not assigned"}
                </strong>
              </div>

              <div className={styles.detailItem}>
                <span>Date of Joining</span>
                <strong>
                  {formatDate(
                    selectedEmployee.date_of_joining
                  )}
                </strong>
              </div>
            </div>

            <div className={styles.profileActions}>
              <button
                className={styles.editFullButton}
                onClick={() =>
                  openEditModal(selectedEmployee)
                }
              >
                Edit Employee
              </button>

              <button
                className={styles.deleteFullButton}
                onClick={() =>
                  handleDelete(selectedEmployee)
                }
              >
                Delete Employee
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}