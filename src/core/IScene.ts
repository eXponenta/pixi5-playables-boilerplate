import { APIData } from '../shared/APIData';
import { App } from "..";
import { StateBech } from "./StateBech";
import { InputHandler } from './InputHandler';

export interface IScene {
	kind: "scene";
	
	stage: PIXI.Container;
	loader: PIXI.Loader;
	apiData: APIData;
	app: App;
	gameState: StateBech<any>;
    input: InputHandler;
    
	resume(soft: boolean): void;
	pause(soft: boolean): void;
	init(app: App): void;
	start(): void;
	preload(loader?: PIXI.Loader): PIXI.Loader;
	stop(): void;
	update(ticker: PIXI.ticker.Ticker): void;
}
