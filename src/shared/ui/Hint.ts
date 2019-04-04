import { Button } from "./Button";
import { SoundGrouper } from "../Sound";
export class Hint extends PIXI.Container {
	_text: PIXI.Text;
	_next: Button;
	_avatar: PIXI.Sprite;
	_avatarInitTex: PIXI.Texture; 
	_textData: string[];

	_storyIndex: number;
	_complitePromise: Promise<null>;
	_comlite: () => void;

	constructor(target: PIXI.Container, size:{width: number, height: number}) {
		super();

		this._storyIndex = 0;
		const hint = target.getChildByPath<PIXI.Container>("hint");

		this.name = hint.name;
		const b = hint.getBounds();
		this.position.set(b.x, b.y);
		
		const height = hint.height;

		const overlay = new PIXI.Sprite(PIXI.Texture.WHITE);
		overlay.tint = 0;
		overlay.alpha = 0.5;
		overlay.width = size.width + 50;
		overlay.height = size.height + 50;
		overlay.y = -size.height + height;
		overlay.interactive = true;
		
		this.addChild(overlay);
		this.addGlobalChild(...hint.children);

		this._avatar = this.getChildByName("avatar") as PIXI.Sprite;
		this._avatar.anchor.set(0, 1);
		this._avatarInitTex = this._avatar.texture;

		this._text = this.getChildByPath<TiledOG.TiledContainer>("text").text as PIXI.Text;
		this._text.style.align = "left";
		this._next = new Button(this.getChildByName("next-btn") as PIXI.Sprite);

		this.addChild(this._next);

		this.pivot = hint.pivot;

		hint.destroy();

		this.pivot.y = height;

		this._next.on("b-click", () => {
			this._nextStory();
        });
        
        this.visible = false;
	}

	open(textData: string[], avatar?: PIXI.Texture) {
		
		if (avatar) {
			this._avatar.texture = avatar;
		} else {
			this._avatar.texture = this._avatarInitTex;
		}

		this._textData = textData;

		if (!this._textData || this._textData.length == 0) {
			return Promise.resolve();
		}
		
		this.visible = true;
		this._nextStory();
	
		return new Promise(res => {
			this._comlite = res;
		});
	}

	close() {
		if (this._comlite) this._comlite();

		this._storyIndex = 0;
		this._textData = [];
		this._comlite = undefined;
		this.visible = false;
	}

	_nextStory() {
		if (this._storyIndex >= this._textData.length) {
			this.close();
			return;
		}

		this._text.text = this._textData[this._storyIndex];
		this._storyIndex += 1;
		
		//sound stuckout
		SoundGrouper.managers["Any"].Play("stuckout");
	}
}
