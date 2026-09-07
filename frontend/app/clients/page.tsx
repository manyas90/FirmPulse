"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./client.module.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Employee = {
  id: number;
  name: string;
};

type Client = {
  id: number;
  client_code: string;
  client_name: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  client_type?: string | null;
  gstin?: string | null;
  pan?: string | null;
  address?: string | null;
  assigned_employee_id?: number | null;
  status: string;
};

type ClientForm = {
  client_code: string;
  client_name: string;
  company_name: string;
  email: string;
  phone: string;
  client_type: string;
  gstin: string;
  pan: string;
  address: string;
  assigned_employee_id: string;
  status: string;
};

const emptyForm: ClientForm = {
  client_code: "",
  client_name: "",
  company_name: "",
  email: "",
  phone: "",
  client_type: "Company",
  gstin: "",
  pan: "",
  address: "",
  assigned_employee_id: "",
  status: "Active",
};

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    label: "Clients",
    href: "/clients",
    icon: "◉",
  },
  {
    label: "Employees",
    href: "/employees",
    icon: "♙",
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: "✓",
  },
  {
    label: "Documents",
    href: "/documents",
    icon: "▣",
  },
  {
    label: "Communications",
    href: "/communications",
    icon: "◌",
  },
  {
    label: "Compliance",
    href: "/compliance",
    icon: "◆",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: "▥",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "⚙",
  },
];

export default function ClientsPage() {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [form, setForm] = useState<ClientForm>(emptyForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // ----------------------------------------
  // LOAD CLIENTS + EMPLOYEES
  // ----------------------------------------

  async function loadData() {
    try {
      setLoading(true);

      const [clientsResponse, employeesResponse] =
        await Promise.all([
          fetch(`${API_URL}/clients/`),
          fetch(`${API_URL}/employees/`),
        ]);

      if (!clientsResponse.ok) {
        throw new Error("Failed to load clients");
      }

      if (!employeesResponse.ok) {
        throw new Error("Failed to load employees");
      }

      const clientsData = await clientsResponse.json();
      const employeesData = await employeesResponse.json();

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
    } catch (error) {
      console.error("Load error:", error);

      alert(
        "Unable to load clients or employees."
      );
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------
  // FORM CHANGE
  // ----------------------------------------

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ----------------------------------------
  // OPEN ADD FORM
  // ----------------------------------------

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  // ----------------------------------------
  // OPEN EDIT FORM
  // ----------------------------------------

  function openEditForm(client: Client) {
    setEditingId(client.id);

    setForm({
      client_code: client.client_code || "",
      client_name: client.client_name || "",
      company_name: client.company_name || "",
      email: client.email || "",
      phone: client.phone || "",
      client_type:
        client.client_type || "Company",
      gstin: client.gstin || "",
      pan: client.pan || "",
      address: client.address || "",
      assigned_employee_id:
        client.assigned_employee_id
          ? String(client.assigned_employee_id)
          : "",
      status: client.status || "Active",
    });

    setShowForm(true);
  }

  // ----------------------------------------
  // CLOSE FORM
  // ----------------------------------------

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  // ----------------------------------------
  // SAVE CLIENT
  // ----------------------------------------

  async function saveClient(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!form.client_code.trim()) {
      alert("Client Code is required.");
      return;
    }

    if (!form.client_name.trim()) {
      alert("Client Name is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        client_code: form.client_code.trim(),
        client_name: form.client_name.trim(),
        company_name:
          form.company_name || null,
        email: form.email || null,
        phone: form.phone || null,
        client_type:
          form.client_type || null,
        gstin: form.gstin || null,
        pan: form.pan || null,
        address: form.address || null,
        assigned_employee_id:
          form.assigned_employee_id
            ? Number(form.assigned_employee_id)
            : null,
        status: form.status,
      };

      const url = editingId
        ? `${API_URL}/clients/${editingId}`
        : `${API_URL}/clients/`;

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

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        console.error(
          "Save error:",
          errorData
        );

        alert(
          errorData?.detail ||
            `Failed to ${
              editingId
                ? "update"
                : "create"
            } client.`
        );

        return;
      }

      await loadData();

      closeForm();
    } catch (error) {
      console.error(
        "Save error:",
        error
      );

      alert(
        "Something went wrong while saving the client."
      );
    } finally {
      setSaving(false);
    }
  }

  // ----------------------------------------
  // DELETE CLIENT
  // ----------------------------------------

  async function deleteClient(id: number) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this client?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/clients/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        alert(
          errorData?.detail ||
            "Failed to delete client."
        );

        return;
      }

      await loadData();
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      alert(
        "Unable to delete client."
      );
    }
  }

  // ----------------------------------------
  // EMPLOYEE NAME
  // ----------------------------------------

  function getEmployeeName(
    employeeId?: number | null
  ) {
    if (!employeeId) {
      return "Unassigned";
    }

    const employee =
      employees.find(
        (item) =>
          item.id === employeeId
      );

    return employee
      ? employee.name
      : "Unknown";
  }

  // ----------------------------------------
  // FILTER CLIENTS
  // ----------------------------------------

  const filteredClients =
    clients.filter((client) => {
      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        client.client_code
          .toLowerCase()
          .includes(searchText) ||
        client.client_name
          .toLowerCase()
          .includes(searchText) ||
        (client.company_name || "")
          .toLowerCase()
          .includes(searchText) ||
        (client.email || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        client.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // ----------------------------------------
  // STATISTICS
  // ----------------------------------------

  const totalClients =
    clients.length;

  const activeClients =
    clients.filter(
      (client) =>
        client.status === "Active"
    ).length;

  const inactiveClients =
    clients.filter(
      (client) =>
        client.status === "Inactive"
    ).length;

  // ----------------------------------------
  // UI
  // ----------------------------------------

  return (
    <div className={styles.layout}>

      {/* =====================================
          MOBILE OVERLAY
      ====================================== */}

      {sidebarOpen && (
        <button
          className={styles.overlay}
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Close sidebar"
        />
      )}

      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`${styles.sidebar} ${
          sidebarOpen
            ? styles.sidebarOpen
            : ""
        }`}
      >

        {/* LOGO */}

        <div className={styles.logoArea}>

          <div className={styles.logoIcon}>
            F
          </div>

          <div>
            <h2 className={styles.logoText}>
              FirmPulse
            </h2>

            <span
              className={styles.logoSubtext}
            >
              Firm Management
            </span>
          </div>

          <button
            className={styles.sidebarClose}
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close sidebar"
          >
            ×
          </button>

        </div>

        {/* NAVIGATION */}

        <div className={styles.navSection}>

          <span
            className={styles.navTitle}
          >
            MAIN MENU
          </span>

          <nav
            className={styles.navigation}
          >

            {navItems.map((item) => {

              const active =
                pathname === item.href ||
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
                    setSidebarOpen(false)
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
                    {item.label}
                  </span>

                  {active && (
                    <span
                      className={
                        styles.activeLine
                      }
                    />
                  )}

                </Link>
              );
            })}

          </nav>

        </div>

        {/* PROFILE */}

        <div
          className={
            styles.sidebarBottom
          }
        >

          <div
            className={styles.profile}
          >

            <div
              className={styles.avatar}
            >
              A
            </div>

            <div
              className={
                styles.profileInfo
              }
            >
              <strong>
                Admin
              </strong>

              <span>
                Firm Administrator
              </span>
            </div>

          </div>

        </div>

      </aside>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <div className={styles.mainContent}>

        {/* MOBILE HEADER */}

        <div
          className={
            styles.mobileHeader
          }
        >

          <button
            className={
              styles.menuButton
            }
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open sidebar"
          >
            ☰
          </button>

          <div
            className={styles.mobileLogo}
          >
            <strong>
              FirmPulse
            </strong>
          </div>

        </div>

        <main className={styles.page}>

          {/* =====================================
              HEADER
          ====================================== */}

          <div className={styles.header}>

            <div>
              <h1
                className={styles.title}
              >
                Clients
              </h1>

              <p
                className={
                  styles.subtitle
                }
              >
                Manage your firm clients
                and their details.
              </p>
            </div>

            <button
              onClick={openAddForm}
              className={
                styles.addButton
              }
            >
              + Add Client
            </button>

          </div>

          {/* =====================================
              STATISTICS
          ====================================== */}

          <div className={styles.stats}>

            <div
              className={
                styles.statCard
              }
            >
              <div
                className={
                  styles.statLabel
                }
              >
                Total Clients
              </div>

              <div
                className={
                  styles.statValue
                }
              >
                {totalClients}
              </div>
            </div>

            <div
              className={
                styles.statCard
              }
            >
              <div
                className={
                  styles.statLabel
                }
              >
                Active Clients
              </div>

              <div
                className={`${styles.statValue} ${styles.activeValue}`}
              >
                {activeClients}
              </div>
            </div>

            <div
              className={
                styles.statCard
              }
            >
              <div
                className={
                  styles.statLabel
                }
              >
                Inactive Clients
              </div>

              <div
                className={`${styles.statValue} ${styles.inactiveValue}`}
              >
                {inactiveClients}
              </div>
            </div>

          </div>

          {/* =====================================
              SEARCH + FILTER
          ====================================== */}

          <div className={styles.filters}>

            <input
              type="text"
              placeholder="Search by code, name, company or email..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              className={
                styles.searchInput
              }
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className={
                styles.statusFilter
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

          </div>

          {/* =====================================
              ADD / EDIT FORM
          ====================================== */}

          {showForm && (
            <div
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
                      ? "Edit Client"
                      : "Add New Client"}
                  </h2>

                  <p
                    className={
                      styles.formSubtitle
                    }
                  >
                    Enter the client
                    information below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  className={
                    styles.closeButton
                  }
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={saveClient}
                className={
                  styles.form
                }
              >

                <div
                  className={
                    styles.formGrid
                  }
                >

                  {/* CLIENT CODE */}

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
                      Client Code *
                    </label>

                    <input
                      name="client_code"
                      value={
                        form.client_code
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        editingId !== null
                      }
                      placeholder="CLI001"
                      className={
                        styles.input
                      }
                      required
                    />
                  </div>

                  {/* CLIENT NAME */}

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
                      Client Name *
                    </label>

                    <input
                      name="client_name"
                      value={
                        form.client_name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="ABC Private Limited"
                      className={
                        styles.input
                      }
                      required
                    />
                  </div>

                  {/* COMPANY NAME */}

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
                      Company Name
                    </label>

                    <input
                      name="company_name"
                      value={
                        form.company_name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="ABC Pvt Ltd"
                      className={
                        styles.input
                      }
                    />
                  </div>

                  {/* CLIENT TYPE */}

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
                      Client Type
                    </label>

                    <select
                      name="client_type"
                      value={
                        form.client_type
                      }
                      onChange={
                        handleChange
                      }
                      className={
                        styles.select
                      }
                    >
                      <option value="Company">
                        Company
                      </option>

                      <option value="Individual">
                        Individual
                      </option>

                      <option value="Partnership">
                        Partnership
                      </option>

                      <option value="LLP">
                        LLP
                      </option>

                      <option value="Trust">
                        Trust
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  {/* EMAIL */}

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
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={
                        handleChange
                      }
                      placeholder="client@example.com"
                      className={
                        styles.input
                      }
                    />
                  </div>

                  {/* PHONE */}

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
                      Phone
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={
                        handleChange
                      }
                      placeholder="9876543210"
                      className={
                        styles.input
                      }
                    />
                  </div>

                  {/* GSTIN */}

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
                      GSTIN
                    </label>

                    <input
                      name="gstin"
                      value={form.gstin}
                      onChange={
                        handleChange
                      }
                      placeholder="27ABCDE1234F1Z5"
                      className={
                        styles.input
                      }
                    />
                  </div>

                  {/* PAN */}

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
                      PAN
                    </label>

                    <input
                      name="pan"
                      value={form.pan}
                      onChange={
                        handleChange
                      }
                      placeholder="ABCDE1234F"
                      className={
                        styles.input
                      }
                    />
                  </div>

                  {/* EMPLOYEE */}

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
                      name="assigned_employee_id"
                      value={
                        form.assigned_employee_id
                      }
                      onChange={
                        handleChange
                      }
                      className={
                        styles.select
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
                            {employee.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* STATUS */}

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
                      name="status"
                      value={
                        form.status
                      }
                      onChange={
                        handleChange
                      }
                      className={
                        styles.select
                      }
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>
                  </div>

                  {/* ADDRESS */}

                  <div
                    className={`${styles.formGroup} ${styles.fullWidth}`}
                  >
                    <label
                      className={
                        styles.label
                      }
                    >
                      Address
                    </label>

                    <textarea
                      name="address"
                      value={
                        form.address
                      }
                      onChange={
                        handleChange
                      }
                      rows={3}
                      placeholder="Client address..."
                      className={
                        styles.textarea
                      }
                    />
                  </div>

                </div>

                {/* FORM BUTTONS */}

                <div
                  className={
                    styles.formActions
                  }
                >

                  <button
                    type="submit"
                    disabled={saving}
                    className={
                      styles.saveButton
                    }
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Client"
                      : "Save Client"}
                  </button>

                  <button
                    type="button"
                    onClick={closeForm}
                    className={
                      styles.cancelButton
                    }
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>
          )}

          {/* =====================================
              CLIENT TABLE
          ====================================== */}

          <div
            className={
              styles.tableContainer
            }
          >

            {loading ? (

              <div
                className={
                  styles.message
                }
              >
                Loading clients...
              </div>

            ) : filteredClients.length ===
              0 ? (

              <div
                className={
                  styles.message
                }
              >

                <div
                  className={
                    styles.emptyIcon
                  }
                >
                  👥
                </div>

                <div
                  className={
                    styles.emptyTitle
                  }
                >
                  No clients found
                </div>

                <div
                  className={
                    styles.emptyText
                  }
                >
                  {search ||
                  statusFilter !==
                    "All"
                    ? "Try changing your search or filter."
                    : "Add your first client using the button above."}
                </div>

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
                        Code
                      </th>

                      <th>
                        Client
                      </th>

                      <th>
                        Contact
                      </th>

                      <th>
                        Type
                      </th>

                      <th>
                        Employee
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

                    {filteredClients.map(
                      (client) => (

                        <tr
                          key={
                            client.id
                          }
                        >

                          <td>
                            <span
                              className={
                                styles.clientCode
                              }
                            >
                              {
                                client.client_code
                              }
                            </span>
                          </td>

                          <td>

                            <div
                              className={
                                styles.clientName
                              }
                            >
                              {
                                client.client_name
                              }
                            </div>

                            {client.company_name && (
                              <div
                                className={
                                  styles.companyName
                                }
                              >
                                {
                                  client.company_name
                                }
                              </div>
                            )}

                          </td>

                          <td>

                            <div
                              className={
                                styles.contactEmail
                              }
                            >
                              {
                                client.email ||
                                "-"
                              }
                            </div>

                            <div
                              className={
                                styles.contactPhone
                              }
                            >
                              {
                                client.phone ||
                                "-"
                              }
                            </div>

                          </td>

                          <td>
                            {
                              client.client_type ||
                              "-"
                            }
                          </td>

                          <td>
                            {getEmployeeName(
                              client.assigned_employee_id
                            )}
                          </td>

                          <td>

                            <span
                              className={`${styles.status} ${
                                client.status ===
                                "Active"
                                  ? styles.active
                                  : styles.inactive
                              }`}
                            >
                              {
                                client.status
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
                                type="button"
                                onClick={() =>
                                  openEditForm(
                                    client
                                  )
                                }
                                className={
                                  styles.editButton
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteClient(
                                    client.id
                                  )
                                }
                                className={
                                  styles.deleteButton
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

          </div>

        </main>

      </div>

    </div>
  );
}