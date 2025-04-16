import type { ConnectionData } from "@/types/ros2-types";
const API_BASE_URL = "http://localhost:3001/api";

export async function fetchConnections(): Promise<ConnectionData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/connections`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching connections:", error);
    return [];
  }
}

export async function callGetGraphService(): Promise<ConnectionData[]> {
  try {
    console.log("Calling GetGraph service...");
    const response = await fetch(`${API_BASE_URL}/service/get_graph`);
    if (!response.ok) {
      console.error(`Service call failed with status: ${response.status}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Received service response:", data);

    // Check if the data has the expected structure
    if (data.success && Array.isArray(data.connections)) {
      return data.connections;
    } else {
      console.error("Unexpected response format:", data);
      return [];
    }
  } catch (error) {
    console.error("Error calling GetGraph service:", error);
    // Add more detailed error reporting here
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      console.error(
        "Could not connect to the bridge server. Make sure it's running at " +
          API_BASE_URL
      );
    }
    return [];
  }
}

export async function addConnection(
  connection: ConnectionData
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/connection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(connection),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error adding connection:", error);
    return false;
  }
}

export async function resetConnections(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/reset`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error resetting connections:", error);
    return false;
  }
}
