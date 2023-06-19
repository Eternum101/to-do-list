import createProjects from './app';
import createTasks from './tasks';

function initialLoad() {
    createProjects();
    createTasks();
}

export default initialLoad;