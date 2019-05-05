import { decode85 } from "./Base85encoder";

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
const MIME = {
	JSON: "application/json",
	TEXT: "plain/text"
};

//path pixi loader
const RAW_TEXT_TYPE = 666;

//not work yet
const USE_BLOB_FOR_85 = false;

//@ts-ignore
const _orig = PIXI.LoaderResource.prototype._loadXhr;

//@ts-ignore
PIXI.LoaderResource.prototype._loadXhr = function() {
	const type = this._determineXhrType();
	if (this.loadType == RAW_TEXT_TYPE) {
		let text: string = this.metadata.data || this.url;
		text = text.replace(/data:(.*?)\,/g, "");

		if (type == "json") {
			this.data = JSON.parse(unescape(text));
			this.type = PIXI.LoaderResource.TYPE.JSON;
		} else {
			this.type = PIXI.LoaderResource.TYPE.TEXT;
			this.data = text;
		}

		return this.complete();
	}
	_orig.call(this);
};

const unescape = (text: string) => {
	return text.replace(/\'/g, "'").replace(/\n/g, "\\n");
};

const trimPath = (path: string) => {
	const slash = path.indexOf("/");
	if (slash <= 1) return path.substr(slash + 1);
	return path;
};

const basePath = (path: string) => {
	return path.substr(0, path.lastIndexOf("/") + 1);
};

export class InlineLoader extends PIXI.Loader {
	constructor(public bundle: IBundle, baseUrl?: string, concurrency?: number) {
		super(baseUrl, concurrency);
	}

	_b85tob64(input: string) {
		const start = input.indexOf(";") + 1;
		const s = input.substr(start, 6).trim();
		if (s !== "base85") return input;
		
		const b64 = decode85(input, start + 7, USE_BLOB_FOR_85);
		if(USE_BLOB_FOR_85)
			return b64;
		return input.substr(0, start) + "base64," + b64;
	}

	_unpackParams(...params: any[]) {
		let [name, url, options, cb] = params;
		// special case of an array of objects or urls
		if (Array.isArray(name)) {
			if (typeof name[0] == "string") return name.map(e => ({ name: e, url: e }));
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
		return [
			{
				name,
				url: url || name,
				options,
				callback: cb
			}
		];
	}

	_resolveSpine(entry: any) {
		if (!entry.options || !entry.options.metadata || !entry.options.metadata.data) return;
		const pack = entry.options.metadata as IPacket;
		if (pack.mime != "application/json") return;

		const text = pack.data.replace("data:application/json;,", "");
		const json = JSON.parse(unescape(text));
		if (!json.bones) return;

		const path = pack.path;
		const atlasPath = path.replace(".json", ".atlas");
		const imagePath = path.replace(".json", ".png");

		const imageRes = this.bundle[imagePath].data;
		const atlasRes = this.bundle[atlasPath].data.replace("data:text/plain;,", "");

		const image = new Image();
		image.src = this._b85tob64(imageRes);
		entry.options.metadata.image = PIXI.BaseTexture.from(image);
		entry.options.metadata.atlasRawData = atlasRes;
	}

	_resolve(entry: { name: string; url: string; options: any; callback: any }) {
		if (!entry) return;

		//spine
		//this._resolveSpine(entry);

		const parent: PIXI.LoaderResource = (entry.options || {}).parentResource;
		if (!parent) return entry;

		const pack = parent.metadata as IPacket;
		if (!pack || !pack.data) return entry;

		// не требует разрешения url, уже валидно
		if (entry.url.indexOf("data:") > -1) return entry;

		entry.url = basePath(pack.path) + entry.url;

		return entry;
	}

	add(...params: any[]) {
		const entry = this._unpackParams(...params).map(e => this._resolve(e));

		for (let e of entry) {
			if (e.url.indexOf("data:") == -1) {
				const path = trimPath(e.url);
				const pack = this.bundle[path];

				if (!pack) {
					console.log("Missing res in bundle", e);
					continue;
				}

				e.url = this._b85tob64(pack.data);
				e.options = { ...e.options, metadata: pack };
				if (pack.mime == MIME.JSON || pack.mime == MIME.TEXT) {
					e.options.loadType = RAW_TEXT_TYPE;
				}
			}

			this._resolveSpine(e);
			super.add(e.name, e.url, e.options, e.callback);
		}

		return this;
	}
}
