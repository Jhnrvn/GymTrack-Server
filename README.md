
# GymTrack API

Backend REST API for GymTrack built with TypeScript, Express, and Mongoose



## API Reference

#### Authentication

```
  GET /api/v1/
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |

#### Get item

```
  GET /api/items/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Id of item to fetch |

#### add(num1, num2)

Takes two numbers and returns the sum.


## Authors

- [@Jhnrvn](https://github.com/Jhnrvn)

