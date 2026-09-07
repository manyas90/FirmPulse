"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./timeline.module.css";

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

type Timeline = {
  id: number;
  timeline_code: string;
  client_id: number;
  event_type: string;
  title: string;
  description?: string | null;
  assigned_employee_id?: number | null;
  event_date: string;
  created_at?: string;
  updated_at?: string;
};

type TimelineForm = {
  timeline_code: string;
  client_id: string;
  event_type: string;
  title: string;
  description: string;
  assigned_employee_id: string;
  event_date: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const emptyForm: TimelineForm = {
  timeline_code: "",
  client_id: "",
  event_type: "Task",
  title: "",
  description: "",
  assigned_employee_id: "",
  event_date: "",
};

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
  {
    label: "Compliance",
    href: "/compliance",
    icon: "◆",
  },
  {
    label: "Timeline",
    href: "/timeline",
    icon: "◷",
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

export default function TimelinePage() {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("All");
  const [clientFilter, setClientFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<TimelineForm>(emptyForm);

  // ---------------------------------------------------------
  // LOAD DATA
  // ---------------------------------------------------------

  async function loadData() {
    try {
      setRefreshing(true);

      const [
        timelineResponse,
        clientsResponse,
        employeesResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/timeline/`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/clients/`, {
          cache: "no-store",
        }),
        fetch(`${API_URL}/employees/`, {
          cache: "no-store",
        }),
      ]);

      if (!timelineResponse.ok) {
        throw new Error("Failed to fetch timeline");
      }

      if (!clientsResponse.ok) {
        throw new Error("Failed to fetch clients");
      }

      if (!employeesResponse.ok) {
        throw new Error("Failed to fetch employees");
      }

      const timelineData =
        await timelineResponse.json();

      const clientsData =
        await clientsResponse.json();

      const employeesData =
        await employeesResponse.json();

      setTimelines(timelineData);
      setClients(clientsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error(
        "Timeline loading error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ---------------------------------------------------------
  // STATISTICS
  // ---------------------------------------------------------

  const totalEvents = timelines.length;

  const taskEvents = timelines.filter(
    (item) =>
      item.event_type?.toLowerCase() === "task"
  ).length;

  const documentEvents = timelines.filter(
    (item) =>
      item.event_type?.toLowerCase() ===
      "document"
  ).length;

  const complianceEvents = timelines.filter(
    (item) =>
      item.event_type?.toLowerCase() ===
      "compliance"
  ).length;

  // ---------------------------------------------------------
  // FILTERS
  // ---------------------------------------------------------

  const filteredTimelines = useMemo(() => {
    const query = search.trim().toLowerCase();

    return timelines.filter((item) => {
      const client = clients.find(
        (client) =>
          client.id === item.client_id
      );

      const clientName =
        client?.client_name || "";

      const matchesSearch =
        !query ||
        item.title
          ?.toLowerCase()
          .includes(query) ||
        item.event_type
          ?.toLowerCase()
          .includes(query) ||
        item.timeline_code
          ?.toLowerCase()
          .includes(query) ||
        clientName
          .toLowerCase()
          .includes(query);

      const matchesEvent =
        eventFilter === "All" ||
        item.event_type === eventFilter;

      const matchesClient =
        clientFilter === "All" ||
        item.client_id ===
          Number(clientFilter);

      return (
        matchesSearch &&
        matchesEvent &&
        matchesClient
      );
    });
  }, [
    timelines,
    clients,
    search,
    eventFilter,
    clientFilter,
  ]);

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------

  function getClientName(clientId: number) {
    const client = clients.find(
      (item) => item.id === clientId
    );

    if (!client) {
      return "Unknown Client";
    }

    return (
      client.company_name ||
      client.client_name
    );
  }

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

  function formatDate(date: string) {
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
  }

  function formatDateTime(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function getEventClass(eventType: string) {
    const value =
      eventType?.toLowerCase();

    if (value === "task") {
      return `${styles.event} ${styles.task}`;
    }

    if (value === "document") {
      return `${styles.event} ${styles.document}`;
    }

    if (value === "compliance") {
      return `${styles.event} ${styles.compliance}`;
    }

    if (value === "communication") {
      return `${styles.event} ${styles.communication}`;
    }

    return `${styles.event} ${styles.defaultEvent}`;
  }

  function getEventIcon(eventType: string) {
    const value =
      eventType?.toLowerCase();

    if (value === "task") return "✓";
    if (value === "document") return "▤";
    if (value === "compliance") return "!";
    if (value === "communication") return "✉";

    return "●";
  }

  // ---------------------------------------------------------
  // OPEN ADD MODAL
  // ---------------------------------------------------------

  function openAddModal() {
    setEditingId(null);

    const now = new Date();

    const localDateTime =
      new Date(
        now.getTime() -
          now.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);

    setForm({
      ...emptyForm,
      timeline_code: `TL-${Date.now()}`,
      event_date: localDateTime,
    });

    setShowModal(true);
  }

  // ---------------------------------------------------------
  // OPEN EDIT MODAL
  // ---------------------------------------------------------

  function openEditModal(item: Timeline) {
    setEditingId(item.id);

    setForm({
      timeline_code:
        item.timeline_code || "",

      client_id:
        String(item.client_id),

      event_type:
        item.event_type || "Task",

      title:
        item.title || "",

      description:
        item.description || "",

      assigned_employee_id:
        item.assigned_employee_id
          ? String(
              item.assigned_employee_id
            )
          : "",

      event_date:
        item.event_date
          ? new Date(item.event_date)
              .toISOString()
              .slice(0, 16)
          : "",
    });

    setShowModal(true);
  }

  // ---------------------------------------------------------
  // SAVE
  // ---------------------------------------------------------

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!form.client_id) {
      alert("Please select a client.");
      return;
    }

    if (!form.title.trim()) {
      alert("Please enter an event title.");
      return;
    }

    if (!form.event_date) {
      alert("Please select event date.");
      return;
    }

    const payload = {
      timeline_code:
        form.timeline_code.trim(),

      client_id:
        Number(form.client_id),

      event_type:
        form.event_type,

      title:
        form.title.trim(),

      description:
        form.description.trim() || null,

      assigned_employee_id:
        form.assigned_employee_id
          ? Number(
              form.assigned_employee_id
            )
          : null,

      event_date:
        new Date(
          form.event_date
        ).toISOString(),
    };

    try {
      const url = editingId
        ? `${API_URL}/timeline/${editingId}`
        : `${API_URL}/timeline/`;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json().catch(
            () => null
          );

        throw new Error(
          errorData?.detail ||
            "Failed to save timeline event"
        );
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadData();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save timeline event"
      );
    }
  }

  // ---------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------

  async function handleDelete(id: number) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this timeline event?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/timeline/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete timeline event"
        );
      }

      await loadData();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete timeline event"
      );
    }
  }

  // ---------------------------------------------------------
  // CLOSE MODAL
  // ---------------------------------------------------------

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  return (
    <div className={styles.layout}>

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          className={styles.overlay}
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Close sidebar"
        />
      )}

      {/* SIDEBAR */}

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

          <div className={styles.logoText}>
            FirmPulse
            <span>
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

          <div className={styles.navTitle}>
            MAIN MENU
          </div>

          <nav className={styles.navigation}>

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

                  <span className={styles.navIcon}>
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>

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

        {/* SIDEBAR BOTTOM */}

        <div className={styles.sidebarBottom}>

          <div className={styles.profile}>

            <div className={styles.avatar}>
              A
            </div>

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
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open sidebar"
          >
            ☰
          </button>

          <div className={styles.mobileLogo}>
            <strong>FirmPulse</strong>
          </div>

        </div>

        <main className={styles.page}>

          {/* HEADER */}

          <header className={styles.header}>

            <div className={styles.headerLeft}>

              <button
                className={styles.backButton}
                onClick={() =>
                  router.push("/")
                }
              >
                ←
              </button>

              <div>

                <div className={styles.eyebrow}>
                  FIRMPULSE · CLIENT MANAGEMENT
                </div>

                <h1>
                  Client Timeline
                </h1>

                <p>
                  Track important activities and
                  events for your clients.
                </p>

              </div>

            </div>

            <div className={styles.headerActions}>

              <button
                className={
                  styles.secondaryButton
                }
                onClick={loadData}
              >
                {refreshing
                  ? "Refreshing..."
                  : "⟳ Refresh"}
              </button>

              <button
                className={
                  styles.primaryButton
                }
                onClick={openAddModal}
              >
                <span>+</span>
                Add Event
              </button>

            </div>

          </header>

          {/* STATISTICS */}

          <section
            className={styles.statsGrid}
          >

            <div className={styles.statCard}>
              <span>Total Events</span>

              <strong>
                {totalEvents}
              </strong>

              <small>
                All timeline activities
              </small>
            </div>

            <div className={styles.statCard}>
              <span>Task Events</span>

              <strong>
                {taskEvents}
              </strong>

              <small>
                Work-related activities
              </small>
            </div>

            <div className={styles.statCard}>
              <span>Documents</span>

              <strong>
                {documentEvents}
              </strong>

              <small>
                Document activities
              </small>
            </div>

            <div className={styles.statCard}>
              <span>Compliance</span>

              <strong>
                {complianceEvents}
              </strong>

              <small>
                GST & compliance events
              </small>
            </div>

          </section>

          {/* FILTERS */}

          <section
            className={styles.filterPanel}
          >

            <div className={styles.searchBox}>

              <span>⌕</span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search timeline events..."
              />

            </div>

            <select
              value={clientFilter}
              onChange={(event) =>
                setClientFilter(
                  event.target.value
                )
              }
            >

              <option value="All">
                All Clients
              </option>

              {clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.company_name ||
                    client.client_name}
                </option>
              ))}

            </select>

            <select
              value={eventFilter}
              onChange={(event) =>
                setEventFilter(
                  event.target.value
                )
              }
            >

              <option value="All">
                All Event Types
              </option>

              <option value="Task">
                Task
              </option>

              <option value="Document">
                Document
              </option>

              <option value="Compliance">
                Compliance
              </option>

              <option value="Communication">
                Communication
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </section>

          {/* TIMELINE */}

          <section
            className={styles.timelinePanel}
          >

            <div
              className={styles.panelHeader}
            >

              <div>

                <h2>
                  Activity Timeline
                </h2>

                <p>
                  {filteredTimelines.length} event
                  {filteredTimelines.length !==
                  1
                    ? "s"
                    : ""}{" "}
                  found
                </p>

              </div>

            </div>

            {loading ? (

              <div
                className={styles.emptyState}
              >
                Loading timeline...
              </div>

            ) : filteredTimelines.length ===
              0 ? (

              <div
                className={styles.emptyState}
              >

                <div
                  className={styles.emptyIcon}
                >
                  ◷
                </div>

                <strong>
                  No timeline events found
                </strong>

                <p>
                  Add your first client activity
                  to get started.
                </p>

                <button
                  className={
                    styles.primaryButton
                  }
                  onClick={openAddModal}
                >
                  + Add Event
                </button>

              </div>

            ) : (

              <div
                className={styles.timeline}
              >

                {filteredTimelines.map(
                  (item) => (

                    <div
                      className={
                        styles.timelineItem
                      }
                      key={item.id}
                    >

                      <div
                        className={
                          getEventClass(
                            item.event_type
                          )
                        }
                      >
                        {getEventIcon(
                          item.event_type
                        )}
                      </div>

                      <div
                        className={
                          styles.timelineContent
                        }
                      >

                        <div
                          className={
                            styles.timelineTop
                          }
                        >

                          <div>

                            <span
                              className={
                                getEventClass(
                                  item.event_type
                                )
                              }
                            >
                              {item.event_type}
                            </span>

                            <h3>
                              {item.title}
                            </h3>

                          </div>

                          <span
                            className={styles.date}
                          >
                            {formatDateTime(
                              item.event_date
                            )}
                          </span>

                        </div>

                        <div
                          className={
                            styles.clientName
                          }
                        >
                          {getClientName(
                            item.client_id
                          )}
                        </div>

                        {item.description && (
                          <p
                            className={
                              styles.description
                            }
                          >
                            {item.description}
                          </p>
                        )}

                        <div
                          className={
                            styles.timelineMeta
                          }
                        >

                          <span>
                            Code:{" "}
                            {item.timeline_code}
                          </span>

                          <span>
                            Employee:{" "}
                            {getEmployeeName(
                              item.assigned_employee_id
                            )}
                          </span>

                          <span>
                            Event date:{" "}
                            {formatDate(
                              item.event_date
                            )}
                          </span>

                        </div>

                        <div
                          className={
                            styles.itemActions
                          }
                        >

                          <button
                            onClick={() =>
                              openEditModal(
                                item
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className={
                              styles.delete
                            }
                            onClick={() =>
                              handleDelete(
                                item.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

          {/* MODAL */}

          {showModal && (

            <div
              className={
                styles.modalOverlay
              }
            >

              <div
                className={styles.modal}
              >

                <div
                  className={
                    styles.modalHeader
                  }
                >

                  <div>

                    <h2>
                      {editingId
                        ? "Edit Timeline Event"
                        : "Add Timeline Event"}
                    </h2>

                    <p>
                      Record an activity for a
                      client.
                    </p>

                  </div>

                  <button
                    className={
                      styles.closeButton
                    }
                    onClick={closeModal}
                  >
                    ×
                  </button>

                </div>

                <form
                  onSubmit={handleSubmit}
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

                      <label>
                        Timeline Code
                      </label>

                      <input
                        value={
                          form.timeline_code
                        }
                        onChange={(event) =>
                          setForm({
                            ...form,
                            timeline_code:
                              event.target.value,
                          })
                        }
                        required
                      />

                    </div>

                    <div
                      className={
                        styles.formGroup
                      }
                    >

                      <label>
                        Client *
                      </label>

                      <select
                        value={form.client_id}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            client_id:
                              event.target.value,
                          })
                        }
                        required
                      >

                        <option value="">
                          Select client
                        </option>

                        {clients.map(
                          (client) => (

                            <option
                              key={client.id}
                              value={client.id}
                            >
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

                      <label>
                        Event Type *
                      </label>

                      <select
                        value={
                          form.event_type
                        }
                        onChange={(event) =>
                          setForm({
                            ...form,
                            event_type:
                              event.target.value,
                          })
                        }
                      >

                        <option value="Task">
                          Task
                        </option>

                        <option value="Document">
                          Document
                        </option>

                        <option value="Compliance">
                          Compliance
                        </option>

                        <option value="Communication">
                          Communication
                        </option>

                        <option value="Other">
                          Other
                        </option>

                      </select>

                    </div>

                    <div
                      className={
                        styles.formGroup
                      }
                    >

                      <label>
                        Event Date *
                      </label>

                      <input
                        type="datetime-local"
                        value={
                          form.event_date
                        }
                        onChange={(event) =>
                          setForm({
                            ...form,
                            event_date:
                              event.target.value,
                          })
                        }
                        required
                      />

                    </div>

                    <div
                      className={`${styles.formGroup} ${styles.full}`}
                    >

                      <label>
                        Title *
                      </label>

                      <input
                        value={form.title}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            title:
                              event.target.value,
                          })
                        }
                        placeholder="e.g. GST return submitted"
                        required
                      />

                    </div>

                    <div
                      className={
                        styles.formGroup
                      }
                    >

                      <label>
                        Assigned Employee
                      </label>

                      <select
                        value={
                          form.assigned_employee_id
                        }
                        onChange={(event) =>
                          setForm({
                            ...form,
                            assigned_employee_id:
                              event.target.value,
                          })
                        }
                      >

                        <option value="">
                          Unassigned
                        </option>

                        {employees.map(
                          (employee) => (

                            <option
                              key={employee.id}
                              value={employee.id}
                            >
                              {employee.name}
                            </option>

                          )
                        )}

                      </select>

                    </div>

                    <div
                      className={`${styles.formGroup} ${styles.full}`}
                    >

                      <label>
                        Description
                      </label>

                      <textarea
                        value={
                          form.description
                        }
                        onChange={(event) =>
                          setForm({
                            ...form,
                            description:
                              event.target.value,
                          })
                        }
                        placeholder="Add additional details..."
                        rows={4}
                      />

                    </div>

                  </div>

                  <div
                    className={
                      styles.modalFooter
                    }
                  >

                    <button
                      type="button"
                      className={
                        styles.cancelButton
                      }
                      onClick={closeModal}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className={
                        styles.primaryButton
                      }
                    >
                      {editingId
                        ? "Update Event"
                        : "Save Event"}
                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

        </main>

      </div>

    </div>
  );
}