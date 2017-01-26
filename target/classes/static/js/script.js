var client = null;
var username = /*[[${username}]]*/ $("#username").html();
var pkey = $("#pkey").html();
var channel = /*[[${channel}]]*/ "default";
var time = "123";

var msgSound = new Audio('/sound/sms1.mp3');
var newMsg = 0;
var documentTitle = "Chatti";
document.title = documentTitle;

var canvasWidth = 800;
var canvasHeight = 400;
var sketchpad = new Sketchpad({
    element: '#sketchpad',
    width: canvasWidth,
    height: canvasHeight
});
                
//Socket subscribe users and messages
client = Stomp.over(new SockJS('/register'));
client.connect({}, function (frame) {
    var subscribeToi = '/users';
    client.subscribe(subscribeToi, function (response) {
        displayUsers(JSON.parse(response.body));
    });
    var subscribeTo = '/channel/' + channel;
    client.subscribe(subscribeTo, function (response) {
        displayMessage(JSON.parse(response.body));
    });
});
                


//Send data to server functions
function send() {
    if (document.getElementById('message').value.match(/\S/)) {
        var imgName = 'default';

        client.send("/ws/messages", {}, JSON.stringify({'username': username, 'channel': channel, 'content': document.getElementById('message').value, 'time': time, 'image': imgName, 'pkey': pkey}));
        document.getElementById('message').value = '';
    }
}
function sendImage() {
    var imageName = $("#file").val().split('\\').pop();
    if (confirm("Haluatko varmasti lÃ¤hettÃ¤Ã¤ seuraavan kuvan: " + imageName)) {
        if ($("#file").val() != '') {
            $("#file").upload("/photo", function (success) {
            });
            if (uploadSuccess(imageName)) {
                sendMessage(imageName);
            }
        }
    }
}
function sendcanvas() {
    var imageData = document.getElementById("sketchpad").toDataURL("image/png")
    var imageName = makeId() + ".png";
    $.ajax({
        url: '/photo',
        data: {cname: imageName, imageBase64: imageData},
        type: 'post',
        dataType: 'json',
        timeout: 10000,
        async: false,
        error: function () {
            console.log("WOOPS");
        },
        success: function (res) {
            if (res.ret == 0) {
                console.log("SUCCESS");
            } else {
                console.log("FAIL : " + res.msg);
            }
        }
    });
    if (uploadSuccess(imageName)) {
        sendMessage(imageName);
        emptycanvas();
        hidecanvas();
    }
}




//File Input Listeners
document.getElementById("canvasfile").onchange = function (e) {
    addImageToCanvas(e);
};
document.getElementById("file").onchange = function () {
    sendImage();
};
$(document).keypress(function (e) {
    if (e.which == 13) {
        send();
    }
});

          
          
          
          
//Show data to user functions          
function buildMessage(message) {
    var paragraph = document.createElement("p");
    paragraph.id = 'msgcontent';

    var msgParts = message.content.split(" ");
    paragraph.appendChild(document.createElement('p'));
    if (message.image != 'default' && message.image != null) {
        //window.alert(message.image);
        var linkElement = document.createElement('a');
        var img = document.createElement('img');
        img.src = '/uploads/' + message.image;
        img.height = 100;
        img.length = 200;
        img.id = 'msgimg';
        linkElement.href = '/uploads/' + message.image;
        linkElement.target = 'blank';
        paragraph.appendChild(document.createElement('p'));

        linkElement.appendChild(img);

        paragraph.appendChild(linkElement);
        paragraph.appendChild(document.createElement('p'));
        document.getElementById("file").value = "";

        if (document.getElementById("file").disabled == true) {
            if (message.username == username) {
                document.getElementById("file").disabled = false;
                document.getElementById("action-info").textContent = '';
            }
        }
    }
    if(message.record != 'default' && message.record != null){
        var audio = document.createElement('audio');
        var audioSource = document.createElement('source');
        var aLink = document.createElement('a');
        audio.autoplay="true";
        audioSource.src = '/uploads/' + message.record + ".mp3";
        audioSource.type = "audio/mp3";
        aLink.href = '/uploads/' + message.record + ".mp3";
        aLink.target = "blank";
        aLink.innerHTML = "Lähetti äänitteen";
        audio.appendChild(audioSource);
        paragraph.appendChild(audio);
        paragraph.appendChild(aLink);
    }
    $.each(msgParts, function (i, word) {
        if (word.indexOf("www.") !== -1 || word.indexOf("http:") !== -1 || word.indexOf("https:") !== -1) {
            var a = document.createElement('a');
            var linkText = document.createTextNode(word);
            a.appendChild(linkText);
            a.href = word;
            a.target = 'blank';
            paragraph.appendChild(a);
        } else {
            var tNode = document.createTextNode(word + " ");
            paragraph.appendChild(tNode);
        }
    });
    return paragraph;
}
                
function displayMessage(message) {
    var paragraph2 = buildMessage(message);
    var paragraph1 = document.createElement("b");
    paragraph1.appendChild(document.createTextNode(message.time + ': ' + message.username + ': '));

    var oneMsgDiv = document.createElement('div');
    oneMsgDiv.id = 'oneMsgDiv';
    oneMsgDiv.appendChild(paragraph1);
    oneMsgDiv.appendChild(paragraph2);

    document.getElementById("messages").appendChild(oneMsgDiv);
    var objDiv = document.getElementById("messages");
    objDiv.scrollTop = objDiv.scrollHeight;
    if (!vis()) {
        newMsg = 1;
        document.title = '[UUSI VIESTI]';
    }
    if (message.username != username) {
        msgSound.play();
    }
}
function displayUsers(users) {
    $("#userbox").empty();
    $.each(users, function (i, user) {
        if (user === username) {
            $("<b/>").text(user).appendTo("#userbox");
        } else {
            $("<p/>").text(user).appendTo("#userbox");
        }
    });
}





window.addEventListener("beforeunload", function (e) {
    client.send("/ws/close", username);
    client.disconnect();
    client.close();
    (e || window.event).returnValue = null;
    return null;
});
function init() {
    client.send("/ws/getusers");
}
setTimeout(function () {
    init();
}, 1000);
                
                

         
                
                
//SKETCHPAD / CANVAS FUNCTIONS
var vis = (function () {
    var stateKey, eventKey, keys = {
        hidden: "visibilitychange",
        webkitHidden: "webkitvisibilitychange",
        mozHidden: "mozvisibilitychange",
        msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function (c) {
        if (c)
            document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
})();
vis(function () {
    if (newMsg == 1) {
        if (vis()) {
            document.title = documentTitle;
            ;
            newMsg = 0;
        }
    }
});
function showCanvas() {
    document.getElementById("canvasdiv").className = "";
    document.getElementById("messages").className = "half";
    document.getElementById("userbox").className = "half";
}
function hidecanvas() {
    document.getElementById("canvasdiv").className = "hidden";
    document.getElementById("messages").className = "full";
    document.getElementById("userbox").className = "full";
}
function emptycanvas() {
    sketchpad = new Sketchpad({
        element: '#sketchpad',
        width: canvasWidth,
        height: canvasHeight
    });
}
function canvascolor() {
    sketchpad.color = document.getElementById("canvascolor").value;
}
function cancelcanvas() {
    sketchpad.undo();
}
function redocanvas() {
    sketchpad.redo();
}
function addImageToCanvas(e){
    var context = document.getElementById('sketchpad').getContext('2d');
    var imageObj = new Image();
    imageObj.onload = function () {
        if (canvasHeight > imageObj.height) {
            context.drawImage(imageObj, 10, 10, imageObj.width, imageObj.height);
        } else {
            var iWidth = imageObj.width;
            var iHeight = imageObj.height;
            while (iHeight > canvasHeight) {
                iWidth = iWidth / 2;
                iHeight = iHeight / 2;
            }
            context.drawImage(imageObj, 10, 10, iWidth, iHeight);
        }
    };
    imageObj.src = URL.createObjectURL(e.target.files[0]);
}

                
                
                

                
                
                
                
                
                
//HELP FUNCTIONS
function linkify(message) {
    message = message.replace(/(www\..+?)(\s|$)/g, function (text, link) {
        return '<a href="http://' + link + '">' + link + '</a>';
    })
    return message;
}
function urlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status != 404;
}
function makeId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
function sendMessage(iName) {
    client.send("/ws/messages", {}, JSON.stringify({'username': username, 'channel': channel, 'content': document.getElementById('message').value, 'time': time, 'image': iName, 'pkey': pkey}));
    document.getElementById("file").disabled = true;
    document.getElementById("action-info").textContent = 'LÃ¤hetetÃ¤Ã¤n kuvaa..';
}

function uploadSuccess(iName) {
    var countx = 0;
    while (urlExists('/uploads/' + iName) == false) {
        console.log("oottaa");
        sleep(500);
        if (countx > 20) {
            return false;
        }
        countx++;
    }
    return true;
}
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}
                


                
                
