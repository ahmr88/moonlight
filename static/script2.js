const senderBtn = document.querySelector("button.sender");
const receiverBtn = document.querySelector("button.receiver");
let carousel = null

senderBtn.addEventListener("click", () => {
  const myCarousel = document.querySelector('#myCarousel')
  carousel = new bootstrap.Carousel(myCarousel, {
    interval: false,
  })

  navigator.requestMIDIAccess().then(
    (e) => {
      document.querySelector('div.controls').classList = ['d-none']

      onMIDISuccess(e)
    },
    onMIDIFailure
  );
});

receiverBtn.addEventListener('click', () => {
  document.querySelector('div.controls').classList = ['d-none']
  let first = true
  socket.on('midi', (data) => {
    if (first) {
      midiLoaded(updateImage)
      first = false
    }
    handleMidiMessage(data)
  })
})

const BUFFER_LENGTH = 30;
const velBuffer = new Uint8Array(BUFFER_LENGTH);
const images = document.querySelectorAll("img");
const timeStep = 50; // ms
const damping = 0.9;

let pedal = false;
let notes = new Uint8Array(88);
let keyState = notes.map((_) => false);

const updateImage = () => {
  const sum = notes.reduce(
    (acc, cur, i) => acc + cur ** (1 + i / notes.length) / 2,
    0
  );
  const avg = sum / (4 * 128);

  const c = 30;
  const percentage = avg * 100;

  const value = percentage + c
  images.forEach(image => {
    image.style.filter = `brightness(${value}%) contrast(${percentage > 100 ? percentage : 100}%)`;
  })
  // if (value > 130) {
  //   image.style.filter += ` contrast(${percentage}%)`
  // }
};

const updateNotes = () => {
  for (let i = 0; i < notes.length; i++) {
    // if (!keyState[i]) {
    if (!keyState[i] && !pedal) {
      const current = notes[i];
      notes[i] = current * damping;
    } else {
      const current = notes[i];
      notes[i] = current * 0.9999;
    }
  }
};

const midiLoaded = (hook) => {
  let step = 0;

  const rec = () => {
    setTimeout(() => rec(), timeStep);
    updateNotes();

    hook();
  };

  rec();
};

const setNoteOn = (note, vel) => {
  notes[note] = vel;
  keyState[note] = true;
};

const setNoteOff = (note, vel) => {
  keyState[note] = false;
  if (!pedal) {
    // notes[note] = 0
  }
};

const setPedal = (vel) => {
  if (vel > 90) {
    pedal = true;
  } else {
    pedal = false;
    for (let i = 0; i < notes.length; i++) {
      if (!keyState[i]) {
        setNoteOff(i, 0);
      }
    }

  }

  if (vel === 0) {
    carousel.next()
  }
};

const handleMidiMessage = (data) => {
  const [cmd, note, vel] = data;
  switch (cmd) {
    case 144:
      setNoteOn(note - 21, vel);
      break;
    case 128:
      setNoteOff(note - 21, vel);
      break;
    case 176:
      setPedal(vel);
      break;
    default:
      break;
  }
};

function onMIDISuccess(midiAccess) {
  console.log(midiAccess);

  const inputs = midiAccess.inputs;
  const outputs = midiAccess.outputs;

  inputs.forEach((x) => {
    x.onmidimessage = (e) => {
      handleMidiMessage(e.data)
      socket.emit('sender', Array.from(e.data))
    };
  });

  midiLoaded(updateImage);
  socket.emit('midi loaded', true)
}

function onMIDIFailure() {
  console.log("Could not access your MIDI devices.");
}

const noteLabels = [
  "A",
  "A#",
  "B",
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
];

const codeToNote = (c) => noteLabels[(c - 21) % 12];
