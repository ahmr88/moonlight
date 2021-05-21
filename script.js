const audioContext = new AudioContext();

console.log("audio is starting up ...");

let BUFF_SIZE_RENDERER = 16384;

let audioInput = null,
  microphone_stream = null,
  gain_node = null,
  script_processor_node = null,
  script_processor_analysis_node = null,
  analyser_node = null;
buffer_length = null;

if (!navigator.getUserMedia)
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

if (navigator.getUserMedia) {
  navigator.getUserMedia(
    { audio: true },
    function (stream) {
      start_microphone(stream);
    },
    function (e) {
      alert("Error capturing audio.");
    }
  );
} else {
  alert("getUserMedia not supported in this browser.");
}

// ---

const process_microphone_buffer = (event) => {
  var i, N, inp, microphone_output_buffer;

  microphone_output_buffer = event.inputBuffer.getChannelData(0); // just mono - 1 channel for now
};

const start_microphone = (stream) => {
  gain_node = audioContext.createGain();
  gain_node.connect(audioContext.destination);

  // microphone_stream = audioContext.createMediaStreamSource(stream);
  const audioEle = new Audio();
  audioEle.src = './Beethoven - Moonlight Sonata (FULL)-4Tr0otuiQuU.mp3'
  audioEle.autoplay = true;
  audioEle.preload = 'auto';

  microphone_stream = audioContext.createMediaElementSource(audioEle);
  microphone_stream.connect(gain_node);

  // --- enable volume control for output speakers

  window.volumeChange = (n) => {
    gain_node.gain.value = n;
  };

  // --- setup FFT
  script_processor_analysis_node = audioContext.createScriptProcessor(
    2048,
    1,
    1
  );
  script_processor_analysis_node.connect(gain_node);

  analyser_node = audioContext.createAnalyser();
  analyser_node.smoothingTimeConstant = 0.8;
  analyser_node.fftSize = 8192;

  microphone_stream.connect(analyser_node);

  analyser_node.connect(script_processor_analysis_node);

  buffer_length = analyser_node.frequencyBinCount;

  console.log("buffer_length " + buffer_length);
};
//
//Create 2D canvas
const test = () => {
  setTimeout(() => test(), 50)

 let byte_data = new Uint8Array(buffer_length);
 analyser_node.getByteFrequencyData(byte_data);

 const delta = 20

 const [avg, freq] = byte_data.reduce(([curAvg, ind], cur, i) => {
   if (i - delta < 0) return [curAvg, ind]

   const sum = byte_data.slice(i - delta, i + delta).reduce((acc, cur) => acc + cur, 0)
    
   const val = sum / (delta * 2)

   if (val > curAvg) {
     return [val, i]
   }
   return [curAvg, ind]
 } , [0,0])

  const brightness = avg
  const percent = 100 * brightness / 255

  const image = document.querySelector("img")
  image.style.filter = `brightness(${percent}%)`
  // image.style.filter = `hue-rotate(${3.14 * freq / 40}rad)`
}

test()

// const canvas = document.createElement("canvas");
// canvas.style.position = "absolute";
// canvas.style.top = 0;
// canvas.style.left = 0;
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
// document.body.appendChild(canvas);
// const canvasCtx = canvas.getContext("2d");
// canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

//const draw = () => {
//  requestAnimationFrame(draw);

//  let byte_data = new Uint8Array(buffer_length);
//  analyser_node.getByteFrequencyData(byte_data);

//  const delta = 20

//  const [avg, freq] = byte_data.reduce(([curAvg, ind], cur, i) => {
//    if (i - delta < 0) return [curAvg, ind]

//    const sum = byte_data.slice(i - delta, i + delta).reduce((acc, cur) => acc + cur, 0)
    
//    const val = sum / (delta * 2)

//    if (val > curAvg) {
//      return [val, i]
//    }
//    return [curAvg, ind]
//  } , [0,0])


//  //Draw black background
//  canvasCtx.fillStyle = "rgba(0, 0, 0, 1)";
//  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

//  console.log(freq)

//  const xx = freq - 150

//  //Draw spectrum
//  canvasCtx.arc(canvas.width / 2, canvas.height / 2, 100, 0, 2 * Math.PI)
//  canvasCtx.fillStyle = `rgba(${255 - freq}, 128, ${freq}, ${Math.max(...byte_data) / 255})`;
//  canvasCtx.fill()
//};

draw();
