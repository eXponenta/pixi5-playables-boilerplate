//@ts-ignore
import * as PIXI from './pixi'

import ActivateUtils from "./pixi-utils/index";
	ActivateUtils();

import { Application } from "./core/Application";
import { IScene } from "./core/IScene";
import { SimpleScene } from './SimpleScene';


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
		const size = {width : 1080, height: 1920};

		if (aspect < size.width / size.height) {
			size.height = size.width / aspect;
		}
		super({
			autoStart: false,
			powerPreference: "low-power",
			backgroundColor: 0xcccccc,
			...size
		});

		parent.appendChild(this.view);
		
		this.ticker.add(this.update, this);
		App.instance = this;
	}

 	async load() {
		
		await this.init();
	}

	private async init() {

		this._init = true;
		this.preparedStart();
		//@ts-ignore
		this.emit("loaded");
	}

	async preparedStart() {
		if(!this._init)
			throw Error("App can't init!");

		const game = new SimpleScene();
		await game.preload(this.loader).loadAsync();
		this.start(game);
	}

	start(game: IScene) {
		this._currentScene = game;
		this._currentScene.init(this);
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
		if (this._currentScene != null) {
			this._currentScene.update(this.ticker);
		}

		this.render();
	}
}
//@ts-ignore
global.App = App;
