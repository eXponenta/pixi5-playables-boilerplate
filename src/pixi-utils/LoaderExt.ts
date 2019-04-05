
export default function() {
	PIXI.Loader.prototype.filter = function(func: (v: PIXI.LoaderResource) => boolean) {
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

	PIXI.Loader.prototype.loadAsync = async function() {
		return new Promise((res, rej) => {
			this.onError.add( (e: any, l : PIXI.Loader, r: PIXI.IResourceDictionary) => rej(e) )
			this.load( (l : PIXI.Loader, r: PIXI.IResourceDictionary) => res(r) );
		});
	} 
}
