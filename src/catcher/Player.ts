
import { Assets } from "./Assets";

export enum PlayerAnimPhase {
	NONE = "none",
	JUMP = "Jump",
	LOSE = "Lose",
	WIN = "Win",
	DAMAGE = "Damage",
	WALK = "Walk"
}

const SIZE = {
	width: 124,
	height: 190
};

export class Player extends PIXI.Container {

	anim: PIXI.spine.Spine;
	startHeight: number;
	lockMovement: boolean;
	safeArea: PIXI.Rectangle = new PIXI.Rectangle(0,0, 100, 100);

	_lastAnim: PlayerAnimPhase;

	constructor(res: PIXI.IResourceDictionary) {
		super();

		this.lockMovement = false;

		this._lastAnim = PlayerAnimPhase.NONE;

		const animData = res[Assets.Assets.player.name].spineData;
		const anim = new PIXI.spine.Spine(animData);
		//anim.position.set(SIZE.width * 0.5, SIZE.height);

		anim.state.timeScale = 1;
		this.anim = anim;

		this.addChild(anim);

		this.startHeight = this.height;
	}

	getSlotSprite(name: string) {
		
		const slot = this.anim.skeleton.findSlot(name);
		if(slot) {
			return slot.currentSprite;
		}
		
		return undefined;

	}

	set face(v: number) {
		if (v > 0) {
			this.anim.scale.x = 1;
		} else if (v < 0) {
			this.anim.scale.x = -1;
		}
	}

	reset() {
		this.animPhase(PlayerAnimPhase.NONE);
		this.lockMovement = false;
	}

	animPhase(phase: PlayerAnimPhase, loop: boolean = false, scale: number = 1) {

		if(this._lastAnim == phase)
			return;
		
		if (phase == PlayerAnimPhase.NONE) {
			this.anim.state.setEmptyAnimation(0, 0.75);
		} else {
			const entry = this.anim.state.setAnimation(0, phase, loop);
			entry.mixDuration = 0.5;
		}

		this.anim.state.timeScale = scale;
		this._lastAnim = phase;
	}

	update() {}

	damaged() {
		this.lockMovement = true;
		this.animPhase(PlayerAnimPhase.DAMAGE, false);
	}

	move(delta: number) {
		//clamping!
		this.face = -delta;
		const next = this.x + delta;
		if (Math.abs(delta) < 1 || next < this.safeArea.left || next > this.safeArea.right) {
			
			this.animPhase(PlayerAnimPhase.NONE, true);

		} else {
			
			this.animPhase(PlayerAnimPhase.WALK, true, 4);

		}
		
		this.x = Math.max( this.safeArea.left , Math.min( this.safeArea.right , next));
		if (this.lockMovement) return;
	}
}
