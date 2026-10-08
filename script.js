// Load tasks from browser storage
let tasks = JSON.parse(localStorage.getItem("studentTasks")) || [];


// -----------------------------
// NAVIGATION
// -----------------------------

function showSection(sectionId) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active-section");
    });

    document.getElementById(sectionId).classList.add("active-section");

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    if (sectionId === "dashboard") {
        document.querySelectorAll(".nav-item")[0].classList.add("active");
        document.getElementById("pageTitle").textContent = "Dashboard";
    }

    if (sectionId === "tasks") {
        document.querySelectorAll(".nav-item")[1].classList.add("active");
        document.getElementById("pageTitle").textContent = "My Tasks";
        displayTasks();
    }

    if (sectionId === "addTask") {
        document.querySelectorAll(".nav-item")[2].classList.add("active");
        document.getElementById("pageTitle").textContent = "Add Task";
    }
}


// -----------------------------
// SAVE TASKS
// -----------------------------

function saveTasks() {
    localStorage.setItem("studentTasks", JSON.stringify(tasks));
}


// -----------------------------
// ADD / UPDATE TASK
// -----------------------------

document.getElementById("taskForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const title = document.getElementById("taskTitle").value.trim();
    const subject = document.getElementById("taskSubject").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const date = document.getElementById("taskDate").value;
    const priority = document.getElementById("taskPriority").value;
    const editId = document.getElementById("editTaskId").value;

    if (editId) {

        const task = tasks.find(task => task.id == editId);

        if (task) {
            task.title = title;
            task.subject = subject;
            task.description = description;
            task.date = date;
            task.priority = priority;
        }

        alert("Task updated successfully!");

    } else {

        const newTask = {
            id: Date.now(),
            title: title,
            subject: subject,
            description: description,
            date: date,
            priority: priority,
            completed: false
        };

        tasks.push(newTask);

        alert("Task added successfully!");
    }

    saveTasks();

    resetForm();

    updateDashboard();

    showSection("tasks");
});


// -----------------------------
// DISPLAY TASKS
// -----------------------------

function displayTasks() {

    const taskList = document.getElementById("taskList");

    const search = document
        .getElementById("searchTask")
        .value
        .toLowerCase();

    const statusFilter = document.getElementById("filterStatus").value;

    const priorityFilter = document.getElementById("filterPriority").value;


    let filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(search) ||
            task.subject.toLowerCase().includes(search);

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "completed" && task.completed) ||
            (statusFilter === "pending" && !task.completed);

        const matchesPriority =
            priorityFilter === "all" ||
            task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });


    if (filteredTasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty">
                <h3>No tasks found</h3>
                <p>Add a new task to get started.</p>
            </div>
        `;

        return;
    }


    taskList.innerHTML = filteredTasks.map(task => {

        const priorityClass =
            task.priority.toLowerCase();

        return `
            <div class="task-item">

                <div class="task-left">

                    <input
                        type="checkbox"
                        class="task-check"
                        ${task.completed ? "checked" : ""}
                        onchange="toggleTask(${task.id})"
                    >

                    <div>

                        <div class="task-title
                            ${task.completed ? "task-completed" : ""}">

                            ${escapeHTML(task.title)}

                            <span class="priority priority-${priorityClass}">
                                ${task.priority}
                            </span>

                        </div>

                        <div class="task-info">
                            ${escapeHTML(task.subject)}
                            &nbsp; • &nbsp;
                            Due: ${formatDate(task.date)}
                        </div>

                    </div>

                </div>


                <div class="task-actions">

                    <button
                        class="edit-btn"
                        onclick="editTask(${task.id})">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteTask(${task.id})">
                        Delete
                    </button>

                </div>

            </div>
        `;

    }).join("");
}


// -----------------------------
// RECENT TASKS
// -----------------------------

function displayRecentTasks() {

    const container = document.getElementById("recentTasks");

    const recentTasks = [...tasks].reverse().slice(0, 5);

    if (recentTasks.length === 0) {

        container.innerHTML = `
            <div class="empty">
                No tasks added yet.
            </div>
        `;

        return;
    }

    container.innerHTML = recentTasks.map(task => {

        return `
            <div class="task-item">

                <div class="task-left">

                    <input
                        type="checkbox"
                        class="task-check"
                        ${task.completed ? "checked" : ""}
                        onchange="toggleTask(${task.id})"
                    >

                    <div>

                        <div class="task-title
                            ${task.completed ? "task-completed" : ""}">

                            ${escapeHTML(task.title)}

                        </div>

                        <div class="task-info">
                            ${escapeHTML(task.subject)}
                            • Due ${formatDate(task.date)}
                        </div>

                    </div>

                </div>

            </div>
        `;

    }).join("");
}


// -----------------------------
// COMPLETE TASK
// -----------------------------

function toggleTask(id) {

    const task = tasks.find(task => task.id === id);

    if (task) {
        task.completed = !task.completed;
    }

    saveTasks();

    displayTasks();
    updateDashboard();
}


// -----------------------------
// DELETE TASK
// -----------------------------

function deleteTask(id) {

    const confirmation = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmation) {
        return;
    }

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    displayTasks();
    updateDashboard();
}


// -----------------------------
// EDIT TASK
// -----------------------------

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    document.getElementById("editTaskId").value = task.id;

    document.getElementById("taskTitle").value = task.title;

    document.getElementById("taskSubject").value = task.subject;

    document.getElementById("taskDescription").value =
        task.description;

    document.getElementById("taskDate").value = task.date;

    document.getElementById("taskPriority").value =
        task.priority;

    document.getElementById("formTitle").textContent =
        "Update Task";

    showSection("addTask");
}


// -----------------------------
// RESET FORM
// -----------------------------

function resetForm() {

    document.getElementById("taskForm").reset();

    document.getElementById("editTaskId").value = "";

    document.getElementById("formTitle").textContent =
        "Add New Task";
}


// -----------------------------
// DASHBOARD STATISTICS
// -----------------------------

function updateDashboard() {

    const total = tasks.length;

    const completed =
        tasks.filter(task => task.completed).length;

    const pending =
        tasks.filter(task => !task.completed).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue =
        tasks.filter(task => {

            if (task.completed) {
                return false;
            }

            const dueDate = new Date(task.date);
            dueDate.setHours(0, 0, 0, 0);

            return dueDate < today;

        }).length;


    document.getElementById("totalTasks").textContent = total;

    document.getElementById("completedTasks").textContent =
        completed;

    document.getElementById("pendingTasks").textContent =
        pending;

    document.getElementById("overdueTasks").textContent =
        overdue;


    displayRecentTasks();
}


// -----------------------------
// DATE FORMAT
// -----------------------------

function formatDate(dateString) {

    if (!dateString) {
        return "No date";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// -----------------------------
// SECURITY HELPER
// -----------------------------

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// -----------------------------
// INITIAL LOAD
// -----------------------------

updateDashboard();
displayTasks();