import { Controls } from "./ui/Controls";
import { KeyInputHandler } from "../pixi-utils/InputHandler";

enum Direction {
	LEFT = "left",
	RIGHT = "right",
	TOP = "top",
	BOTTOM = "bottom"
}

enum InputMethod {
	MOBILE = 0,
	ACCEL = 1,
	KEY = 2,
	NONE = -1
}

const ACCEL_DELTA = 0.25;
const MAX_TILT = 3;

export class InputHandler {
	private _axis: PIXI.Point = new PIXI.Point();

	mobileControlls: Controls;
	useMobile: boolean = false;
	useAccel: boolean = false;
	
	_binded: Boolean = false;
	_active: InputMethod = InputMethod.NONE;
	_mobileKeysStatus: { [key: string]: boolean } = {};
	_accelHandlerBinding: (event: DeviceMotionEvent) => {};
    _latestAccelX: number = undefined;
    _accelX: number = 0;

	constructor(accel: boolean = false, mobile?: boolean) {

		mobile = mobile == undefined ? (PIXI.utils.isMobile as any).any : mobile;
		this.useAccel = accel && mobile;
		this.useMobile = mobile;
	}

	accelIsSupported() {
		return "ondevicemotion" in window;
	}

	bindInput() {
		if(this._binded) return;
		if (this.useMobile) {
			this._bindMobile();
			if (this.useAccel) {
				this._bindAccel();
			}
		} else {
			this._bindKeys();
		}
		this._binded = true;
		console.log("Input binded");
	}

	private _bindMobile() {
		if (!this.mobileControlls) {
			console.warn("Mobile Controlls UI cant found\n Assign it in c `controlls` property!");
			return;
		}

		const keys = ["left", "right", "top", "bottom"];
		for (let k of keys) {
			const key = (this.mobileControlls as any)[k + "Button"] as PIXI.Sprite;
			if (!key) continue;

			key.on("touchstart", () => {
				const name = k;
				this._mobileKeysStatus[name] = true;
				this._active = InputMethod.MOBILE;
			});

			key.on("touchend", () => {
				const name = k;
				this._mobileKeysStatus[name] = false;
			});
			key.on("touchcancel", () => {
				const name = k;
				this._mobileKeysStatus[name] = false;
			});

			key.on("touchendoutside", () => {
				const name = k;
				this._mobileKeysStatus[name] = false;
			});
		}
	}

	private _bindAccel() {
		if (this.accelIsSupported()) {
			this._accelHandlerBinding = this._accelHandler.bind(this);
			window.addEventListener("devicemotion", this._accelHandlerBinding);
			return;
		}

		console.log("Sorry, but  device orientaon can't support on you device!");
	}

	private _bindKeys() {
		KeyInputHandler.BindKeyHandler(window);
	}

	unbindInput() {
		this._unbindMobile();
		this._unbindAccel();
		this._unbindKeys();
		this._binded = false;
	}

	private _unbindMobile() {
		if(!this.mobileControlls) return;

		const keys = ["left", "right", "top", "bottom"];
		for (let k of keys) {
			const key = (this.mobileControlls as any)[k + "Button"] as PIXI.Sprite;
			if (!key) continue;

			key.removeAllListeners("touchstart");
			key.removeAllListeners("touchend");
			key.removeAllListeners("touchcancel");
			key.removeAllListeners("touchendoutside");
			key.removeAllListeners("touchmove");
		}
	}

	private _accelHandler(event: DeviceMotionEvent) {
		if(!this.useAccel) return;
		
        this._latestAccelX = this._accelX;
        this._accelX = event.accelerationIncludingGravity.x;
        if(this._latestAccelX && Math.abs(this._accelX - this._latestAccelX) > ACCEL_DELTA) {
            this._active = InputMethod.ACCEL;
        }

		//console.log("Accel:", event.accelerationIncludingGravity.x);
	}

	private _unbindAccel() {
		window.removeEventListener("devicemotion", this._accelHandlerBinding);
	}

	private _unbindKeys() {
		KeyInputHandler.ReleaseKeyHandler();
	}
	get axis(){
		return this._axis.clone();
	}

	get keys () {
		return KeyInputHandler.IsKeyDown;
	}
	
	update() {
		this._axis.x = 0;
		this._axis.y = 0;

		if (!this.useAccel && !this.useMobile) this._active = InputMethod.KEY;

		switch (this._active) {
			case InputMethod.MOBILE: {
				this._axis.x = ~~this._mobileKeysStatus[Direction.RIGHT] - ~~this._mobileKeysStatus[Direction.LEFT];
				this._axis.y = ~~this._mobileKeysStatus[Direction.BOTTOM] - ~~this._mobileKeysStatus[Direction.TOP];
				break;
			}
			case InputMethod.KEY: {
				this._axis.x = ~~KeyInputHandler.IsKeyDown[39] - ~~KeyInputHandler.IsKeyDown[37];
				this._axis.y = ~~KeyInputHandler.IsKeyDown[40] - ~~KeyInputHandler.IsKeyDown[38];
			}
			case InputMethod.ACCEL: {

                if(Math.abs(this._accelX) < ACCEL_DELTA) return;

                const normal = Math.max(-MAX_TILT, Math.min(MAX_TILT,this._accelX)) / MAX_TILT;
                this._axis.x = -normal;
			}
		}
	}
}
