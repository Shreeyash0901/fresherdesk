"use server";

import { getDb, users, auditLogs } from "@/db";
import { eq } from "drizzle-orm";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { setSessionCookie, clearSessionCookie, getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";

export type AuthState = {
  error?: string;
  success?: boolean;
};

export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const returnTo = (formData.get("returnTo") as string) || "";

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const db = getDb();
  const user = db.select().from(users).where(eq(users.email, email)).get();

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Invalid email or password." };
  }

  if (!user.isActive) {
    return { error: "This account has been deactivated. Please contact support." };
  }

  // Update last login
  db.update(users)
    .set({ lastLoginAt: new Date().toISOString() })
    .where(eq(users.id, user.id))
    .run();

  // Audit log
  try {
    db.insert(auditLogs)
      .values({
        id: "aud_" + randomUUID(),
        actorId: user.id,
        action: "USER_LOGIN",
        entityType: "user",
        entityId: user.id,
        metadata: JSON.stringify({ email: user.email, role: user.role }),
      })
      .run();
  } catch (e) {
    console.error("Failed to log audit action", e);
  }

  // Issue session cookie
  await setSessionCookie({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "admin" | "editor" | "recruiter" | "candidate",
    avatarUrl: user.avatarUrl,
  });

  // Redirect based on role or returnTo
  if (returnTo && returnTo.startsWith("/")) {
    redirect(returnTo);
  } else if (user.role === "admin" || user.role === "recruiter" || user.role === "editor") {
    redirect("/admin/leads");
  } else {
    redirect("/");
  }
}

export async function signupAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Please fill in all required fields." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const db = getDb();
  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const userId = "usr_" + randomUUID();
  db.insert(users)
    .values({
      id: userId,
      name,
      email,
      passwordHash: hashPassword(password),
      role: "candidate",
      isActive: true,
    })
    .run();

  // Audit log
  try {
    db.insert(auditLogs)
      .values({
        id: "aud_" + randomUUID(),
        actorId: userId,
        action: "USER_SIGNUP",
        entityType: "user",
        entityId: userId,
        metadata: JSON.stringify({ email, role: "candidate" }),
      })
      .run();
  } catch (e) {
    console.error("Failed to log audit action", e);
  }

  // Auto login
  await setSessionCookie({
    userId,
    name,
    email,
    role: "candidate",
  });

  redirect("/");
}

export async function logoutAction() {
  const session = await getSession();
  if (session) {
    try {
      const db = getDb();
      db.insert(auditLogs)
        .values({
          id: "aud_" + randomUUID(),
          actorId: session.userId,
          action: "USER_LOGOUT",
          entityType: "user",
          entityId: session.userId,
          metadata: JSON.stringify({ email: session.email }),
        })
        .run();
    } catch (e) {
      console.error("Failed to log audit action", e);
    }
  }

  await clearSessionCookie();
  redirect("/login");
}
