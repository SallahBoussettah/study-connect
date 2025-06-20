# Understanding Controller Parameters and Sequelize Operators

## Controller Function Parameters: req, res, next

In your controller functions, you'll notice they typically follow this pattern:

```javascript
exports.functionName = async (req, res, next) => {
  // Function body
};
```

Let's break down what each of these parameters represents:

### 1. req (Request)

The `req` object contains information about the HTTP request that was made to the server:

- **req.body**: Contains data submitted in the request body (e.g., form data or JSON)
- **req.params**: Contains route parameters (e.g., in `/users/:id`, `req.params.id` would contain the actual ID)
- **req.query**: Contains query string parameters (e.g., in `/search?term=javascript`, `req.query.term` would be "javascript")
- **req.headers**: Contains request headers (e.g., `req.headers.authorization` for auth tokens)
- **req.cookies**: Contains cookies sent by the client
- **req.user**: Often added by authentication middleware to store the logged-in user's information

**Example from your code:**
```javascript
// From authController.js
const { firstName, lastName, email, password, role = 'student' } = req.body;
```

### 2. res (Response)

The `res` object represents the HTTP response that will be sent back to the client:

- **res.status(code)**: Sets the HTTP status code (e.g., 200 for success, 404 for not found)
- **res.json(data)**: Sends a JSON response
- **res.send(data)**: Sends a response of various types
- **res.redirect(url)**: Redirects to another URL
- **res.cookie(name, value)**: Sets a cookie
- **res.render(view, data)**: Renders a view template (not typically used in API-only backends)

**Example from your code:**
```javascript
// From authController.js
res.status(200).json({
  success: true,
  data: user
});
```

### 3. next (Next Middleware Function)

The `next` function is a callback that passes control to the next middleware function in the chain:

- **next()**: Calls the next middleware function
- **next(error)**: Passes an error to Express's error handling middleware
- If `next()` is not called, the request-response cycle ends

**Example from your code:**
```javascript
// From authController.js
try {
  // Code that might throw an error
} catch (error) {
  next(error); // Pass error to error-handling middleware
}
```

## Request-Response Flow

1. Client makes an HTTP request to your server
2. Express routes the request to the appropriate controller function
3. The controller function receives `req`, `res`, and `next`
4. The controller processes the request using the `req` object
5. The controller sends a response using the `res` object
6. If needed, the controller calls `next()` to pass control to another middleware

## Sequelize Operators: Op.gte and Others

Sequelize provides operators to create complex conditions in your queries. These are imported from Sequelize:

```javascript
const { Op } = require('sequelize');
```

### Common Operators

| Operator | Description | SQL Equivalent |
|----------|-------------|----------------|
| `Op.eq` | Equal | `=` |
| `Op.ne` | Not equal | `!=` |
| `Op.gt` | Greater than | `>` |
| `Op.gte` | Greater than or equal | `>=` |
| `Op.lt` | Less than | `<` |
| `Op.lte` | Less than or equal | `<=` |
| `Op.in` | In a list | `IN (...)` |
| `Op.notIn` | Not in a list | `NOT IN (...)` |
| `Op.like` | Pattern matching | `LIKE` |
| `Op.notLike` | Negative pattern matching | `NOT LIKE` |
| `Op.and` | Logical AND | `AND` |
| `Op.or` | Logical OR | `OR` |

### Focus on Op.gte (Greater Than or Equal)

The `Op.gte` operator is used to find records where a field is greater than or equal to a specified value.

**Example from your code:**
```javascript
// From dashboardController.js
const upcomingEvents = await Event.findAll({
  where: {
    date: { [Op.gte]: new Date() }
  }
});
```

In this example:
- `date: { [Op.gte]: new Date() }` translates to SQL: `WHERE date >= CURRENT_TIMESTAMP`
- This finds all events with dates in the future or happening right now

### More Complex Examples

**Multiple Conditions:**
```javascript
const activeUsers = await User.count({
  where: {
    lastLogin: {
      [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    isActive: true
  }
});
```
This finds users who logged in within the last 7 days AND are active.

**Combining Operators:**
```javascript
const users = await User.findAll({
  where: {
    [Op.or]: [
      { role: 'admin' },
      {
        [Op.and]: [
          { role: 'student' },
          { createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        ]
      }
    ]
  }
});
```
This finds users who are either admins OR students who registered within the last 30 days.

## How It All Works Together

In your controllers, you typically:

1. Extract data from the request (`req`)
2. Use Sequelize models with operators like `Op.gte` to query the database
3. Format the data for the response
4. Send the response back to the client using `res`
5. Handle any errors with `next(error)`

This pattern allows you to write clean, maintainable code that effectively handles HTTP requests and database operations. 