import { App } from "..";
import { StateBech } from "./StateBech";
import { InputHandler } from './InputHandler';

export interface IScene {
	kind: "scene";
	
	stage: PIXI.Container;
	loader: PIXI.Loader;
	app: App;
	gameState: StateBech<any>;
    input: InputHandler;
	
	preload(loader?: PIXI.Loader): PIXI.Loader;
	init(app: App): void;
	start(): void;
	stop(): void;
	resume(soft: boolean): void;
	pause(soft: boolean): void;
	update(ticker: PIXI.ticker.Ticker): void;
}
