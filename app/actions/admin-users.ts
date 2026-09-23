"use server";

import { getDb, users, auditLogs, leads } from "@/db";
import { eq, desc, ne, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "recruiter" | "candidate";
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  assignedLeadsCount: number;
};

/**
 * Fetch all users with their assigned leads count
 */
export async function getAdminUsersList(params?: { q?: string; role?: string }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized: Only administrators can manage users and roles.");
  }

  const db = getDb();
  const allUsers = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .all();

  // Get assigned leads counts for recruiters/admins
  const leadsList = db.select({ assignedTo: leads.assignedTo }).from(leads).all();
  const leadsCountMap = new Map<string, number>();
  for (const l of leadsList) {
    if (l.assignedTo) {
      leadsCountMap.set(l.assignedTo, (leadsCountMap.get(l.assignedTo) || 0) + 1);
    }
  }

  let results: AdminUserListItem[] = allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as any,
    isActive: Boolean(u.isActive),
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    assignedLeadsCount: leadsCountMap.get(u.id) || 0,
  }));

  if (params?.role && params.role !== "all") {
    results = results.filter((u) => u.role === params.role);
  }

  if (params?.q?.trim()) {
    const term = params.q.trim().toLowerCase();
    results = results.filter(
      (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  }

  return results;
}

/**
 * Create a new team member user (Admin, Recruiter, Editor, Candidate)
 */
export async function createAdminUserAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Unauthorized: Only administrators can create users." };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();
  const role = (formData.get("role") as string) as "admin" | "editor" | "recruiter" | "candidate";

  if (!name || !email || !password || !role) {
    return { error: "Please fill in all required fields." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const db = getDb();
  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    return { error: "A user with this email address already exists." };
  }

  const newUserId = "usr_" + randomUUID();

  try {
    db.insert(users)
      .values({
        id: newUserId,
        name,
        email,
        passwordHash: hashPassword(password),
        role,
        isActive: true,
      })
      .run();

    db.insert(auditLogs)
      .values({
        id: "aud_" + randomUUID(),
        actorId: session.userId,
        action: "USER_CREATED_BY_ADMIN",
        entityType: "user",
        entityId: newUserId,
        metadata: JSON.stringify({ name, email, role }),
      })
      .run();

    revalidatePath("/admin/users");
    return { success: true };
  } catch (e: any) {
    return { error: "Failed to create user: " + e.message };
  }
}

/**
 * Change a user's role (Admin, Recruiter, Editor, Candidate)
 */
export async function updateUserRoleAction(userId: string, newRole: "admin" | "editor" | "recruiter" | "candidate") {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Unauthorized: Only administrators can change roles." };
  }

  // Prevent self-demotion if last admin
  if (session.userId === userId && newRole !== "admin") {
    return { error: "You cannot change your own admin role." };
  }

  const db = getDb();
  const targetUser = db.select().from(users).where(eq(users.id, userId)).get();
  if (!targetUser) return { error: "User not found." };

  const oldRole = targetUser.role;

  db.update(users)
    .set({
      role: newRole,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, userId))
    .run();

  db.insert(auditLogs)
    .values({
      id: "aud_" + randomUUID(),
      actorId: session.userId,
      action: "USER_ROLE_UPDATED",
      entityType: "user",
      entityId: userId,
      metadata: JSON.stringify({ oldRole, newRole }),
    })
    .run();

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Toggle user active/deactivated status
 */
export async function toggleUserStatusAction(userId: string, isActive: boolean) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Unauthorized" };
  }

  if (session.userId === userId && !isActive) {
    return { error: "You cannot deactivate your own admin account." };
  }

  const db = getDb();
  db.update(users)
    .set({
      isActive: isActive,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, userId))
    .run();

  db.insert(auditLogs)
    .values({
      id: "aud_" + randomUUID(),
      actorId: session.userId,
      action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      entityType: "user",
      entityId: userId,
    })
    .run();

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Reset user password from admin
 */
export async function resetUserPasswordAction(userId: string, newPass: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Unauthorized" };
  }

  if (newPass.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const db = getDb();
  db.update(users)
    .set({
      passwordHash: hashPassword(newPass),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, userId))
    .run();

  db.insert(auditLogs)
    .values({
      id: "aud_" + randomUUID(),
      actorId: session.userId,
      action: "USER_PASSWORD_RESET_BY_ADMIN",
      entityType: "user",
      entityId: userId,
    })
    .run();

  return { success: true };
}
