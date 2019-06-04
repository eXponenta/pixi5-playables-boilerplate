import {Loader, LoaderResource, IResourceDictionary} from "pixi.js";

export default function() {
	Loader.prototype.filter = function(func: (v: LoaderResource) => boolean) {
		if (!func) return [];

		const ress = this.resources;

		let ret: Array<LoaderResource> = [];

		let keys = Object.keys(ress);

		keys.forEach((k: string) => {
			if (func(ress[k])) {
				ret.push(ress[k]);
			}
		});

		return ret;
	};

	Loader.prototype.loadAsync = async function() {
		return new Promise((res, rej) => {
			this.onError.add( (e: any, l : Loader, r: IResourceDictionary) => rej(e) )
			this.load( (l : Loader, r: IResourceDictionary) => res(r) );
		});
	} 
}
