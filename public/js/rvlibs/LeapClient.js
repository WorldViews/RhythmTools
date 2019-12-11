// This class is a connection to live streaming Leap Motion hand poses.

var focusListener;
var blurListener;

// Support both the WebSocket and MozWebSocket objects
if ((typeof(WebSocket) == 'undefined') &&
    (typeof(MozWebSocket) != 'undefined')) {
    WebSocket = MozWebSocket;
}

//TODO: maybe merge with KinectPoseRecorder
class PoseRecorder {
    constructor(type)
    {
        this.type = type;
        this.startTime = getClockTime();
        this.endTime = this.startTime;
        this.frames = [];
       // this.recSessionId = "Local/foo2";
    }

    handleFrame(frame) {
        var t = getClockTime();
        frame.frameTime = t;
        this.endTime = t;
        frame.bodies = [];
        //if (this.frames.length > 5)
        //    return;
        this.frames.push(frame);
    }

    //finish() { this.save(); }

    getFrameRecs() {
        var dur = this.endTime - this.startTime;
        var sessObj = {'type': 'leap', frames: this.frames, duration: dur,
                        numFrames: this.frames.length};
        return sessObj;
        //console.log("frames", JSON.stringify(sessObj, null, 3))
    }

//    save() {
//        var sessObj = this.getFrameRecs();
//        console.log("frames", sessObj);
//        uploadObjAsFile(this.recSessionId, sessObj, "leapFrames.json");
//    }
}

class LeapClient {
    constructor(opts) {
        opts = opts || {};
        var inst = this;
        this.poseWatcher = null;
        this.lastFrame = null;
        var url = opts.url || "ws://localhost:6437/v7.json";
        console.log("Getting websocket "+url);
        var ws = new WebSocket(url);
        this.ws = ws;
        this.renderer = null;
        this.recording = false;
        this.debug = false;

        // On successful connection
        ws.onopen = function(event) {
            ws.send(JSON.stringify({focused: true})); // claim focus
        };

        //this.socket = socket || io.connect('/');
        //this.socket.on('bodyFrame', frame => inst.handleFrame(frame));
        //this.socket.on('stats', msg => inst.handleStats(msg));
        // On message received
        ws.onmessage = function(event) {
            inst.handleFrame(event)
            var msg = JSON.parse(event.data);
            inst.handleFrame(msg);
        }
    
        // On socket close
        ws.onclose = function(event) {
            this.ws = null;
            document.getElementById("connection").innerHTML = "WebSocket connection closed";
        }

        // On socket error
        ws.onerror = function(event) {
            alert("Received error");
        };

    }

    startRecording() {
        this.poseRecorder = new PoseRecorder("Leap");
        this.recording = true;
    }

    stopRecording() {
        console.log("stopRecording");
        if (!this.poseRecorder)
            return;
        this.recording = false;
    }

    getFrameRecs() {
        if (!this.poseRecorder)
            return null;
        return this.poseRecorder.getFrameRecs();
    }

    uploadXXX() {
        console.log("LeapClient upload");
        if (!this.poseRecorder) {
            console.log("LeapClient - no poseRecorder");
            return;
        }
        this.poseRecorder.finish();
    }

    destroy() {
        console.log("LeapClient.destroy");
        this.poseWatcher = null;
        if (this.renderer)
            this.renderer = null;
        this.stopRecording();
        //TODO: anything else we should do?
    }
  
    handleFrame(frame) {
        //console.log("frame", frame);
        this.lastFrame = frame;
        var hands = frame.hands;
        if (!hands)
            return;
        if (this.renderer)
           this.renderer.draw(frame);
        //console.log(hands.length);
        if (this.debug) {
            var i = 0;
            hands.forEach(hand => {
                console.log("hand", i, hand);
                console.log("hand "+JSON.stringify(hand, null, 3));
                i++;
            })
        }
        if (this.poseRecorder && this.recording) {
            this.poseRecorder.handleFrame(frame);
        }
        if (this.poseWatcher)
            this.poseWatcher(frame);
    }
    
    handleStats(stats) {
        $("#stats").html(JSON.stringify(stats));
    }
}

