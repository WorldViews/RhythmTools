
// This helper class is for 'debouncing'.  It watches discrete
// states being tracked, and keeps track of how long a new state
// has been in.  After an observed state change, the actual state
// is considered to be transient (represented by null value)
// until a given time duration passes in which only one value of
// state is observed.
//
class State {
    constructor(name, initialState) {
        console.log("State " + name);
        this.name = name;
        this.state = initialState;
        this.lastObservedState = null;
        this.lastChangeTime = getClockTime();
        this.minChangeTime = 0.2;
    }

    isStale() {
        var t = getClockTime();
        return (t - this.lastChangeTime > .5)
    }

    observe(state) {
        this.state = state;
        this.lastChangeTime = getClockTime();
    }

    noticeNewState(state) {
        console.log(sprintf("******* %s: %s", this.name, state));
    }

    hasState() {
        return self.state != null;
    }

    getState() {
        return this.state;
    }

    get() { return this.state; }
}

class V3State extends State {
    constructor(name, initialState) {
        initialState = initialState || [0,0,0];
        super(name, initialState);
    }

    observe(state) {
        this.state = state;
        this.lastChangeTime = getClockTime();
    }

    get() {
        return this.state;
    }
}

class KinematicState extends State {
    constructor(name) {
        super(name, [0,0,0]);
        this.prevT = getClockTime();
        this.t = this.prevT;
        this.prevState = [0,0,0];
    }
    
    observe(state) {
        this.prevState = this.state;
        this.state = state;
        this.prevT = this.t;
        this.t = getClockTime();
        this.lastChangeTime = this.t;
    }

    get() {
        var p = this.getPos();
        var v = this.getVel();
        //return {x: p[0], y: p[1], z: p[2], vx: v[0], vy: v[1], vz: [2]}
        return [p[0], p[1], p[2], v[0], v[1], v[2] ];
    }

    getPos() {
        return this.state;
    }

    getVel() {
        var dt = this.t - this.prevT;
        if (dt <= 0) dt = 0.00001;
        var vx = (this.state[0] - this.prevState[0]) / dt;
        var vy = (this.state[1] - this.prevState[1]) / dt;
        var vz = (this.state[2] - this.prevState[2]) / dt;
        return [vx, vy, vz];
    }
}

class BooleanState extends State {
    constructor(name) {
        super(name);
        console.log("BooleanState " + name);
    }

    observe(state) {
        if (state == this.state) {
            return state;
        }
        this.state = null;
        var t = getClockTime();
        if (state == this.lastObservedState) {
            var dt = t - this.lastChangeTime;
            if (dt >= this.minChangeTime) {
                this.state = state;
                this.noticeNewState(state);
            }
        }
        else {
            this.lastObservedState = state;
            this.lastChangeTime = t;
        }
        return this.state;
    }
}

