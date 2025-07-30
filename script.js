console.log("Script carregado com sucesso!");

document.addEventListener("DOMContentLoaded", function () {
  const addBtn = document.getElementById("addBtn");
  const taskInput = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");

  addBtn.addEventListener("click", function () {
    const task = taskInput.value.trim();
    if (task === "") return;

    const li = document.createElement("li");
    li.textContent = task;
    taskList.appendChild(li);
    taskInput.value = "";
  });
});
  