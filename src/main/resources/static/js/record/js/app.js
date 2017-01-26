var recordSent = false;

function restore(){
  $("#record, #live").removeClass("disabled");
  $("#pause").replaceWith('<a class="button one" id="pause">Pause</a>');
  $(".one").addClass("disabled");
  Fr.voice.stop();
}
$(document).ready(function(){
  $(document).on("click", "#record:not(.disabled)", function(){
    elem = $(this);
    document.getElementById("recording").className = "";
    Fr.voice.record($("#live").is(":checked"), function(){
      elem.addClass("disabled");
      $("#live").addClass("disabled");
      $(".one").removeClass("disabled");
      
      /**
       * The Waveform canvas
       */
      analyser = Fr.voice.context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      analyser.smoothingTimeConstant = 0.85;
      Fr.voice.input.connect(analyser);
      
      var bufferLength = analyser.frequencyBinCount;
      var dataArray = new Uint8Array(bufferLength);
      
      WIDTH = 500, HEIGHT = 200;
      canvasCtx = $("#level")[0].getContext("2d");
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      
      function draw() {
        drawVisual = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);
        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
  
        canvasCtx.beginPath();
        var sliceWidth = WIDTH * 1.0 / bufferLength;
        var x = 0;
        for(var i = 0; i < bufferLength; i++) {
          var v = dataArray[i] / 128.0;
          var y = v * HEIGHT/2;
  
          if(i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }
  
          x += sliceWidth;
        }
        canvasCtx.lineTo(WIDTH, HEIGHT/2);
        canvasCtx.stroke();
      };
      draw();
    });
    recordSent = false;
    $(this).replaceWith('<input type="button" value="STOP" id="save" class="btn btn-default btn-file"></input>');
    var xcount = 4; document.getElementById("action-info").innerHTML = 5;
    var myTimer = setInterval(function(){ 
        if(!recordSent)
            document.getElementById("action-info").innerHTML = xcount;
        if(xcount==0){
            sendRecord();
            clearInterval(myTimer);
        }
        xcount--;
    }, 1000);
  });
  
  $(document).on("click", "#pause:not(.disabled)", function(){
    if($(this).hasClass("resume")){
      Fr.voice.resume();
      $(this).replaceWith('<input type="button" value="Pause" class="button one" id="pause"></input>');
    }else{
      Fr.voice.pause();
      $(this).replaceWith('<input type="button" value="Resume" class="button one resume" id="pause"></input>');
    }
  });
  
  $(document).on("click", "#stop:not(.disabled)", function(){
    restore();
  });
  
  $(document).on("click", "#play:not(.disabled)", function(){
    Fr.voice.export(function(url){
      $("#audio").attr("src", url);
      $("#audio")[0].play();
    }, "URL");
    restore();
  });
  
  $(document).on("click", "#download:not(.disabled)", function(){
    Fr.voice.export(function(url){
      $("<a href='"+url+"' download='MyRecording.wav'></a>")[0].click();
    }, "URL");
    restore();
  });
  
  $(document).on("click", "#base64:not(.disabled)", function(){
    Fr.voice.export(function(url){
      console.log("Here is the base64 URL : " + url);
      alert("Check the web console for the URL");
      
      $("<a href='"+ url +"' target='_blank'></a>")[0].click();
    }, "base64");
    restore();
  });
  
  $(document).on("click", "#mp3:not(.disabled)", function(){
    alert("The conversion to MP3 will take some time (even 10 minutes), so please wait....");
    Fr.voice.export(function(url){
      console.log("Here is the MP3 URL : " + url);
      alert("Check the web console for the URL");
      
      $("<a href='"+ url +"' target='_blank'></a>")[0].click();
    }, "mp3");
    restore();
  });
  
  $(document).on("click", "#save:not(.disabled)", function(){
      sendRecord();
  });
  function sendRecord(){
      if(!recordSent){
        var conf = confirm("Haluatko lähettää äänitteen?");
        if(conf){
           Fr.voice.export(function(blob){
             var formData = new FormData();

             var recName = makeId();
             formData.append('file', blob, recName+'.mp3');


             $.ajax({
               url: "/sound",
               type: 'POST',
               data: formData,
               contentType: false,
               processData: false,
               success: function(url) {
                 $("#audio").attr("src", url);
                 $("#audio")[0].play();
                 client.send("/ws/messages", {}, JSON.stringify({'username': username, 'channel': channel, 'content': '', 'time': time, 'image': 'default','record':recName , 'pkey': pkey}));
               }
             });
           }, "blob");
        }

       document.getElementById("recording").className = "hidden";
       $("#save").replaceWith('<input type="button" value="Nauhoita äänite" id="record" class="btn btn-default btn-file"></input>');
       document.getElementById("action-info").innerHTML = '';
       recordSent = true;
       restore();
     }
  }
});
