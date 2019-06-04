import { IScene } from "../core/IScene";
import { StateBech } from "../core/StateBech";
import { App } from "..";
import { Assets } from "./Assets";
import { Tween } from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";
import {tiled as TILED } from "pixi.js";

function JumpEase(steps = 2, fadeout = true) {
	return (k: number) => {
		return Math.sin(Math.PI * steps * k * 2) * (1 - k * ~~fadeout);
	};
}

interface StairPairs {
    btn : PIXI.Sprite;
    bg: PIXI.Sprite;
}
class Stair extends PIXI.Sprite {
    initialY : number = 0;
}

export class Playable implements IScene {
	kind: "scene";

	stage: PIXI.Container = new PIXI.Container();
	loader: PIXI.Loader;
	app: App;
	gameState: StateBech<any>;
	hammer: PIXI.Sprite;
    continue: PIXI.Sprite;
    menu : PIXI.Container;
    ok: PIXI.Sprite;
    stairButtons: StairPairs[] = [];
    stairs : Stair[] = [];
    oldStair: Stair;

	constructor(app: App) {
		this.app = app;
	}

	preload(loader?: PIXI.Loader): PIXI.Loader {
		this.loader = loader;
		const assets = Object.values(Assets.Assets).map(e => {
			e.url = Assets.BaseDir + e.url;
			return e;
		});
		loader.add(assets);
		return loader;
	}

	init(): void {
		const l = this.loader;
		const a = Assets.Assets;
		const sp = l.resources[a.atlass.name].spritesheet;
		sp.textures["bg.png"] = l.resources[a.bg.name].texture;

		const stage = TILED.CreateStage(sp, l.resources[a.map.name].data);
		this.stage = stage;

		this.hammer = this.stage.getChildByPath<PIXI.Sprite>("Main/hammer-btn");
        this.continue = this.stage.getChildByPath<PIXI.Sprite>("Top/cont-btn");
        this.continue.on("pointerdown", ()=>{
            alert("You clicked a button!!!!\n");
        })
        this.menu = this.stage.getChildByPath<PIXI.Container>("Menu");

        this.ok = this.menu.getChildByPath<PIXI.Sprite>("ok-btn");
        this.ok.x += this.ok.width * 0.5;
        this.ok.anchor.x = 0.5;
        this.ok.visible = false;
        this.ok.on("pointerdown", this.compliteAnim, this);
         
        //--- Stair buttons
         for(let i = 0; i < 3; i ++ ) {
            const btn = this.menu.getChildByPath<PIXI.Sprite>(`stair-${i}-btn`);
            const bg = this.menu.getChildByPath<PIXI.Sprite>(`stair-${i}-btn:selected`);
            btn.x += btn.width * 0.5;
            btn.anchor.x = 0.5;
            const index = i;
            btn.on("pointerdown", ()=>{
                this.selectStair(index);
            })
            this.stairButtons.push({btn, bg});
        }

        //--- Stair

        this.oldStair = this.stage.getChildByPath<Stair>("Main/stair-old");
        this.oldStair.initialY = this.oldStair.y;

        for(let i = 0; i < 3; i++) {
            this.stairs[i] = this.stage.getChildByPath<Stair>(`Main/stair-new-${i}`);
            this.stairs[i].initialY = this.stairs[i].y;
        }

	}

	start(): void {
        
        const ht = this.hammerAnim();
        this.contAnim();
        
        this.hammer.on("pointerdown", ()=>{
            ht.stop();
            new Tween(this.hammer).to({alpha: 0}, 100).onComplete(()=>{
                this.hammer.visible = false;
            }).start();
            this.menuAnim();
        });       
        
    }
    
    private selectStair(index: number) {
        this.stairButtons.forEach((p, k)=>{
            p.bg.visible = k === index;
        });
        if(!this.ok.visible){
            this.ok.visible = true;
            this.ok.alpha = 0;
            new Tween(this.ok).to({alpha: 1}, 100).start();
        }
        new Tween(this.ok).to({x : this.stairButtons[index].btn.x}, 100).start();
        
        const ns = this.stairs[index];
        ns.visible = true;
        ns.alpha = 0;
        ns.y = ns.initialY -  100;
        const next = 
                new Tween(ns)
                .to({alpha: 1, y : ns.initialY}, 300);

        new Tween(this.oldStair)
            .to({alpha: 0, y : this.oldStair.y - 100}, 300)
            .chain(next)
            .onComplete(()=>{
                this.oldStair = ns;
            })
            .start();
    }

    private compliteAnim(){
        
        const final = this.stage.getChildByPath<PIXI.Container>("Final");
        final.visible = true;
        final.alpha = 0;
        const ovtween = new Tween(final).to({
            alpha: 1
        }, 300)
        .delay(300);
        
        const oldanim = new Tween(this.oldStair).to({y : this.oldStair.initialY + 100}, 100);
        return new Tween(this.menu).to({y: -100, alpha: 0}, 100)
                    .chain(oldanim,  ovtween)
                    .start();
    }

    private menuAnim() {
        this.menu.visible = true;
        this.menu.y -= 100;
        new Tween(this.menu).to({y : 0}, 100).start();
    }

	private contAnim() {
		this.continue.x += this.continue.width * 0.5;
		this.continue.y -= this.continue.height * 0.5;
		this.continue.anchor.set(0.5);

		const se = JumpEase(1, false);
		const re = JumpEase(2, false);
		const tween = new Tween({val: 0})
			.to(
				{
					val: 1
				},
				2000
			)
			.onUpdate(p => {
				this.continue.scale.set(1 + se(p.val) * 0.025);
				this.continue.angle = 1 * re(p.val);
			})
			.repeat(Infinity)
			.start();
		return tween;
	}

	private hammerAnim() {
		const initial = this.hammer.y;
		let tween = new Tween(this.hammer);

		const hammerJump = new Tween(this.hammer)
			.to(
				{
					y: initial - 30
				},
				500
			)
			.easing(JumpEase())
			.repeat(Infinity)
			.delay(1000);

		setTimeout(() => {
			this.hammer.visible = true;
			this.hammer.alpha = 0;
			tween
				.to(
					{
						alpha: 1
					},
					500
				)
				.chain(hammerJump)
				.start();
		}, 3000);
		return tween;
	}
	resume(soft: boolean): void {}

	pause(soft: boolean): void {}

	stop(): void {}

	update(ticker: PIXI.ticker.Ticker): void {}
}
