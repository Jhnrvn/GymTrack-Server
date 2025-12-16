# GymTrack API

Backend REST API for GymTrack built with TypeScript, Express, and Mongoose

## API Reference

#### **Authentication**

#### User registration:

```
  POST /api/v1/auth/register
```

| Request Body | Type      | Required | Description              |
| :----------- | :-------- | :------- | :----------------------- |
| `email`      | `string`  | `true`   | user valid email address |
| `password`   | `string`  | `true`   | user password            |
| `isAgree`    | `boolean` | `true`   | user agreement to terms  |

#### User login:

```
  POST /api/v1/auth/login
```

| Request Body | Type     | Required | Description              |
| :----------- | :------- | :------- | :----------------------- |
| `email`      | `string` | `true`   | user valid email address |
| `password`   | `string` | `true`   | user password            |

#### User change password:

```
  PATCH /api/v1/auth/change-password
```

| Request Body       | Type     | Required | Description         |
| :----------------- | :------- | :------- | :------------------ |
| `current_password` | `string` | `true`   | user existing email |
| `new_password`     | `string` | `true`   | user new password   |

#### User forgot password:

```
  PATCH /api/v1/auth/forgot-password
```

| Request Body | Type     | Required | Description         |
| :----------- | :------- | :------- | :------------------ |
| `email`      | `string` | `true`   | user existing email |

```
  PATCH /api/v1/auth/reset-password
```

| Request Body | Type     | Required | Description         |
| :----------- | :------- | :------- | :------------------ |
| `email`      | `string` | `true`   | user existing email |
| `password`   | `string` | `true`   | user new password   |
| `code`       | `string` | `true`   | user password code  |

## Authors

- [@Jhnrvn](https://github.com/Jhnrvn)
