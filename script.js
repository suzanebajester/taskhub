console.log("Script carregado com sucesso!");

const columns = ["todoList", "doingList", "doneList"];

// Carregar tarefas
window.addEventListener("DOMContentLoaded", () => {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  savedTasks.forEach(task => renderTask(task.text, task.column, task.priority));
});

// Adicionar tarefa
document.getElementById("addBtn").addEventListener("click", () => {
  const input = document.getElementById("taskInput");
  const prioritySelect = document.getElementById("taskPriority");
  const taskText = input.value.trim();
  const priority = prioritySelect ? prioritySelect.value : "normal";

  if (!taskText) return alert("Digite uma tarefa!");

  renderTask(taskText, "todoList", priority);
  saveTask(taskText, "todoList", priority);
  input.value = "";
});

// Renderiza tarefa
function renderTask(text, columnId, priority="normal") {
  const ul = document.getElementById(columnId);
  const li = document.createElement("li");
  li.draggable = true;
  li.dataset.column = columnId;
  li.dataset.priority = priority;

  // Conteúdo da tarefa (edição inline)
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("task-content");
  contentDiv.textContent = text;
  contentDiv.contentEditable = true;
  contentDiv.addEventListener("blur", () => {
    updateTaskInStorage(text, li.dataset.column, contentDiv.textContent.trim(), priority);
    text = contentDiv.textContent.trim();
  });
  li.appendChild(contentDiv);

  // Tag de prioridade
  const tag = document.createElement("span");
  tag.classList.add("priority-tag", priority);
  tag.textContent = priority[0].toUpperCase();
  li.appendChild(tag);

  // Botão de excluir
  const delBtn = document.createElement("button");
  delBtn.textContent = "🗑️";
  delBtn.onclick = () => {
    li.remove();
    removeFromStorage(text, li.dataset.column);
  };
  li.appendChild(delBtn);

  // Drag & Drop
  li.addEventListener("dragstart", () => li.classList.add("dragging"));
  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    saveColumnOrder(li.dataset.column);
  });

  setCardColor(li, columnId);
  ul.appendChild(li);
}

// Drag & Drop para cada coluna
columns.forEach(id => {
  const ul = document.getElementById(id);

  ul.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(ul, e.clientY);
    if (!afterElement) ul.appendChild(dragging);
    else ul.insertBefore(dragging, afterElement);
  });

  ul.addEventListener("drop", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    if (!dragging) return;

    const sourceColumn = dragging.dataset.column;
    const newColumn = ul.id;

    // Atualiza coluna do cartão
    dragging.dataset.column = newColumn;

    // Move para nova coluna
    ul.appendChild(dragging);

    // Atualiza a cor da borda
    setCardColor(dragging, newColumn);

    // Salva ordem no localStorage
    saveColumnOrder(newColumn);
    saveColumnOrder(sourceColumn);
  });
});

// Função para pegar referência do elemento abaixo
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Salva tarefa
function saveTask(text, columnId, priority="normal") {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push({ text, column: columnId, priority });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Atualiza tarefa
function updateTaskInStorage(oldText, columnId, newText, priority="normal") {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.map(task => {
    if (task.text === oldText && task.column === columnId) {
      return { text: newText, column: columnId, priority };
    }
    return task;
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Remove tarefa
function removeFromStorage(text, columnId) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter(t => !(t.text === text && t.column === columnId));
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Salva ordem das tarefas em uma coluna
function saveColumnOrder(columnId) {
  const ul = document.getElementById(columnId);
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  const newOrder = [...ul.children].map(li => {
    const text = li.querySelector(".task-content").textContent.trim();
    const priority = li.dataset.priority;
    return { text, column: columnId, priority };
  });

  tasks = tasks.filter(task => task.column !== columnId);
  tasks.push(...newOrder);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Borda por coluna
function setCardColor(li, columnId) {
  switch(columnId) {
    case "todoList": li.style.borderLeft = "5px solid #0077cc"; break;
    case "doingList": li.style.borderLeft = "5px solid #ff9800"; break;
    case "doneList": li.style.borderLeft = "5px solid #4caf50"; break;
    default: li.style.borderLeft = "5px solid #0077cc"; break;
  }
}

