
export class StateBech<T> extends PIXI.utils.EventEmitter {

    private _current: T;
    private _before: T;

    constructor(){
        super();
    }

    send(state: T) {
        
        this._before = this._current;// seva last state
        this._current = state;
        
        if(this._current) {
            this.emit("leave", this._current);
        }

        this.emit("enter", state);
        
    }

    set current(state: T) {
        this.send(state)
    }

    get current() {
        return this._current;
    }

    get before() {
        return this._before;
    }

    release() {
        this.removeAllListeners();
    }
}