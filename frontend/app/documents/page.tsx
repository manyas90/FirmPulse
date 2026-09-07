
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./document.module.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Client = {
  id: number;
  client_code: string;
  client_name: string;
  company_name?: string | null;
  status: string;
};

type Employee = {
  id: number;
  employee_code: string;
  name: string;
  department?: string | null;
  designation?: string | null;
  status: string;
};

type Document = {
  id: number;
  document_code: string;
  document_name: string;
  document_type?: string | null;
  client_id?: number | null;
  assigned_employee_id?: number | null;
  description?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type DocumentForm = {
  document_code: string;
  document_name: string;
  document_type: string;
  client_id: string;
  assigned_employee_id: string;
  description: string;
  issue_date: string;
  expiry_date: string;
  status: string;
};

const emptyForm: DocumentForm = {
  document_code: "",
  document_name: "",
  document_type: "",
  client_id: "",
  assigned_employee_id: "",
  description: "",
  issue_date: "",
  expiry_date: "",
  status: "Active",
};

const documentTypes = [
  "GST",
  "PAN",
  "Income Tax",
  "Audit",
  "Company Registration",
  "Agreement",
  "Invoice",
  "Bank",
  "Compliance",
  "Other",
];

const statusOptions = [
  "Active",
  "Expired",
  "Pending",
  "Archived",
];

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "▦",
  },
  {
    name: "Employees",
    href: "/employees",
    icon: "👥",
  },
  {
    name: "Clients",
    href: "/clients",
    icon: "◉",
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: "✓",
  },
  {
    name: "Documents",
    href: "/documents",
    icon: "▤",
  },
  {
    name: "Communications",
    href: "/communications",
    icon: "✉",
  },
  {
    name: "Compliance",
    href: "/compliance",
    icon: "✓",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: "▥",
  },
];

export default function DocumentsPage() {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [form, setForm] = useState<DocumentForm>(emptyForm);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        documentsRes,
        clientsRes,
        employeesRes,
      ] = await Promise.all([
        fetch(`${API_URL}/documents/`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/clients/`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/employees/`, {
          cache: "no-store",
        }),
      ]);

      if (!documentsRes.ok) {
        throw new Error("Failed to load documents");
      }

      if (!clientsRes.ok) {
        throw new Error("Failed to load clients");
      }

      if (!employeesRes.ok) {
        throw new Error("Failed to load employees");
      }

      const documentsData = await documentsRes.json();
      const clientsData = await clientsRes.json();
      const employeesData = await employeesRes.json();

      setDocuments(
        Array.isArray(documentsData)
          ? documentsData
          : []
      );

      setClients(
        Array.isArray(clientsData)
          ? clientsData
          : []
      );

      setEmployees(
        Array.isArray(employeesData)
          ? employeesData
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function openEditForm(document: Document) {
    setEditingId(document.id);

    setForm({
      document_code:
        document.document_code || "",

      document_name:
        document.document_name || "",

      document_type:
        document.document_type || "",

      client_id:
        document.client_id !== null &&
        document.client_id !== undefined
          ? String(document.client_id)
          : "",

      assigned_employee_id:
        document.assigned_employee_id !== null &&
        document.assigned_employee_id !== undefined
          ? String(document.assigned_employee_id)
          : "",

      description:
        document.description || "",

      issue_date:
        document.issue_date || "",

      expiry_date:
        document.expiry_date || "",

      status:
        document.status || "Active",
    });

    setMessage("");
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function updateForm(
    field: keyof DocumentForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!form.document_code.trim()) {
        throw new Error(
          "Document code is required"
        );
      }

      if (!form.document_name.trim()) {
        throw new Error(
          "Document name is required"
        );
      }

      const payload = {
        document_code:
          form.document_code.trim(),

        document_name:
          form.document_name.trim(),

        document_type:
          form.document_type || null,

        client_id:
          form.client_id
            ? Number(form.client_id)
            : null,

        assigned_employee_id:
          form.assigned_employee_id
            ? Number(
                form.assigned_employee_id
              )
            : null,

        description:
          form.description.trim() || null,

        issue_date:
          form.issue_date || null,

        expiry_date:
          form.expiry_date || null,

        status: form.status,
      };

      const url = editingId
        ? `${API_URL}/documents/${editingId}`
        : `${API_URL}/documents/`;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to save document"
        );
      }

      setMessage(
        editingId
          ? "Document updated successfully."
          : "Document added successfully."
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save document"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/documents/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to delete document"
        );
      }

      setMessage(
        "Document deleted successfully."
      );

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete document"
      );
    }
  }

  function getClientName(
    clientId?: number | null
  ) {
    if (!clientId) return "—";

    const client = clients.find(
      (item) => item.id === clientId
    );

    if (!client) return "Unknown client";

    return (
      client.company_name ||
      client.client_name
    );
  }

  function getEmployeeName(
    employeeId?: number | null
  ) {
    if (!employeeId) return "—";

    const employee = employees.find(
      (item) => item.id === employeeId
    );

    return (
      employee?.name ||
      "Unknown employee"
    );
  }

  function formatDate(
    value?: string | null
  ) {
    if (!value) return "—";

    const date = new Date(
      `${value}T00:00:00`
    );

    if (
      Number.isNaN(date.getTime())
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function isExpired(
    expiryDate?: string | null
  ) {
    if (!expiryDate) return false;

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const expiry = new Date(
      `${expiryDate}T00:00:00`
    );

    return expiry < today;
  }

  function isExpiringSoon(
    expiryDate?: string | null
  ) {
    if (!expiryDate) return false;

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const expiry = new Date(
      `${expiryDate}T00:00:00`
    );

    const difference =
      expiry.getTime() -
      today.getTime();

    const days =
      difference /
      (1000 * 60 * 60 * 24);

    return (
      days >= 0 &&
      days <= 30
    );
  }

  const filteredDocuments =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return documents.filter(
        (document) => {
          const clientName =
            getClientName(
              document.client_id
            );

          const employeeName =
            getEmployeeName(
              document.assigned_employee_id
            );

          const matchesSearch =
            !query ||
            document.document_code
              .toLowerCase()
              .includes(query) ||
            document.document_name
              .toLowerCase()
              .includes(query) ||
            (
              document.document_type ||
              ""
            )
              .toLowerCase()
              .includes(query) ||
            clientName
              .toLowerCase()
              .includes(query) ||
            employeeName
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "All" ||
            document.status ===
              statusFilter;

          const matchesType =
            typeFilter === "All" ||
            document.document_type ===
              typeFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesType
          );
        }
      );
    }, [
      documents,
      clients,
      employees,
      search,
      statusFilter,
      typeFilter,
    ]);

  const totalDocuments =
    documents.length;

  const activeDocuments =
    documents.filter(
      (document) =>
        document.status ===
        "Active"
    ).length;

  const expiredDocuments =
    documents.filter(
      (document) =>
        document.status ===
          "Expired" ||
        isExpired(
          document.expiry_date
        )
    ).length;

  const expiringSoonDocuments =
    documents.filter(
      (document) =>
        !isExpired(
          document.expiry_date
        ) &&
        isExpiringSoon(
          document.expiry_date
        )
    ).length;

  return (
    <div
      className={
        styles.appLayout
      }
    >
      {/* SIDEBAR */}
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen
            ? styles.sidebarOpen
            : ""
        }`}
      >
        <div
          className={
            styles.sidebarHeader
          }
        >
          <div
            className={
              styles.logoBox
            }
          >
            FP
          </div>

          <div>
            <h2
              className={
                styles.logoTitle
              }
            >
              FirmPulse
            </h2>

            <p
              className={
                styles.logoSubtitle
              }
            >
              Firm Management
            </p>
          </div>

          <button
            className={
              styles.mobileClose
            }
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            ×
          </button>
        </div>

        <nav
          className={
            styles.sidebarNav
          }
        >
          <p
            className={
              styles.navLabel
            }
          >
            MAIN MENU
          </p>

          {navigation.map(
            (item) => {
              const active =
                pathname ===
                  item.href ||
                pathname.startsWith(
                  `${item.href}/`
                );

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
                    setSidebarOpen(
                      false
                    )
                  }
                >
                  <span
                    className={
                      styles.navIcon
                    }
                  >
                    {item.icon}
                  </span>

                  <span>
                    {item.name}
                  </span>
                </Link>
              );
            }
          )}
        </nav>

        <div
          className={
            styles.sidebarBottom
          }
        >
          <div
            className={
              styles.userCard
            }
          >
            <div
              className={
                styles.userAvatar
              }
            >
              A
            </div>

            <div
              className={
                styles.userInfo
              }
            >
              <strong>
                Admin
              </strong>

              <span>
                Administrator
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className={
            styles.overlay
          }
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* MAIN CONTENT */}
      <div
        className={
          styles.mainContent
        }
      >
        {/* MOBILE TOPBAR */}
        <div
          className={
            styles.mobileTopbar
          }
        >
          <button
            className={
              styles.menuButton
            }
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            ☰
          </button>

          <div
            className={
              styles.mobileBrand
            }
          >
            FirmPulse
          </div>
        </div>

        <main
          className={
            styles.page
          }
        >
          {/* HEADER */}
          <header
            className={
              styles.header
            }
          >
            <div>
              <h1
                className={
                  styles.title
                }
              >
                Documents
              </h1>

              <p
                className={
                  styles.subtitle
                }
              >
                Manage client documents,
                records and expiry
                information.
              </p>
            </div>

            <button
              className={
                styles.addButton
              }
              onClick={
                openAddForm
              }
            >
              <span>+</span>
              Add Document
            </button>
          </header>

          {/* MESSAGES */}
          {error && (
            <div
              className={
                styles.errorMessage
              }
            >
              {error}
            </div>
          )}

          {message && (
            <div
              className={
                styles.successMessage
              }
            >
              {message}
            </div>
          )}

          {/* STATISTICS */}
          <section
            className={
              styles.stats
            }
          >
            <div
              className={
                styles.statCard
              }
            >
              <span
                className={
                  styles.statLabel
                }
              >
                Total Documents
              </span>

              <strong
                className={
                  styles.statValue
                }
              >
                {totalDocuments}
              </strong>
            </div>

            <div
              className={
                styles.statCard
              }
            >
              <span
                className={
                  styles.statLabel
                }
              >
                Active
              </span>

              <strong
                className={`${styles.statValue} ${styles.activeValue}`}
              >
                {activeDocuments}
              </strong>
            </div>

            <div
              className={
                styles.statCard
              }
            >
              <span
                className={
                  styles.statLabel
                }
              >
                Expiring Soon
              </span>

              <strong
                className={`${styles.statValue} ${styles.warningValue}`}
              >
                {
                  expiringSoonDocuments
                }
              </strong>
            </div>

            <div
              className={
                styles.statCard
              }
            >
              <span
                className={
                  styles.statLabel
                }
              >
                Expired
              </span>

              <strong
                className={`${styles.statValue} ${styles.inactiveValue}`}
              >
                {expiredDocuments}
              </strong>
            </div>
          </section>

          {/* FILTERS */}
          <section
            className={
              styles.filters
            }
          >
            <input
              type="text"
              className={
                styles.searchInput
              }
              placeholder="Search documents, clients..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            <select
              className={
                styles.select
              }
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Types
              </option>

              {documentTypes.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                )
              )}
            </select>

            <select
              className={
                styles.select
              }
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Status
              </option>

              {statusOptions.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>
          </section>

          {/* ADD / EDIT FORM */}
          {showForm && (
            <section
              className={
                styles.formContainer
              }
            >
              <div
                className={
                  styles.formHeader
                }
              >
                <div>
                  <h2
                    className={
                      styles.formTitle
                    }
                  >
                    {editingId
                      ? "Edit Document"
                      : "Add Document"}
                  </h2>

                  <p
                    className={
                      styles.formSubtitle
                    }
                  >
                    Enter the document
                    information below.
                  </p>
                </div>

                <button
                  type="button"
                  className={
                    styles.closeButton
                  }
                  onClick={
                    closeForm
                  }
                  disabled={saving}
                >
                  ×
                </button>
              </div>

              <form
                className={
                  styles.form
                }
                onSubmit={
                  handleSubmit
                }
              >
                <div
                  className={
                    styles.formGrid
                  }
                >
                  <div
                    className={
                      styles.formGroup
                    }
                  >
                    <label
                      className={
                        styles.label
                      }
                    >
                      Document Code *
                    </label>

                    <input
                      className={
                        styles.input
                      }
                      value={
                        form.document_code
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "document_code",
                          event.target
                            .value
                        )
                      }
                      placeholder="DOC001"
                      required
                    />
                  </div>

                  <div
                    className={
                      styles.formGroup
                    }
                  >
                    <label
                      className={
                        styles.label
                      }
                    >
                      Document Name *
                    </label>

                    <input
                      className={
                        styles.input
                      }
                      value={
                        form.document_name
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "document_name",
                          event.target
                            .value
                        )
                      }
                      placeholder="GST Registration Certificate"
                      required
                    />
                  </div>

                  <div
                    className={
                      styles.formGroup
                    }
                  >
                    <label
                      className={
                        styles.label
                      }
                    >
                      Document Type
                    </label>

                    <select
                      className={
                        styles.select
                      }
                      value={
                        form.document_type
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "document_type",
                          event.target
                            .value
                        )
                      }
                    >
                      <option value="">
                        Select type
                      </option>

                      {documentTypes.map(
                        (type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {type}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div
                    className={
                      styles.formGroup
                    }
                  >
                    <label
                      className={
                        styles.label
                      }
                    >
                      Client
                    </label>

                    <select
                      className={
                        styles.select
                      }
                      value={
                        form.client_id
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "client_id",
                          event.target
                            .value
                        )
                      }
                    >
                      <option value="">
                        Select client
                      </option>

                      {clients.map(
                        (client) => (
                          <option
                            key={client.id}
                            value={
                              client.id
                            }
                          >
                            {
                              client.client_code
                            }{" "}
                            —{" "}
                            {client.company_name ||
                              client.client_name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div
                    className={
                      styles.formGroup
                    }
                  >
                    <label
                      className={
                        styles.label
                      }
                    >
                      Assigned Employee
                    </label>

                    <select
                      className={
                        styles.select
                      }
                      value={
                        form.assigned_employee_id
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "assigned_employee_id",
                          event.target
                            .value
                        )
                      }
                    >
                      <option value="">
                        Select employee
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
                              employee.employee_code
                            }{" "}
                            —{" "}
                            {
                              employee.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div
                    className={
                      styles.formGroup
                    }
                  >
                    <label
                      className={
                        styles.label
                      }
                    >
                      Status
                    </label>

                    <select
                      className={
                        styles.select
                      }
                      value={
                        form.status
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "status",
                          event.target
                            .value
                        )
                      }
                    >
                      {statusOptions.map(
                        (status) => (
                          <option
                            key={
                              status
                            }
                            value={
                              status
                            }
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div
                    className={
                      styles.formGroup
                    }
                  >
                    <label
                      className={
                        styles.label
                      }
                    >
                      Issue Date
                    </label>

                    <input
                      type="date"
                      className={
                        styles.input
                      }
                      value={
                        form.issue_date
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "issue_date",
                          event.target
                            .value
                        )
                      }
                    />
                  </div>

                  <div
                    className={
                      styles.formGroup
                    }
                  >
                    <label
                      className={
                        styles.label
                      }
                    >
                      Expiry Date
                    </label>

                    <input
                      type="date"
                      className={
                        styles.input
                      }
                      value={
                        form.expiry_date
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "expiry_date",
                          event.target
                            .value
                        )
                      }
                    />
                  </div>

                  <div
                    className={`${styles.formGroup} ${styles.fullWidth}`}
                  >
                    <label
                      className={
                        styles.label
                      }
                    >
                      Description
                    </label>

                    <textarea
                      className={
                        styles.textarea
                      }
                      value={
                        form.description
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "description",
                          event.target
                            .value
                        )
                      }
                      placeholder="Enter document description..."
                      rows={4}
                    />
                  </div>
                </div>

                <div
                  className={
                    styles.formActions
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.cancelButton
                    }
                    onClick={
                      closeForm
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className={
                      styles.saveButton
                    }
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Document"
                      : "Save Document"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* DOCUMENT TABLE */}
          <section
            className={
              styles.tableContainer
            }
          >
            <div
              className={
                styles.tableHeader
              }
            >
              <div>
                <h2>
                  Document Records
                </h2>

                <span>
                  {
                    filteredDocuments.length
                  }{" "}
                  document
                  {filteredDocuments.length !==
                  1
                    ? "s"
                    : ""}
                </span>
              </div>
            </div>

            {loading ? (
              <div
                className={
                  styles.loading
                }
              >
                Loading documents...
              </div>
            ) : filteredDocuments.length ===
              0 ? (
              <div
                className={
                  styles.emptyState
                }
              >
                <div
                  className={
                    styles.emptyIcon
                  }
                >
                  📄
                </div>

                <h3>
                  No documents found
                </h3>

                <p>
                  Add your first
                  document to start
                  managing records.
                </p>

                <button
                  className={
                    styles.addButton
                  }
                  onClick={
                    openAddForm
                  }
                >
                  + Add Document
                </button>
              </div>
            ) : (
              <div
                className={
                  styles.tableWrapper
                }
              >
                <table
                  className={
                    styles.table
                  }
                >
                  <thead>
                    <tr>
                      <th>
                        Document
                      </th>
                      <th>
                        Type
                      </th>
                      <th>
                        Client
                      </th>
                      <th>
                        Employee
                      </th>
                      <th>
                        Issue Date
                      </th>
                      <th>
                        Expiry Date
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
                    {filteredDocuments.map(
                      (document) => {
                        const expired =
                          isExpired(
                            document.expiry_date
                          );

                        const expiring =
                          isExpiringSoon(
                            document.expiry_date
                          );

                        return (
                          <tr
                            key={
                              document.id
                            }
                          >
                            <td>
                              <div
                                className={
                                  styles.documentInfo
                                }
                              >
                                <strong
                                  className={
                                    styles.documentName
                                  }
                                >
                                  {
                                    document.document_name
                                  }
                                </strong>

                                <span
                                  className={
                                    styles.documentCode
                                  }
                                >
                                  {
                                    document.document_code
                                  }
                                </span>
                              </div>
                            </td>

                            <td>
                              <span
                                className={
                                  styles.typeBadge
                                }
                              >
                                {document.document_type ||
                                  "Other"}
                              </span>
                            </td>

                            <td>
                              <span
                                className={
                                  styles.clientName
                                }
                              >
                                {getClientName(
                                  document.client_id
                                )}
                              </span>
                            </td>

                            <td>
                              {getEmployeeName(
                                document.assigned_employee_id
                              )}
                            </td>

                            <td>
                              {formatDate(
                                document.issue_date
                              )}
                            </td>

                            <td>
                              <span
                                className={
                                  expired
                                    ? styles.expiryDanger
                                    : expiring
                                    ? styles.expiryWarning
                                    : styles.expiryNormal
                                }
                              >
                                {formatDate(
                                  document.expiry_date
                                )}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`${styles.status} ${
                                  document.status ===
                                  "Active"
                                    ? styles.active
                                    : document.status ===
                                      "Expired"
                                    ? styles.expired
                                    : document.status ===
                                      "Archived"
                                    ? styles.archived
                                    : styles.pending
                                }`}
                              >
                                {
                                  document.status
                                }
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
                                      document
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  className={
                                    styles.deleteButton
                                  }
                                  onClick={() =>
                                    handleDelete(
                                      document.id
                                    )
                                  }
                                >
                                  Delete
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
          </section>
        </main>
      </div>
    </div>
  );
}
