import { Application } from "../../Application";
import { Progress } from "./Progress";
import { Button } from "./Button";
import { CheckedButton } from "./CheckedButton";
import { PopupDifficulty, PopupType } from './Popup';
import { Assets } from "../AssetsLib";
import { Utils } from "./Utils";
import { Hint } from "./Hint";
import { Pause } from "./Pause";
import { AnimatedPopup } from "./AnimatedPopup";
import { IUIListener, IPopup } from './IUIListener';
import { Controls } from "./Controls";
import { SoundGrouper } from '../Sound';

export enum ControlsLayout {
	NONE,
	HOR,
	FULL
}

export interface IUiOptions {
	showProgress?: boolean;
	showArrows?: boolean;
	progress?: number;
	progressMax?: number;
	level?: number;
	levelHint?: string;
	progressHint?: string;
	controlLayout?: ControlsLayout;
}

const DEF_OPTIONS: IUiOptions = {
	progress: 0,
	progressMax: 100,
	showProgress: true,
	showArrows: false,
	level: 1,
	levelHint: "Level {current}/{total}",
	progressHint: "Progress {current}/{total}",
	controlLayout: ControlsLayout.NONE
};

export const EXT_FONT_SETTINGS = {
	dropShadowAlpha: 0.4,
	dropShadowAngle: 0.4,
	dropShadowBlur: 2,
	dropShadowColor: "#260e00",
	dropShadowDistance: 2,
	stroke: "#260e00"
};

export class UiManager extends PIXI.utils.EventEmitter {
	public stage: PIXI.Container = new PIXI.Container();
	public textures: PIXI.ITextureDictionary;
	public sadNeoo: PIXI.Texture;
	public happyNeeo: PIXI.Texture;

	app: Application;

	hint: Hint;
	private popup: PopupDifficulty;
	private pause: Pause;
	private exit: AnimatedPopup;

	_progress: Progress;
	_pauseBtn: Button;
	_exitBtn: Button;

	private _controls: Controls;
	private _controls_full: Controls;
	private _uiListener: IUIListener;

	_options: IUiOptions = { ...DEF_OPTIONS };
	constructor(app: Application) {
		super();

		this.app = app;
	}

	init(resources: PIXI.IResourceDictionary, params?: IUiOptions) {
		params = params || DEF_OPTIONS;
		const size = this.app.size;

		const atlas = resources["ui-atlas"].spritesheet;
		this.textures = atlas.textures;
		this.sadNeoo = this.textures["neeo-dialog-fail.png"];
		this.happyNeeo = this.textures["neeo-dialog.png"];

		const map = resources[Assets.Assets["ui-map"].name].data;
		const uiStage = PIXI.tiled.CreateStage(atlas, map);

		this.popup = new PopupDifficulty(uiStage, this.textures);
		this.popup.position.set(this.app.width >> 1, this.app.height >> 1);

		this.popup.visible = false;

		this.popup.setLevelStatus([{ opened: true, complete: false }, {}, {}]);

		this._progress = new Progress(uiStage);
		this._progress.progress = 50;
		this._progress.levelIndex = 2;

		this._exitBtn = new Button(uiStage.getChildByPath("settings/exit-btn"));

		this._pauseBtn = new Button(Utils.findOn(uiStage, "settings/pause-btn"));

		const hor = uiStage.getChildByName("controls_hor") as PIXI.Container;
		this._controls = new Controls(hor);
		this._controls.pivot.y = this._controls.height;
		this._controls.position.y = this.app.height - 100;
		this._controls.visible = false;

		const full = uiStage.getChildByName("controls_full") as PIXI.Container;
		this._controls_full = new Controls(full);
		this._controls_full.pivot.y = this._controls_full.height;
		this._controls_full.position.y = this.app.height - 100;
		this._controls_full.visible = false;

		this.hint = new Hint(uiStage, this.app.size);
		this.hint.position.y = this.app.height;

		this.pause = new Pause(uiStage);
		this.pause.position.set(this.app.width >> 1, this.app.height >> 1);
		this.pause.close(true).then();

		const exitp = uiStage.getChildByPath<TiledOG.TiledContainer>("exit");

		this.exit = new AnimatedPopup(exitp, {
			buttons: ["ok", "cancel"]
		});

		this.exit.position.set(this.app.width >> 1, this.app.height >> 1);
		this.exit.close(true).then();

		uiStage.addChild(
			this._progress,
			this._pauseBtn,
			this._exitBtn,
			this._controls,
			this._controls_full,
			this.popup,
			this.pause,
			this.exit,
			this.hint
		);

		this.stage.addChild(uiStage);
		this.setOptions({ ...params, ...DEF_OPTIONS });

		this.reset();
	}

	public bindListener(lst: IUIListener) {
		this.reset();
		this._uiListener = lst;
	}

	public postInit() {
		//@ts-ignore
		this.popup.applyTranslation(this._uiListener.lang["levels_button"]);
	}

	public update(ticker: PIXI.Ticker) {}

	setOptions(params: IUiOptions) {
		this._options = { ...this._options, ...params };

		this.level = this._options.level;
		this.progress = this._options.progress;

		// Set progress bar parameters

		this._progress.maxValue = this._options.progressMax;
		this._progress.levelHint = this._options.levelHint;
		this._progress.progressHint = this._options.progressHint;
		this._progress.visible = this._options.showProgress;

		this._controls.visible = this._options.controlLayout == ControlsLayout.HOR && this._options.showArrows;
		this._controls_full.visible = this._options.controlLayout == ControlsLayout.FULL && this._options.showArrows;

		if (this._uiListener) {
			//sync level data
			this.popup.setLevelStatus(
				this._uiListener.apiData.levels.map(e => ({ opened: e.opened, complete: e.playing > 0 }))
			);
		}

		this.visible = true;
	}

	fromMenu: boolean = false;

	reset() {
		this.removeAllListeners();
		this._pauseBtn.reset();
		//this._settingBtn.removeAllListeners();
		this.visible = false;
		this.pause.reset();
		this.popup.reset();
		this.exit.reset();
		this._controls.reset();
		this._controls_full.reset();
		this.clearPopupStack();
		// bind popups button in self
		// open exit popup

		this.popup.exitButton.on("b-click", () => {
			if (this.controls) this.controls.interactiveChildren = false;

			this.pause.interactiveChildren = false;
			this.popup.interactiveChildren = false;
			this.exit.interactiveChildren = true;

			this.pushPopup(IPopup.CLOSING);
		});

		// close exit popup
		this.exit.buttons["cancel"].on("b-click", () => {

			if (this.controls) this.controls.interactiveChildren = true;

			this.pause.interactiveChildren = true;
			this.popup.interactiveChildren = true;
			this.exit.interactiveChildren = true;
			this.popPopup(true);
		});

		// emit closing event

		this.exit.buttons["ok"].on("b-click", () => {
			this.app.stop();
		});

		this._exitBtn.on("b-click", () => {
			if( this.openedPopup.length > 0 ) return; 
			if (this.controls) this.controls.interactiveChildren = false;

			this.pause.interactiveChildren = false;
			this.popup.interactiveChildren = false;
			this.exit.interactiveChildren = true;

			const handle = () => {
				if (this.controls) this.controls.interactiveChildren = true;

				this.pause.interactiveChildren = true;
				this.popup.interactiveChildren = true;
				this.exit.interactiveChildren = true;
				
				this._uiListener.softResume();
				this.popPopup(true);
				
				this.exit.buttons["cancel"].off("b-click", handle, this);
			};

			this.exit.buttons["cancel"].on("b-click", handle);
			this.pushPopup(IPopup.CLOSING);
			this.onPause(true);
		});

		// open pause popup

		this._pauseBtn.on("b-click", () => {
			if(this.openedPopup.length == 0) {
				this.onPause(false);
			}
		});

		this.pause.playButton.on("b-click", () => {
			this.popPopup(true);
			this._uiListener.softResume();
		});

		this.pause.reloadButton.on("b-click", () => {
			this.clearPopupStack();
			this._uiListener.reload();
			this._uiListener.softResume();
		});

		this.pause.menuButton.on("b-click", () => {
			//this.pause.close();
			this.setOptions({
				showArrows: false,
				showProgress: false
			});

			this.pushPopup(IPopup.MENU, true, PopupType.START)
		});

		this.popup.on("level-click", (l: number) => {
			this._uiListener.setLevel(l);
			this._uiListener.softResume();
			this.clearPopupStack();
			//this.popPopup(true);
		});
	}

	openedPopup: Array<AnimatedPopup> = [];

	clearPopupStack() {
		this.openedPopup.forEach(e => e.close(false));
		this.openedPopup = [];
	} 

	popPopup(animate: boolean = true) {
		const pop = this.openedPopup.splice(-1, 1)[0];
		if (pop) {
			pop.close(!animate);
		}
		const top = this.openedPopup[this.openedPopup.length - 1];

		return top ? top.open(!animate) : Promise.resolve();
	}

	pushPopup(popup: IPopup, animate: boolean = true, ...params: any) {
		
		//play sound when open difficult popup
		if(params) {
			
			if(params == PopupType.LOSE) {
			
				SoundGrouper.managers["Any"].Play("lose");

			} else if(params == PopupType.WIN) {

				//кастыль 
				setTimeout(()=>{
					if(this._uiListener.apiData.current == 3){
						SoundGrouper.managers["Any"].Play("win");
					} else {
						SoundGrouper.managers["Any"].Play("next_level");
					}
				}, 0)
			}
		}

		const top = this.openedPopup[this.openedPopup.length - 1];
		if(top){
			top.close();
		}

		this._uiListener.popupOpened(popup);
		if (popup == undefined) return;
		
		if (popup == IPopup.CLOSING) {
			this.openedPopup.push(this.exit);
			return this.exit.open(!animate);
		}
		if (popup == IPopup.PAUSE) {
			this.openedPopup.push(this.pause);
			return this.pause.open(!animate);
		}
		if (popup == IPopup.MENU) {
			this.openedPopup.push(this.popup);
			return this.popup.show(...(params || PopupType.START), !animate);
		}
	}

	onPause(immediate: boolean = true) {
		this.emit("soft-pause");
		this._uiListener.softPause();
		if (this.openedPopup.length == 0) {
			this.pushPopup(IPopup.PAUSE, !immediate);
		}
	}

	onResume() {}

	get visible() {
		return this.stage.visible;
	}

	set visible(v: boolean) {
		this.stage.visible = v;
	}

	set progress(v: number) {
		this._progress.progress = v;
	}

	get progress() {
		return this._progress.progress;
	}

	set level(v: number) {
		this._progress.levelIndex = v;
		//this.popup.setLevelStatus(v);
	}

	get level() {
		return this._progress.levelIndex;
	}

	get controls(): Controls {
		if (this._options.controlLayout == ControlsLayout.NONE) return undefined;
		return this._options.controlLayout == ControlsLayout.HOR ? this._controls : this._controls_full;
	}
}
