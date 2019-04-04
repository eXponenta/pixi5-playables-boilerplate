export default function() {
	PIXI.Loader.prototype.filter = function(func: (v: PIXI.loaders.Resource) => boolean) {
		if (!func) return [];

		const ress = this.resources;

		let ret: Array<PIXI.LoaderResource> = [];

		let keys = Object.keys(ress);

		keys.forEach((k: string) => {
			if (func(ress[k])) {
				ret.push(ress[k]);
			}
		});

		return ret;
	};
}
