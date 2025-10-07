const firebaseConfig = {
apiKey: "AIzaSyB47DTVbAw572Pnfvv-rmdIej1PAu5MpAg",
authDomain: "aplicaciones-2025.firebaseapp.com",
projectId: "aplicaciones-2025",
storageBucket: "aplicaciones-2025.firebasestorage.app",
messagingSenderId: "788816899111",
appId: "1:788816899111:web:6b4d9f7dedc21d7d08f202"
};   // Initialize Firebase

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore()
  const auth = firebase.auth();
  
  /// Referencias a las tareas
  const taskInput = document.getElementById('taskInput');
  const addTaskbtn = document.getElementById('addTaskBtn');
  const pendingTasks = document.getElementById('pendingTasks');
  const doneTask = document.getElementById('doneTask');

  //Elementos nuevos
  const assingedInput= document.getElementById('assignedInput')
  const statusInput = document.getElementById('statusInput')
  const priorityInput = document.getElementById('priorityInput')
  const kanbanBoard = document.getElementById('kanbanBoard')
  const boardTabs = document.getElementById('boardTabs')

  // Referencias a los tableros
  // const boardTitle = document.getElementById('boardTitle')
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
  let listeners = {}
  
  // Estados disponibles de las tareas
  let STATUSES = ['Pendiente','En progreso','Bloqueado','Hecho']
  
  // Funciones Login / Logout con Google
  loginBtn.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  await auth.signInWithPopup(provider);
  });
  
  logoutBtn.addEventListener('click', async () => {
  await auth.signOut();
  });
  
  // Evento que escucha cuando cambia la autenticacion
  auth.onAuthStateChanged(user => {
  const navbarText = document.querySelector('.navbar-text');
  
  if (user) {
  currentUser = user;
  navbarText.textContent = user.email;
  loginBtn.style.display = 'none';
  logoutBtn.style.display = 'block';
  boardInput.disabled = false;
  boardBtn.disabled = false;
  taskInput.disabled = false;
  addTaskbtn.disabled = false;
  mostrarTableros()
  
  //loadTasks();
  } else {
  currentUser = null;
  navbarText.textContent = 'No autenticado';
  loginBtn.style.display = 'block';
  logoutBtn.style.display = 'none';
  boardInput.disabled = true;
  boardBtn.disabled = true;
  boardList.innerHTML = '';
  // boardTitle.textContent = 'Inicia sesión para ver tus tableros';
  taskInput.disabled = true;
  addTaskbtn.disabled = true;
  doneTask.innerHTML = '';
  }
  });
  
  // Crear un tablero
  boardBtn.addEventListener('click', async () => {
  const name = boardInput.value.trim();
  if (name && currentUser) {
  await db.collection('boards').add({ name, userId: currentUser.uid});
  boardInput.value = '';
  }
  });
  
  // Mostrar tableros

  const mostrarTableros = ()=>{
      db.collection('boards').where('userId', '==',currentUser.uid).onSnapshot((tableros) => {
          boardList.innerHTML = '';
          tableros.forEach((doc) => {
              
          const board = doc.data();
          const li = document.createElement('li');
          li.classList = 'list-group-item list-group-item-action';
          li.textContent = board.name;
          
          li.onclick = () => openBoard(doc.id, board.name);
          // li.onclick = () => selectBoard(doc.id, board.name);
          boardList.appendChild(li);
          });
          });
  }

  // Abrir la pestania del tablero 
  const openBoard = (id,name) => {
    currentBoardId = id
    if(!document.getElementById(`tab-${id}`)){
        const li = document.createElement('li')
        li.className = 'nav-item'
        li.innerHTML = 
        `
        <button class="nav-link" id="tab-${id}" data-id="${id}">
        ${name}❌
        </button>
        `
        boardTabs.appendChild(li)

        li.querySelector('button').addEventListener('click', (e) => {
          if(e.offsetX > e.target.offsetWidth - 20) {
            // Cerrar tab (click en la X)
            li.remove()
            if(listeners[id]) {
              listeners[id]()
            }
            if(boardTabs.children.length > 0) {
              const nextTab = boardTabs.children[0].querySelector('button')
              openBoard(nextTab.dataset.id, nextTab.textContent.replace("❌", ""))
            } else {
              resetKanban()
            }
          } else {
            // Activar tab (click en el nombre)
            setActiveTab(id)
          }
        })
      }
      setActiveTab(id)  //CHUY
    }

  // Activar pestania CHUY

  const setActiveTab = id => {
    document.querySelectorAll('#boardTabs .nav-link').forEach((btn) => btn.classList.remove('active'))
    document.getElementById(`tab-${id}`).classList.add('active')
    currentBoardId = id
    enableTaskForm() 
    renderKanban()
    loadTasks(id)
  }

  

  //Seleccionar Tablero
  const selectBoard = (id, name) => {
      currentBoardId = id;
      // boardTitle.textContent = `${name}`;
      enableTaskForm()
      renderKanban()
      loadTasks(id);
  };
  //funcion para enable los forms de tareas
  const enableTaskForm = () =>{
      taskInput.disabled = false
      assingedInput.disabled = false
      priorityInput.disabled = false
      addTaskbtn.disabled = false
      statusInput.disabled =false
  }


  const disableForm = () =>{
      taskInput.disabled = true
      assingedInput.disabled = true
      priorityInput.disabled = true
      addTaskbtn.disabled = true
      statusInput.disabled =true
  }

  //helper para color de priodidad y status

  const getStatusColor = status =>{
      switch (status){
          case 'Pendiente': return 'secondary'
          case 'En progreso': return 'info'
          case 'Bloqueado': return 'warning'
          case 'Hecho': return 'success'
          default: return 'dark'
      }
  }

  const getPriorityColor = priority =>{
      switch (priority){
          case 'Alta': return 'secondary'
          case 'Media': return 'info'
          case 'Baja': return 'warning'
          default: return 'secondary'
      }
  }



  // Agregar tarea
  addTaskbtn.addEventListener('click', async () => {
  const text = taskInput.value.trim();
  const assigned = assingedInput.value.trim();
  const status = statusInput.value
  const priority = priorityInput.value
  if (text && currentBoardId) {

  await db.collection('tasks').add({ text
      ,assigned,status,priority, done: status =='Hecho', boardId: currentBoardId,userId: currentUser.uid });
  taskInput.value = ''
  assingedInput.value = ''
  statusInput.value = 'Pendiente'
  priorityInput.value = 'Media'
  } else {
  alert('Selecciona un tablero y escribe la tarea');
  }
  });
  
  




  // Cargar tareas
  const loadTasks = (boardId) => {
  if (!currentBoardId) return;

  // Limpiar listener anterior si existe
  if(listeners[boardId]){
    listeners[boardId]()
  }

  listeners[boardId] = db.collection('tasks').where('boardId', '==', currentBoardId)
  .where('userId', '==', currentUser.uid)
  .onSnapshot(snapshot => {

      document.querySelectorAll('.kanban-col').forEach(col => col.innerHTML = ``)

      snapshot.forEach((doc) => {
          const task = doc.data()
          const card = document.createElement('div')
          card.className = 'card p-2 kanban-task'
          card.draggable = true
          card.dataset.id = doc.id
          card.innerHTML= `
          
                  <strong>${task.text}</strong>
                  <small>👽${task.assigned} </small>
                  <span class="badge bg-${getStatusColor(task.status)}">
                      ${task.status}
                  </span>
                    <span class="badge bg-${getPriorityColor(task.priority)}">
                      ${task.priority}
                  </span>
                  <button class= "btn btn-sm btn-danger">🗑</button>

          `
          card.addEventListener('dragstart', e => {
              e.dataTransfer.setData('taskId', doc.id)

          })

          card.querySelector('button').onclick=() => db.collection('tasks').doc(doc.id).delete()

          const col = document.querySelector(`.kanban-col[data-status="${task.status}"]`)
          if(col){
              col.appendChild(card)
          }

      })
  })

  
  };
  

  const updateTask = (taskId,newStatus) =>{
      db.collection('tasks').doc(taskId).update(
          {
              status:newStatus,
              done : newStatus === 'Hecho'
          }
      )
  }

  const renderKanban = () =>{
      kanbanBoard.innerHTML = ``

      STATUSES.forEach((status) => {
          const col = document.createElement('div')
          col.className = 'col-md-3'
          col.innerHTML = `
              <h5 class='text-center'>${status}</h5>
              <div class='kanban-col' style='min-height: 300px;' data-status='${status}'></div>
          `
          kanbanBoard.appendChild(col)

          //Eventos del drag and drop
          const dropZone = col.querySelector('.kanban-col')

          dropZone.addEventListener('dragover', e=> {
              e.preventDefault()
              dropZone.classList.add('drag-over')
          })

          dropZone.addEventListener('dragleave', () => {
              dropZone.classList.remove('drag-over')
          })

          dropZone.addEventListener('drop', e=> {
              e.preventDefault()
              dropZone.classList.remove('drag-over')
              const taskId = e.dataTransfer.getData('taskId')
              updateTask(taskId,status)
          })
      })
  }

  const resetKanban = () => {
    kanbanBoard.innerHTML = 
    `
      <p class="text-center mb-4 text-muted">Seleccion un tablero para comenzar</p> 

    `
  }
  // parametro y argumento
