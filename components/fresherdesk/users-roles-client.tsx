"use client";

import { useState } from "react";
import {
  createAdminUserAction,
  updateUserRoleAction,
  toggleUserStatusAction,
  resetUserPasswordAction,
  type AdminUserListItem,
} from "@/app/actions/admin-users";
import {
  ShieldAlert,
  UserPlus,
  Search,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Ban,
  CheckCircle,
  AlertCircle,
  Clock,
  Briefcase,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function UsersRolesClient({
  users,
  currentAdminId,
}: {
  users: AdminUserListItem[];
  currentAdminId: string;
}) {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetModalUser, setResetModalUser] = useState<AdminUserListItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const roleBadgeStyle: Record<string, string> = {
    admin: "bg-rose-100 text-rose-800 border-rose-200",
    recruiter: "bg-purple-100 text-purple-800 border-purple-200",
    editor: "bg-blue-100 text-blue-800 border-blue-200",
    candidate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  async function handleRoleChange(userId: string, newRole: "admin" | "editor" | "recruiter" | "candidate") {
    setLoadingId(userId);
    setMessage(null);
    try {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success) {
        setMessage({ text: "User role updated successfully!", type: "success" });
        router.refresh();
      } else {
        setMessage({ text: res.error || "Failed to update role", type: "error" });
      }
    } finally {
      setLoadingId(null);
    }
  }

  async function handleToggleStatus(userId: string, currentActive: boolean) {
    setLoadingId(userId);
    setMessage(null);
    try {
      const res = await toggleUserStatusAction(userId, !currentActive);
      if (res.success) {
        setMessage({ text: `User ${currentActive ? "deactivated" : "activated"}!`, type: "success" });
        router.refresh();
      } else {
        setMessage({ text: res.error || "Failed to toggle status", type: "error" });
      }
    } finally {
      setLoadingId(null);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;

    setLoadingId(resetModalUser.id);
    setMessage(null);
    try {
      const res = await resetUserPasswordAction(resetModalUser.id, newPassword);
      if (res.success) {
        setMessage({ text: `Password reset successfully for ${resetModalUser.name}!`, type: "success" });
        setResetModalUser(null);
        setNewPassword("");
      }
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert size={22} className="text-emerald-600" />
            Users & Roles Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage administrators, recruiters, editors, and candidate user accounts with full role-based access control.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="button button-navy compact text-xs flex items-center gap-1.5"
        >
          <UserPlus size={15} />
          <span>Add Team Member</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Role Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-700">👑 Admins</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-purple-700">💼 Recruiters</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {users.filter((u) => u.role === "recruiter").length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-blue-700">✍️ Editors</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {users.filter((u) => u.role === "editor").length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-600">🎓 Candidates</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {users.filter((u) => u.role === "candidate").length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name or email..."
            className="pl-9 h-10 text-xs bg-slate-50 border-slate-200"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {["all", "admin", "recruiter", "editor", "candidate"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                roleFilter === r
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r === "all" ? "All Users" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Users & Roles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4">User</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Assigned Leads</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No users matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentSelf = user.id === currentAdminId;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span>{user.name}</span>
                            {isCurrentSelf && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                You
                              </span>
                            )}
                            <span className="block text-[11px] font-normal text-slate-400">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Dropdown */}
                      <td className="p-4">
                        <Select
                          value={user.role}
                          disabled={loadingId === user.id || isCurrentSelf}
                          onValueChange={(val: any) => handleRoleChange(user.id, val)}
                        >
                          <SelectTrigger className={`h-8 text-xs font-semibold w-32 border capitalize ${roleBadgeStyle[user.role]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">👑 Admin</SelectItem>
                            <SelectItem value="recruiter">💼 Recruiter</SelectItem>
                            <SelectItem value="editor">✍️ Editor</SelectItem>
                            <SelectItem value="candidate">🎓 Candidate</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Active Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                            user.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {user.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>

                      {/* Assigned Leads */}
                      <td className="p-4 font-semibold text-slate-800">
                        {user.role === "recruiter" || user.role === "admin" ? (
                          <span>{user.assignedLeadsCount} active leads</span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => setResetModalUser(user)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                            title="Reset password"
                          >
                            <KeyRound size={12} />
                            <span>Reset Pass</span>
                          </button>

                          {/* Deactivate / Activate */}
                          {!isCurrentSelf && (
                            <button
                              type="button"
                              disabled={loadingId === user.id}
                              onClick={() => handleToggleStatus(user.id, user.isActive)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                                user.isActive
                                  ? "text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200"
                                  : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                              }`}
                            >
                              {user.isActive ? <Ban size={12} /> : <CheckCircle size={12} />}
                              <span>{user.isActive ? "Deactivate" : "Activate"}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Team Member Modal */}
      <CreateUserModal open={createModalOpen} onOpenChange={setCreateModalOpen} />

      {/* Reset Password Modal */}
      {resetModalUser && (
        <Dialog open={Boolean(resetModalUser)} onOpenChange={() => setResetModalUser(null)}>
          <DialogContent className="fd-dialog max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound size={17} /> Reset Password
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Set a new password for <strong>{resetModalUser.name}</strong> ({resetModalUser.email}).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleResetPassword} className="space-y-3 mt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">New Password</label>
                <Input
                  type="password"
                  required
                  placeholder="At least 6 characters..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="button button-outline compact text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="button button-green compact text-xs">
                  Save New Password
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CreateUserModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [role, setRole] = useState("recruiter");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    try {
      const res = await createAdminUserAction(formData);
      if (res.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        setError(res.error || "Failed to create user");
      }
    } catch {
      setError("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fd-dialog max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserPlus size={18} /> Add New Team Member
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Create an administrator, talent recruiter, content editor, or student user.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-2.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Full Name</label>
            <Input name="name" required placeholder="e.g. Ramesh Kumar" className="h-9 text-xs" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <Input name="email" type="email" required placeholder="ramesh@fresherdesk.com" className="h-9 text-xs" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Temporary Password</label>
            <Input name="password" type="password" required placeholder="At least 6 characters" className="h-9 text-xs" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Role & Permissions</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">👑 Admin (Full system control)</SelectItem>
                <SelectItem value="recruiter">💼 Recruiter (Lead management & applicant tracking)</SelectItem>
                <SelectItem value="editor">✍️ Editor (Jobs & Internships content management)</SelectItem>
                <SelectItem value="candidate">🎓 Candidate (Standard user)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="button button-outline compact text-xs"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="button button-navy compact text-xs">
              {isSubmitting ? "Creating User..." : "Create Team Member"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
