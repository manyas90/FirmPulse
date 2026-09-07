"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Client = {
  id: number;
  client_name: string;
  company_name?: string;
};

type Employee = {
  id: number;
  name: string;
};

type Communication = {
  id: number;
  communication_code: string;
  client_id: number;
  communication_type: string;
  subject: string;
  message?: string;
  assigned_employee_id?: number | null;
  communication_date: string;
  created_at?: string;
  updated_at?: string;
};

type FormData = {
  communication_code: string;
  client_id: string;
  communication_type: string;
  subject: string;
  message: string;
  assigned_employee_id: string;
  communication_date: string;
};

const emptyForm: FormData = {
  communication_code: "",
  client_id: "",
  communication_type: "Email",
  subject: "",
  message: "",
  assigned_employee_id: "",
  communication_date: "",
};

export default function CommunicationsPage() {
  const router = useRouter();

  const [communications, setCommunications] = useState<Communication[]>(
    []
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<FormData>(emptyForm);

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [communicationRes, clientRes, employeeRes] =
        await Promise.all([
          fetch(`${API_URL}/communications/`),
          fetch(`${API_URL}/clients/`),
          fetch(`${API_URL}/employees/`),
        ]);

      if (!communicationRes.ok) {
        throw new Error("Failed to load communications");
      }

      if (!clientRes.ok) {
        throw new Error("Failed to load clients");
      }

      if (!employeeRes.ok) {
        throw new Error("Failed to load employees");
      }

      const communicationData = await communicationRes.json();
      const clientData = await clientRes.json();
      const employeeData = await employeeRes.json();

      setCommunications(communicationData);
      setClients(clientData);
      setEmployees(employeeData);
    } catch (err) {
      console.error(err);
      setError("Unable to load communication data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  function getClientName(clientId: number) {
    const client = clients.find((item) => item.id === clientId);

    if (!client) {
      return `Client #${clientId}`;
    }

    return client.company_name
      ? `${client.client_name} · ${client.company_name}`
      : client.client_name;
  }

  function getEmployeeName(employeeId?: number | null) {
    if (!employeeId) {
      return "Unassigned";
    }

    const employee = employees.find(
      (item) => item.id === employeeId
    );

    return employee ? employee.name : `Employee #${employeeId}`;
  }

  function formatDate(dateString: string) {
    if (!dateString) {
      return "-";
    }

    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getTypeIcon(type: string) {
    switch (type.toLowerCase()) {
      case "email":
        return "✉";

      case "call":
        return "☎";

      case "meeting":
        return "◉";

      case "whatsapp":
        return "◌";

      default:
        return "•";
    }
  }

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredCommunications = useMemo(() => {
    const query = search.toLowerCase().trim();

    return communications.filter((communication) => {
      const matchesType =
        typeFilter === "All" ||
        communication.communication_type === typeFilter;

      const clientName = getClientName(
        communication.client_id
      ).toLowerCase();

      const employeeName = getEmployeeName(
        communication.assigned_employee_id
      ).toLowerCase();

      const matchesSearch =
        !query ||
        communication.communication_code
          .toLowerCase()
          .includes(query) ||
        communication.subject.toLowerCase().includes(query) ||
        (communication.message || "")
          .toLowerCase()
          .includes(query) ||
        clientName.includes(query) ||
        employeeName.includes(query);

      return matchesType && matchesSearch;
    });
  }, [
    communications,
    search,
    typeFilter,
    clients,
    employees,
  ]);

  // --------------------------------------------------
  // OPEN ADD MODAL
  // --------------------------------------------------

  function openAddModal() {
    setEditingId(null);

    setForm({
      ...emptyForm,
      communication_code: `COM-${String(
        communications.length + 1
      ).padStart(3, "0")}`,
      communication_date: new Date().toISOString().slice(0, 16),
    });

    setShowModal(true);
  }

  // --------------------------------------------------
  // OPEN EDIT MODAL
  // --------------------------------------------------

  function openEditModal(communication: Communication) {
    setEditingId(communication.id);

    setForm({
      communication_code:
        communication.communication_code,

      client_id: String(communication.client_id),

      communication_type:
        communication.communication_type,

      subject: communication.subject,

      message: communication.message || "",

      assigned_employee_id:
        communication.assigned_employee_id
          ? String(communication.assigned_employee_id)
          : "",

      communication_date:
        communication.communication_date
          ? communication.communication_date.slice(0, 16)
          : "",
    });

    setShowModal(true);
  }

  // --------------------------------------------------
  // SAVE
  // --------------------------------------------------

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.communication_code.trim()) {
      alert("Communication code is required.");
      return;
    }

    if (!form.client_id) {
      alert("Please select a client.");
      return;
    }

    if (!form.subject.trim()) {
      alert("Subject is required.");
      return;
    }

    if (!form.communication_date) {
      alert("Communication date is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        communication_code:
          form.communication_code.trim(),

        client_id: Number(form.client_id),

        communication_type:
          form.communication_type,

        subject: form.subject.trim(),

        message: form.message.trim() || null,

        assigned_employee_id:
          form.assigned_employee_id
            ? Number(form.assigned_employee_id)
            : null,

        communication_date:
          new Date(form.communication_date).toISOString(),
      };

      const url = editingId
        ? `${API_URL}/communications/${editingId}`
        : `${API_URL}/communications/`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail ||
            "Failed to save communication"
        );
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to save communication."
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this communication?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/communications/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail ||
            "Failed to delete communication"
        );
      }

      await loadData();
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete communication."
      );
    }
  }

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  const total = communications.length;

  const emailCount = communications.filter(
    (item) => item.communication_type === "Email"
  ).length;

  const callCount = communications.filter(
    (item) => item.communication_type === "Call"
  ).length;

  const meetingCount = communications.filter(
    (item) => item.communication_type === "Meeting"
  ).length;

  const whatsappCount = communications.filter(
    (item) => item.communication_type === "WhatsApp"
  ).length;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <main className="page">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">F</div>

          <div>
            <div className="logo-name">FirmPulse</div>
            <div className="logo-subtitle">
              Practice Management
            </div>
          </div>
        </div>

        <nav>
          <button onClick={() => router.push("/")}>
            <span>⌂</span>
            Dashboard
          </button>

          <button
            onClick={() => router.push("/employees")}
          >
            <span>👥</span>
            Employees
          </button>

          <button
            onClick={() => router.push("/clients")}
          >
            <span>▣</span>
            Clients
          </button>

          <button
            onClick={() => router.push("/tasks")}
          >
            <span>✓</span>
            Tasks & Workload
          </button>

          <button
            onClick={() => router.push("/documents")}
          >
            <span>▤</span>
            Documents
          </button>

          <button
            onClick={() => router.push("/compliance")}
          >
            <span>▥</span>
            GST & Compliance
          </button>

          <button
            onClick={() => router.push("/timeline")}
          >
            <span>◷</span>
            Client Timeline
          </button>

          <button className="active">
            <span>✉</span>
            Communications
          </button>

          <button
            onClick={() => router.push("/analytics")}
          >
            <span>▦</span>
            Analytics
          </button>
        </nav>
      </aside>

      {/* CONTENT */}

      <section className="content">
        <header className="header">
          <div>
            <div className="eyebrow">
              CLIENT RELATIONSHIP
            </div>

            <h1>Communications</h1>

            <p>
              Track emails, calls, meetings and client
              interactions.
            </p>
          </div>

          <button
            className="add-button"
            onClick={openAddModal}
          >
            + Add Communication
          </button>
        </header>

        {/* STATS */}

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon">✉</div>

            <div>
              <div className="stat-label">
                Total Communications
              </div>

              <div className="stat-value">{total}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✉</div>

            <div>
              <div className="stat-label">Emails</div>

              <div className="stat-value">
                {emailCount}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">☎</div>

            <div>
              <div className="stat-label">Calls</div>

              <div className="stat-value">
                {callCount}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">◉</div>

            <div>
              <div className="stat-label">Meetings</div>

              <div className="stat-value">
                {meetingCount}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">◌</div>

            <div>
              <div className="stat-label">WhatsApp</div>

              <div className="stat-value">
                {whatsappCount}
              </div>
            </div>
          </div>
        </section>

        {/* FILTERS */}

        <section className="toolbar">
          <input
            type="text"
            placeholder="Search communications..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
          >
            <option value="All">All Types</option>
            <option value="Email">Email</option>
            <option value="Call">Call</option>
            <option value="Meeting">Meeting</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Other">Other</option>
          </select>
        </section>

        {/* ERROR */}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {/* COMMUNICATION LIST */}

        <section className="communication-panel">
          <div className="panel-header">
            <div>
              <h2>Communication History</h2>

              <p>
                {filteredCommunications.length} communication
                {filteredCommunications.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="empty">
              Loading communications...
            </div>
          ) : filteredCommunications.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">✉</div>

              <h3>No communications found</h3>

              <p>
                Add your first client communication to get
                started.
              </p>

              <button
                className="empty-button"
                onClick={openAddModal}
              >
                + Add Communication
              </button>
            </div>
          ) : (
            <div className="communication-list">
              {filteredCommunications.map(
                (communication) => (
                  <article
                    className="communication-card"
                    key={communication.id}
                  >
                    <div className="type-icon">
                      {getTypeIcon(
                        communication.communication_type
                      )}
                    </div>

                    <div className="communication-main">
                      <div className="communication-top">
                        <div>
                          <span className="code">
                            {
                              communication.communication_code
                            }
                          </span>

                          <span className="type-badge">
                            {
                              communication.communication_type
                            }
                          </span>
                        </div>

                        <div className="date">
                          {formatDate(
                            communication.communication_date
                          )}
                        </div>
                      </div>

                      <h3>
                        {communication.subject}
                      </h3>

                      <div className="client">
                        Client:{" "}
                        <strong>
                          {getClientName(
                            communication.client_id
                          )}
                        </strong>
                      </div>

                      {communication.message && (
                        <p className="message">
                          {communication.message}
                        </p>
                      )}

                      <div className="communication-bottom">
                        <span>
                          Assigned to:{" "}
                          <strong>
                            {getEmployeeName(
                              communication.assigned_employee_id
                            )}
                          </strong>
                        </span>

                        <div className="actions">
                          <button
                            onClick={() =>
                              openEditModal(
                                communication
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete"
                            onClick={() =>
                              handleDelete(
                                communication.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </section>

      {/* MODAL */}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={() =>
            setShowModal(false)
          }
        >
          <div
            className="modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <div className="eyebrow">
                  COMMUNICATION
                </div>

                <h2>
                  {editingId
                    ? "Edit Communication"
                    : "Add Communication"}
                </h2>
              </div>

              <button
                className="close"
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* CODE */}

                <div className="field">
                  <label>
                    Communication Code *
                  </label>

                  <input
                    value={
                      form.communication_code
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        communication_code:
                          event.target.value,
                      })
                    }
                    placeholder="COM-001"
                  />
                </div>

                {/* TYPE */}

                <div className="field">
                  <label>
                    Communication Type *
                  </label>

                  <select
                    value={
                      form.communication_type
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        communication_type:
                          event.target.value,
                      })
                    }
                  >
                    <option value="Email">
                      Email
                    </option>

                    <option value="Call">
                      Call
                    </option>

                    <option value="Meeting">
                      Meeting
                    </option>

                    <option value="WhatsApp">
                      WhatsApp
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* CLIENT */}

                <div className="field">
                  <label>Client *</label>

                  <select
                    value={form.client_id}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        client_id:
                          event.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select Client
                    </option>

                    {clients.map((client) => (
                      <option
                        key={client.id}
                        value={client.id}
                      >
                        {client.client_name}
                        {client.company_name
                          ? ` · ${client.company_name}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* EMPLOYEE */}

                <div className="field">
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
                      Select Employee
                    </option>

                    {employees.map((employee) => (
                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DATE */}

                <div className="field">
                  <label>
                    Communication Date *
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      form.communication_date
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        communication_date:
                          event.target.value,
                      })
                    }
                  />
                </div>

                {/* SUBJECT */}

                <div className="field full">
                  <label>Subject *</label>

                  <input
                    value={form.subject}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        subject:
                          event.target.value,
                      })
                    }
                    placeholder="Enter communication subject"
                  />
                </div>

                {/* MESSAGE */}

                <div className="field full">
                  <label>
                    Message / Notes
                  </label>

                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        message:
                          event.target.value,
                      })
                    }
                    placeholder="Enter communication details..."
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Communication"
                    : "Save Communication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #f7f3eb;
          color: #26362f;
          font-family: Arial, Helvetica, sans-serif;
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 245px;
          background: #173d30;
          color: white;
          padding: 24px 16px;
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
          padding: 34px 38px 50px;
        }

        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .eyebrow {
          color: #708071;
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

        .add-button,
        .empty-button {
          border: none;
          background: #234d3c;
          color: white;
          padding: 12px 18px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 700;
        }

        .add-button:hover,
        .empty-button:hover {
          background: #173d30;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e8e1d5;
          border-radius: 15px;
          padding: 19px;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #edf4ef;
          color: #234d3c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .stat-label {
          color: #7d867f;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .stat-value {
          color: #173d30;
          font-size: 24px;
          font-weight: 800;
        }

        .toolbar {
          background: white;
          border: 1px solid #e8e1d5;
          border-radius: 15px;
          padding: 16px;
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .toolbar input {
          flex: 1;
        }

        input,
        select,
        textarea {
          width: 100%;
          border: 1px solid #dcd7cc;
          background: white;
          border-radius: 8px;
          padding: 11px 12px;
          font-size: 13px;
          color: #26362f;
          outline: none;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #6d927d;
        }

        .toolbar select {
          width: 180px;
        }

        .communication-panel {
          background: white;
          border: 1px solid #e8e1d5;
          border-radius: 15px;
          overflow: hidden;
        }

        .panel-header {
          padding: 22px 24px;
          border-bottom: 1px solid #eee9df;
        }

        .panel-header h2 {
          margin: 0;
          color: #173d30;
          font-size: 19px;
        }

        .panel-header p {
          margin: 5px 0 0;
          color: #89918b;
          font-size: 12px;
        }

        .communication-list {
          padding: 10px 20px 20px;
        }

        .communication-card {
          display: flex;
          gap: 15px;
          padding: 19px 5px;
          border-bottom: 1px solid #eee9df;
        }

        .communication-card:last-child {
          border-bottom: none;
        }

        .type-icon {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          border-radius: 12px;
          background: #edf4ef;
          color: #234d3c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .communication-main {
          flex: 1;
          min-width: 0;
        }

        .communication-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .code {
          color: #7c857e;
          font-size: 11px;
          margin-right: 8px;
        }

        .type-badge {
          display: inline-block;
          background: #f0f4ef;
          color: #315c49;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }

        .date {
          color: #7e8780;
          font-size: 11px;
          white-space: nowrap;
        }

        .communication-card h3 {
          margin: 8px 0 6px;
          font-size: 16px;
          color: #26362f;
        }

        .client {
          color: #7a847d;
          font-size: 12px;
        }

        .client strong {
          color: #315c49;
        }

        .message {
          color: #69746d;
          font-size: 13px;
          line-height: 1.5;
          margin: 9px 0;
        }

        .communication-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
          color: #858d87;
          font-size: 11px;
        }

        .communication-bottom strong {
          color: #315c49;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .actions button {
          border: 1px solid #d9d5cc;
          background: white;
          color: #315c49;
          padding: 6px 10px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 11px;
        }

        .actions button:hover {
          background: #f4f6f2;
        }

        .actions button.delete {
          color: #a34b42;
          border-color: #e3c9c5;
        }

        .empty {
          text-align: center;
          padding: 65px 20px;
          color: #8a928c;
        }

        .empty-icon {
          font-size: 34px;
          margin-bottom: 12px;
        }

        .empty h3 {
          margin: 0 0 6px;
          color: #315c49;
        }

        .empty p {
          font-size: 13px;
          margin-bottom: 20px;
        }

        .error {
          background: #fff1ef;
          border: 1px solid #e4c5c0;
          color: #9b4339;
          padding: 13px 16px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 13px;
        }

        /* MODAL */

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(20, 35, 28, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 100;
        }

        .modal {
          width: 720px;
          max-width: 100%;
          max-height: 92vh;
          overflow-y: auto;
          background: white;
          border-radius: 17px;
          box-shadow: 0 20px 70px rgba(0, 0, 0, 0.22);
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 24px 25px;
          border-bottom: 1px solid #ece7dd;
        }

        .modal-header h2 {
          margin: 0;
          color: #173d30;
          font-size: 22px;
        }

        .close {
          border: none;
          background: transparent;
          color: #6d756f;
          font-size: 28px;
          cursor: pointer;
          line-height: 1;
        }

        form {
          padding: 25px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          font-size: 12px;
          font-weight: 700;
          color: #536159;
        }

        textarea {
          resize: vertical;
          min-height: 110px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #ece7dd;
        }

        .cancel-button,
        .save-button {
          border: none;
          padding: 11px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        .cancel-button {
          background: #f0eee8;
          color: #536159;
        }

        .save-button {
          background: #234d3c;
          color: white;
        }

        .save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 1100px) {
          .stats {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 850px) {
          .sidebar {
            width: 190px;
          }

          .content {
            margin-left: 190px;
            padding: 25px;
          }

          .stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .sidebar {
            display: none;
          }

          .content {
            margin-left: 0;
            padding: 20px;
          }

          .header {
            flex-direction: column;
            gap: 15px;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .toolbar {
            flex-direction: column;
          }

          .toolbar select {
            width: 100%;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }

          .communication-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .communication-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </main>
  );
}