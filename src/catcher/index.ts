import { BaseGame, GameState } from '../shared/BaseGame';
import { APIData } from '../shared/APIData';
import { App } from "..";
import { Assets } from './Assets';
import { ObjectBuilder } from './ObjectBuider';
import { ObjectType, GameConfig, ILevelData } from './GameConfig';
import { M2 } from "../shared/M2";
import { PopupType } from '../shared/ui/Popup';
import { UiManager, ControlsLayout } from '../shared/ui/UiManager';
import { InputHandler } from '../shared/CrossplatformInputHandler';
import { Tween } from '@tweenjs/tween.js';
import { Player, PlayerAnimPhase } from './Player';
import { FrontSprite } from '../shared/FrontSprite';
import { IUIListener, IPopup } from '../shared/ui/IUIListener';
import { ITextBase } from '../shared/Multilang';
import { SoundGrouper } from '../shared/Sound';


export class Catcher extends BaseGame implements IUIListener{
	
	lang: ITextBase;
	target: PIXI.Point = new PIXI.Point();
	ui: UiManager;
	tex: PIXI.ITextureDictionary;
	stage: PIXI.Container;
	physics: PIXI.Container;
	loader: PIXI.Loader;
	player: Player;
	bucket: FrontSprite;
	fallingSpeed: number;
	spawnOffset: number = 100;
	_res: PIXI.IResourceDictionary;
	_spawner: ObjectBuilder;

	_pool: PIXI.Sprite[] = [];
	_bucketPool: PIXI.Sprite[] =[];

	_freeSize: number = 0;
	_stackSize: number = 0;
	_levelData: ILevelData;
	_drops: number = 0;
	
	catched: number = 0

	get totatlDrops() {
		return this._drops;
	}

	constructor() {
		super();
		
		this.input = new InputHandler(false, M2.mobile);
		this.apiData = new APIData("Catcher", this);
		this.stage = new PIXI.Container();
		this.physics = new PIXI.Container();
		this.physics.sortableChildren = true;
	}

	init(app: App){
		this.app = app;
		this.sounds = SoundGrouper.createManager("Catcher");
		this.sounds.Play("main_theme2", {loop: true, volume: .25});
		
		this.gameState.on("enter", this.onStateEnter, this);
		this.lang = this.app.multilang.getTextBase('Catcher');

		this.ui = this.app.uiManager;

		this.ui.setOptions({
            showArrows: false,
            showProgress: false,
			level: this.apiData.lastOpenedLevel,
			controlLayout: ControlsLayout.HOR,
			levelHint: this.lang.levels[0],
            progressHint: this.lang.progress[0],
		});

		this.input.mobileControlls = this.ui.controls;
		
		this.ui.pushPopup(IPopup.MENU, true, PopupType.START);
	
		this._res = this.loader.resources;
		this._spawner = new ObjectBuilder(this._res, this.physics);

		const bottomHeight = 300;
		let yOffset = M2.mobile ? bottomHeight : 120;
		
		this.player = new Player(this._res);
		this.player.scale.set(1.5);
		this.player.safeArea = new PIXI.Rectangle(160, 0, app.width - 320, app.height);
		this.player.position.set(app.width * 0.5, app.height - yOffset)
		

		const slot = this.player.getSlotSprite("basket front") as PIXI.Sprite;
		this.bucket = new FrontSprite(slot);
		this.bucket.texture = PIXI.Texture.EMPTY;
		this.bucket.zIndex = 99;
		this.bucket.sortableChildren = true;

		const view = new PIXI.Sprite(slot.texture);
		view.anchor.set(0.5);
		view.zIndex = 10;

		//fixme collision can't work now
		this.bucket.addChild(view);

		
		const hand = new FrontSprite(this.player.getSlotSprite("Hand Left"));
		hand.zIndex = 100;

		this.physics.addChild(this.player, this.bucket, hand);
		
		// ставим цвет заливки в цвет листьев, что бы сливался 
		this.app.renderer.backgroundColor = 0x001815;

		const fg = new PIXI.Sprite(this._res["fg"].texture);
		fg.scale.set(app.width / fg.texture.width);
		fg.anchor.set(0, 1);
		fg.y = app.height + bottomHeight - yOffset ;
		
		this.spawnOffset = app.height - fg.height;

		const bg = new PIXI.Sprite(this._res["bg"].texture);
		bg.scale.set(app.width / bg.texture.width);
		bg.anchor.set(0, 1);
		bg.y = fg.y - 240;
		
		this.stage.addChild(bg,this.physics,fg);
		
		this.app.uiManager.hint.open(this.lang.hello);
        super.init(app);
		super.start();
	}

	preload(loader: PIXI.Loader): PIXI.Loader {
		const _l = super.preload(loader);

		const assets = Object.values(Assets.Assets).map( e => {
			e.url = Assets.BaseDir + e.url;
			return e;
		});

		_l.add(assets);
		return _l;
	}

	reset() {
		
		this.physics.pivot.set(0,0);
		this._pool.forEach((e) => {
			e.destroy();
		});

		this._pool = [];
	
		this._bucketPool.forEach((e) => {
			e.destroy();
		});

		this._bucketPool = [];

		this.player.reset();
		this.player.x = this.app.width * 0.5;
		
		// у спавнера
		this._lastX = this.app.width * 0.5;
	
		this.catched = 0;
		this._stackSize = 0;
		this._freeSize = 0;
		this._drops = 0;
	}

	// --- UI Listener impementing
	setLevel(level: number): void {
	
		this.apiData.current = level;
		this._levelData = GameConfig.levels[level - 1];

		this.fallingSpeed = this._levelData.fallingSpeed;
		
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

	_lastX: number;
	_nextSpawnTime: number = -1;

	spawnObject(ticker: PIXI.Ticker) {

		if(this._nextSpawnTime > 0 && ticker.lastTime < this._nextSpawnTime)
			return;
		
		const progress = (this.catched / this._levelData.catchsToWin);
		const delta =  Math.pow(GameConfig.deltaMult, progress) * this._levelData.spavnDelta;
		this._nextSpawnTime = ticker.lastTime + delta * 1000;

		const safe = this.player.safeArea;
		this._lastX += ( -1 + 2*Math.random() ) * this._levelData.maxDistance;
		
		if(this._lastX > safe.right) {
			
			this._lastX = 2 * safe.right - this._lastX;
	
		} else if( this._lastX < safe.left) {

			this._lastX = 2 * safe.left - this._lastX;
		}

		let pos = {
			x: this._lastX,
			y: 200 + this.spawnOffset
		}

		const type = M2.randKey(this._levelData.probs);
		const obj = this._spawner.createObject(type, pos, 0.75) as any;

		//spafn bad objects sound
		if(obj.type != ObjectType.NORMAL) {
			this.sounds.Play("bad");
		}

		this._pool.push(obj);
		this._freeSize ++;
	}

	onStateEnter(state: GameState) {
		switch(state) {

			case GameState.PRE: {
				this.ui.setOptions({
					showProgress: false,
					progress : 0,
					level : this.apiData.lastOpenedLevel
				});
				this.ui.pushPopup(IPopup.MENU, true, PopupType.START);
				break;
			}

			case GameState.GAME: {
				this.ui.setOptions({
					showProgress: true,
					progress : 0,
					showArrows: M2.mobile,
					level : this.apiData.current,
					progressMax: this._levelData.catchsToWin
				});
				this.ui.progress = 0;
				//this.ui.popup.close();
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
				
				this.ui.pushPopup(IPopup.MENU, true, PopupType.WIN);
				this.player.animPhase(PlayerAnimPhase.WIN, true, 1);
				this.gameState.current = GameState.WIN;

				break;	
			}

			case GameState.WIN: {
				
				setTimeout(()=>{
					if(this.gameState.current !== GameState.WIN)
						return;
					this.ui.hint.open(this.lang.endings)
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
				
				this.ui.pushPopup(IPopup.MENU, true, PopupType.LOSE);
				this.player.animPhase(PlayerAnimPhase.LOSE, true, 1);
				
				setTimeout(()=>{
					if(this.gameState.current !== GameState.LOSE)
						return;
					let three = this.apiData.loosesAtRun % 3 == 0 && this.apiData.loosesAtRun > 0 && this.lang.falling_3times;
					this.ui.hint.open(three ? this.lang.falling_3times : this.lang.falling, this.ui.sadNeoo);
				}, 1000);
				break;	
			}
		}
	}

	stop(): void {
		super.stop();	
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

		this.flush();
		
		//update all gems

		//this.physics.update();

		if(this.gameState.current == GameState.GAME)
		{
			
			this.spawnObject(ticker);
			const delta = this.input.axis.x * GameConfig.playerSpeed * ticker.deltaTime;
			this.player.move(delta);

		}

	}

	flush() {
		for(let i = this._pool.length - 1; i >= 0; i--) {
			if(this._pool[i].y > this.app.height) {
				this._pool.splice(i, 1)[0].destroy();
			}
		}
	}

	animateDrop(next: PIXI.Sprite) {

		//drop gems sound
		this.sounds.Play("crumble");
		next.destroy();
	}

	animateCatch(next: PIXI.Sprite) {

		//catch gems sound
		this.sounds.Play("catch");

		this._pool.splice(this._pool.indexOf(next), 1 );
		this._bucketPool.push(next);
		
		this.bucket.addChild(next);
		next.scale.set(1);
		next.position.set(M2.rand(-40, 40),M2.rand(-50, -80));
		next.rotation = M2.rand(-Math.PI / 6, Math.PI / 6);
	}

	// new test implementation
	onBeginContact(e: any) {

		if(this.gameState.current !== GameState.GAME)
			return;

		const pb = (this.bucket as any).body;		
		if(e.bodyA != pb && e.bodyB != pb)
			return;

		const other = pb == e.bodyA ? e.bodyB : e.bodyA;
		const otherDisp = other.display;

		const cost = GameConfig.costs[otherDisp.type];

		if(cost < 0) {

			this.animateDrop(otherDisp);
	
		} else {
	
			this.animateCatch(otherDisp);
	
		}

		this.catched += cost;

		// мы не должны учитывать первый, так как он летит 
		this.ui.progress = this.catched;

		if(this.catched>= this._levelData.catchsToWin) {
			
			this.gameState.current = GameState.PREWIN;

		} else if(this.catched < 0) {
			
			this.gameState.current = GameState.LOSE;
		}
		
	}

}
