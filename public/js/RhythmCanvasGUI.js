var NOTE = null;

class NoteGraphic extends CanvasTool.RectGraphic {
    constructor(opts) {
        var tool = opts.tool;
        opts.x = tool.canvas.timeToPos(opts.t) + opts.width/2;
        super(opts);
        this.tool = opts.tool;
        this.rhythmTool = this.tool.tool;
        this.lineWidth = .02;
        this.r = opts.r;
        this.c = opts.c;
        this.width = opts.width || 0.4;
        this.height = opts.height || this.width/2;
    }

    setActive(val) {
        this.strokeStyle = (val ? 'red' : 'grey');
    }

    onClick() {
        NOTE = this;
        this.rhythmTool.clickedOn(this.r, this.c);
    }
}

class CountGraphic extends NoteGraphic {
    constructor(opts) {
        opts.textAlign = "left";
        super(opts);
        //this.tool = opts.tool;
        this.rhythmTool = this.tool.tool;
        this.beatsPerMeasure = this.rhythmTool.beatsPerMeasure;
        this.text = this.getCountText(opts.c);
    }

    getLabels() {
        return ["one", "two", "three", "four", "five", "six", "seven", "eight"];
    }

    getCountText(c) {
        var b = (c % this.beatsPerMeasure);
        return this.getLabels()[b];
    }

    setActive(val) {
        this.textStyle = (val ? 'red' : 'grey');
    }

    draw(canvas, ctx) {
        var x = this.x - this.width/2;
        this.drawText(canvas, ctx, x, this.y, this.text);
    }
}

class JapaneseCount extends CountGraphic {
    getLabels(c) {
        return ["itchi", "ni", "san", "shi", "go", "roku", "shichi", "hachi"];
    }
}

class TimeGraphic extends CanvasTool.Graphic {
    constructor(opts) {
        super(opts);
        this.t = opts.t || 0;
    }

    draw(canvas, ctx) {
        var t = this.t;
        this.drawPolyLine(canvas, ctx, [{ x: t, y: -100 }, { x: t, y: 100 }]);
    }
}

class LabelGraphic extends CanvasTool.TextGraphic {
    constructor(opts) {
        //opts.textAlign = "center";
        opts.fillStyle = "white";
        super(opts);
        this.r = opts.r;
        this.tool = opts.tool;
        this.rhythmTool = this.tool.tool;
        this.muted = false;
    }

    onClick() {
        this.muted = !this.muted;
        console.log("muted:", this.id, this.muted);
        //this.fillStyle = this.muted ? "gray" : "white";
        this.textStyle = this.muted ? "gray" : "black";
        this.rhythmTool.setMuted(this.r, this.muted);
    }
}

class RhythmCanvas extends CanvasTool {
    constructor(gui, name, opts) {
        super(name, opts);
        this.gui = gui;
        this.t2p = 0.5;
    }

    handleMouseDrag(e) {
        super.handleMouseDrag(e);
        if (e.which != 1)
            return;
        var pt = this.getMousePos(e);
        //this.gui.setTime(pt.x);
        console.log("x: ", pt.x);
        this.gui.timeGraphic.x = pt.x;
        var t = this.posToTime(pt.x);
        this.gui.tool.setBeatNum(t);
    }

    timeToPos(t) {
        return t*this.t2p;
    }
    
    posToTime(t) {
        return t/this.t2p;
    }
    
}

class RhythmCanvasGUI extends RhythmGUI {
    constructor(tool) {
        super(tool);
        this.canvas = new RhythmCanvas(this, "canvas", { timerDelay: 10 });
        this.canvas.gui = this;
        this.canvas.init();
        this.notes = {};
    }

    setupGUI() {
        super.setupGUI();
        if ($("#beatsDiv").length > 0) {
         this.setupButtonGUI();
        }
        else {
            console.log("*** No Buttons UI ***")
        }
        this.updateSong();
        this.canvas.start();
        var inst = this;
        setTimeout(e => inst.canvas.setViewRange(-2, 9, -1, 2), 100);
    }

    updateSong() {
        this.canvas.clear();
        this.notes = {};
        this.setupCanvas();
    }

    setupCanvas() {
        var inst = this;
        var tool = this.tool;
        var div = $("#beatsDiv");
        var nwd = 0.5;
        var nht = 0.4;
        for (let r = 0; r < tool.numTracks; r++) {
            //var name = tool.tracks[r].sound.split('.')[0];
            var name = tool.tracks[r].name;
            var id = name;
            var y = nht * r;
            var label = new LabelGraphic({id, r, x: -.8, y: y, width:1.2, height:.25, text: id, tool: inst});
            this.canvas.addGraphic(label);
            for (let c = 0; c < tool.TICKS; c++) {
                let id = sprintf("b_%s_%s", r, c);
                var x = this.canvas.timeToPos(c);
                //console.log("x", x, "y", y);
                var ng;
                if (name == 'count') {
                    ng = new CountGraphic({ t: c, x, y, r, c, width: .4, tool: inst });
                }
                else if (name == 'nihongo') {
                    ng = new JapaneseCount({ t: c, x, y, r, c, width: .4, tool: inst });
                }
                else {
                    ng = new NoteGraphic({ t: c, x, y, r, c, width: .4, tool: inst });
                }
                this.canvas.addGraphic(ng);
                this.notes[r + "_" + c] = ng;
                var v = this.tool.getState(r,c);
                this.noticeState(r, c, v);
            }
        }
        this.timeGraphic = new TimeGraphic({ x: 0, y: 1, t: 0 });
        this.canvas.addGraphic(this.timeGraphic);
        this.beatGraphic = new  NoteGraphic({ x:0, y:2.5, r:0, c:0, width: 0.1, tool: inst });
        this.canvas.addGraphic(this.beatGraphic);
    }

    setupButtonGUI() {
        this.beats = {};
        var inst = this;
        var tool = this.tool;
        var div = $("#beatsDiv");
        for (let r = 0; r < tool.numTracks; r++) {
            var beatDiv = div.append("<div class='beats'></div>");
            var soundname = tool.tracks[r].split('.')[0];
            var id = soundname;
            beatDiv.append(sprintf("<input id='%s' type='button' value=' ' style='width:30px;height:30px;margin:4px'></input>", id));
            beatDiv.append(sprintf("%s", soundname));
            beatDiv.append("<br>");
            $("#" + id).click(e => tool.hitBeat(r));
            for (let c = 0; c < tool.TICKS; c++) {
                let id = sprintf("b_%s_%s", r, c);
                let beat = $(sprintf("<input type='button' class='beatsbutton' id='%s' value=''></input>", id));
                beatDiv.append(beat);
                beat.click((e) => tool.clickedOn(r, c));
                this.beats[r + "_" + c] = beat;
            }
            beatDiv.append("<p>");
        }
    }

    noticeUserBeat(bn) {
        console.log("noticeUserBeat", bn);
        this.beatGraphic.x = bn * 0.5;
    }

    activateBeat(b) {
        //console.log("activateBeat", b);
        var tool = this.tool;
        for (let r = 0; r < tool.numTracks; r++) {
            for (let c = 0; c < this.tool.TICKS; c++) {
                var note = this.notes[r + "_" + c];
                note.setActive(c == b);
            }
        }
    }

    noticeState(r, c, v) {
        //console.log("noticeState", r, c, v);
        var bt = this.tool.getBeat(r, c);
        var color = v ? 'blue' : 'white';
        bt.css('background-color', color);
        var id = r + "_" + c;
        var ng = this.notes[id];
        if (!ng) {
            console.log("*** no note", id);
            return;
        }
        //console.log("fillStyle", id, color);
        ng.fillStyle = color;
    }

    noticeTime(t) {
        this.timeGraphic.t = t * 0.5;
    }
}

