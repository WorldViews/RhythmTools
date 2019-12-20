


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
class DrumGraphic extends CanvasTool.RectGraphic {
    constructor(opts) {
        super(opts);
        console.log("***DrumGraphic", opts);
        this.tool = opts.tool;
        this.rhythmTool = this.tool.rhythmTool;
        this.lineWidth = .02;
        this.width = opts.width || 0.4;
        this.height = opts.height || this.width/2;
    }


    onClick() {
        NOTE = this;
        this.rhythmTool.clickedOn(this.r, this.c);
    }
}

class InstrumentCanvas extends CanvasTool {
    constructor(instrumentTool, name, opts) {
        console.log("InstrumentCanvas", instrumentTool);
        super(name);
        this.tool = instrumentTool;
        console.log("tool", this.tool);
    }

    addDrums() {
        var tool = this.tool;
        console.log("tool", this.tool);
        for (var i=0; i<3; i++) {
            for (var j=0; j<3; j++) {
                var id="d"+i+"_"+j;
                var d = new DrumGraphic({tool, id, x: i, y: j, width:1, height: 1});
                this.addGraphic(d);
            }
        }
    }
}

class InstrumentTool {
    constructor(rhythmTool) {
        console.log("**** InstrumentTool ****", rhythmTool);
        /*
        super(tool);
        var $div = $("#rhythmTools");
        $div.append('<canvas id="rhythmLabels", width="100" height="300" style="border-style:solid;border-width:1px" />');
        $div.append('<canvas id="rhythmCanvas", width="600" height="300" style="border-style:solid;border-width:1px"/>');
        $div.append('<br>');
        $div.append('<span id="canvasStat" />&nbsp')
        $div.append('<span id="beatNum" />');
        */
        this.rhythmTool = rhythmTool;
        this.canvas = new InstrumentCanvas(this, "instrumentCanvas", { timerDelay: 10 });
        this.canvas.gui = this;
        this.canvas.init();
        this.canvas.addDrums();
        this.canvas.start();
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

