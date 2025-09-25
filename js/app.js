const firebaseConfig = {
apiKey: "AIzaSyBK7iA8YLDLZXtj841YnYz8I2DB77ZWUJA",
  authDomain: "app-ad2025.firebaseapp.com",
  projectId: "app-ad2025",
  storageBucket: "app-ad2025.firebasestorage.app",
  messagingSenderId: "484805168922",
  appId: "1:484805168922:web:ce28a5d197430b53dc26a3"
};
// Initialize Firebase

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore()

//Referencias a las tareas
const taskInput = document.getElementById('taskInput');
const addTaskbtn = document.getElementById('addTaskButton');
const pendingTasks= document.getElementById('pendingTasks');
const doneTask = document.getElementById('doneTask');

//Referencias a los tableros


const boardTitle = document.getElementById('boardTitle')
const boardList = document.getElementById('boardList')
const boardInput = document.getElementById('boardInput')
const boardBtn = document.getElementById('addBoardBtn')


let currentBoardId = null

boardBtn.addEventListener('click', async () => {
const name = boardInput.value.trim()

if(name){
    await db.collection('boards').add({name})
    boardInput.value = ''
}

})
db.collection('boards').onSnapshot((tableros) => {
boardList.innerHTML = ''
tableros.forEach((doc) =>{
    const board = doc.data()
    const li = document.createElement('li')
    li.classList = 'list-group-item list-group-item-action'
    li.textContent = board.name

    li.onclick = () => selectBoard(doc.id, board.name)
    boardList.appendChild(li)
})
})


const selectBoard = (id,name) =>{
currentBoardId = id
boardTitle.textContent = `${name}`
loadTasksForBoard(id)
loadTasks()
}

const loadTasksForBoard = (boardId) => {
  // db.collection('tasks').where('boardId', '==', boardId).onSnapshot(snapshot => {
  //     pendingTasks.innerHTML = ''
  //     doneTask.innerHTML=''
  //     snapshot.forEach(doc => {

  //     const task = doc.data()
  //     const li = document.createElement('li')
  //     li.classList = 'list-group-item d-flex justify-content-between align-items-center' 
      
  //     const leftDiv = document.createElement('div')
  //     leftDiv.classList = 'd-flex align-items-center'

  //     const checkbox = document.createElement('input')
  //     checkbox.type = 'checkbox'
  //     checkbox.classList = 'form-check-input2 me-2'
  //     checkbox.checked = task.done
  //     checkbox.onchange = async() => db.collection('tasks').doc(doc.id).update({done:checkbox.checked})
      
  //     const span = document.createElement('span')
  //     span.textContent = task.text
  //     if(task.done){
  //         span.style.textDecoration = 'line-through'
  //     }

  //     const delbtn = document.createElement('button')
  //     delbtn.classList = 'btn btn-danger btn-sm'
  //     delbtn.textContent = 'Delete'
  //     delbtn.onclick =  async() =>  await db.collection('tasks').doc(doc.id).delete()
  //     leftDiv.appendChild(span)

  //     leftDiv.appendChild(checkbox)

  //     li.appendChild(delbtn)
  //     li.appendChild(leftDiv)


  //     if (task.done){
  //         doneTask.appendChild(li)

  //     }else{
  //         pendingTasks.appendChild(li)
  //     }
  // })
  // })
}

addTaskbtn.addEventListener('click', async () => {
console.log('Button clicked')
const text = taskInput.value.trim()
if (text && currentBoardId) {
    await db.collection('tasks').add({ text, done: false, boardId: currentBoardId })
    taskInput.value = ''
}
else {
  alert('Por favor, selecciona el tablero y escribe una tarea.')
}
})

const loadTasks = () => {
  db.collection("tasks").where('boardId', '==', currentBoardId)
  .onSnapshot((tasks) => {
  pendingTasks.innerHTML = ''
  doneTask.innerHTML = ''
  tasks.forEach((doc) => {
    const task = doc.data()
    const li = document.createElement('li')
    li.classList = 'list-group-item d-flex justify-content-between align-items-center' 
    
    const leftDiv = document.createElement('div')
    leftDiv.classList = 'd-flex align-items-center'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.classList = 'form-check-input2 me-2'
    checkbox.checked = task.done
    checkbox.onchange = async() => db.collection('tasks').doc(doc.id).update({done:checkbox.checked})
    
    const span = document.createElement('span')
    span.textContent = task.text
    if(task.done){
        span.style.textDecoration = 'line-through'
    }

    const delbtn = document.createElement('button')
    delbtn.classList = 'btn btn-danger btn-sm'
    delbtn.textContent = 'Delete'
    delbtn.onclick =  async() =>  await db.collection('tasks').doc(doc.id).delete()
    
    leftDiv.appendChild(checkbox)
    leftDiv.appendChild(span)

    li.appendChild(leftDiv)
    li.appendChild(delbtn)


    if (task.done){
        doneTask.appendChild(li)

    }else{
        pendingTasks.appendChild(li)
    }

  })
  })
}


// parametro y argumento