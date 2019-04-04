import { Button } from "./Button";
import { AnimatedPopup } from "./AnimatedPopup";

export interface IPopupManifest {
	buttons?: string[];
	texts?: string[];
}

export class Pause extends AnimatedPopup {
    
    reloadButton: Button;
	menuButton: Button;
	playButton: Button;

    constructor(ref: TiledOG.TiledContainer) {
		
		const popup = ref.getChildByPath<TiledOG.TiledContainer>("pause");
		super(popup, {
			buttons: [
				"play","reload", "menu"
			]
		});

		this.reloadButton = this.buttons["reload"];
		this.menuButton = this.buttons["menu"];
		this.playButton = this.buttons["play"];
	}
}