const API_URL = 'https://654bbc905b38a59f28efa0dc.mockapi.io/tarea';
let taskTitleInput = document.querySelector('#task-title');
let taskDescInput = document.querySelector('#task-desc');
let taskStatusSelect = document.querySelector('#task-status');
let voiceSelect = document.querySelector('#voice-language');
let voiceRateSlider = document.querySelector('#voice-rate');

// Retrieve configs
var myVoice = localStorage.getItem('voice');
var speed = localStorage.getItem('speed') ?? 1;

// Listen when voices are loaded
let voicesLoaded = false;
speechSynthesis.onvoiceschanged = () => {
  voicesLoaded = true;
};

var speechSyntheObj = new SpeechSynthesisUtterance();

speechSyntheObj.rate = speed;
voiceRateSlider.value = speed;

const fetchTasks = async () => {
  const response = await fetch(API_URL);
  const tasks = await response.json();
  return tasks;
};

const mockObject = [
  {
    id: '1',
    fechacreacion: '2023-10-10 15:21:00',
    fechaconclusion: '',
    titulo: 'Título de la tarea',
    descripcion: 'Descripcion mas extensa de la tarea a realizar',
    estado: 'pendiente',
  },
];

const renderTasks = (tasks) => {
  const taskList = document.querySelector('#content');
  taskList.classList.remove('middle-align');
  taskList.classList.remove('center-align');
  const grid = document.createElement('div');
  grid.classList.add('grid');
  taskList.innerHTML = '';
  tasks.forEach((task) => {
    //const taskItem = document.createElement('article');
    //taskItem.textContent = task.name;
    grid.innerHTML += `
        <article data-id="${task.id}" class="s12 m6 l4 no-padding no-margin">
            <div class="grid no-space">
                <div class="s9 padding">
                    <h5 id="title" class="no-round text-ellipsis">${
                      task.titulo
                    }</h5>
                    <p class="no-round text-ellipsis">${task.fechacreacion}</p>
                    <input type="hidden" id="desc" value="${task.descripcion}">
                </div>
                <div class="s3 padding right-align">
                <button class="transparent circle">
                    <i>more_vert</i>
                    <menu class="no-wrap left">
                        <a>Editar</a>
                    </menu>
                </button>
                <button ${
                  voicesLoaded ? '' : 'disabled'
                } onclick="playTTS()" class="play-button circle border">
                  ${
                    voicesLoaded
                      ? '<i>play_arrow</i>'
                      : '<progress class="circle"></progress>'
                  }
                </button>
                </div>
            </div>
        </article>
    `;
  });
  // Spacer
  grid.innerHTML += `<div class="s large-space margin"></div>`;
  taskList.appendChild(grid);
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

const setEmptyState = () => {
  const taskList = document.querySelector('#content');
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
  const title = card.querySelector('#title').textContent;
  const desc = card.querySelector('#desc').value;
  speechSyntheObj.text = `${title}. ${desc}`;
  window.speechSynthesis.speak(speechSyntheObj);
  // list all available voices in all languages
  console.log(speechSynthesis.getVoices());
};

const enableFab = () => {
  const fab = document.querySelector('#add-fab');
  fab.removeAttribute('disabled');
};

const removeFab = () => {
  const fab = document.querySelector('#add-fab');
  fab.remove();
};

fetchTasks().then((tasks) => {
  console.log(tasks);
  if (tasks.length === 0) {
    setEmptyState();
  } else {
    renderTasks(tasks);
    enableFab();
  }
});

const form = document.getElementById('form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(form);

  // create json object from formdata
  let task = Object.fromEntries(data.entries());
  task.fechacreacion = new Date().toISOString().slice(0, 19).replace('T', ' ');
  task.fechaconclusion = '';
  //console.log(task);

  try {
    let res = await postTask(task);
    console.log(res);
    document.querySelector('#add-dialog').classList.remove('active');
    document.querySelector('.overlay').classList.remove('active');
  } catch (err) {
    console.log(err.message);
  }
});

let voiceList;
const synth = window.speechSynthesis;

synth.addEventListener('voiceschanged', () => {
  voiceList = window.speechSynthesis.getVoices();
  console.log(voiceList);
  voiceList.forEach(
    (voice) =>
      (voiceSelect.innerHTML += `<option value="${voice.voiceURI}">${voice.name} - ${voice.lang}</option>`)
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
  debugger;
  speechSyntheObj.voice = voiceList.filter(
    (voice) => voice.voiceURI === voiceSelect.value
  )[0];
  localStorage.setItem('voice', voiceSelect.value);
});

voiceRateSlider.addEventListener('change', () => {
  speechSyntheObj.rate = voiceRateSlider.value;
  localStorage.setItem('speed', voiceRateSlider.value);
});
