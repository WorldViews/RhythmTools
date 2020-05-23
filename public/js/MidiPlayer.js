

class MidiPlayer extends SoundPlayer {
    constructor(app) {
        super(app);
        console.log("**** SoundPlayer ****", app);
        this.soundPrefix = 'sounds/';
        this.numNotesPlayed = 0;
        this.buffers = {};
        this.context = null;
        this.tStart = getClockTime();
        MIDI.loader=new sketch.ui.Timer;
        //this.loadInstrument("harpsichord");
        this.loadInstrument("taiko_drum");
/*
        this.AudioContext = window.AudioContext || window.webkitAudioContext;
        if (this.AudioContext) {
            this.context = new this.AudioContext();
        }
*/
    }

    playNote(instName) {
        instName = instName || "taiko";
        console.log("MidiPlayer.playNote", instName);
        var i = 21 + this.numNotesPlayed % 20;
        if (instName == "cowbell") {
            i = 50;
        }
        MIDI.noteOn(  0, i, 100);
        MIDI.noteOff( 0, i,  .1);
        this.numNotesPlayed += 1;
    }

    loadInstrument(instr, successFn) {
        var instrument = instr;
        MIDI.loadPlugin({
            soundfontUrl: "./soundfont/",
            instrument: instrument,
            onprogress: function (state, progress) {
                MIDI.loader.setValue(progress * 100);
            },
            onprogress: function (state, progress) {
                MIDI.loader.setValue(progress * 100);
            },
            onsuccess: function () {
                MIDI.programChange(0, instr);
                if (successFn)
                    successFn();
            }
        });
    }

}


