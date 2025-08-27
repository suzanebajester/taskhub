// Backend: TaskHub
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir frontend (index.html, script.js, style.css)
app.use(express.static(path.join(__dirname, "public")));

// Test route
app.get("/ping", (req, res) => {
  res.send("✅ TaskHub backend is running!");
});

// "Banco de dados" em memória
let tasks = [];
let nextId = 1;

// GET - listar todas as tarefas
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// POST - adicionar uma nova tarefa
app.post("/tasks", (req, res) => {
  const { text, column, priority } = req.body;

  if (!text) {
    return res.status(400).json({ error: "⚠️ Text is required" });
  }

  const newTask = {
    id: nextId++,
    text,
    column: column || "todoList",
    priority: priority || "normal",
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT - atualizar uma tarefa
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { text, column, priority } = req.body;

  const task = tasks.find((t) => t.id == id);
  if (!task) return res.status(404).json({ error: "❌ Task not found" });

  if (text) task.text = text;
  if (column) task.column = column;
  if (priority) task.priority = priority;

  res.json(task);
});

// DELETE - remover uma tarefa
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter((t) => t.id != id);
  res.json({ message: "🗑️ Task deleted" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
