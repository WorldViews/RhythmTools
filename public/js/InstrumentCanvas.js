


/*
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
*/
class DrumGraphic extends CanvasTool.TextGraphic {
    constructor(opts) {
        super(opts);
        console.log("***DrumGraphic", opts);
        this.r = opts.r;
        this.tool = opts.tool;
        this.rhythmTool = this.tool.rhythmTool;
        this.lineWidth = .02;
        this.width = opts.width || 0.4;
        this.height = opts.height || this.width / 2;
    }

    onClick() {
        this.rhythmTool.hitBeat(this.r);
    }
}

class InstrumentCanvas extends CanvasTool {
    constructor(instrumentTool, name, opts) {
        console.log("InstrumentCanvas", instrumentTool);
        super(name);
        this.tool = instrumentTool;
        console.log("tool", this.tool);
    }
}

class InstrumentTool {
    constructor(rhythmTool) {
        console.log("**** InstrumentTool ****", rhythmTool);
        rhythmTool.instrumentTool = this;
        this.rhythmTool = rhythmTool;
        this.drums = [];
        this.canvas = new InstrumentCanvas(this, "instrumentCanvas", { timerDelay: 10 });
        this.canvas.gui = this;
        this.canvas.init();
        this.canvas.start();
        this.updateSong();
    }

    clear() {
        this.canvas.clear();
        this.drums = [];
    }

    /*
    addDrums() {
        for (var i = 0; i < 8; i++) {
            this.addDrum("drum" + i);
        }
    }

    addDrum(name) {
        var text = name;
        this.drums.push(name);
        var tool = this.rhythmTool;
        var i = this.drums.length;
        var x0 = -5;
        var id = "d_" + i;
        var w = 1.25;
        var h = .4;
        var dx = w + .2;
        var y = 0;
        var x = x0 + dx * i;
        var d = new DrumGraphic({ tool, id, text, x, y, width: w, height: h });
        this.canvas.addGraphic(d);
    }
    */

    updateSong() {
        this.clear();
        var inst = this;
        var x0 = -5;
        var w = 1.25;
        var h = 1;
        var dx = w + .2;
        var rhythmTool = this.rhythmTool;
        for (let r = 0; r < rhythmTool.numTracks; r++) {
            //var name = tool.tracks[r].sound.split('.')[0];
            var name = rhythmTool.tracks[r].name;
            var text = name;
            var id = name;
            var y = 0;
            var x = x0 + dx * r;
            var d = new DrumGraphic({ tool: this, id, text, x, y, r, width: w, height: h });
            this.drums.push(d);
            this.canvas.addGraphic(d);
        }
    }

    noticeState(r, v) {
        //console.log("noticeState", r, v);
        var color = v ? 'blue' : 'white';
        var dg = this.drums[r];
        if (!dg) {
            console.log("*** no instrument", r);
            return;
        }
        dg.fillStyle = color;
    }

    noticeTime(t) {
       // this.timeGraphic.t = t * 0.5;
    }
}

