import { IScene } from "./core/IScene";
import { InputHandler } from "./core/inputHandler";
import { StateBech } from "./core/StateBech";
import { App } from './index';

export class SimpleScene implements IScene {
	kind: "scene";

	stage: PIXI.Container = new PIXI.Container();
	loader: PIXI.Loader;
	app: App;
	gameState: StateBech<any>;
	input: InputHandler;
	bunny: PIXI.Sprite;

	init(app: App): void {
		this.app = app;
		this.bunny = new PIXI.Sprite(this.loader.resources["bunny"].texture);
		this.bunny.anchor.set(0.5);
		this.bunny.position.set(this.app.width >> 1, this.app.height >>1);

		setInterval(()=> {
			this.bunny.position.set(
				Math.random() * app.width,
				Math.random() * app.height
			)
			this.bunny.scale.set(
				Math.random() * 5,
				Math.random() * 5
			)
			this.bunny.rotation = Math.random() * Math.PI * 2;
		}, 1000)
	}

	resume(soft: boolean): void {
	}
	pause(soft: boolean): void {
	}
	start(): void {
	}
	preload(loader?: PIXI.Loader): PIXI.Loader {
		this.loader = new PIXI.Loader();
		this.loader.add("bunny", "https://pixijs.io/examples/examples/assets/bunny.png");
		return this.loader;
	}
	stop(): void {
	}
	update(ticker: PIXI.ticker.Ticker): void {
	}
}
