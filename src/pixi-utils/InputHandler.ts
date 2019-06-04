import * as PIXI from 'pixi.js';

export class KeyInputHandler {
	static IsKeyDown: Array<boolean> = [];
	static events: PIXI.utils.EventEmitter = new PIXI.utils.EventEmitter();

	private static latestDom: HTMLElement | Window | undefined;

	private static upHandler(e: any) {
		e.preventDefault();
		KeyInputHandler.IsKeyDown[e.keyCode] = false;
		KeyInputHandler.events.emit("keyup", e);
	}

	private static downHandler(e: any) {
		e.preventDefault();
		KeyInputHandler.IsKeyDown[e.keyCode] = true;
		KeyInputHandler.events.emit("keydown", e);
	}
	
	private static focusOut(e: any) {
		KeyInputHandler.IsKeyDown = [];
	}
    
	static BindKeyHandler(dom: HTMLElement | Window) {
		KeyInputHandler.latestDom = dom;

		dom.addEventListener("keydown", KeyInputHandler.downHandler);
		dom.addEventListener("keyup", KeyInputHandler.upHandler);
		dom.addEventListener("blur", KeyInputHandler.focusOut);
	}

	static ReleaseKeyHandler() {
		if (KeyInputHandler.latestDom) {
			KeyInputHandler.latestDom.removeEventListener("keydown", KeyInputHandler.downHandler);
			KeyInputHandler.latestDom.removeEventListener("keyup", KeyInputHandler.upHandler);
			KeyInputHandler.latestDom.removeEventListener("blur", KeyInputHandler.focusOut);
			KeyInputHandler.latestDom = undefined;
		}

		KeyInputHandler.IsKeyDown = [];
		KeyInputHandler.events.removeAllListeners();
	}
}
