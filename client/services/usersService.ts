export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
  lastLogin: string;
}

// Fetch all users
export async function getUsers(): Promise<AdminUser[]> {
  try {
    const response = await fetch("/api/users");
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Add a new user
export async function addUser(
  user: Omit<AdminUser, "id" | "lastLogin">
): Promise<AdminUser | null> {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error(`Failed to add user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding user:", error);
    return null;
  }
}

// Remove a user
export async function removeUser(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to remove user: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error removing user:", error);
    return false;
  }
}
