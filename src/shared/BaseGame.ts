import { APIData } from '../shared/APIData';
import { App } from "..";
import { StateBech } from "../core/StateBech";
import { InputHandler } from './../core/inputHandler';
import { ITextBase } from './Multilang';
import { SoundManager } from './Sound';
import { IScene } from '../core/IScene';

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
	
	preload(loader?: PIXI.Loader): PIXI.Loader{
		this.loader = loader || this.loader || new PIXI.Loader();
		return this.loader;
	}

	pause(soft: boolean): void {
		if(this.input){
			this.input.unbindInput();
		}
	}

	resume(soft: boolean): void {
		if(this.input)
			this.input.bindInput();
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
	}


	update(ticker: PIXI.ticker.Ticker): void{
		if(this.input)
			this.input.update();
	}
}
