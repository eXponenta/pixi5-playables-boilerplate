import { BaseGame, GameState } from '../shared/BaseGame';
import { APIData } from '../shared/APIData';
import { App } from "..";
import { PhysicContainer } from '../physics/PhysicContainer';
import { Assets } from './Assets';
import { GameConfig, ILevelData } from './GameConfig';
import { M2 } from "../shared/M2";
import { PopupType } from '../shared/ui/Popup';
import { UiManager, ControlsLayout } from '../shared/ui/UiManager';
import { InputHandler } from '../shared/CrossplatformInputHandler';
import { IUIListener, IPopup } from '../shared/ui/IUIListener';

export class Twofold extends BaseGame implements IUIListener{
	

	ui: UiManager;
	tex: PIXI.ITextureDictionary;
	stage: PIXI.Container;
	physics: PhysicContainer;
	res: PIXI.IResourceDictionary;
	levelData: ILevelData;

	constructor() {
		super();
		
		this.input = new InputHandler(false, M2.mobile);
		this.apiData = new APIData("Twofold", this);
		this.stage = new PIXI.Container();
		this.loader = new PIXI.Loader(Assets.BaseDir);
	}

	init(app: App){
		this.app = app;
		this.gameState.on("enter", this.onStateEnter, this);
		
		this.ui = this.app.uiManager;

		this.ui.setOptions({
            showArrows: false,
            showProgress: false,
			level: this.apiData.lastOpenedLevel,
			controlLayout: ControlsLayout.HOR,
			levelHint: this._m("levels", {})[0],
            progressHint: this._m("progress_bar", {})[0],
		});

		this.ui.popup.show(PopupType.START, true);
		this.res = this.loader.resources;

		const bg = new PIXI.Sprite(this.res["bg"].texture);
		bg.scale.set(app.width / bg.texture.width);
	
		this.stage.addChild(bg);
        super.init(app);
		super.start();
	}

	preload(): PIXI.Loader {
		
		//@ts-ignore
		this.loader.add(Object.values(Assets.Assets));
		return super.preload();
	}

	reset() {

	}

	// --- UI Listener impementing

	setLevel(level: number): void {
	
		this.apiData.current = level;
		this.levelData = GameConfig.levels[level - 1];

		this.reset()
		this.gameState.current = GameState.GAME;
	}

	reload(): void {
		this.setLevel(this.apiData.current);
	}

	popupOpened(popup: IPopup): void {
		
		if(popup == IPopup.MENU){
			this.app.uiManager.setOptions({
				showArrows: false,
				level: this.apiData.lastOpenedLevel
			});
		}
	}
	
	softPause(): boolean {
		return super.softPause();
	}
	// --- End

	onStateEnter(state: GameState) {
		switch(state) {

			case GameState.PRE: {
				this.ui.setOptions({
					showProgress: false,
					progress : 0,
					level : this.apiData.lastOpenedLevel
				});
				this.ui.popup.show(PopupType.START);
				break;
			}

			case GameState.GAME: {
				this.ui.setOptions({
					showProgress: true,
					progress : 0,
					showArrows: M2.mobile,
					level : this.apiData.current,
					//progressMax: this._levelData.catchsToWin
				});
				this.ui.progress = 0;
				break;
			}

			case GameState.PREWIN: {

				this.apiData.levelSucsess();
				this.ui.setOptions({
					showProgress: false,
					progress : 0,
					showArrows: false,
					level : this.apiData.lastOpenedLevel
				});
				
				this.ui.popup.show(PopupType.WIN);
				this.gameState.current = GameState.WIN;

				break;	
			}

			case GameState.WIN: {
				
				setTimeout(()=>{
					if(this.gameState.current !== GameState.WIN)
						return;
					this.ui.hint.open(this._m("endings"))
				}, 1000);

				break;
			}
			case GameState.LOSE: {

				this.apiData.levelFailed();
				this.ui.setOptions({
					showProgress: false,
					progress : 0,
					showArrows: false,
					level : this.apiData.lastOpenedLevel
				});

				this.ui.popup.show(PopupType.LOSE);
				setTimeout(()=>{
					if(this.gameState.current !== GameState.LOSE)
						return;
					let three = this.apiData.loosesAtRun % 3 == 0 && this.apiData.loosesAtRun > 0;
					this.ui.hint.open(this._m( three ? "falling_3times" : "falling"))
				}, 1000);
				break;	
			}
		}
	}

	// its real pause, when tab changed
	pause(): void {
		this.app.uiManager.onPause();
		super.pause();
	}

	// real resume
	resume(): void {
		
		this.app.uiManager.onResume();
		super.resume();
	}

	update(ticker: PIXI.Ticker): void {
		if(this._isPaused)
			return;
		
		this.input.update();

	
		if(this.gameState.current == GameState.GAME)
		{

		}

	}

	_m(text: string, data?: any) {
		return this.app.multilang.map("Twofold", text, data);
	}
}
