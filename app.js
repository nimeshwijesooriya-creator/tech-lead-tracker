const API_URL = 'https://script.google.com/macros/s/AKfycbxkaYS7nCTbsJX6mTEbXf5P5LG_G8R6fQZBbc3WpUWffHzRxNVG0iV8U5gRI373J8Wy/exec';
let tasksData = [];

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        tasksData = await response.json();
        renderTasks();
        updateProgress();
    } catch (error) {
        document.getElementById('taskList').innerHTML = '<p>Error loading tasks.</p>';
    }
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasksData.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        
        const isChecked = task.status ? 'checked' : '';
        
        card.innerHTML = `
            <input type="checkbox" ${isChecked} onchange="toggleTask(${task.id}, this.checked)">
            <div class="task-details">
                <p class="task-date">${task.date}</p>
                <p class="task-name">${task.task}</p>
            </div>
        `;
        taskList.appendChild(card);
    });
}

async function toggleTask(rowId, status) {
    // Optimistic UI update
    const taskIndex = tasksData.findIndex(t => t.id === rowId);
    if(taskIndex > -1) {
        tasksData[taskIndex].status = status;
        updateProgress();
    }

    // Send update to Google Sheets
    await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ row: rowId, status: status }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' } // text/plain avoids CORS preflight issues
    });
}

function updateProgress() {
    if (tasksData.length === 0) return;
    
    const completed = tasksData.filter(t => t.status).length;
    const percentage = Math.round((completed / tasksData.length) * 100);
    
    document.getElementById('progressBar').style.width = `${percentage}%`;
    document.getElementById('progressText').innerText = `${percentage}% Completed`;
}

// Initialize
fetchTasks();