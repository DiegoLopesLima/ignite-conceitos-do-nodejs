const express = require('express');
const cors = require('cors');
const uuid = require('uuid')

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  if (users.find(user => user.username === request.headers.username)) {
    request.body.username = request.headers.username;

    return next();
  }

  return response
    .status(404)
    .json({
      error: 'Not Found.'
    });
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (users.find(item => item.username === username)) {
    return response
      .status(400)
      .json({
        error: 'The username already exists.'
      });
  }

  const user = {
    id: uuid.v4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response
    .status(201)
    .json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = users.find(item => item.username === request.body.username);

  return response
    .status(200)
    .json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const
    { title, deadline } = request.body,
    todo = {
      id: uuid.v4(),
      done: false,
      created_at: new Date(),
      deadline: new Date(deadline),
      title
    },
    user = users.find(item => item.username === request.body.username);

  user.todos.push(todo);

  return response
    .status(201)
    .json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const
    { title, deadline } = request.body,
    user = users.find(item => item.username === request.body.username),
    todo = user.todos.find(item => item.id === request.params.id);

  if (todo) {
    todo.title = title;
    todo.deadline = new Date(deadline);

    return response
      .status(200)
      .json(todo);
  }

  return response
    .status(404)
    .json({
      error: 'Not Found.'
    });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const
    user = users.find(user => user.username === request.body.username),
    todo = user.todos.find(item => item.id === request.params.id);

  if (todo) {
    todo.done = true;

    return response
      .status(200)
      .json(todo);
  }

  return response
    .status(404)
    .json({
      error: 'Not Found.'
    });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const
    user = users.find(item => item.username === request.body.username),
    todoIndex = user.todos.findIndex(item => item.id === request.params.id);

  if (todoIndex >= 0) {
    user.todos.splice(todoIndex, 1);

    return response.sendStatus(204);
  }

  return response
    .status(404)
    .json({
      error: 'Not Found.'
    });
});

module.exports = app;
