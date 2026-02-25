# Google Authentication Guide

The Riroschool Portfolio Generator uses **NextAuth.js** with **GoogleProvider** for secure authentication.

## Setup Instructions

To enable Google Authentication locally or in production, you must configure the following environment variables in your `.env` file:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_here" # Generate a random string: openssl rand -base64 32
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
```

### Obtaining Google OAuth Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > Credentials**.
4. Click **Create Credentials** and select **OAuth client ID**.
5. Set the Application type to **Web application**.
6. Add Authorized JavaScript origins (e.g., `http://localhost:3000`).
7. Add Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`.
8. Copy the generated **Client ID** and **Client Secret** into your `.env` file.

## Testing the Authentication Flow

1. Start the development server: `pnpm dev`.
2. Open `http://localhost:3000/` in an incognito window.
3. Because the root route (`/`) is protected by middleware, you should be automatically redirected to `/login`.
4. Click the **"Google 계정으로 로그인"** (Login with Google) button.
5. You will be taken to the Google consent screen. Select an account to log in.
6. Upon successful login, you will be redirected back to the homepage (`/`).
7. Check the top navigation bar to ensure your Google profile picture (avatar) and name are displayed.
8. Verify your user record exists in the database by running `npx prisma studio` and checking the `User` and `Account` tables.
9. Click the **Logout** button in the navigation bar. You should be securely signed out and redirected back to the `/login` page.

## Data Privacy & Security

- User sessions are managed entirely server-side using secure, HTTP-only JWT cookies.
- Secrets (`GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`) are only accessible in the Node.js backend environment and are never leaked to the client browser.
