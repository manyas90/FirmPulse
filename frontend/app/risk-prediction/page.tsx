"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Prediction = {
  id: number;
  client_id: number | null;
  task_id: number | null;
  risk_score: number;
  risk_level: string;
  risk_reason: string | null;
  predicted_at: string | null;
  created_at: string | null;
};

type Task = {
  id: number;
  title: string;
  client_name: string | null;
  priority: string;
  status: string;
  due_date: string | null;
};

export default function RiskPredictionPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [predictionRes, taskRes] = await Promise.all([
        fetch(`${API_URL}/risk-prediction/`),
        fetch(`${API_URL}/tasks/`),
      ]);

      if (!predictionRes.ok || !taskRes.ok) {
        throw new Error("Failed to load data");
      }

      const predictionData = await predictionRes.json();
      const taskData = await taskRes.json();

      setPredictions(predictionData);
      setTasks(taskData);
    } catch (err) {
      console.error(err);
      setError("Unable to load risk prediction data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateRisk = async () => {
    if (!selectedTask) {
      alert("Please select a task.");
      return;
    }

    try {
      setCalculating(true);
      setError("");

      const response = await fetch(
        `${API_URL}/risk-prediction/calculate/task/${selectedTask}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Risk calculation failed");
      }

      await response.json();

      setSelectedTask("");
      await loadData();

      alert("Risk prediction calculated successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to calculate risk.");
    } finally {
      setCalculating(false);
    }
  };

  const deletePrediction = async (id: number) => {
    if (!confirm("Delete this risk prediction?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/risk-prediction/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await loadData();
    } catch (err) {
      console.error(err);
      setError("Unable to delete prediction.");
    }
  };

  const getRiskClass = (level: string) => {
    if (level === "High") return "high";
    if (level === "Medium") return "medium";
    return "low";
  };

  const highRisk = predictions.filter(
    (p) => p.risk_level === "High"
  ).length;

  const mediumRisk = predictions.filter(
    (p) => p.risk_level === "Medium"
  ).length;

  const lowRisk = predictions.filter(
    (p) => p.risk_level === "Low"
  ).length;

  const averageRisk =
    predictions.length > 0
      ? Math.round(
          predictions.reduce(
            (sum, prediction) => sum + prediction.risk_score,
            0
          ) / predictions.length
        )
      : 0;

  const getTaskTitle = (taskId: number | null) => {
    if (!taskId) return "—";

    const task = tasks.find((item) => item.id === taskId);

    return task ? task.title : `Task #${taskId}`;
  };

  if (loading) {
    return (
      <main className="page">
        <div className="loading">Loading risk predictions...</div>
      </main>
    );
  }

  return (
    <main className="page">
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f7f3ea;
          padding: 32px;
          color: #26352c;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 28px;
        }

        .title {
          font-size: 32px;
          font-weight: 700;
          margin: 0;
        }

        .subtitle {
          margin: 7px 0 0;
          color: #718078;
          font-size: 15px;
        }

        .actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        select {
          border: 1px solid #d8ddd7;
          background: white;
          border-radius: 9px;
          padding: 11px 14px;
          min-width: 220px;
          color: #26352c;
          outline: none;
        }

        button {
          border: none;
          border-radius: 9px;
          padding: 11px 18px;
          cursor: pointer;
          font-weight: 600;
        }

        .calculate {
          background: #2f5d46;
          color: white;
        }

        .calculate:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .refresh {
          background: white;
          color: #2f5d46;
          border: 1px solid #d8ddd7;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat {
          background: white;
          border: 1px solid #e2e5df;
          border-radius: 14px;
          padding: 20px;
        }

        .stat-label {
          font-size: 13px;
          color: #77847d;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 30px;
          font-weight: 700;
        }

        .high-text {
          color: #b44343;
        }

        .medium-text {
          color: #b37a22;
        }

        .low-text {
          color: #3f7652;
        }

        .average-text {
          color: #315d78;
        }

        .panel {
          background: white;
          border: 1px solid #e2e5df;
          border-radius: 14px;
          overflow: hidden;
        }

        .panel-header {
          padding: 20px 22px;
          border-bottom: 1px solid #e8ebe6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .panel-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 14px 18px;
          font-size: 12px;
          color: #77847d;
          background: #fafbf9;
          border-bottom: 1px solid #e8ebe6;
          text-transform: uppercase;
        }

        td {
          padding: 16px 18px;
          border-bottom: 1px solid #edf0ec;
          font-size: 14px;
        }

        tr:last-child td {
          border-bottom: none;
        }

        .risk-badge {
          display: inline-block;
          padding: 6px 11px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .risk-badge.high {
          background: #f8e1e1;
          color: #a53d3d;
        }

        .risk-badge.medium {
          background: #f8edd8;
          color: #9a681d;
        }

        .risk-badge.low {
          background: #e3f0e6;
          color: #39704c;
        }

        .score {
          font-weight: 700;
        }

        .reason {
          color: #68756e;
          max-width: 420px;
        }

        .delete {
          background: #f8e7e7;
          color: #a43d3d;
          padding: 7px 12px;
          font-size: 12px;
        }

        .empty {
          padding: 50px;
          text-align: center;
          color: #7c8881;
        }

        .error {
          background: #f9e3e3;
          color: #a33e3e;
          border: 1px solid #efcaca;
          padding: 12px 15px;
          border-radius: 9px;
          margin-bottom: 18px;
        }

        .loading {
          padding: 80px;
          text-align: center;
          color: #68756e;
        }

        @media (max-width: 900px) {
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
          }

          .actions {
            width: 100%;
            flex-wrap: wrap;
          }
        }

        @media (max-width: 600px) {
          .page {
            padding: 18px;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          select {
            width: 100%;
          }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <div>
            <h1 className="title">Risk Prediction</h1>
            <p className="subtitle">
              Identify tasks that may require attention based on
              priority, status and due dates.
            </p>
          </div>

          <div className="actions">
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
            >
              <option value="">Select task</option>

              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  #{task.id} - {task.title}
                </option>
              ))}
            </select>

            <button
              className="calculate"
              onClick={calculateRisk}
              disabled={calculating}
            >
              {calculating ? "Calculating..." : "Calculate Risk"}
            </button>

            <button
              className="refresh"
              onClick={loadData}
            >
              Refresh
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="stats">
          <div className="stat">
            <div className="stat-label">High Risk</div>
            <div className="stat-value high-text">
              {highRisk}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Medium Risk</div>
            <div className="stat-value medium-text">
              {mediumRisk}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Low Risk</div>
            <div className="stat-value low-text">
              {lowRisk}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Average Risk Score</div>
            <div className="stat-value average-text">
              {averageRisk}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              Risk Predictions
            </h2>
          </div>

          {predictions.length === 0 ? (
            <div className="empty">
              No risk predictions available.
              <br />
              Select a task above and click{" "}
              <strong>Calculate Risk</strong>.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Task</th>
                    <th>Client</th>
                    <th>Risk Score</th>
                    <th>Risk Level</th>
                    <th>Reason</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {predictions.map((prediction) => (
                    <tr key={prediction.id}>
                      <td>#{prediction.id}</td>

                      <td>
                        {getTaskTitle(prediction.task_id)}
                      </td>

                      <td>
                        {prediction.client_id
                          ? `Client #${prediction.client_id}`
                          : "—"}
                      </td>

                      <td>
                        <span className="score">
                          {prediction.risk_score}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`risk-badge ${getRiskClass(
                            prediction.risk_level
                          )}`}
                        >
                          {prediction.risk_level}
                        </span>
                      </td>

                      <td className="reason">
                        {prediction.risk_reason || "—"}
                      </td>

                      <td>
                        <button
                          className="delete"
                          onClick={() =>
                            deletePrediction(prediction.id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}