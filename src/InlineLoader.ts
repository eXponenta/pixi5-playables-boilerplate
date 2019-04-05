export interface IPacket {
	data: string;
	mime: string;
	name: string;
	path: string;
}

export interface BundledResources extends PIXI.LoaderResource {
	pack: IPacket;
}

export type IBundle = { [key: string]: IPacket };

const unescape = (text: string) => {
	return text.replace(/\'/g, "'").replace(/\n/g, "\\n");
};

const trimPath = (path: string) => {
	const slash = path.indexOf("/");
	if (slash <= 1) return path.substr(slash + 1);
	return path;
};

const basePath = (path: string) =>{
	return path.substr(0, path.lastIndexOf("/") + 1);
}

export class InlineLoader extends PIXI.Loader {
	constructor(public bundle: IBundle, baseUrl?: string, concurrency?: number) {
		super(baseUrl, concurrency);
	}

	_unpackParams(...params: any[]) {
        
        let [name, url, options, cb] = params;
		// special case of an array of objects or urls
		if (Array.isArray(name)) {
            return name;
		}

		// if an object is passed instead of params
		if (typeof name === "object") {
			cb = url || name.callback || name.onComplete;
			options = name;
			url = name.url;
			name = name.name || name.key || name.url;
		}

		// case where no name is passed shift all args over by one.
		if (typeof url !== "string") {
			cb = options;
			options = url;
			url = name;
		}

		// now that we shifted make sure we have a proper url.
		if (typeof url !== "string") {
			throw new Error("No url passed to add resource to loader.");
		}

		// options are optional so people might pass a function and no options
		if (typeof options === "function") {
			cb = options;
			options = null;
        }
        return [{
            name, url, options, callback : cb
        }]
    }
    
    _resolve(entry: {name: string, url: string, options: any, callback:any}){
        
        if(!entry)
            return;

        const parent: PIXI.LoaderResource = (entry.options || {}).parentResource;
        if(!parent)
            return entry;
		const pack = parent.metadata as IPacket;
		if(!pack || !pack.data)
			return entry;
		
		entry.url = basePath(pack.path) + entry.url;
		return entry;
    }

	add(...params: any[]) {

        const entry = this._unpackParams(...params).map(this._resolve);

		for (let e of entry) {
			const path = trimPath(e.url);
			const pack = this.bundle[path];
			if (!pack) {
				console.log("Missing res in bundle", e);
				continue;
			}
			e.options = {...e.options, metadata : pack};
			e.url = pack.data;

			super.add(e.name, e.url, e.options, e.callback);
		}

		return this;
	}
}
