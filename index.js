// TASK: import helper functions from utils
import { getTasks, createNewTask, deleteTask,putTask } from './utils/taskFunctions.js';
// TASK: import initialData
import { initialData } from './initialData.js';
/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/




// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

initializeData()




// TASK: Get elements from the DOM
const elements = {


//Sidebar
 sideBar: document.querySelector('.side-bar'),
 themeSwitch: document.getElementById('switch'),
 hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
 showSideBarBtn: document.getElementById('show-side-bar-btn'),

 // Main Layout elements
 headerBoardName: document.getElementById('header-board-name'),
 createNewTaskBtn: document.getElementById('add-new-task-btn'),
 editBoardBtn: document.getElementById('edit-board-btn'),
 deleteBoardBtn: document.getElementById('deleteBoardBtn'),

 // Task Columns elements
 todoColumn: document.querySelector('[data-status="todo"]'),
 doingColumn: document.querySelector('[data-status="doing"]'),
 doneColumn: document.querySelector('[data-status="done"]'),
 

 // New Task Modal elements
 modalWindow: document.getElementById('new-task-modal-window'),
 titleInput: document.getElementById('title-input'),
 descInput: document.getElementById('desc-input'),
 selectStatus: document.getElementById('select-status'),
 

 // Edit Task Modal elements
 editTaskModal: document.querySelector('.edit-task-modal-window'),
 editTaskTitleInput: document.getElementById('edit-task-title-input'),
 editTaskDescInput: document.getElementById('edit-task-desc-input'),
 editSelectStatus: document.getElementById('edit-select-status'),
 saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
 deleteTaskBtn: document.getElementById('delete-task-btn'),
 

 // Filter Div
 filterDiv: document.getElementById('filterDiv')

}

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks(); //gives us the tasks json object
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];//removes any falsey board properties and assigns it to a spread out set so now we have an array that holds the tasks.board: properties, which are 2: roadmap and launch career
  displayBoards(boards);  //displayboards is run here so that the activeBoard object exists before we call it here
  if (boards.length > 0) { //if board  s has items
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; //if localStorageBoard exists then it will be returned but if it doesnt exist then it will return teh first element in the boards array intead
    elements.headerBoardName.textContent = activeBoard; // sets the text content of the header to the value we get from activeBoard
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}



// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) { 
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {   //for every item in the boards object the function will apply launchcareer and roadmap
    const boardElement = document.createElement("button"); //creates a new button element in the dom
    boardElement.textContent = board; //the new button element gets the textContent of the board argument
    boardElement.classList.add("board-btn"); // the new button element gets a class called board-btn
    boardElement.addEventListener("click",()=> {   //the new button element gets a "click" event listener 
      elements.headerBoardName.textContent = board; //the headerboardname element gets it textcontent changed to the board argument
      filterAndDisplayTasksByBoard(board);  //the  filterAndDisplayTasksByBoard function runs with our board parameter as its arguments
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard)); //creates a localstorage item with key activeBoard  value of activeBoard variable 
      styleActiveBoard(activeBoard); //styleactiveboard function runs with the argument of our activeboard variable  
    })
    boardsContainer.appendChild(boardElement); // we append our baordElement button to the boardsContainer variable 
  });

}





// Filters tasks corresponding to the board name and displays them on the DOM. and further filters them according to their status property
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);  //this filters all the tasks that have a corresponding board property value

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs
  const columns = [elements.todoColumn, elements.doingColumn,elements.doneColumn]; //initially columnDivs returned an html collection which was more difficult to work with
  columns.forEach(column => {
    const status = column.getAttribute("data-status"); //gets the value of the data-status attribute 
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div"> 
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`; //changes the innerHTMl of the current column element and provides it with new text contents for the heading

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer); //creates a new div in the current column for containing tasks that match the status

    filteredTasks.filter(task => task.status == status).forEach(task => {  //filters each task that matches the board name by their status
      const taskElement = document.createElement("div");  //creates a div for holding each individual task
      taskElement.classList.add("task-div");  //adds a class called task-div to the created element
      taskElement.textContent = task.title; //changes the text content of created element to the title of the individual task object it refers to
      taskElement.setAttribute('data-task-id', task.id);  //creates an attribute called data-task-id which holds teh value of the task objects unique id 

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click", () => {  //properly added an eventlistener
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);  //appends the created task to the created taskContainer div 
    });
  });
}



function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard); //runs the function that recreates the boards and their 
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {  //grabs all the elements returned from the queryselector that match the query, then runs a foreach on each corresponding element
    
    if(btn.textContent === boardName) {  // checks if the argument is equal to the textContent of each grabbed element 
      btn.classList.add('active');  //if so it adds the class of active to the current board
    }
    else {
      btn.classList.remove('active');  //if not it removes the class of active from the current board
    }
  });
}


function addTaskToUI(task) {  
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);   //incorrect way to use template literals, grabs a "nested selector"
  if (!column) { //makes sure that column for task exists
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container'); //gets the element that contains the tasks within the current status column
  if (!tasksContainer) {  
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener("click", () => {toggleModal(false, elements.editTaskModal)});

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object


    const task = {
      title: elements.titleInput.value,
      description: elements.descInput.value,
      status: elements.selectStatus.value,
      board: activeBoard
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  if(show == true){
 elements.sideBar.style.display = "block";
 elements.showSideBarBtn.style.display = "none";
}
else if(show==false){
  elements.sideBar.style.display = "none";
  elements.showSideBarBtn.style.display = "block";
}
}

function toggleTheme() {
  const bodyTag= document.querySelector("body");
if(bodyTag.classList == "light-theme"){
  bodyTag.classList.remove("light-theme");
  localStorage.setItem('theme', 'dark');
}else
 bodyTag.classList.add("light-theme");
 localStorage.setItem('theme', 'light');
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
   elements.editTaskTitleInput.value = task.title;
   elements.editTaskDescInput.value = task.description;
   elements.editSelectStatus.value = task.status;

  // Get button elements from the task modal
 const saveBtn = elements.saveTaskChangesBtn;
 const deleteBtn = elements.deleteTaskBtn;
 const cancelBtn = elements.cancelEditBtn;

 

  // Call saveTaskChanges upon click of Save Changes button
 saveBtn.addEventListener("click", ()=>{saveTaskChanges(task.id)});

  // Delete task using a helper function and close the task modal
deleteBtn.addEventListener("click", function(){
  deleteTask(task.id);
  location.reload();
});

  // Show the edit task modal
  toggleModal(true, elements.editTaskModal);
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  
    let newTitle =  elements.editTaskTitleInput.value;
    let newDesc = elements.editTaskDescInput.value;
    let newStatus = elements.editSelectStatus.value;
   
  
  // Create an object with the updated task details

  const updatedTask = {
    title: newTitle,
    description: newDesc,
    status: newStatus,
    board: activeBoard
  };
  // Update task using a hlper functoin
 
putTask(taskId,updatedTask);
  // Close the modal and refresh the UI to reflect the changes

  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('theme') === 'light-theme';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}