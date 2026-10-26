# LetsEdit Authentication Architecture & Specification

> **Notice on Scope & Accessibility:**
> This document details the reverse-engineered client authentication system of [Sejda.com](https://www.sejda.com/) obtained via browser runtime inspection (CDP & REA). Sejda's backend application server (Java/JVM infrastructure) is closed-source and runs server-side, so its private backend repository cannot be downloaded. However, the complete client-side code, network contracts, API endpoints, state management, and integration patterns have been captured, decoded, and documented below.

---

## 1. System Overview

Sejda's authentication frontend operates dual-mode:
1. **Full-page view:** Navigated directly via `/login`. Redirects upon success to `/account`.
2. **Modal / Embedded Iframe:** Triggered from PDF editing tools via an iframe overlay. Detects embed via `window != window.top`, hides surrounding branding/footers, and communicates results back to the host window via `window.parent.userLoggedInHandler(email, teamMember)` and `window.parent.closeLoginModal()`.

```
                    ┌───────────────────────────────────────────────┐
                    │               User on Sejda.com               │
                    └───────────────────────┬───────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │      Login Entry (Standalone / Iframe)        │
                    │        - Cloudflare Turnstile Check           │
                    │        - Timezone/Language Cookie sync        │
                    └───────┬───────────────┬───────────────┬───────┘
                            │               │               │
                            ▼               ▼               ▼
                 ┌──────────────────┐ ┌──────────┐ ┌──────────────────┐
                 │ Email / Password │ │   SSO    │ │  OAuth Providers │
                 │  + Step-up 2FA   │ │  Lookup  │ │ (Google / MSFT)  │
                 └──────────────────┘ └──────────┘ └──────────────────┘
```

---

## 2. API Endpoints & Request/Response Contracts

### 2.1 Standard Email & Password (`POST /users/login`)
Submits user credentials along with a Cloudflare bot verification token and CSRF protection.

* **URL:** `https://www.sejda.com/users/login`
* **Method:** `POST`
* **Content-Type:** `application/json`
* **Request Payload:**
  ```json
  {
    "email": "user@example.com",
    "password": "user_password",
    "csrf": "5P2FSZAB1JOKAO2V1ETO",
    "cf-turnstile-response": "<turnstile_token>",
    "emailVerificationCode": "123456" // Included when 2FA is triggered
  }
  ```
* **Responses:**
  * **`200 OK`**: Login successful. Returns `{ "email": "...", "teamMember": false }`. Saves email to `localStorage.setItem("rememberedEmail", email)`.
  * **`403 Forbidden` (`"Email verification required"`):** Triggers adaptive 2FA. The client reveals the `.verification-code-group` input.
  * **`429 Too Many Requests`:** `"Too many login attempts. Please take a break and try again later."`
  * **`400 Bad Request`:** Validation failure or invalid credentials (`responseText` displayed in `.alert-danger`).

---

### 2.2 Enterprise SSO Domain Lookup (`POST /users/login-with-sso/lookup`)
Debounced listener on the email field checks if the domain is registered under enterprise Single Sign-On.

* **URL:** `https://www.sejda.com/users/login-with-sso/lookup`
* **Method:** `POST`
* **Payload:**
  ```json
  {
    "email": "user@enterprise-domain.com",
    "csrf": "5P2FSZAB1JOKAO2V1ETO"
  }
  ```
* **Response:**
  ```json
  {
    "useSSO": true
  }
  ```
* **UI Behavior:** If `true`, hides password fields (`.pwd-login-elem`) and displays the SSO button (`.sso-login-elem`). Results are cached in client memory (`d[email]`).

---

### 2.3 SSO Execution (`POST /users/login-with-sso`)
Initiates the corporate SSO redirect.

* **URL:** `https://www.sejda.com/users/login-with-sso`
* **Method:** `POST`
* **Payload:**
  ```json
  {
    "email": "user@enterprise-domain.com",
    "csrf": "5P2FSZAB1JOKAO2V1ETO",
    "cf-turnstile-response": "<turnstile_token>"
  }
  ```
* **Response:**
  ```json
  {
    "ssoUrl": "https://auth.enterprise.com/saml2/idp/..."
  }
  ```
* **Behavior:** Browser redirects to `e.ssoUrl` (or opens in a new tab if running in an iframe).

---

### 2.4 Google OAuth Sign-In (`POST /users/login-with-google`)
Uses Google Identity Services (GSI) web SDK.

* **Client ID:** `8721525582-fbt24du8pl38r1ht2ihu9q9vl815o5t8.apps.googleusercontent.com`
* **Library:** `https://accounts.google.com/gsi/client`
* **URL:** `https://www.sejda.com/users/login-with-google`
* **Method:** `POST`
* **Payload:**
  ```json
  {
    "id_token": "<google_jwt_credential>",
    "csrf": "5P2FSZAB1JOKAO2V1ETO"
  }
  ```
* **Response:** `{ "email": "...", "teamMember": false }`

---

### 2.5 Microsoft Azure AD / MSAL (`POST /users/login-with-microsoft`)
Uses the official Microsoft Authentication Library (`msal.js` v1.2.1).

* **App Client ID:** `fcd5a3f1-9bed-44f2-8eb8-84483c69b9e2`
* **Authority:** `https://login.microsoftonline.com/common`
* **Redirect URI:** `https://www.sejda.com/one-drive-auth`
* **URL:** `https://www.sejda.com/users/login-with-microsoft`
* **Method:** `POST`
* **Payload:**
  ```json
  {
    "id_token": "<microsoft_raw_id_token>",
    "csrf": "5P2FSZAB1JOKAO2V1ETO"
  }
  ```

---

## 3. Extracted Files in this Repository

| File Path | Description |
| :--- | :--- |
| [`reference/sejda-login.js`](file:///home/codxbrexx/Pdf-Editor/reference/sejda-login.js) | Full, unminified & formatted JavaScript logic extracted directly from Sejda's production build. |
| [`reference/sejda-login-form.html`](file:///home/codxbrexx/Pdf-Editor/reference/sejda-login-form.html) | Extracted DOM fragment containing the complete login container, forms, and social buttons. |

---

## 4. Key Functions in `reference/sejda-login.js`

* **`e(e)` (Error Formatter):** Parses HTTP status codes and extracts messages. Formats rate limit errors (`429`) and server error codes.
* **`o(e)` (Email Domain Matcher):** Validates email format and checks against `window.ssoSuffixes`.
* **`n(e)` (UI Switcher):** Toggles `.sso-login-elem` vs `.pwd-login-elem`.
* **`t()` (SSO Lookup Handler):** Performs the `/users/login-with-sso/lookup` POST request and updates local cache.
* **`r()` (Google Identity Initializer):** Loads GSI, renders `#google-signin2`, and registers credential callback.
* **`l.submit()` (Form Submission):** Validates Cloudflare Turnstile, disables button with spinner, sends credentials to `/users/login`, and handles the `403` email code challenge.
