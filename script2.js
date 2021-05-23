navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

const BUFFER_LENGTH = 30;
const velBuffer = new Uint8Array(BUFFER_LENGTH);
const image = document.querySelector("img");
const timeStep = 50 // ms
const damping = 0.8

let pedal = false;

let notes = new Uint8Array(88);
let keyState = notes.map(_ => false);


const updateImage = () => {
  const sum = notes.reduce((acc, cur, i) => acc + (cur ** (1 + (i/notes.length)))/2 ,0)
  const avg = sum / (6 * 128)

  const c = 30
  const percentage = avg * 100


  image.style.filter = `brightness(${percentage + c}%)`
}

const updateNotes = () => {
  for (let i = 0; i < notes.length; i++) {
    if (!keyState[i]) {
      const current = notes[i]
      notes[i] = current * 0.8
    }
  }
}

const midiLoaded = (hook) => {
  let step = 0;
  const rec = () => {
    setTimeout(() => rec(), timeStep);
    updateNotes()

    hook()
  };
  rec();
};

const setNoteOn = (note, vel) => {
  notes[note] = vel
  keyState[note] = true
};

const setNoteOff = (note, vel) => {
  keyState[note] = false
  if (!pedal) {
    // notes[note] = 0
  }
};

const setPedal = (vel) => {
  if (vel > 90) {
    pedal = true
  } else {
    pedal = false
    for (let i = 0; i < notes.length; i++) {
      if (!keyState[i]) {
        setNoteOff(i, 0)
      }
    }
  }
};

const handleMidiMessage = (e) => {
  const [cmd, note, vel] = e.data;
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
    x.onmidimessage = handleMidiMessage;
  });

  midiLoaded(updateImage);
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
