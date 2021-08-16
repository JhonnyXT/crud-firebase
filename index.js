const db = firebase.firestore();

const taskForm = document.getElementById("task-form");
const taskContainer = document.getElementById("tasks-container");

let editStatus = false;
let id = '';

//Funcion para guardar las tareas
const saveTask = (title, description) =>
  db.collection("tasks").doc().set({
    title,
    description,
  });

//Funcion para obtener las tareas
const getTasks = () => db.collection("tasks").get();

//Funcion para obtener tarea por medio del ID
const getTask = (id) => db.collection("tasks").doc(id).get();

const onGetTasks = (callback) => db.collection("tasks").onSnapshot(callback);

//Funcion para eliminar tarea por medio de su ID
const deleteTask = id => db.collection("tasks").doc(id).delete();

//Funcion para actualizar la tarea
const updateTask = (id, updatedTask) => db.collection("tasks").doc(id).update(updatedTask);

//Metodo para pintar las tareas creadas en el window
window.addEventListener("DOMContentLoaded", async (e) => {
  onGetTasks((querySnapshot) => {
    taskContainer.innerHTML = '';

    querySnapshot.forEach((doc) => {
      console.log(doc.data());

      const task = doc.data();
      task.id = doc.id;

      taskContainer.innerHTML += `<div class="card card-body mt-2 border-primary">
                <h3 class="h5">${task.title}</h3>
                <p>${task.description}</p>
                <div>
                    <button class="btn btn-primary btn-delete" data-id="${task.id}">Delete</button>
                    <button class="btn btn-primary btn-edit" data-id="${task.id}">Edit</button>
                </div>
            </div>`;

            const btnsDelete = document.querySelectorAll('.btn-delete');
            btnsDelete.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    await deleteTask(e.target.dataset.id)
                })
            });

            const btnsEdit = document.querySelectorAll('.btn-edit');
            btnsEdit.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const doc = await getTask(e.target.dataset.id);
                    const task = doc.data();

                    editStatus = true;
                    id = doc.id;

                    taskForm['task-title'].value = task.title;
                    taskForm['task-description'].value = task.description;
                    taskForm['btn-task-form'].innerHTML = 'UPDATE';
                })
            })
    });
  });
});

//capturando el evento sumbit del formulario
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault(); //para cancelar el reload de la pagina

  //Capturando todo lo que contiene el elemento input
  const title = taskForm["task-title"];
  const description = taskForm["task-description"];

  if (!editStatus) {
    await saveTask(title.value, description.value);
  } else {
    await updateTask(id, {
        title: title.value, 
        description: description.value
    });
    //Luego de que todo se edite hay que cambiar el estado del formulario
    editStatus = false;

    id = '';
    taskForm['btn-task-form'].innerHTML = 'SAVE';
  }

  await getTasks();

  taskForm.reset(); //Metodo para resetear todo el formulario
  title.focus(); //metodo para poner el cursor en el title
});
