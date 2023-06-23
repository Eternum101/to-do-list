// Importing date-fns library
import { isSameDay, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

// Declaring variables
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

// Event listeners
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

// Clears tasksContainer, iterates through projects and tasks to display them, 
// sets event listeners for checkboxes, updates list title, count, and display settings
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

// Clears tasksContainer, iterates through projects and tasks to display tasks due today,
// updates list title, count, and display settings, and removes active-list class 
// from selectedListElement if exists
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

// Clears tasksContainer, calculates the start and end dates of the current week,
// iterates through projects and tasks to display tasks within the week interval,
// updates list title, count, and display settings, and removes active-list class from selectedListElement if exists
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

// Creates and returns a new project object with a unique ID based on the current timestamp, 
// given a name and an empty tasks array
function createProject(name) {
    return { id: Date.now().toString(), name: name, tasks: [] }
};

// Creates and returns a new task object with a unique ID based on the current 
// timestamp, given a name, initial completion status as false, and a null dueDate
function createTask(name) {
    return { id: Date.now().toString(), name: name, complete: false ,dueDate: null}; 
}

// Sets up an event listener for the input element of the dueDate, and updates the 
// task's dueDate property with the selected date
function handleDateSelection(task, dueDateInput) {
    dueDateInput.addEventListener('input', function(event) {
        const selectedDate = event.target.value;
        task.dueDate = selectedDate;
      });
}

// Calls the save() function to save data and the render() function to update the display
function saveAndRender() {
    save();
    render();
}

// Saves the projects data and the selectedListID to the localStorage using JSON.stringify()
function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(projects));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListID);
}


// Clears projectsContainer, renders the lists, determines the selectedList 
// based on selectedListID, updates the list display settings and title, 
// renders the task count and tasks for the selected list, sets the display settings 
// for newTaskForm and displayButtons 
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

// Renders tasks for the selected list by iterating through each task, 
// creating task elements, setting checkbox properties and labels,
// setting due date input value, setting up date selection handling,
// and appending task elements to the tasksContainer
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

// Renders the task count for the selected list by filtering incomplete tasks,
// getting the count, and updating the listCountElement with the count and appropriate string
function renderTaskCount(selectedList) {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
    const taskString = incompleteTaskCount === 1 ? "Task" : "Tasks";
    listCountElement.innerText = `${incompleteTaskCount} ${taskString} Remaining`;
}

// Renders the lists by iterating through each project,
// creating list elements, setting dataset list ID, class, and content,
// adding list elements to the projectsContainer,
// adding active class to the selected list element, and updating button states
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

// Clears the contents of the specified element by removing all its child nodes
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild); 
    }
};

// Calls the render function
render();

};

// Exports createProjects
export default createProjects;