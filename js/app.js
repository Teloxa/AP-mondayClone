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
loadTasks();
};

// Agregar tarea
addTaskbtn.addEventListener('click', async () => {
const text = taskInput.value.trim();
if (text && currentBoardId) {
await db.collection('tasks').add({ text, done: false, boardId: currentBoardId });
taskInput.value = '';
} else {
alert('Selecciona un tablero y escribe la tarea');
}
});

// Cargar tareas
const loadTasks = () => {
if (!currentBoardId) return;

db.collection("tasks").where('boardId', '==', currentBoardId)
.onSnapshot((tasks) => {
    pendingTasks.innerHTML = '';
    doneTask.innerHTML = '';

    tasks.forEach((doc) => {
        const task = doc.data();
        const li = document.createElement('li');
        li.classList = 'list-group-item d-flex justify-content-between align-items-center';

        const leftDiv = document.createElement('div');
        leftDiv.classList = 'd-flex align-items-center';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList = 'form-check-input2 me-2';
        checkbox.checked = task.done;
        checkbox.onchange = async () => db.collection('tasks').doc(doc.id).update({ done: checkbox.checked });

        const span = document.createElement('span');
        span.textContent = task.text;
        if (task.done) {
            span.style.textDecoration = 'line-through';
        }

        const delbtn = document.createElement('button');
        delbtn.classList = 'btn btn-danger btn-sm';
        delbtn.textContent = 'Delete';
        delbtn.onclick = async () => await db.collection('tasks').doc(doc.id).delete();

        leftDiv.appendChild(checkbox);
        leftDiv.appendChild(span);

        li.appendChild(leftDiv);
        li.appendChild(delbtn);

        if (task.done) {
            doneTask.appendChild(li);
        } else {
            pendingTasks.appendChild(li);
        }
    });
});
};

// parametro y argumento