export class Controls extends PIXI.Container {
	
	rightButton: PIXI.Sprite;
	leftButton: PIXI.Sprite;
	topButton: PIXI.Sprite;
	downButton: PIXI.Sprite;

	constructor(controls: PIXI.Container) {
		super();
	
		let obj = [];
		const names = ["left", "right", "top", "bottom"];
		const pos = controls.getBounds();
		this.position.set(pos.x, pos.y);
	
		for (const iterator of names) {
			const btn = controls.getChildByPath(`arrow-${iterator}-btn`);
			if (!btn) continue;
			btn.interactive = btn.buttonMode = true;
			obj.push(btn);
			(this as any)[iterator + "Button"] = btn;
		}

		this.addGlobalChild(...obj);
	}
	reset() {
		if (this.rightButton) this.rightButton.removeAllListeners();
		if (this.leftButton) this.leftButton.removeAllListeners();
		if (this.topButton) this.topButton.removeAllListeners();
		if (this.downButton) this.downButton.removeAllListeners();

		this.interactiveChildren  = true;
	}
}
