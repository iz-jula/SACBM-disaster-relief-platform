// Mock data - will be replaced with Supabase queries
const MOCK_USERS: AdminUser[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@sabcm.org",
    role: "admin",
    lastLogin: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Manager User",
    email: "manager@sabcm.org",
    role: "manager",
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
  lastLogin: string;
}

export async function handleGetUsers(req: any, res: any) {
  try {
    res.json({ users: MOCK_USERS });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export async function handleAddUser(req: any, res: any) {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res
        .status(400)
        .json({ error: "Missing required fields" });
    }

    const newUser: AdminUser = {
      id: `${Date.now()}`,
      name,
      email,
      role,
      lastLogin: new Date().toISOString(),
    };

    MOCK_USERS.push(newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Failed to add user" });
  }
}

export async function handleRemoveUser(req: any, res: any) {
  try {
    const { id } = req.params;

    const index = MOCK_USERS.findIndex((u) => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const removed = MOCK_USERS.splice(index, 1);
    res.json(removed[0]);
  } catch (error) {
    console.error("Error removing user:", error);
    res.status(500).json({ error: "Failed to remove user" });
  }
}
