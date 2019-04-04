import { APIData } from '../shared/APIData';
import { App } from "..";
import { StateBech } from "./StateBech";
import { InputHandler } from './CrossplatformInputHandler';
import { ITextBase } from './Multilang';
import { SoundManager } from './Sound';

export enum GameState {
	PRE,
	GAME,
	PREWIN,
	WIN,
	LOSE
}

export interface IGame {

	stage: PIXI.Container;
	loader: PIXI.Loader;
	apiData: APIData;
	app: App;
	gameState: StateBech<GameState>;
	input: InputHandler;
	softPause(): void;
	softResume(): void;
	init(app: App): void;
	start(): void;
	preload(): PIXI.Loader;
	stop(): void;
	update(ticker: PIXI.ticker.Ticker): void
}

export class BaseGame implements IGame {
	sounds: SoundManager;
	lang: ITextBase;
	stage: PIXI.Container;
	loader: PIXI.Loader;
	apiData: APIData;
	app: App;
	gameState: StateBech<GameState> = new StateBech();
	input: InputHandler;

	protected _isPaused: boolean = false;

	init(app: App): void {
		this.app = app;
		this.apiData.submitState({type: "init"});
	}

	start(): void {
		this.apiData.submitState( {
			type: "start"
		});
	}
	
	preload(): PIXI.Loader{
	
		if(this.apiData) {
			this.loader.on("progress", (l, r)=>{
				this.apiData.submitLoadingProgress( l.progress, {name:r.name});
			});
		}
		return this.loader;
	}

	softPause() {
		const allow = this.gameState.current == GameState.GAME && !this._isPaused;
		this._isPaused = true;
		return allow;
	}

	softResume() {
		if(this._isPaused) {
			this._isPaused = false;
			//this.app.uiManager.pause.close();
		}
	}

	pause(): void {
		this.softPause();
		
		if(this.input){
			this.input.unbindInput();
		}

		this.apiData.submitState({
			type: "pause"
		});
	}

	resume(): void {
		if(this.input)
			this.input.bindInput();

		this.apiData.submitState({
			type: "resume"
		});
	}

	stop(): void {
		if(this.input){
			this.input.unbindInput();
		}

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

		this.loader.reset();
		this.apiData.submitState({type: "close"});
	}


	update(ticker: PIXI.ticker.Ticker): void{
		if(this.input)
			this.input.update();
	}
}
