import { IScene } from "../core/IScene";
import { StateBech } from "../core/StateBech";
import { App } from "..";
import { Assets } from "./Assets";
export class Playable implements IScene {
	kind: "scene";
	stage: PIXI.Container = new PIXI.Container();
	loader: PIXI.Loader;
	app:App;
    gameState: StateBech<any>;
    
    constructor(app: App) 
    {
        this.app = app;
    }

    preload(loader?: PIXI.Loader): PIXI.Loader {
        this.loader = loader;
        const assets = Object.values(Assets.Assets).map( e => {
			e.url = Assets.BaseDir + e.url;
			return e;
		});
        loader.add(assets);
        return loader;
    }
    
    
    init(): void {
        console.log("Init")
	}
    
    start(): void {
	}
    
	resume(soft: boolean): void {
	}
    
    pause(soft: boolean): void {
    }
    
	stop(): void {
    }
    
	update(ticker: PIXI.ticker.Ticker): void {
	}
}
