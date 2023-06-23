import { isSameDay, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const projectsContainer = document.querySelector('[data-projects]');
const newProjectForm = document.querySelector('[data-new-project-form]');
const newProjectInput = document.querySelector('[data-new-project-input]');
const deleteListButton = document.querySelector('[data-delete-list-button]');
const listDisplayContainer = document.querySelector('[data-list-display-container]');
const listTitleElement = document.querySelector('[data-list-title]');
const listCountElement = document.querySelector('[data-list-count]');
const tasksContainer = document.querySelector('[data-tasks]');
const taskTemplate = document.getElementById('task-template');
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-button]');
const allTasksButton = document.querySelector('[data-all-tasks-button]');
const todayButton = document.querySelector('[data-today-button]');
const thisWeekButton = document.querySelector('[data-this-week-button]');
const displayButtons = document.querySelector('[data-delete-task]');
const displayForm = document.querySelector('[data-new-task-form');

const createProjects = () => {

const LOCAL_STORAGE_LIST_KEY = 'task.lists';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListID';
let projects = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListID = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

projectsContainer.addEventListener('click', (e) => {
  if (e.target.tagName.toLowerCase() === 'li') {
    selectedListID = e.target.dataset.listId;
    saveAndRender();
  }
});

tasksContainer.addEventListener('click', (e) => {
  if (e.target.tagName.toLowerCase() === 'input') {
    const selectedList = projects.find((list) => list.id === selectedListID);
    const selectedTask = selectedList.tasks.find((task) => task.id === e.target.id);
    selectedTask.complete = e.target.checked;
    save();

    if (!allTasksButton.classList.contains('btn-active') &&
        !todayButton.classList.contains('btn-active') &&
        !thisWeekButton.classList.contains('btn-active')) {
      renderTaskCount(selectedList);
    }
  }
});

clearCompleteTasksButton.addEventListener('click', e => {
    const selectedList = projects.find(list => list.id === selectedListID);
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
    saveAndRender();
});

deleteListButton.addEventListener('click', e => {
    projects = projects.filter(list => list.id !== selectedListID);
    selectedListID = null;
    saveAndRender();
});

newProjectForm.addEventListener('submit', e => {
    e.preventDefault();
    const projectName = newProjectInput.value;
    if (projectName == null || projectName === '') return;
    const project = createProject(projectName);
    newProjectInput.value = null;
    projects.push(project);
    saveAndRender();
});

newTaskForm.addEventListener('submit', e => {
    e.preventDefault();
    const taskName = newTaskInput.value;
    if (taskName == null || taskName === '') return;
    const task = createTask(taskName);
    newTaskInput.value = null;
    const selectedList = projects.find(list => list.id === selectedListID);
    selectedList.tasks.push(task);
    saveAndRender();
});

allTasksButton.addEventListener('click', () => {
    displayAllTasks();
    todayButton.classList.remove('btn-active');
    thisWeekButton.classList.remove('btn-active');
    allTasksButton.classList.add('btn-active');
});

todayButton.addEventListener('click', () => {
    filterTodayTasks();
    allTasksButton.classList.remove('btn-active');
    thisWeekButton.classList.remove('btn-active'); 
    todayButton.classList.add('btn-active');
});

thisWeekButton.addEventListener('click', () => {
    filterThisWeekTasks();
    allTasksButton.classList.remove('btn-active');
    todayButton.classList.remove('btn-active');
    thisWeekButton.classList.add('btn-active');
});

function displayAllTasks() {
  clearElement(tasksContainer);

  projects.forEach((project) => {
    project.tasks.forEach((task) => {
      const taskElement = document.importNode(taskTemplate.content, true);
      const checkbox = taskElement.querySelector('input');
      checkbox.id = task.id;
      checkbox.checked = task.complete;
      const label = taskElement.querySelector('label');
      label.htmlFor = task.id;
      label.append(task.name);

      const dueDateInput = taskElement.querySelector('.input-due-date');
      dueDateInput.value = task.dueDate;

      handleDateSelection(task, dueDateInput);

      checkbox.addEventListener('click', (e) => {
        const selectedTask = projects
          .flatMap((project) => project.tasks)
          .find((t) => t.id === e.target.id);
        selectedTask.complete = e.target.checked;
        save();
        renderTaskCount();
      });

      tasksContainer.appendChild(taskElement);
    });
  });

  const selectedListElement = projectsContainer.querySelector('.active-list');
  if (selectedListElement) {
    selectedListElement.classList.remove('active-list');
  }

  listTitleElement.innerText = 'All Tasks';
  listCountElement.innerText = '';
  displayButtons.style.display = 'none';
  displayForm.style.display = 'none';

  listDisplayContainer.style.display = '';
}

  function filterTodayTasks() {
    const today = new Date();
    clearElement(tasksContainer);
  
    projects.forEach((project) => {
      project.tasks.forEach((task) => {
        const dueDate = new Date(task.dueDate);
        if (isSameDay(dueDate, today)) {
          const taskElement = document.importNode(taskTemplate.content, true);
          const checkbox = taskElement.querySelector('input');
          checkbox.id = task.id;
          checkbox.checked = task.complete;
          const label = taskElement.querySelector('label');
          label.htmlFor = task.id;
          label.append(task.name);

          const dueDateInput = taskElement.querySelector('.input-due-date');
          dueDateInput.value = task.dueDate;
  
          handleDateSelection(task, dueDateInput);
          
          tasksContainer.appendChild(taskElement);
        }
      });
    });

    listTitleElement.innerText = 'Today';
    listCountElement.innerText = '';
    displayButtons.style.display = 'none';
    displayForm.style.display = 'none';
  
    const selectedListElement = projectsContainer.querySelector('.active-list');
    if (selectedListElement) {
      selectedListElement.classList.remove('active-list');
    }
}

function filterThisWeekTasks() {
    const today = new Date();
    const startOfWeekDate = startOfWeek(today);
    const endOfWeekDate = endOfWeek(today);
  
    clearElement(tasksContainer);
  
    projects.forEach((project) => {
      project.tasks.forEach((task) => {
        const dueDate = new Date(task.dueDate);
        if (isWithinInterval(dueDate, { start: startOfWeekDate, end: endOfWeekDate })) {
          const taskElement = document.importNode(taskTemplate.content, true);
          const checkbox = taskElement.querySelector('input');
          checkbox.id = task.id;
          checkbox.checked = task.complete;
          const label = taskElement.querySelector('label');
          label.htmlFor = task.id;
          label.append(task.name);
  
          const dueDateInput = taskElement.querySelector('.input-due-date');
          dueDateInput.value = task.dueDate;
  
          handleDateSelection(task, dueDateInput);
  
          tasksContainer.appendChild(taskElement);
        }
      });
    });
  
    listTitleElement.innerText = 'This Week';
    listCountElement.innerText = '';
    displayButtons.style.display = 'none';
    displayForm.style.display = 'none';
  
    const selectedListElement = projectsContainer.querySelector('.active-list');
    if (selectedListElement) {
      selectedListElement.classList.remove('active-list');
    }
}

function createProject(name) {
    return { id: Date.now().toString(), name: name, tasks: [] }
};

function createTask(name) {
    return { id: Date.now().toString(), name: name, complete: false ,dueDate: null}; 
}

function handleDateSelection(task, dueDateInput) {
    dueDateInput.addEventListener('input', function(event) {
        const selectedDate = event.target.value;
        task.dueDate = selectedDate;
      });
}

function saveAndRender() {
    save();
    render();
}

function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(projects));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListID);
}

function render() {
    clearElement(projectsContainer);
    renderLists();

    const selectedList = projects.find(list => list.id === selectedListID);
    if (selectedListID == null) {
        listDisplayContainer.style.display = 'none';
    } else {
        listDisplayContainer.style.display = ''; 
        listTitleElement.innerText = selectedList.name;
        renderTaskCount(selectedList);
        clearElement(tasksContainer);
        renderTasks(selectedList);
        newTaskForm.style.display = '';
        displayButtons.style.display = '';
    }
};

function renderTasks(selectedList) {
    selectedList.tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true);
        const checkbox = taskElement.querySelector('input'); 
        checkbox.id = task.id;
        checkbox.checked = task.complete;
        const label = taskElement.querySelector('label');
        label.htmlFor = task.id;
        label.append(task.name);

        const dueDateInput = taskElement.querySelector('.input-due-date');
        dueDateInput.value = task.dueDate;

        handleDateSelection(task, dueDateInput);

        tasksContainer.appendChild(taskElement);
    });
}

function renderTaskCount(selectedList) {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
    const taskString = incompleteTaskCount === 1 ? "Task" : "Tasks";
    listCountElement.innerText = `${incompleteTaskCount} ${taskString} Remaining`;
}

function renderLists() {
    projects.forEach(list => {
        const listElement = document.createElement('li');
        listElement.dataset.listId = list.id; 
        listElement.classList.add("list-name");
        const listSpan = document.createElement('span');
        listSpan.setAttribute('class', 'material-symbols-outlined list');
        listSpan.innerText = 'playlist_add';
        listElement.appendChild(listSpan); 
        listElement.appendChild(document.createTextNode(list.name));
        if (list.id === selectedListID) {
            listElement.classList.add('active-list'); 
            allTasksButton.classList.remove('btn-active');
            todayButton.classList.remove('btn-active');
            thisWeekButton.classList.remove('btn-active'); 
        }
        projectsContainer.appendChild(listElement);
    });
}

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild); 
    }
};

render();

};

export default createProjects;