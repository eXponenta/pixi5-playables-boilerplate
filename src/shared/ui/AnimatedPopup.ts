import { Button } from "./Button";
import { Tween } from "@tweenjs/tween.js";
import { App } from "../../index";
import { IPopupManifest } from "./Pause";

export class AnimatedPopup extends PIXI.Container {

	fadeDuration: number = 250;
	buttons: { [key: string]: Button } = {};
	texts: { [key: string]: PIXI.Text } = {};
	_animated: boolean = false;

	constructor(popup: TiledOG.TiledContainer, manifest: IPopupManifest = {}) {
		super();

		this.name = popup.name;
		const b = popup.getBounds();
		this.position.set(b.x, b.y);
		this.addGlobalChild(...popup.children);
		
		const btns = manifest.buttons || [];
		for (let name of btns) {

			const normal = this.getChildByPath<PIXI.Sprite>(`${name}-btn`);
			const disabled = this.getChildByPath<PIXI.Sprite>(`${name}-btn:disabled`);
			const label = this.getChildByPath<TiledOG.TiledContainer>(`${name}-btn:text`);

			if (!normal)
				continue;
			
			const btn = new Button( normal, disabled, label);
			btn.name = name;
			this.buttons[name] = btn;
			this.addChild(btn);
		}

		popup.destroy();
		this.pivot.x = this.width >> 1;
		this.pivot.y = this.height >> 1;
	}

	open(immediate: boolean = false): Promise<void> {
		this.visible = true;
		if (this._animated) {
			return Promise.resolve();
		}
		if (!immediate) {
			return new Promise(res => {
				this._animated = true;
				const target = this.y;
				this.y = -(this.width - this.pivot.y);
				new Tween(this)
					.to(
						{
							y: target
						},
						this.fadeDuration
					)
					.onComplete(() => {
						res();
						this._animated = false;
					})
					.start();
			});
		}
		this._animated = false;
		return Promise.resolve();
	}

	close(immediate: boolean = false): Promise<void> {
		if (this._animated) {
			return Promise.resolve();
		}
		if (!immediate) {
			this._animated = true;
			const origin = this.y;
			const target = App.instance.height + this.pivot.y;
			return new Promise(res => {
				new Tween(this)
					.to(
						{
							y: target
						},
						this.fadeDuration
					)
					.onComplete(() => {
						this.visible = false;
						this.y = origin;
						this._animated = false;
						res();
					})
					.start();
			});
		} else {
			this.visible = false;
			this._animated = false;
			return Promise.resolve();
		}
	}

	reset() {
		this.close(true);
		for (let name in this.buttons) {
			this.buttons[name].reset();
		}

		this.interactiveChildren = true;
	}
}
