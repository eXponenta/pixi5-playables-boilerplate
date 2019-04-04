import { Utils } from "./Utils";
import { Button } from "./Button";
import { AnimatedPopup } from './AnimatedPopup';

export enum PopupType {
	START = "start",
	LOSE = "lose",
	WIN = "win"
}

export class LevelButton extends Button {
	icon: PIXI.Sprite;
}

export class PopupDifficulty extends AnimatedPopup {
	levelButtons: LevelButton[];
	exitButton: Button;
	_titles: {[ke: string] : PIXI.Sprite};

	constructor(ref: TiledOG.TiledContainer, textures: PIXI.ITextureDictionary) {

		const popup = Utils.findOn<TiledOG.TiledContainer>(ref, "popup");
		super(popup, {
			buttons : [
				"menu",
				"level-0",
				"level-1",
				"level-2",
			],
		});

		this.levelButtons = [];
		
		for(let i = 0; i < 3; i++ ) {
			let btn = this.buttons["level-" + i ] as LevelButton;
			btn.icon = new PIXI.Sprite(textures["cancel-btn.png"]);
			btn.addChild(btn.icon);

			btn.icon.x = 40;
			btn.icon.y = 20;
			
			this.levelButtons[i] = btn;
		}

		this.exitButton = this.buttons['menu'];

		const titles = [PopupType.WIN, PopupType.LOSE, PopupType.START];

		this._titles = {};
		for (var t of titles) {
			this._titles[t] = this.getChildByPath(`title-${t}`);
		}

		const bg = this.getChildByPath<PIXI.Container>("bg");
		this.pivot.x = bg.x + (bg.width >> 1);
		this.pivot.y = bg.y - (bg.height >> 1);
	}

	show(type: PopupType = PopupType.START,
			immediate: boolean = false) : Promise<void> {

		for (const key in this._titles) {
			this._titles[key].visible = type == key;
		}

		return super.open(immediate);
	}

	reset() {
		super.reset();
		this.close(true);

		this.removeAllListeners();
		for (const name in this.buttons) {
			this.buttons[name].reset();
		}

		this.levelButtons.forEach((v, i)=>{
			const index = i + 1;
			v.on("b-click", ()=>{
				this.emit("level-click", index);
			});
		});

		this.interactiveChildren = true;
	}

	setLevelStatus(data: Array<{opened?: boolean, complete?: boolean}>) {
		for (let i = 0; i < this.levelButtons.length; i++) {
			const btn = this.levelButtons[i];
			btn.disabled = !data[i].opened;
			btn.icon.visible = !data[i].complete && data[i].opened;
		}
	}

	applyTranslation(btns : string[]) {
		
		for(let i = 0 ; i < 3; i++) {
			const btn = this.buttons['level-' + i];
			const txt = btns[i];
			if(btn && txt)
				btn._text.text = txt;
		}
	}
}