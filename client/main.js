var capture = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia ||
              navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia || navigator.mediaDevices.msGetUserMedia;

if(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia){
  capture = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  capture = capture.bind(navigator);
}

if(navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia || navigator.mediaDevices.msGetUserMedia) {
  capture = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia || navigator.mediaDevices.msGetUserMedia;
  capture = capture.bind(navigator.mediaDevices);
}


var audioContext = window.AudioContext ? new window.AudioContext() :
                   window.webkitAudioContext ? new window.webkitAudioContext() :
                   window.mozAudioContext ? new window.mozAudioContext() :
                   window.oAudioContext ? new window.oAudioContext() :
                   window.msAudioContext ? new window.msAudioContext() :
                   undefined;

var merger = audioContext.createChannelMerger();

$(function(){

    $('#audio').click(record);
    function record() {
      Promise.all([prepareInput(), prepareOutput($('#output')[0])])
        .then(function (results){
            console.log('hitting');
          var sourceBuffer = results[1];
          var node = results[0];
          node.addEventListener('audioprocess', function(e){
              console.log('in');
              for(var i = 0; i < NUM_CHANNELS; i++){
                  sourceBuffer[i].push(e.inputBuffer.getChannelData(i));
              }
          });
          merger.connect(audioContext.destination);
      });
    }



});


const BUFFER_LENGTH = 4096;
const NUM_CHANNELS = 2;

function prepareInput (config) {
  if(!config) config = {};
  
  return new Promise(function(resolve, reject) {
    capture({audio: true, video: false}, function (mediaStream) {
        var audioSource = audioContext.createMediaStreamSource(mediaStream);
        
        var context = audioSource.context;
        
        var bufferLen = config.bufferLen || BUFFER_LENGTH;
        var numChannels = config.numChannels || NUM_CHANNELS;
    
        var node = context.createScriptProcessor(BUFFER_LENGTH, NUM_CHANNELS, NUM_CHANNELS);
        audioSource.connect(node);
        node.connect(merger);
        resolve(node);
    }, reject);
  });
}


function prepareOutput (elem) {
    var all_buffers =[];
    for(var i = 0; i < NUM_CHANNELS; i ++){
        all_buffers.push([]);
    }


    var node = audioContext.createScriptProcessor(BUFFER_LENGTH, NUM_CHANNELS, NUM_CHANNELS);
    node.addEventListener('audioprocess', function(event) {
    console.log('out');
      var out_buffers = [],
          that = this;
      for (var ch = 0; ch < all_buffers.length; ch++) {
        out_buffers.push(all_buffers[ch].shift() || new Float32Array(BUFFER_LENGTH));
      }
      for (ch = 0; ch < out_buffers.length; ch++) {
        event.outputBuffer.getChannelData(ch).set(out_buffers[ch]);
      }
    });
    var gainNode = audioContext.createGain();

    node.connect(gainNode);
    gainNode.connect(merger);

    return new Promise(function(resolve, reject){
        resolve(all_buffers);
    })
}

