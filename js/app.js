const firebaseConfig = {
apiKey: "AIzaSyB47DTVbAw572Pnfvv-rmdIej1PAu5MpAg",
authDomain: "aplicaciones-2025.firebaseapp.com",
projectId: "aplicaciones-2025",
storageBucket: "aplicaciones-2025.firebasestorage.app",
messagingSenderId: "788816899111",
appId: "1:788816899111:web:6b4d9f7dedc21d7d08f202"
};
// Initialize Firebase

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore()
const auth = firebase.auth();

/// Referencias a las tareas
const taskInput = document.getElementById('taskInput');
const addTaskbtn = document.getElementById('addTaskButton');
const pendingTasks = document.getElementById('pendingTasks');
const doneTask = document.getElementById('doneTask');

// Elementos nuevos
const assignedInput = document.getElementById('assignedInput')
const statusInput = document.getElementById('statusInput')
const priorityProject = document.getElementById('priorityProject')

// Referencias a los tableros
const boardTitle = document.getElementById('boardTitle')
const boardList = document.getElementById('boardList');
const boardInput = document.getElementById('boardInput');
const boardBtn = document.getElementById('addBoardBtn');

// Botones para Google
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');

// Variable Global para el id del tablero actual
let currentBoardId = null;
let currentUser = null;

// Funciones Login / Logout con Google
loginBtn.addEventListener('click', async () => {
const provider = new firebase.auth.GoogleAuthProvider();
await auth.signInWithPopup(provider);
});

logoutBtn.addEventListener('click', async () => {
await auth.signOut();
});

auth.onAuthStateChanged(user => {
if (user) {
currentUser = user;
userInfo.textContent = user.email;
loginBtn.style.display = 'none';
logoutBtn.style.display = 'block';
boardInput.style.display = 'block';
boardBtn.disabled = false;
taskInput.disabled = false;
addTaskbtn.disabled = false;
loadTasks();
} else {
currentUser = null;
userInfo.textContent = 'No autenticado';
loginBtn.style.display = 'block';
logoutBtn.style.display = 'none';
boardInput.style.display = 'none';
boardBtn.disabled = true;
boardList.innerHTML = '';
boardTitle.textContent = 'Inicia sesión para ver tus tableros';
taskInput.disabled = true;
addTaskbtn.disabled = true;
doneTask.innerHTML = '';
}
});

// Crear un tablero
boardBtn.addEventListener('click', async () => {
const name = boardInput.value.trim();
if (name) {
await db.collection('boards').add({ name });
boardInput.value = '';
}
});

// Mostrar tableros
db.collection('boards').onSnapshot((tableros) => {
boardList.innerHTML = '';
tableros.forEach((doc) => {
const board = doc.data();
const li = document.createElement('li');
li.classList = 'list-group-item list-group-item-action';
li.textContent = board.name;

li.onclick = () => selectBoard(doc.id, board.name);
boardList.appendChild(li);
});
});

const selectBoard = (id, name) => {
  currentBoardId = id;
  boardTitle.textContent = `${name}`;
  enableTaskForm()
  loadTasks();
};

// Funcion para habilitar input del formulario para tareas
const enableTaskForm = () => {
  taskInput.disabled = false
  assignedInput.disabled = false
  priorityProject.disabled  = false 
  addTaskbtn.disabled = false
  statusInput.disabled = false
}

// Funcion para deshabilitar input del formulario para tareas
const disableTaskForm = () => {
  taskInput.disabled = true
  assignedInput.disabled = true
  priorityProject.disabled  = true 
  addTaskbtn.disabled = true
  statusInput.disabled = true
}

// helpers para color de prioridad y status 
const getStatusColor = status => {
  switch(status) {
    case 'Pendiente': return 'secondary'
    case 'En progreso': return 'info'
    case 'Bloqueado': return 'warning'
    case 'Hecho': return 'success'
    default: return 'dark'
  }
}

const getPriorityColor = priority => {
  switch(priority) {
    case 'Alta': return 'danger'
    case 'Media': return 'primary'
    case 'Baja': return 'success'
    default: return 'secondary'
  }
}

// Agregar tarea
addTaskbtn.addEventListener('click', async () => {
  const text = taskInput.value.trim();
  const assigned = assignedInput.value.trim()
  const status = statusInput.value
  const priority = priorityProject.value


  if (text && assigned && currentBoardId && currentUser) {
    await db.collection('tasks').add({ text, assigned,status, priority, done: status === 'Hecho', boardId: currentBoardId, userId: currentUser.uId });
    taskInput.value = '';
    assignedInput.value = ''
    statusInput.value = 'Pendiente'
    priorityInput.value = 'Media'
    } else {
    alert('Selecciona un tablero y escribe la tarea');
}
});

// Cargar tareas
const loadTasks = () => {
  
  db.collection('tasks')
    .where('boardId', '===', currentBoardId)
    .where('userId', '===', currentUser.uId)
    .onSnapshot(snapshot=> {
      document.querySelectorAll('.kanban-col').forEach(col => col.innerHTML = '')
      snapshot.forEach((doc) => {
        const task = doc.data()
        const card = document.createElement('div')
        card.className = 'card p-2 kanban-taks'
        card.draggable = true
        card.dataset.id = doc.id
        card.innerHTML = 
      ` 
        <strong>${task.text}</strong>
        <small>🕴️${task.assigned}</small>
        <span class="badge bg-${getStatusColor(task.status)}"> ${task.status}</span>
        <span class="badge bg-${getPriorityColor(task.priority)}"> ${task.priority}</span>
        <button class="btn btn-sm btn-danger">🗑️</button>
      `

      // drag events
      card.addEventListener('dragstart', e => {
        e.preventDefault()
        e.dataTransfer.setData('taskId', doc.id)
      })
      card.querySelector('button').onclick = () => db.collection('tasks').doc(doc.id).delete()

      const col = document.querySelector(`.kanban-col[data-status="${task.status}"]`)
      if(col){
        col.appendChild(card)
      } else {

      }


      })  
    })

// Actualizar el estado de tareas

const updateTaskStatus = (taskId, newStatus) => {
  db.collection('tasks').doc(taskId).update({
    status: newStatus,
    done: newStatus === 'Hecho'
  })
}


    // db.collection("tasks").where('boardId', '==', currentBoardId)
.onSnapshot((tasks) => {
  pendingTasks.innerHTML = '';
  doneTask.innerHTML = '';

  tasks.forEach((doc) => {
      const task = doc.data();
      const li = document.createElement('li');
      li.className = 'list-group-item'
      // card de las tareas
      li.innerHTML = 
      ` <div class="d-flex justify-content-between aligns-items-center">
          <div>
            <strong>${task.text}</strong>
            <small>🕴️${task.assigned}</small>
            <span class="badge bg-${getStatusColor(task.status)}"> ${task.status}</span>
            <span class="badge bg-${getPriorityColor(task.priority)}"> ${task.priority}</span>
          </div>
          <div>
            <button class="btn btn-sm btn-danger">🗑️</button>
          </div>
        </div>      
      `
    li.querySelector('button').onclick = () => db.collection('tasks').doc(doc.id).delete()



      if (task.done) {
          doneTask.appendChild(li);
      } else {
          pendingTasks.appendChild(li);
      }
  });

});
};

// parametro y argumento
