const API_URL = 'https://654bbc905b38a59f28efa0dc.mockapi.io/tarea';
let taskTitleInput = document.querySelector('#task-title');
let taskDescInput = document.querySelector('#task-desc');
let taskStatusSelect = document.querySelector('#task-status');
let voiceSelect = document.querySelector('#voice-language');
let voiceRateSlider = document.querySelector('#voice-rate');
let darkModeSwitch = document.querySelector('#dark-mode');
let taskList = document.querySelector('#content');

// Retrieve configs
var myVoice = localStorage.getItem('voice');
var speed = localStorage.getItem('speed') ?? 1;
var darkMode = localStorage.getItem('darkMode') ?? false;

// Listen when voices are loaded
let voicesLoaded = false;
let voicesList = window.speechSynthesis.getVoices();
if (voicesList.length > 0) {
  voicesLoaded = true;
} else {
  speechSynthesis.onvoiceschanged = () => {
    voicesLoaded = true;
  };
}

var speechSyntheObj = new SpeechSynthesisUtterance();

speechSyntheObj.rate = speed;
voiceRateSlider.value = speed;

// Functions

const fetchTasks = async () => {
  const response = await fetch(API_URL);
  const tasks = await response.json();
  return tasks;
};

const setDarkMode = (bool) => {
  if (bool == 'true') {
    document.body.classList.add('dark');
    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute('content', 'rgb(79, 55, 138)');
  } else {
    document.body.classList.remove('dark');
    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute('content', 'rgb(233, 221, 255)');
  }
  localStorage.setItem('darkMode', bool);
};

const renderTasks = (tasks) => {
  console.table(tasks);
  taskList.classList.remove(
    'middle-align',
    'center-align',
    'large-padding',
    'large-margin'
  );
  const grid = document.createElement('div');
  grid.classList.add('grid');
  taskList.innerHTML = '';
  // Pendant tasks
  tasks
    .filter((task) => task.estado === 'pendiente')
    .forEach((task) => {
      grid.innerHTML += renderTask(task, voicesLoaded);
    });

  // Completed tasks
  tasks
    .filter((task) => task.estado === 'completada')
    .sort((a, b) => {
      const dateA = new Date(a.fechaconclusion);
      const dateB = new Date(b.fechaconclusion);
      return dateA - dateB;
    })
    .forEach((task) => {
      grid.innerHTML += renderTask(task, voicesLoaded);
    });

  // Spacer
  grid.innerHTML += `<div class="s large-space margin"></div>`;
  taskList.appendChild(grid);
};

const renderTask = (task, voicesLoaded) => {
  let isCompleted = task.estado === 'completada';
  let taskButton = isCompleted
    ? `<button class="circle transparent" disabled><i class="primary-text">done</i></button>`
    : `<button ${
        voicesLoaded ? '' : 'disabled'
      } onclick="playTTS()" class="play-button circle border">
          ${
            voicesLoaded
              ? '<i>play_arrow</i>'
              : '<progress class="circle"></progress>'
          }
        </button>`;
  return `
    <article data-id="${task.id}" class="s12 m6 l4 no-padding no-margin ${
    isCompleted ? 'fill' : ''
  }">
      <div class="grid no-space">
          <div class="s9 padding">
              <h5 class="title no-round text-ellipsis">${task.titulo}</h5>
              <p class="no-round text-ellipsis">${
                isCompleted ? task.fechaconclusion : task.fechacreacion
              }</p>
              <input type="hidden" class="desc" value="${task.descripcion}">
              <input type="hidden" class="create-date" value="${
                task.fechacreacion
              }">
              <input type="hidden" class="conclusion-date" value="${
                task.fechaconclusion
              }">
              <input type="hidden" class="status" value="${task.estado}">
          </div>
          <div class="s3 padding right-align">
            <button class="transparent circle">
                <i>more_vert</i>
                <menu class="no-wrap left">
                    <a class="row" onclick="openEditDialog(this)">
                      <i>edit</i>
                      <span>Editar</span>
                    </a>
                </menu>
            </button>
            ${taskButton}
            </div>
        </div>
    </article>
`;
};

const postTask = async (task) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(task),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  return data;
};

const putTask = async (task) => {
  const response = await fetch(`${API_URL}/${task.id}`, {
    method: 'PUT',
    body: JSON.stringify(task),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  return data;
};

const setEmptyState = () => {
  taskList.classList.add('large-padding', 'large-margin');
  removeFab();
  taskList.innerHTML = `
    <div class="center-align">
        <i class="extra">list_alt</i>
        <h5>No ten&eacute;s tareas</h5>
        <p>¡Agreg&aacute; una nueva!</p>
        <div class="space"></div>
        <nav class="center-align">
          <button data-ui="#add-dialog"><i>add</i>Nueva tarea</button>
        </nav>
    </div>
    `;
};

const playTTS = () => {
  const card = event.target.parentNode.parentNode;
  const title = card.querySelector('.title').textContent;
  const desc = card.querySelector('.desc').value;
  speechSyntheObj.text = `${title}. ${desc}`;
  window.speechSynthesis.speak(speechSyntheObj);
};

const enableFab = () => {
  const fab = document.querySelector('#add-fab');
  fab.removeAttribute('disabled');
};

const removeFab = () => {
  const fab = document.querySelector('#add-fab');
  fab.classList.add('hide');
};

const showFab = () => {
  const fab = document.querySelector('#add-fab');
  fab.classList.remove('hide');
};

function openEditDialog(el) {
  const thisCard = el.parentNode.parentNode.parentNode.parentNode.parentNode;
  const id = thisCard.dataset.id;
  const title = thisCard.querySelector('.title').textContent;
  const desc = thisCard.querySelector('.desc').value;
  const createDate = thisCard.querySelector('.create-date').value;
  const conclusionDate = thisCard.querySelector('.conclusion-date').value;
  const status = thisCard.querySelector('.status').value;
  const dialog = document.querySelector('#edit-dialog');
  dialog.dataset.id = id;
  dialog.querySelector('#task-edit-title').textContent = title;
  dialog.querySelector('#task-edit-desc').textContent = desc;
  dialog.querySelector('#task-edit-create-date').textContent = createDate;
  dialog.querySelector('#task-edit-conclusion-date').textContent =
    conclusionDate != '' ? conclusionDate : '-';
  dialog.querySelector('#task-edit-status').value = status;
  ui('#edit-dialog');
}

// End functions

setDarkMode(darkMode);
if (darkMode === 'true') {
  darkModeSwitch.checked = true;
}

fetchTasks().then((tasks) => {
  if (tasks.length === 0) {
    setEmptyState();
  } else {
    renderTasks(tasks);
    enableFab();
  }
});

const formAdd = document.getElementById('form');
formAdd.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(formAdd);

  // create json object from formdata
  let task = Object.fromEntries(data.entries());
  task.fechacreacion = new Date().toISOString().slice(0, 19).replace('T', ' ');
  task.fechaconclusion = '';
  ui('#add-dialog');
  taskList.innerHTML =
    "<div class='center-align padding'><progress class='circle'></progress></div>";
  try {
    let res = await postTask(task);
  } catch (err) {
    console.error(err.message);
  }
  fetchTasks().then((tasks) => renderTasks(tasks));
  showFab();
  formAdd.reset();
});

const formEdit = document.getElementById('form-edit');
formEdit.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(formEdit);
  let task = Object.fromEntries(data.entries());
  let concDate = formEdit.querySelector(
    '#task-edit-conclusion-date'
  ).textContent;
  task.id = formEdit.parentNode.dataset.id;
  if (task.estado == 'pendiente') {
    if (concDate != '-') task.fechaconclusion = '';
  } else if (task.estado == 'completada') {
    if (concDate == '-')
      task.fechaconclusion = new Date()
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
  }
  taskList.innerHTML =
    "<div class='center-align padding'><progress class='circle'></progress></div>";
  debugger;
  if ('fechaconclusion' in task) {
    // hubo cambios
    try {
      let res = await putTask(task);
    } catch (err) {
      console.error(err.message);
    }
  }

  fetchTasks().then((tasks) => renderTasks(tasks));
  showFab();
  formEdit.reset();
});

let voiceList;
const synth = window.speechSynthesis;

synth.addEventListener('voiceschanged', () => {
  voiceList = window.speechSynthesis.getVoices();
  voiceList.forEach(
    (voice) =>
      (voiceSelect.innerHTML += `<option value="${
        voice.voiceURI
      }" data-lang="${voice.lang.replace('_', '-')}">${voice.name} - ${
        voice.lang
      }</option>`)
  );
  if (myVoice) {
    //speechSyntheObj.voice = voiceList.filter((voice) => voice === voice);
    speechSyntheObj.voice = voiceList.filter(
      (voice) => voice.voiceURI === myVoice
    )[0];
  } else {
    speechSyntheObj.voice = speechSynthesis.getVoices()[0];
  }
  document.querySelectorAll('.play-button').forEach((element) => {
    element.removeAttribute('disabled');
    element.innerHTML = '<i>play_arrow</i>';
  });
});

voiceSelect.addEventListener('change', () => {
  speechSyntheObj.voice = voiceList.filter(
    (voice) => voice.voiceURI === voiceSelect.value
  )[0];
  // get data-lang of selected option
  speechSyntheObj.lang =
    voiceSelect.options[voiceSelect.selectedIndex].dataset.lang;
  localStorage.setItem('voice', voiceSelect.value);
});

voiceRateSlider.addEventListener('change', () => {
  speechSyntheObj.rate = voiceRateSlider.value;
  localStorage.setItem('speed', voiceRateSlider.value);
});

darkModeSwitch.addEventListener('change', () => {
  setDarkMode(darkModeSwitch.checked.toString());
});
