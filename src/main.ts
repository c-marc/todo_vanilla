import {v4 as uuidV4} from "uuid"

type Task = {
  id: string,
  name: string,
  complete: boolean
}

type List = {
  id: string,
  name: string,
  tasks: Task[]
}

const listsContainer = document.querySelector<HTMLUListElement>("[data-lists]")
const newListForm = document.querySelector<HTMLFormElement>("[data-new-list-form]")
const newListInput = document.querySelector<HTMLInputElement>("[data-new-list-input]")
const deleteListButton = document.querySelector<HTMLInputElement>("[data-delete-list-button]")

const listDisplayContainer = document.querySelector<HTMLElement>("[data-list-display-container]")
const listTitleElement = document.querySelector<HTMLElement>("[data-list-title]")
const listCountElement = document.querySelector<HTMLElement>("[data-list-count]")
const tasksContainer = document.querySelector<HTMLElement>("[data-tasks]")

const taskTemplate = document.querySelector<HTMLTemplateElement>("#task-template")

const newTaskForm = document.querySelector<HTMLFormElement>("[data-new-task-form]")
const newTaskInput = document.querySelector<HTMLInputElement>("[data-new-task-input]")

const clearCompleteTasksButton = document.querySelector<HTMLInputElement>("[data-clear-complete-tasks-button]")

const LOCAL_STORAGE_LIST_KEY = "task.lists"
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = "task.selectedListId"

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY) || "[]")
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY)

tasksContainer?.addEventListener("click", e => {
  const targetEl = e.target as HTMLInputElement
  if (targetEl && targetEl.tagName.toLowerCase() === "input") {
    const selectedList = lists.find((list: List) => list.id === selectedListId)
    const selectedTask = selectedList.tasks.find((task: Task) => task.id === targetEl.id)
    selectedTask.complete = targetEl.checked
    save()
    renderTaskCount(selectedList)
  }
})

listsContainer?.addEventListener("click", e => {
  const targetEl = e.target as HTMLElement
  if (targetEl && targetEl.tagName.toLowerCase() === "li") {
    selectedListId = targetEl.dataset.listId || null
    saveAndRender()
  }
})

clearCompleteTasksButton?.addEventListener("click", () => {
  const selectedList = lists.find((list: List) => list.id === selectedListId)
  selectedList.tasks = selectedList.tasks.filter((task: Task) => !task.complete)
  saveAndRender()
})

deleteListButton?.addEventListener("click", () =>  {
  lists = lists.filter((list: List) => list.id !== selectedListId)
  selectedListId = null
  saveAndRender()
})

newListForm!.addEventListener("submit", (e) => {
  e.preventDefault()
  const listName = newListInput!.value
  if (listName == null || listName === "") return
  const list = createList(listName)
  newListInput!.value = ""
  lists.push(list)
  saveAndRender()
})

newTaskForm!.addEventListener("submit", (e) => {
  e.preventDefault()
  const taskName = newTaskInput!.value
  if (taskName == null || taskName === "") return
  const task = createTask(taskName)
  newTaskInput!.value = ""
  const selectedList = lists.find((list: List) => list.id === selectedListId)
  selectedList.tasks.push(task)
  saveAndRender()
})

function createTask(name: string) {
  return {
    id: uuidV4(),
    name: name,
    complete: false
  }
}

function createList(name: string) {
  return {
    id: uuidV4(),
    name: name,
    tasks: []
  }
}
 
function saveAndRender(){
  save()
  render()
}

function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists))
  if (selectedListId) localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId)
}

function render() {
  clearElement(listsContainer!)

  renderLists()
  const selectedList = lists.find((list: List) => list.id === selectedListId)

  if (selectedListId == null) {
    listDisplayContainer!.style.display = "none"
  } else {
    listDisplayContainer!.style.display = ""
    listTitleElement!.innerText = selectedList.name
    renderTaskCount(selectedList)
    clearElement(tasksContainer!)
    renderTasks(selectedList)
  }
}

function renderTasks(list: List) {
  list.tasks.forEach(task => {
    const taskElement = document.importNode(taskTemplate!.content, true)
    const checkbox = taskElement.querySelector("input")
    checkbox!.id = task.id
    checkbox!.checked = task.complete
    const label = taskElement.querySelector("label")
    label!.htmlFor = task.id
    label!.append(task.name)
    tasksContainer!.appendChild(taskElement)

  })
}

function renderTaskCount(list: List) {
  const incompleteTaskCount = list.tasks.filter(task => !task.complete).length

  const taskString = incompleteTaskCount <= 1 ? "task" : "tasks"
  listCountElement!.innerText = `${incompleteTaskCount} ${taskString} remaining`
}

function renderLists() {
  lists.forEach((list: List) => {
    const listElement = document.createElement("li")
    listElement.dataset.listId = list.id
    listElement.classList.add("list-name")
    listElement.innerText = list.name
    if  (list.id === selectedListId) {
      listElement.classList.add("active-list")
    }
    listsContainer?.appendChild(listElement)
  })
}

function clearElement(element: HTMLElement) {
  while(element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

render()

/*
let tasks: Task[] = loadTasks()
tasks.forEach(addListItem)
updateStats()

todoForm?.addEventListener("submit", (e) => {
  e.preventDefault()

  if (mainInput?.value === "" || mainInput?.value == null) return

  const newTask: Task = {
    id: uuidV4(), //new Date().getTime(),
    title: mainInput.value,
    completed: false,
    createdAt: new Date()
  }
  tasks.push(newTask)
  saveTasks()
  updateStats()

  addListItem(newTask)


//  mainInput.value = ""
  todoForm.reset()
  mainInput?.focus()

})


function addListItem(task: Task){
  const item = document.createElement("li")
  // Checkbox
  const checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  checkbox.checked = task.completed
  if (task.completed) item.classList.add("complete")
  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked
    if(task.completed) {
      item.classList.add("complete")
    } else {
      item.classList.remove("complete")
    }
    saveTasks()
    updateStats()
  })
  // Title
  const title = document.createElement("span")
  title.textContent = task.title
  
  const container = document.createElement("div")
  container.append(checkbox)
  container.append(title)

  // Delete button
  const button = document.createElement("button")
  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
</svg>`
  button.addEventListener("click", () => {
    tasks = tasks.filter((t: Task) => t.id !== task.id)
    item.remove()
    saveTasks()
    updateStats()
  })

  item.append(container)
  item.append(button)
  todoList?.append(item)
}

function saveTasks(){
  localStorage.setItem("TASKS", JSON.stringify(tasks))
}

function loadTasks(): Task[]{
  const taskJSON = localStorage.getItem("TASKS")
  if (taskJSON == null) return []
  return JSON.parse(taskJSON)
}

function updateStats (){
  const completedTasks = tasks.filter((task: Task) => task.completed === true)
  const remainingTasks = tasks.filter((task: Task) => task.completed !== true)

  statTotal!.textContent = tasks.length.toString()
  statCompleted!.textContent = completedTasks.length.toString()
  statRemaining!.textContent = remainingTasks.length.toString()
}
*/
