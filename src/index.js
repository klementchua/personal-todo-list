// Make a sidebar which you can add projects to
// Main display where you can add sticky notes

// Project obj which stores lists of notes
// Note obj which stores text
// JS Modules will be split into project, note, and DOMHandler

// DOMHandler Logic ----
// initialisePage => let projects, currProj => createProj('Default') => append and set currProj => loadPage (DONE)
// addProj (eventListener) => createProj => append to projects (DONE)
// deleteProj (listen) => del from projects, set currProj => loadPage
// clickProj (listen) => set currProj => loadPage
// addNote => addNote to currProj => loadPage (DONE)
// deleteNote => delNote from currProj => loadPage

import './styles.css';

// Project constructor --------------
function createProject(title) {
  let notes = [];

  const getNotes = () => notes;

  const addNote = function (note) {
    notes.push(note);
  };

  const delNote = function (title) {
    notes = notes.filter((note) => note.note !== title);
  };

  return { title, getNotes, addNote, delNote };
}

// Note constructor -------------
function createNote(note) {
  return { note };
}

// Controller -------------
const Controller = (function Controller() {
  let projects = [createProject('Default')];
  let currProject = projects[0];

  const getProjects = () => projects;
  const getCurrProject = () => currProject;
  function setCurrProject(title) {
    currProject = projects.find((project) => project.title === title);
  }

  function addProject(project) {
    projects.push(project);
  }
  function delProject(title) {
    projects = projects.filter((project) => project.title !== title);
  }

  return {
    getProjects,
    getCurrProject,
    setCurrProject,
    addProject,
    delProject,
  };
})();

// DOM Control -------------
// Accessory Module
const DOMHandler = (function handleMainDOMFunctions() {
  function loadPage() {
    const projectContainer = document.querySelector('.project-container');
    projectContainer.innerHTML = '';
    for (const project of Controller.getProjects()) {
      if (project === Controller.getCurrProject()) {
        projectContainer.innerHTML += `<div class="project current-project">${project.title}</div>`;
      } else {
        projectContainer.innerHTML += `<div class="project">${project.title}</div>`;
      }
    }

    const noteContainer = document.querySelector('.note-container');
    noteContainer.innerHTML = '';
    for (const note of Controller.getCurrProject().getNotes()) {
      noteContainer.innerHTML += `<div class="note">${note.note}</div>`;
    }
  }

  return { loadPage };
})();

const NoteHandler = (function handleNoteDOM() {
  function handleInput(input, event) {
    const currProject = Controller.getCurrProject();
    switch (event.key) {
      case 'Enter':
        currProject.addNote(createNote(event.target.value));
        DOMHandler.loadPage();
        input.value = '';
        break;
      case 'Escape':
        input.value = '';
        input.blur();
        break;
    }
  }
  return { handleInput };
})();

const ProjectHandler = (function handleProjectDOM() {
  function revealInput() {
    const inputField = document.querySelector('#add-project-field');
    inputField.style.display = 'block';
    inputField.focus();
  }

  function handleInput(input, event) {
    switch (event.key) {
      case 'Enter':
        Controller.addProject(createProject(event.target.value));
        DOMHandler.loadPage();
        input.value = '';
        input.style.display = 'none';
        break;
      case 'Escape':
        input.value = '';
        input.style.display = 'none';
        break;
    }
  }

  function handleSwitch(target) {
    const projTitle = target.textContent;
    Controller.setCurrProject(projTitle);
    DOMHandler.loadPage();
  }

  return { revealInput, handleInput, handleSwitch };
})();

// Event Listeners and Initialisation -------------
DOMHandler.loadPage();

// Add Project
const addProjectBtn = document.querySelector('#add-project-btn');
addProjectBtn.addEventListener('click', ProjectHandler.revealInput);
const addProjectInput = document.querySelector('#add-project-field');
addProjectInput.addEventListener('keydown', (e) =>
  ProjectHandler.handleInput(addProjectInput, e)
);

const addNoteInput = document.querySelector('#add-note input');
addNoteInput.addEventListener('keydown', (e) =>
  NoteHandler.handleInput(addNoteInput, e)
);

const projectContainer = document.querySelector('.project-container');
projectContainer.addEventListener('click', (e) =>
  ProjectHandler.handleSwitch(e.target)
);
