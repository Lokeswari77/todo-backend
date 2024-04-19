const express = require('express');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 3000;

const databasePath = path.join(__dirname, 'todoApplication.db');
const app = express();

app.use(express.json());
app.use(cors())

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    await database.run(`DROP TABLE IF EXISTS todos`);

    await database.run(`
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT 
            )
        `);

    app.listen(PORT, () =>
      console.log(`Server Running at ${PORT}` ),
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// API to get all Todos
app.get('/todos', async (req, res) => {
  const getTodosQuery = `
    SELECT * FROM todos
  `;
  const allTodos = await database.all(getTodosQuery);
  res.send(allTodos);
});

// API to get single Todo
app.get('/todos/:id', async (req, res) => {
  const id = req.params.id;
  const getTodoQuery = `
    SELECT * FROM todos WHERE id=${id}
  `;
  const singleTodo = await database.get(getTodoQuery);
  res.send(singleTodo);
});

// API to add todo
app.post('/todos', async (req, res) => {
  const {  title, description, status } = req.body;
  const addTodoQuery = `
    INSERT INTO todos (title, description, status)
    VALUES ( '${title}', '${description}', 'not completed')
  `;
  await database.run(addTodoQuery);
  res.send('Todo added successfully');
});

// API to update todo
app.put('/todos/:id', async (req, res) => {
  const id = req.params.id;
  const { title, description, status } = req.body;
  const updateTodoQuery = `
    UPDATE todos
    SET title='${title}', description='${description}', status='${status}'
    WHERE id=${id}
  `;
  await database.run(updateTodoQuery);
  res.send('Todo updated successfully');
});

// API to delete Todo
app.delete('/todos/:id', async (req, res) => {
  const id = req.params.id;
  const deleteTodoQuery = `
    DELETE FROM todos WHERE id=${id}
  `;
  await database.run(deleteTodoQuery);
  res.send('Todo deleted successfully');
});
