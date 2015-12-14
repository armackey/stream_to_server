window.URL = window.URL || window.webkitURL;
window.MediaSource = window.MediaSource || window.WebKitMediaSource;


var $subbed, $streams, subbed;

subbed = {};

function refreshList(){
    $streams.empty();
    $.get('/stream',function(data){
       var nodes = data.forEach(function(stream_name){
           $streams.append('<li><a class="subscribe" href="/stream/'+stream_name+'">'+stream_name+'</a></li>');
       });
    });
}

function subscribe(href){
    var ws = new WebSocket(href);
    var mediaSource = new MediaSource();    

    var audio_elem = $('<audio />')
    var elem = $('<li id="'+href+'"><button class="unsubscribe" data-href="'+href+'">Unsub</button></li>');
    elem.append(audio_elem);
    $subbed.append(elem);
    audio_elem = audio_elem[0];


    audio_elem.src = window.URL.createObjectURL(mediaSource);
    ws.addEventListener('close', unsubscribe.bind(void 0, href));
    
    
    
    return new Promise(function(resolve, reject){
        ts.addEventListener('sourceopen', function(){
            soucebuffer = mediaSource.addSourceBuffer()
            resolve(sourceBuffer);
        })
    });
    
    // might have to listen to webkitsourceopen
    mediaSource.addEventListener('sourceopen', function(e){

        var sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');

        ws.addEventListener('message', function(message){
            sourceBuffer.append(message);
        });

    });
    
    subbed[href] = {
        ws: ws,
        mediaSource: mediaSource,
        elem: elem
    };

}

function unsubscribe(href){
    subbed[href].ws.close();
    subbed[href].mediaSource.endOfStream();
    subbed[href].elem.remove(); $subbed.find('#'+href).remove();
    delete subbed[href];
}

// Generally will publish getUserMedia
function publishStream(mediaStream, config){
    var ws = new WebSocket('/stream');

    // Prepare Audio data for streaming

    var obj = new AudioContext();

    var audioSource = context.createMediaStreamSource(mediaStream);
    
    var context = audioSource.context;
    
    var bufferLen = config.bufferLen || 4096;
    var numChannels = 1; //config.numChannels || 2;

    var node = (context.createScriptProcessor || context.createJavascriptNode)
        .call(context, bufferLen, numChannels, numChannels);


    // Piping getUserMedia data to websocket
    
    node.addEventListener('audioprocess', function(e){
        /*
        var buffers = [];
        for(var i = 0; i < numChannels; i++){
            buffers.push(e.inputBuffer.getChannelData(i));
        }
        ws.send(buffers);
        */
        ws.send(e.inputBuffer.getChannelData(0))
    });
}

$(function(){
    if(!!! window.MediaSource)
    {
        alert('MediaSource API is not available!');
        return;
    }

    $subbed = $('#subbed');
    $streams = $('#streams');
   
   refreshList(); 
   
    $('#streams').click('.subscribe',function(e){
        e.preventDefault();
        subscribe($(this).attr('href'));
    });
    
    $('#subbed').click('.unsubscribe', function(e){
        e.preventDefault();
        unsubscribe($(this).attr('data-href'));
    });
});

