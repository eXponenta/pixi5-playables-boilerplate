import { App } from "..";
import { StateBech } from "../core/StateBech";
import { ITextBase } from './Multilang';
import { SoundManager } from './Sound';
import { IScene } from '../core/IScene';
import * as PIXI from "pixi.js";

export enum GameState {
	PRE,
	GAME,
	PREWIN,
	WIN,
	LOSE
}

export class BaseGame implements IScene {
	kind: "scene";

	sounds: SoundManager;
	lang: ITextBase;
	stage: PIXI.Container;
	loader: PIXI.Loader;
	app: App;
	gameState: StateBech<GameState> = new StateBech();

	protected _isPaused: boolean = false;

	constructor(app: App) {
		this.app = app;
	}

	init(): void {
		console.log(this.loader);
	}

	start(): void {
	}
	
	preload(loader?: PIXI.Loader): PIXI.Loader{
		this.loader = loader || this.loader || new PIXI.Loader();
		return this.loader;
	}

	pause(soft: boolean): void {
	}

	resume(soft: boolean): void {
	}

	stop(): void {

		for(let res in this.loader.resources) {

			const r =  this.loader.resources[res];
			if(r.texture){
				r.texture.destroy(true);
			}
			if(r.textures){
				for(let t in r.textures)
					if(r.textures[t]) r.textures[t].destroy(true);
			}
		}

		this.stage.destroy({
			children : true,
			texture: true,
			baseTexture: true,
		});
	}


	update(ticker: PIXI.ticker.Ticker): void{
	}
}
