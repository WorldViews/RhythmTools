
function dist(v1, v2) { return Math.sqrt(dist2(v1,v2))};
function dist2(v1, v2) {
    var d2 = 0;
    //var N = 3;
    for (var i=0; i<v1.length; i++) {
        var d = v1[i]-v2[i];
        d2 += d*d;
    }
    return d2;
}


class DrumTool {
    constructor(rhythmTool) {
        this.rhythmTool = rhythmTool;
        this.arcLength = 0;
        this.gain = 10.0;
        this.trackArcLen = false;
        this.crank = true;
        this.initCanvasTool();
        let inst = this;
        //this.skelWatcher = null;
        //this.initSkelWatcher();
        this.leapWatcher = null;
        this.initLeapWatcher();
        this.setupDATGUI();
        this.start();
    }

    setLeapView() {
        var view = { center: { x: 0, y: 0.8 }, width: 1.0 };
        var canvasTool = this.canvasTool;
        canvasTool.setView(view);
    }

    start() {
        let inst = this;
        setInterval(() => inst.update(), 20);
    }

    update() {
        if (this.trackArcLen)
            this.handleTrackArcLen();
        if (this.crank)
            this.handleCrank();
    }

    handleTrackArcLen() {
        var rpos = this.leapWatcher.RHAND.get();
        //var leapX = 5;
        //var leapY = 1;
        var leapX = 0;
        var leapY = 0;
        if (rpos && this.trail) {
            var pt = [leapX+rpos[0]/1000, leapY-rpos[1]/1000];
            if (this.lastPt) {
                var d = dist(pt, this.lastPt);
                this.arcLength += d*this.gain;
                //console.log("arcLength", this.arcLength);
                this.rhythmTool.setBeatNum(this.arcLength);
            }
            this.lastPt = pt;
            //console.log("trail pt", pt);
            this.trail.addPoint(pt);
        }
    }

    handleCrank() {
        var rpos = this.leapWatcher.RHAND.get();
        var leapX = 0;
        var leapY = 0;
        if (rpos && this.trail) {
            var x = rpos[0]/1000;
            var y = rpos[1]/1000;
            var a = Math.atan2(y,x);
            var pt = [leapX+x, leapY-y];
            if (this.lastPt) {
                var d = dist(pt, this.lastPt);
                this.arcLength = a*this.gain;
                //console.log("arcLength", this.arcLength);
                this.rhythmTool.setBeatNum(this.arcLength);
            }
            this.lastPt = pt;
            //console.log("trail pt", pt);
            this.trail.addPoint(pt);
        }
    }


    initCanvasTool() {
        this.canvasTool = new CanvasTool("trackingCanvas");
        var addSampleGraphics = false;
        if (addSampleGraphics) {
            var n = 0;
            var low = -400;
            var high = 400;
            var inc = 200;
            for (var i = low; i <= high; i += inc) {
                for (var j = low; j <= high; j += inc) {
                    var g = new CanvasTool.Graphic(n, i, j);
                    this.canvasTool.addGraphic(g);
                    n++;
                }
            }
        }
        //this.graph = new CanvasTool.GraphGraphic('graph1', 0, 0, 2, 1);
        //this.canvasTool.addGraphic(this.graph);

        //this.trail = new CanvasTool.TrailGraphic('trail1', 0, 0.8, 2, 1);
        this.trail = new CanvasTool.TrailGraphic(
            {id:'trail1', x:1.0, y:1.0, width:2, height:1, lineWidth:0.001});
        this.canvasTool.addGraphic(this.trail);
        this.canvasTool.start();
        this.canvasTool.setView(0, 1, 5);
        this.setLeapView();
    }

    initLeapWatcher() {
        this.leapWatcher = new CanvasLeapWatcher({
            canvasTool: this.canvasTool,
            portal: this.portal
        })
    }

    setupDATGUI() {
        var gui = this.rhythmTool.datgui;
        gui.add(this, "trackArcLen");
        gui.add(this, "crank");
        gui.add(this, "gain", 0, 30);
    }
}