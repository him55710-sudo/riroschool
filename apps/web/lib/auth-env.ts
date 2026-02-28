const PLACEHOLDER_MARKERS = [
    "your_",
    "example",
    "placeholder",
    "google_client",
    "google secret",
    "google-secret",
    "mock",
    "test",
];

const isPlaceholderValue = (value: string) => {
    const normalized = value.trim().toLowerCase();
    return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker));
};

export const normalizeGoogleClientId = (clientId = "") => {
    const value = clientId.trim();
    if (!value) return "";

    const markdownMatch = value.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (markdownMatch?.[1]) {
        return markdownMatch[1].trim();
    }

    return value;
};

export const hasGoogleOAuthCredentials = (
    clientId = process.env.GOOGLE_CLIENT_ID,
    clientSecret = process.env.GOOGLE_CLIENT_SECRET
) => {
    const id = normalizeGoogleClientId(clientId || "");
    const secret = (clientSecret || "").trim();

    if (!id || !secret) return false;
    if (isPlaceholderValue(id) || isPlaceholderValue(secret)) return false;

    const clientIdLooksValid = id.toLowerCase().endsWith(".apps.googleusercontent.com");
    return clientIdLooksValid && secret.length >= 16;
};

export const hasNextAuthSecret = (secret = process.env.NEXTAUTH_SECRET) => {
    const value = secret?.trim() || "";
    if (!value) return false;
    if (isPlaceholderValue(value)) return false;
    return value.length >= 16;
};
