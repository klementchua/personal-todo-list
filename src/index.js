// Make a sidebar which you can add projects to
// Main display where you can add sticky notes

// Project obj which stores lists of notes
// Note obj which stores text
// JS Modules will be split into project, note, and DOMHandler

// DOMHandler Logic ----
// initialisePage => let projects, currProj => createProj('Default') => append and set currProj => loadPage (DONE)
// addProj (eventListener) => createProj => append to projects (DONE)
// deleteProj (listen) => del from projects, set currProj => loadPage
// clickProj (listen) => set currProj => loadPage (DONE)
// addNote => addNote to currProj => loadPage (DONE)
// deleteNote => delNote from currProj => loadPage (DONE)

import './styles.css';

// Project constructor --------------
function createProject(title) {
  let cards = [];

  const getCards = () => cards;

  const addCard = function (card) {
    cards.push(card);
  };

  const delCard = function (title) {
    cards = cards.filter((card) => card.title !== title);
  };

  const getCard = function (title) {
    return cards.find((card) => card.title === title);
  };

  return { title, getCards, addCard, delCard, getCard };
}

// Card constructor -------------
function createCard(title, description, dueDate, priority, completedOrNot) {
  let completed = completedOrNot;
  const getCompleted = () => completed;
  const switchCompleted = () => {
    if (completed === 'Incomplete') {
      completed = 'Completed';
    } else {
      completed = 'Incomplete';
    }
  };

  return {
    title,
    description,
    dueDate,
    priority,
    getCompleted,
    switchCompleted,
  };
}

// Controller -------------
const Controller = (function Controller() {
  let projects = [];
  let currProject;
  if (localStorage.length === 0) {
    projects.push(createProject('Default'));
    currProject = projects[0];
  }

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
// Main DOM Handler Module
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

    const cardContainer = document.querySelector('.card-container');
    cardContainer.innerHTML = '';
    for (const card of Controller.getCurrProject().getCards()) {
      cardContainer.innerHTML += `
        <div class="todo-card">
            <div class="priority-block ${card.priority}-priority"></div>
            <div class="info-block">
                <h2>${card.title}</h2>
                <p>${card.description}</p>
                <p><strong>Due: </strong>${card.dueDate}</p>
            </div>
            <div class="delete-block">
                <svg id="trash-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>delete</title><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
            </div>
            <div class="complete-block">
                <button class="complete-toggle ${card.getCompleted()}">${card.getCompleted()}</button>
            </div>
        </div>`;
    }

    // Store Data after every page load
    StorageHandler.storeData();
  }

  return { loadPage };
})();

// Card-related DOM Handler Module
const CardHandler = (function handleCardDOM() {
  function showModal() {
    const newCardDialog = document.querySelector('#new-todo-dialog');
    newCardDialog.showModal();
  }

  function handleInput(event) {
    event.preventDefault();
    // Create to-do card
    const title = document.querySelector('#note-title').value;
    const description = document.querySelector('#note-description').value;
    const dueDate = document.querySelector('#note-due-date').value;
    const importance = document.querySelector('#note-importance').value;
    const card = createCard(
      title,
      description,
      dueDate,
      importance,
      'Incomplete'
    );
    // Add card to project, load to DOM and reset form
    const currProject = Controller.getCurrProject();
    currProject.addCard(card);
    DOMHandler.loadPage();
    const newToDoForm = document.querySelector('#new-todo-dialog form');
    newToDoForm.reset();
    const newToDoDialog = document.querySelector('#new-todo-dialog');
    newToDoDialog.close();
  }

  function handleEvent(target) {
    if (target.classList.contains('card-container')) {
      return;
    }
    const cardTitle = target
      .closest('.todo-card')
      .querySelector('.info-block h2').textContent;
    const currProject = Controller.getCurrProject();
    if (target.id === 'trash-svg' || target.parentNode.id === 'trash-svg') {
      currProject.delCard(cardTitle);
      DOMHandler.loadPage();
    }
    if (target.classList.contains('complete-toggle')) {
      const card = currProject.getCard(cardTitle);
      card.switchCompleted();
      DOMHandler.loadPage();
    }
  }
  return { showModal, handleInput, handleEvent };
})();

// Project-related DOM Handler Module
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

// Storage Handler --------
const StorageHandler = (function handleStorageInputAndOutput() {
  function storeData() {
    let dataObj = {};
    // Store projects as obj keys and cards as arrays of objects in obj values
    Controller.getProjects().forEach((project) => {
      dataObj[project.title] = [];
      project.getCards().forEach((card) => {
        const cardObj = {
          title: card.title,
          description: card.description,
          dueDate: card.dueDate,
          priority: card.priority,
          completed: card.getCompleted(),
        };
        dataObj[project.title].push(cardObj);
      });
    });
    localStorage.setItem('projects', JSON.stringify(dataObj));
  }

  function initialiseData() {
    if (localStorage.length !== 0) {
      const dataObj = JSON.parse(localStorage.getItem('projects'));
      for (const [projectTitle, cardArr] of Object.entries(dataObj)) {
        const project = createProject(projectTitle);
        cardArr.forEach((card) => {
          const newCard = createCard(
            card.title,
            card.description,
            card.dueDate,
            card.priority,
            card.completed
          );
          project.addCard(newCard);
        });
        Controller.addProject(project);
      }
      Controller.setCurrProject('Default');
    }
  }

  return { storeData, initialiseData };
})();

// Event Listeners and Page Initialisation -------------
StorageHandler.initialiseData();
DOMHandler.loadPage();

// Add Project
const addProjectBtn = document.querySelector('#add-project-btn');
addProjectBtn.addEventListener('click', ProjectHandler.revealInput);
const addProjectInput = document.querySelector('#add-project-field');
addProjectInput.addEventListener('keydown', (e) =>
  ProjectHandler.handleInput(addProjectInput, e)
);

// Add Todo Card
const addCardBtn = document.querySelector('#add-card-btn');
addCardBtn.addEventListener('click', CardHandler.showModal);
const cardConfirmBtn = document.querySelector('#confirm-button');
cardConfirmBtn.addEventListener('click', (e) => CardHandler.handleInput(e));

// Todo Card Handler
const cardContainer = document.querySelector('.card-container');
cardContainer.addEventListener('click', (e) =>
  CardHandler.handleEvent(e.target)
);

// Switch projects
const projectContainer = document.querySelector('.project-container');
projectContainer.addEventListener('click', (e) =>
  ProjectHandler.handleSwitch(e.target)
);
