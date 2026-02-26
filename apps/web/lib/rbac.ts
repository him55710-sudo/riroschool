export const APP_ROLES = ["anonymous", "user", "admin"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const API_PERMISSIONS = [
    "admin:config:read",
    "admin:config:write",
    "jobs:create",
    "jobs:read",
    "jobs:download",
    "orders:create",
    "payments:confirm",
    "webhooks:payment:mock",
] as const;
export type ApiPermission = (typeof API_PERMISSIONS)[number];

const PERMISSION_ROLE_MAP: Record<ApiPermission, readonly AppRole[]> = {
    "admin:config:read": ["admin"],
    "admin:config:write": ["admin"],
    "jobs:create": ["user", "admin"],
    "jobs:read": ["user", "admin"],
    "jobs:download": ["user", "admin"],
    "orders:create": ["user", "admin"],
    "payments:confirm": ["user", "admin"],
    "webhooks:payment:mock": ["admin"],
};

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || "";

const parseAdminEmails = (raw = process.env.ADMIN_EMAILS) =>
    new Set(
        (raw || "")
            .split(",")
            .map((email) => normalizeEmail(email))
            .filter(Boolean)
    );

export const isAdminEmail = (email?: string | null) => {
    const normalized = normalizeEmail(email);
    if (!normalized) return false;
    return parseAdminEmails().has(normalized);
};

export const resolveRoles = (email?: string | null, userId?: string | null): AppRole[] => {
    const roles: AppRole[] = ["anonymous"];
    if (userId || normalizeEmail(email)) roles.push("user");
    if (isAdminEmail(email)) roles.push("admin");
    return roles;
};

export const hasPermission = (roles: readonly AppRole[], permission: ApiPermission) =>
    PERMISSION_ROLE_MAP[permission].some((allowedRole) => roles.includes(allowedRole));
