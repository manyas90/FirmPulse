const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function getEmployees() {
  const response = await fetch(`${API_URL}/employees/`);

  if (!response.ok) {
    throw new Error("Failed to fetch employees");
  }

  return response.json();
}