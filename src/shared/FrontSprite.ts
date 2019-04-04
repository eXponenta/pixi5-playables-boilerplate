export class FrontSprite extends PIXI.Sprite {
	rememberWorldID = -1;
	tempTransform = new PIXI.Matrix();

	constructor(public proto?: PIXI.Sprite) {
		super(proto ? proto.texture : PIXI.Texture.EMPTY);
	}

	updateTransform() {
		const proto = this.proto;
		const transform = (proto.transform as any);

		if (this.rememberWorldID !== transform._worldID) {
			this.rememberWorldID = transform._worldID;

			this.anchor.copyFrom(proto.anchor);

			const loc = this.tempTransform;

			loc.copyFrom(this.parent.transform.worldTransform);
			loc.invert();
			loc.append(transform.worldTransform);
			this.transform.setFromMatrix(loc);
		}

		super.updateTransform();
	}
}
