import HookPixi from "./pixi-utils";
	HookPixi();

import TWEEN from "@tweenjs/tween.js";
import { Application } from "./Application";
import { Config } from "./shared/Config";
import { Assets } from "./shared/AssetsLib";
import { BaseGame } from "./shared/BaseGame";
import { UiManager } from "./shared/ui/UiManager";
import { GameApiInterface, FakeGameApi } from './GameAPI';
import { Multilang } from "./shared/Multilang";

import Resources from "./inline/resources";

//games
import { Catcher } from './catcher/index';
import { SoundGrouper } from './shared/Sound';
import { InlineLoader} from "./InlineLoader";


export class App extends Application {
	static instance: App;
	public api: GameApiInterface;
	private _currentGame?: BaseGame;
	public uiManager: UiManager;
	public multilang: Multilang;
	public lang: string;
	public games: {[key: string]: typeof BaseGame};
	public resources: PIXI.IResourceDictionary;

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
		//@ts-ignore		
		window.GameAPI = this.api;
		
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
		//console.log(this.resources);

		// на всякий случай такой кастыль
		//this.loader.baseUrl = Assets.BaseDir;
		SoundGrouper.createManager("Any");
		
	
		//this.loader.add("mainfest", Config.Translations);

		this.loader.load(() => {
			this.init();
		});
	}

	private init() {

		this.multilang = new Multilang(this.resources["translations/manifest.json"].data);
		this.multilang.langdata = this.resources["translations/en_US.json"].data;

		this.lang = this.multilang._lang;

		this.uiManager.init(this.resources);
		this.uiManager.visible = false;
		this.stage.addChild(this.uiManager.stage);

		//this.multilang.once("loaded", () => {
			this._init = true;
			this.preparedStart();
			this.emit("loaded");
		//});
	}

	preparedStart() {
		if(!this._init)
			throw Error("App can't init!");

		const game = new Catcher();
		game.preload().load(() => {
			this.start(game);
		});
	}

	start(game: BaseGame) {
		
		this._currentGame = game;

		this.uiManager.bindListener(game as any);
		this._currentGame.init(this);
		this.uiManager.postInit();

		this.stage.addChildAt(this._currentGame.stage, 0);
		
		this.resume();
		super.start();
	}

	stop() {
		if (this._currentGame) {
			this.stage.removeChild(this._currentGame.stage);
			this.uiManager.reset();
			this._currentGame.stop();
			if(this._currentGame.sounds)
				this._currentGame.sounds.Stop();
		}
		this._currentGame = undefined;
		super.render();
		super.stop();
	}

	pause() {
		this.ticker.stop();
		if (this._currentGame) {
			this._currentGame.pause();
		}
		
		this.update();
	}

	resume() {
		if (!this._currentGame) return;

		this._currentGame.resume();
		super.start();
	}

	private update() {
		TWEEN.update(this.ticker.lastTime);
		if (this._currentGame != null) {
			this._currentGame.update(this.ticker);
		}

		this.render();
	}
}

//@ts-ignore
window.GamesFromHell = App;