# Authentication

GymTrack Authentication routes handle user registration, login, password management, and account recovery. These endpoints provide secure access control for the GymTrack platform.

## API Reference

#### Base URL

```
/api/v1/auth
```

#### 1. Register new user account

```
  POST /api/v1/auth/register
```

**Description:** Creates a new user account with generated name and secure credentials.

| Parameter  | Type      | Description                           |
| :--------- | :-------- | :------------------------------------ |
| `email`    | `string`  | **Required**. User email              |
| `password` | `string`  | **Required**. User password           |
| `isAgree`  | `boolean` | **Required**. generated automatically |

---

#### 2. Verify user account

```
  POST /api/v1/auth/verify?token=<token>
```

**Description:** Verify user account to complete registration.

| Parameter | Type     | Description                  |
| :-------- | :------- | :--------------------------- |
| `token`   | `string` | **Required**. sent via email |

---

#### 3. User login

```
  POST /api/v1/auth/login
```

**Description:** Authenticates a user and returns an access token.

| Parameter  | Type     | Description                 |
| :--------- | :------- | :-------------------------- |
| `email`    | `string` | **Required**. User email    |
| `password` | `string` | **Required**. User password |

---

#### 4. Change password

```
  patch /api/v1/auth/change-password
```

**Description:** Update or change user password.

| Parameter         | Type     | Description                       |
| :---------------- | :------- | :-------------------------------- |
| `curren_password` | `string` | **Required**. User email          |
| `new_password`    | `string` | **Required**. User password       |
| `id`              | `string` | **Required**. access via req.user |

---

#### 5. Forgot password

```
  patch /api/v1/auth/forgot-password
```

**Description:** send an email that contains a OTP to the user to reset their password.

| Parameter | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `email`   | `string` | **Required**. User email              |
| `code`    | `string` | **Required**. generated automatically |

---

#### 6. Reset password

```
  patch /api/v1/auth/reset-password
```

**Description:** reset user password by providing the email, code, and new password.

| Parameter  | Type     | Description                  |
| :--------- | :------- | :--------------------------- |
| `email`    | `string` | **Required**. User email     |
| `password` | `string` | **Required**. User password  |
| `code`     | `string` | **Required**. sent via email |

---
