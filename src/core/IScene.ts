import { App } from "..";
import { StateBech } from "./StateBech";
import { InputHandler } from './InputHandler';

export interface IScene {
	kind: "scene";
	
	stage: PIXI.Container;
	loader: PIXI.Loader;
	app: App;
	gameState: StateBech<any>;
    
	resume(soft: boolean): void;
	pause(soft: boolean): void;
	init(): void;
	start(): void;
	preload(loader?: PIXI.Loader): PIXI.Loader;
	stop(): void;
	update(ticker: PIXI.ticker.Ticker): void;
}
