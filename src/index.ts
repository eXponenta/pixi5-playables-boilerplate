import HookPixi from "./pixi-utils";
	HookPixi();

import { Application } from "./core/Application";
import { IScene } from "./core/IScene";

import Sounds from "./sounds.json";
import TWEEN from "@tweenjs/tween.js";
import { Config } from "./shared/Config";
import { Assets } from "./shared/AssetsLib";
import { UiManager } from "./shared/ui/UiManager";
import { GameApiInterface, FakeGameApi } from './GameAPI';
import { Multilang } from "./shared/Multilang";

import Resources from "./inline/resources";

//games
import { Catcher } from './catcher/index';
import { SoundGrouper } from './shared/Sound';
import { InlineLoader} from "./loader/InlineLoader";
import { M2 } from "./shared/M2";


export class App extends Application {
	static instance: App;
	public api: GameApiInterface;
	private _currentScene?: IScene;
	public uiManager: UiManager;
	public multilang: Multilang;
	public lang: string;
	public games: {[key: string]: IScene};

	_init: boolean;
	constructor(parent: HTMLElement) {
		if(!parent)
			throw new Error("aprent element must be div!");
			
		const aspect = window.innerWidth / window.innerHeight;
		const size = { ...Config.ReferenceSize };

		if (aspect < size.width / size.height) {
			size.height = size.width / aspect;
		}

		//fallback
		PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL;

		super({
			autoStart: false,
			powerPreference: "low-power",
			backgroundColor: 0xcccccc,
			...size
		});

		parent.appendChild(this.view);
		
		this.lang = 'en_US';

		this.api = new FakeGameApi();
		
		this.uiManager = new UiManager(this);
		this.uiManager.visible = false;
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
		
		this.loader = new InlineLoader(Resources);
		//@ts-ignore
		const ui_asset = Assets.AssetsTranslated[this.lang] || {};

		//@ts-ignore 
		this.loader.add(Object.values( {...Assets.Assets, ...ui_asset}));
		this.loader.add(Sounds.list.map(e=>  Sounds.baseDir + e ));

		//console.log(this.resources);

		// на всякий случай такой кастыль
		//this.loader.baseUrl = Assets.BaseDir;
		SoundGrouper.createManager("Any", this.loader.resources);
		
	
		this.loader.add("manifest", Config.Translations);
		this.loader.load(() => {
			this.init();
		});
	}

	private init() {

		this.multilang = new Multilang(this.loader.resources["manifest"].data);
		this.multilang.preload(this.lang, this.loader);

		this.lang = this.multilang._lang;

		this.uiManager.init(this.loader.resources);
		this.uiManager.visible = false;
		this.stage.addChild(this.uiManager.stage);

		this.multilang.once("loaded", () => {
			this._init = true;
			this.preparedStart();
			this.emit("loaded");
		});
	}

	async preparedStart() {
		if(!this._init)
			throw Error("App can't init!");

		await M2.Delay(1);
		const game = new Catcher(this);
		game.preload(this.loader).load(() => {
			this.start(game);
		});
	}

	start(game: IScene) {
		
		this._currentScene = game;

		this.uiManager.bindListener(game as any);
		this._currentScene.init(this);
		this.uiManager.postInit();

		this.stage.addChildAt(this._currentScene.stage, 0);
		
		this.resume();
		super.start();
	}

	stop() {
		if (this._currentScene) {
			this.stage.removeChild(this._currentScene.stage);
			this.uiManager.reset();
			this._currentScene.stop();
			//if(this._currentScene.sounds)
			//	this._currentScene.sounds.Stop();
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
window.GamesFromHell = App;