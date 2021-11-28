var DATA_ARRAY_ALT
var DATA_ARRAY
document.body.addEventListener('click', init);

function init() {
  document.body.removeEventListener('click', init)

  // Older browsers might not implement mediaDevices at all, so we set an empty object first
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }


  // Some browsers partially implement mediaDevices. We can't just assign an object
  // with getUserMedia as it would overwrite existing properties.
  // Here, we will just add the getUserMedia property if it's missing.
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {

      // First get ahold of the legacy getUserMedia, if present
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

      // Some browsers just don't implement it - return a rejected promise with an error
      // to keep a consistent interface
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }

      // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }



  // set up forked web audio context, for multiple browsers
  // window. is needed otherwise Safari explodes

  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var source;
  var stream;

  //set up the different audio nodes we will use for the app

  var analyser = audioCtx.createAnalyser();
  analyser.minDecibels = -90;
  analyser.maxDecibels = 0;
  analyser.smoothingTimeConstant = 0;

  // var distortion = audioCtx.createWaveShaper();
  var gainNode = audioCtx.createGain();
  var biquadFilter = audioCtx.createBiquadFilter();
  // var convolver = audioCtx.createConvolver();


  // set up canvas context for visualizer

  var canvas = document.querySelector('.visualizer');
  var canvasCtx = canvas.getContext("2d");

  var intendedWidth = document.querySelector('.wrapper').clientWidth;

  canvas.setAttribute('width',intendedWidth);

  var drawVisual;

  //main block for doing the audio recording

  if (navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');
    

    var constraints = {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    }
    navigator.mediaDevices.getUserMedia (constraints)
      .then(
        function(stream) {
          document.getElementById('sweep-btn').disabled = false
          document.getElementById('sweep-btn').textContent = '〜 Start Sweep 〜'
                    
          source = audioCtx.createMediaStreamSource(stream);
          // source.connect(distortion);
          // distortion.connect(biquadFilter);
          biquadFilter.connect(gainNode);
          // convolver.connect(gainNode);
          source.connect(gainNode);
          gainNode.connect(analyser);
          //analyser.connect(audioCtx.destination);
          visualize();
      })
      .catch( function(err) { console.log('The following gUM error occured: ' + err);})
  } else {
    console.log('getUserMedia not supported on your browser!');
  }

  function visualize() {
    WIDTH = canvas.width;
    HEIGHT = canvas.height;

    analyser.fftSize = 2048;
    var bufferLength = analyser.fftSize;

    var bufferLengthAlt = analyser.frequencyBinCount;
    DATA_ARRAY_ALT = new Uint8Array(bufferLengthAlt);
    //DATA_ARRAY = new Uint8Array(bufferLength);


    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    var drawAlt = function() {
      drawVisual = requestAnimationFrame(drawAlt);

      //analyser.getByteTimeDomainData(DATA_ARRAY);


      analyser.getByteFrequencyData(DATA_ARRAY_ALT);

      for (var i = 0; i < 10; i++) {
        DATA_ARRAY_ALT[i] = 0
      }


      canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      var barWidth = (WIDTH / bufferLengthAlt) * 2.5;
      var barHeight;
      var x = 0;

      // console.log(DATA_ARRAY_ALT)
      for(var i = 0; i < bufferLengthAlt; i++) {
        barHeight = DATA_ARRAY_ALT[i];

        canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
        canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

        x += barWidth + 1;
      }
    };
    drawAlt();
  }
}