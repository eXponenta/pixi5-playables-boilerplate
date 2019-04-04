import { Button } from "./Button";

export class CheckedButton extends Button {
	_checkedSprite: PIXI.Sprite;
	_checked: boolean;

	constructor(normal: PIXI.Sprite, checked: PIXI.Sprite, disabled?: PIXI.Sprite) {
		super(normal, disabled);

		this._checkedSprite = checked;
		this.interactiveChildren = true;
		this._checked = false;

		this.on("b-click", () => {
			this.checked = !this.checked;
			this.emit("b-check", this);
			console.log("chechked");
		});

		this.addChild(this._checkedSprite);
	}

	set checked(v: boolean) {
		this._checked = v;

		this._mainSprite.visible = !v;
		this._checkedSprite.visible = v;
	}

	get checked() {
		return this._checked;
	}
}
