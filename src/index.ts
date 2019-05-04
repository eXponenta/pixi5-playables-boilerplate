import ActivateUtils from "./pixi-utils";
	ActivateUtils();

import { Application } from "./core/Application";
import { IScene } from "./core/IScene";

import TWEEN from "@tweenjs/tween.js";
import { Config } from './shared/Config';
//import Resources from "./inline/resources";

//import { InlineLoader} from "./loader/InlineLoader";
import { M2 } from "./shared/M2";

import { Playable } from './playable/index';
import { Assets } from './playable/Assets';


export class App extends Application {
	static instance: App;
	private _currentScene?: IScene;
	public lang: string;
	public games: {[key: string]: IScene};

	_init: boolean;
	constructor(parent: HTMLElement) {
		if(!parent)
			throw new Error("aprent element must be div!");
			
		const aspect = window.innerWidth / window.innerHeight;
		const size = { ...Config.ReferenceSize };

		//fallback
		PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL;

		super({
			autoStart: false,
			powerPreference: "low-power",
			backgroundColor: 0xcccccc,
			...size
		});

		parent.appendChild(this.view);
		

		this.ticker.add(this.update, this);

		if (Config.PausedInBackground) {
			window.addEventListener("blur", () => {
				this.pause();
			});

			window.addEventListener("focus", () => {
				this.resume();
			});
		}

		this.render();

		//@ts-ignore
		window.AppInstance = this;
		App.instance = this;
	}

 	async load() {
		
		//this.loader = new InlineLoader(Resources);
		this.loader = new PIXI.Loader();
		this.loader.baseUrl = Config.BaseResDir;
		//@ts-ignore 
		this.init();
	}

	private async init() {

		this._init = true;
		this.preparedStart();
		this.emit("loaded");	
	}

	async preparedStart() {
		if(!this._init)
			throw Error("App can't init!");

		await M2.Delay(1);
		
		const game = new Playable(this);
		await game.preload(this.loader).loadAsync();
		this.start(game);
	}

	start(game: IScene) {
		
		this._currentScene = game;
		this._currentScene.init();

		this.stage.addChildAt(this._currentScene.stage, 0);
		
		this.resume();
		super.start();
	}

	stop() {
		if (this._currentScene) {
			this.stage.removeChild(this._currentScene.stage);
			this._currentScene.stop();
		}
		this._currentScene = undefined;
		super.render();
		super.stop();
	}

	pause() {
		this.ticker.stop();
		if (this._currentScene) {
			this._currentScene.pause(false);
		}
		
		this.update();
	}

	resume() {
		if (!this._currentScene) return;

		this._currentScene.resume(false);
		super.start();
	}

	private update() {
		TWEEN.update(this.ticker.lastTime);
		if (this._currentScene != null) {
			this._currentScene.update(this.ticker);
		}

		this.render();
	}
}

//@ts-ignore
window.App = App;