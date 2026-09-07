"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./compliance.module.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Client = {
  id: number;
  client_code: string;
  client_name: string;
  company_name?: string | null;
};

type Employee = {
  id: number;
  employee_code: string;
  name: string;
};

type Compliance = {
  id: number;
  compliance_code: string;
  compliance_name: string;
  compliance_type: string;
  client_id: number | null;
  assigned_employee_id: number | null;
  due_date: string;
  filing_date: string | null;
  frequency: string | null;
  status: string;
  priority: string;
  remarks: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ComplianceForm = {
  compliance_code: string;
  compliance_name: string;
  compliance_type: string;
  client_id: string;
  assigned_employee_id: string;
  due_date: string;
  filing_date: string;
  frequency: string;
  status: string;
  priority: string;
  remarks: string;
};

const emptyForm: ComplianceForm = {
  compliance_code: "",
  compliance_name: "",
  compliance_type: "GST",
  client_id: "",
  assigned_employee_id: "",
  due_date: "",
  filing_date: "",
  frequency: "Monthly",
  status: "Pending",
  priority: "Medium",
  remarks: "",
};

export default function CompliancePage() {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [compliances, setCompliances] = useState<Compliance[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<ComplianceForm>(emptyForm);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "⌂" },
    { label: "Clients", href: "/clients", icon: "◉" },
    { label: "Employees", href: "/employees", icon: "♙" },
    { label: "Tasks", href: "/tasks", icon: "✓" },
    { label: "Documents", href: "/documents", icon: "▣" },
    {
      label: "Communications",
      href: "/communications",
      icon: "◌",
    },
    { label: "Compliance", href: "/compliance", icon: "◆" },
    { label: "Analytics", href: "/analytics", icon: "▥" },
    { label: "Settings", href: "/settings", icon: "⚙" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [complianceRes, clientsRes, employeesRes] =
        await Promise.all([
          fetch(`${API_URL}/compliance/`),
          fetch(`${API_URL}/clients/`),
          fetch(`${API_URL}/employees/`),
        ]);

      if (!complianceRes.ok) {
        throw new Error("Failed to load compliance records");
      }

      const complianceData = await complianceRes.json();

      let clientsData: Client[] = [];
      let employeesData: Employee[] = [];

      if (clientsRes.ok) {
        clientsData = await clientsRes.json();
      }

      if (employeesRes.ok) {
        employeesData = await employeesRes.json();
      }

      setCompliances(
        Array.isArray(complianceData) ? complianceData : []
      );

      setClients(
        Array.isArray(clientsData) ? clientsData : []
      );

      setEmployees(
        Array.isArray(employeesData) ? employeesData : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load compliance data"
      );
    } finally {
      setLoading(false);
    }
  }

  function getClientName(clientId: number | null) {
    if (!clientId) return "Unassigned";

    const client = clients.find((item) => item.id === clientId);

    if (!client) return "Unknown Client";

    return `${client.client_code} - ${client.client_name}`;
  }

  function getEmployeeName(employeeId: number | null) {
    if (!employeeId) return "Unassigned";

    const employee = employees.find(
      (item) => item.id === employeeId
    );

    if (!employee) return "Unknown Employee";

    return `${employee.employee_code} - ${employee.name}`;
  }

  function getDueState(item: Compliance) {
    if (item.status === "Completed") {
      return "Completed";
    }

    const today = new Date();
    const due = new Date(item.due_date);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diff =
      Math.ceil(
        (due.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      );

    if (diff < 0) {
      return "Overdue";
    }

    if (diff <= 7) {
      return "Due Soon";
    }

    return "Pending";
  }

  function getDaysText(item: Compliance) {
    if (item.status === "Completed") {
      return item.filing_date ? "Filed" : "Completed";
    }

    const today = new Date();
    const due = new Date(item.due_date);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diff = Math.ceil(
      (due.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diff < 0) {
      return `${Math.abs(diff)} day${
        Math.abs(diff) !== 1 ? "s" : ""
      } overdue`;
    }

    if (diff === 0) {
      return "Due today";
    }

    return `${diff} day${diff !== 1 ? "s" : ""} left`;
  }

  const filteredCompliances = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return compliances.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.compliance_name
          .toLowerCase()
          .includes(searchText) ||
        item.compliance_code
          .toLowerCase()
          .includes(searchText) ||
        item.compliance_type
          .toLowerCase()
          .includes(searchText) ||
        getClientName(item.client_id)
          .toLowerCase()
          .includes(searchText);

      const matchesType =
        typeFilter === "All" ||
        item.compliance_type === typeFilter;

      const dueState = getDueState(item);

      const matchesStatus =
        statusFilter === "All" ||
        dueState === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    compliances,
    clients,
    search,
    typeFilter,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    let overdue = 0;
    let dueSoon = 0;
    let completed = 0;
    let pending = 0;

    compliances.forEach((item) => {
      const state = getDueState(item);

      if (state === "Overdue") overdue++;
      else if (state === "Due Soon") dueSoon++;
      else if (state === "Completed") completed++;
      else pending++;
    });

    return {
      total: compliances.length,
      overdue,
      dueSoon,
      completed,
      pending,
    };
  }, [compliances]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function openEditForm(item: Compliance) {
    setEditingId(item.id);

    setForm({
      compliance_code: item.compliance_code,
      compliance_name: item.compliance_name,
      compliance_type: item.compliance_type,
      client_id: item.client_id
        ? String(item.client_id)
        : "",
      assigned_employee_id: item.assigned_employee_id
        ? String(item.assigned_employee_id)
        : "",
      due_date: item.due_date
        ? item.due_date.slice(0, 10)
        : "",
      filing_date: item.filing_date
        ? item.filing_date.slice(0, 10)
        : "",
      frequency: item.frequency || "Monthly",
      status: item.status,
      priority: item.priority,
      remarks: item.remarks || "",
    });

    setShowForm(true);
    setError("");
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.compliance_code.trim()) {
      setError("Compliance code is required.");
      return;
    }

    if (!form.compliance_name.trim()) {
      setError("Compliance name is required.");
      return;
    }

    if (!form.due_date) {
      setError("Due date is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        compliance_code: form.compliance_code.trim(),
        compliance_name: form.compliance_name.trim(),
        compliance_type: form.compliance_type,
        client_id: form.client_id
          ? Number(form.client_id)
          : null,
        assigned_employee_id: form.assigned_employee_id
          ? Number(form.assigned_employee_id)
          : null,
        due_date: form.due_date,
        filing_date: form.filing_date || null,
        frequency: form.frequency || null,
        status: form.status,
        priority: form.priority,
        remarks: form.remarks.trim() || null,
      };

      const url = editingId
        ? `${API_URL}/compliance/${editingId}`
        : `${API_URL}/compliance/`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = "Failed to save compliance record.";

        try {
          const data = await response.json();

          if (typeof data.detail === "string") {
            message = data.detail;
          }
        } catch {
          // Ignore invalid error response
        }

        throw new Error(message);
      }

      await loadData();

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save compliance record."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCompliance(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this compliance record?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/compliance/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete compliance record."
        );
      }

      setCompliances((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete compliance record."
      );
    }
  }

  function updateForm(
    field: keyof ComplianceForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function formatDate(value: string | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusClass(item: Compliance) {
    const state = getDueState(item);

    if (state === "Completed") {
      return styles.statusCompleted;
    }

    if (state === "Overdue") {
      return styles.statusOverdue;
    }

    if (state === "Due Soon") {
      return styles.statusDueSoon;
    }

    return styles.statusPending;
  }

  function getPriorityClass(priority: string) {
    if (priority === "Low") {
      return styles.priorityLow;
    }

    if (priority === "High") {
      return styles.priorityHigh;
    }

    return styles.priorityMedium;
  }

  return (
    <div className={styles.layout}>
      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <button
          className={styles.overlay}
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : ""
        }`}
      >
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>F</div>

          <div>
            <div className={styles.logoText}>
              FirmPulse
            </div>

            <div className={styles.logoSubtext}>
              Firm Management
            </div>
          </div>

          <button
            className={styles.sidebarClose}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navTitle}>
            MAIN MENU
          </div>

          <nav className={styles.navigation}>
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${
                    active
                      ? styles.navItemActive
                      : ""
                  }`}
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                >
                  <span className={styles.navIcon}>
                    {item.icon}
                  </span>

                  <span>{item.label}</span>

                  {active && (
                    <span
                      className={styles.activeLine}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.profile}>
            <div className={styles.avatar}>A</div>

            <div className={styles.profileInfo}>
              <strong>Admin</strong>

              <span>
                Firm Administrator
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className={styles.mainContent}>
        {/* MOBILE HEADER */}
        <div className={styles.mobileHeader}>
          <button
            className={styles.menuButton}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <div className={styles.mobileLogo}>
            FirmPulse
          </div>
        </div>

        <main className={styles.page}>
          {/* HEADER */}
          <div className={styles.header}>
            <div>
              <div className={styles.breadcrumb}>
                FirmPulse / Compliance
              </div>

              <h1>GST &amp; Compliance</h1>

              <p>
                Track statutory filings, deadlines and
                compliance responsibilities.
              </p>
            </div>

            <button
              className={styles.addButton}
              onClick={openAddForm}
            >
              + Add Compliance
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className={styles.error}>
              <span>{error}</span>

              <button
                onClick={() => setError("")}
                aria-label="Close error"
              >
                ×
              </button>
            </div>
          )}

          {/* STATS */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>
                Total Compliance
              </span>

              <strong>{stats.total}</strong>

              <small>
                All compliance records
              </small>
            </div>

            <div
              className={`${styles.statCard} ${styles.dangerCard}`}
            >
              <span className={styles.statLabel}>
                Overdue
              </span>

              <strong>{stats.overdue}</strong>

              <small>
                Requires attention
              </small>
            </div>

            <div
              className={`${styles.statCard} ${styles.warningCard}`}
            >
              <span className={styles.statLabel}>
                Due Soon
              </span>

              <strong>{stats.dueSoon}</strong>

              <small>
                Within 7 days
              </small>
            </div>

            <div
              className={`${styles.statCard} ${styles.successCard}`}
            >
              <span className={styles.statLabel}>
                Completed
              </span>

              <strong>{stats.completed}</strong>

              <small>
                Successfully filed
              </small>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>
                Pending
              </span>

              <strong>{stats.pending}</strong>

              <small>
                Future deadlines
              </small>
            </div>
          </div>

          {/* FILTER TOOLBAR */}
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search compliance..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
            >
              <option value="All">
                All Types
              </option>
              <option value="GST">GST</option>
              <option value="Income Tax">
                Income Tax
              </option>
              <option value="TDS">TDS</option>
              <option value="ROC">ROC</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">
                All Status
              </option>
              <option value="Overdue">
                Overdue
              </option>
              <option value="Due Soon">
                Due Soon
              </option>
              <option value="Pending">
                Pending
              </option>
              <option value="Completed">
                Completed
              </option>
            </select>
          </div>

          {/* TABLE */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2>Compliance Records</h2>

              <span>
                {filteredCompliances.length} record
                {filteredCompliances.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </span>
            </div>

            {loading ? (
              <div className={styles.emptyState}>
                <div className={styles.spinner} />

                <p>
                  Loading compliance records...
                </p>
              </div>
            ) : filteredCompliances.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  ◆
                </div>

                <h3>
                  No compliance records found
                </h3>

                <p>
                  Add a compliance record or change
                  your filters.
                </p>

                <button
                  className={styles.addButton}
                  onClick={openAddForm}
                >
                  + Add Compliance
                </button>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table>
                  <thead>
                    <tr>
                      <th>Compliance</th>
                      <th>Client</th>
                      <th>Assigned To</th>
                      <th>Due Date</th>
                      <th>Frequency</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCompliances.map(
                      (item) => {
                        const dueState =
                          getDueState(item);

                        return (
                          <tr key={item.id}>
                            <td>
                              <div
                                className={
                                  styles.complianceName
                                }
                              >
                                {
                                  item.compliance_name
                                }
                              </div>

                              <div
                                className={
                                  styles.complianceCode
                                }
                              >
                                {
                                  item.compliance_code
                                }
                              </div>
                            </td>

                            <td>
                              <div
                                className={
                                  styles.clientName
                                }
                              >
                                {getClientName(
                                  item.client_id
                                )}
                              </div>
                            </td>

                            <td>
                              {getEmployeeName(
                                item.assigned_employee_id
                              )}
                            </td>

                            <td>
                              <div
                                className={
                                  dueState ===
                                  "Overdue"
                                    ? styles.overdueDate
                                    : styles.date
                                }
                              >
                                {formatDate(
                                  item.due_date
                                )}
                              </div>

                              <span
                                className={
                                  dueState ===
                                  "Overdue"
                                    ? styles.overdueText
                                    : styles.daysText
                                }
                              >
                                {getDaysText(item)}
                              </span>
                            </td>

                            <td>
                              {item.frequency ||
                                "—"}
                            </td>

                            <td>
                              <span
                                className={`${styles.priority} ${getPriorityClass(
                                  item.priority
                                )}`}
                              >
                                {item.priority}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`${styles.status} ${getStatusClass(
                                  item
                                )}`}
                              >
                                {dueState}
                              </span>
                            </td>

                            <td>
                              <div
                                className={
                                  styles.actions
                                }
                              >
                                <button
                                  className={
                                    styles.editButton
                                  }
                                  onClick={() =>
                                    openEditForm(
                                      item
                                    )
                                  }
                                  title="Edit"
                                >
                                  ✎
                                </button>

                                <button
                                  className={
                                    styles.deleteButton
                                  }
                                  onClick={() =>
                                    deleteCompliance(
                                      item.id
                                    )
                                  }
                                  title="Delete"
                                >
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeForm();
            }
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2>
                  {editingId
                    ? "Edit Compliance"
                    : "Add Compliance"}
                </h2>

                <p>
                  Enter the compliance filing details
                  below.
                </p>
              </div>

              <button
                className={styles.closeButton}
                onClick={closeForm}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              className={styles.form}
              onSubmit={handleSubmit}
            >
              <div className={styles.formGrid}>
                {/* CODE */}
                <div className={styles.formGroup}>
                  <label>
                    Compliance Code *
                  </label>

                  <input
                    type="text"
                    value={form.compliance_code}
                    onChange={(event) =>
                      updateForm(
                        "compliance_code",
                        event.target.value
                      )
                    }
                    placeholder="e.g. GST-001"
                    required
                  />
                </div>

                {/* NAME */}
                <div className={styles.formGroup}>
                  <label>
                    Compliance Name *
                  </label>

                  <input
                    type="text"
                    value={form.compliance_name}
                    onChange={(event) =>
                      updateForm(
                        "compliance_name",
                        event.target.value
                      )
                    }
                    placeholder="e.g. GSTR-1 Filing"
                    required
                  />
                </div>

                {/* TYPE */}
                <div className={styles.formGroup}>
                  <label>
                    Compliance Type
                  </label>

                  <select
                    value={form.compliance_type}
                    onChange={(event) =>
                      updateForm(
                        "compliance_type",
                        event.target.value
                      )
                    }
                  >
                    <option value="GST">
                      GST
                    </option>

                    <option value="Income Tax">
                      Income Tax
                    </option>

                    <option value="TDS">
                      TDS
                    </option>

                    <option value="ROC">
                      ROC
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* CLIENT */}
                <div className={styles.formGroup}>
                  <label>Client</label>

                  <select
                    value={form.client_id}
                    onChange={(event) =>
                      updateForm(
                        "client_id",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {clients.map((client) => (
                      <option
                        key={client.id}
                        value={client.id}
                      >
                        {client.client_code} -{" "}
                        {client.client_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* EMPLOYEE */}
                <div className={styles.formGroup}>
                  <label>
                    Assigned Employee
                  </label>

                  <select
                    value={
                      form.assigned_employee_id
                    }
                    onChange={(event) =>
                      updateForm(
                        "assigned_employee_id",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {employees.map((employee) => (
                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.employee_code} -{" "}
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DUE DATE */}
                <div className={styles.formGroup}>
                  <label>Due Date *</label>

                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(event) =>
                      updateForm(
                        "due_date",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                {/* FILING DATE */}
                <div className={styles.formGroup}>
                  <label>Filing Date</label>

                  <input
                    type="date"
                    value={form.filing_date}
                    onChange={(event) =>
                      updateForm(
                        "filing_date",
                        event.target.value
                      )
                    }
                  />
                </div>

                {/* FREQUENCY */}
                <div className={styles.formGroup}>
                  <label>Frequency</label>

                  <select
                    value={form.frequency}
                    onChange={(event) =>
                      updateForm(
                        "frequency",
                        event.target.value
                      )
                    }
                  >
                    <option value="Monthly">
                      Monthly
                    </option>

                    <option value="Quarterly">
                      Quarterly
                    </option>

                    <option value="Half-Yearly">
                      Half-Yearly
                    </option>

                    <option value="Yearly">
                      Yearly
                    </option>

                    <option value="One Time">
                      One Time
                    </option>
                  </select>
                </div>

                {/* STATUS */}
                <div className={styles.formGroup}>
                  <label>Status</label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        "status",
                        event.target.value
                      )
                    }
                  >
                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Completed">
                      Completed
                    </option>
                  </select>
                </div>

                {/* PRIORITY */}
                <div className={styles.formGroup}>
                  <label>Priority</label>

                  <select
                    value={form.priority}
                    onChange={(event) =>
                      updateForm(
                        "priority",
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
                </div>

                {/* REMARKS */}
                <div
                  className={`${styles.formGroup} ${styles.fullWidth}`}
                >
                  <label>Remarks</label>

                  <textarea
                    rows={4}
                    value={form.remarks}
                    onChange={(event) =>
                      updateForm(
                        "remarks",
                        event.target.value
                      )
                    }
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeForm}
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
                    : editingId
                    ? "Update Compliance"
                    : "Save Compliance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}