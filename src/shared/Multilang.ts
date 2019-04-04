import { Config } from "./Config";
export interface IManifestEntry {
	url: string;
	name: string;
}

export interface ITextBase {
	progress : Array<string>;
	levels : Array<string>;
	hello : Array<string>;
	hello_pc? : Array<string>;
	falling : Array<string>;
	falling_3times? : Array<string>;
	endings?: Array<string>;
}

export class Multilang extends PIXI.utils.EventEmitter {
	manifest: { [name: string]: IManifestEntry };
	langdata: { [key: string]: { [key: string]: string[] } } = {};
	_lang: string;
	loader: PIXI.Loader;

	constructor(manifest: { [name: string]: IManifestEntry }) {
		super();
		this.manifest = manifest;
		this._lang = "en_US";

		this.loader = new PIXI.Loader(Config.BaseResDir);
	}

	preload(lang: string) {
		if(!this.manifest[lang])
			lang = 'en_US';
		
		const l = this.manifest[lang];
		this._lang = lang;
		const base = Config.Translations.substr(0, Config.Translations.lastIndexOf("/"));
		this.loader
			.add(base + "/" + l.url)
			.load()
			.on("load", (l, r) => {
				this.langdata = r.data;
				this.emit("loaded");
			});	
	}

	getTextBase(group : string) : ITextBase {
		let gd = this.langdata[group] || {};
		const any = this.langdata['ANY'] || {};
		return {...any, ...gd} as any;
	}

	map(group: string, text: string, data?: {}): string[] {
		
		const gd = this.getTextBase(group) as any;
		if (!gd) return [text];

		let txt = gd[text],
			arr: string[] = [];

		if (!txt) return [text];

		arr = txt instanceof Array ? txt : [txt];
		data = data || {};

		for (var t in data) {
			for (let i = 0; i < arr.length; i++) {
				arr[i] = arr[i].replace(new RegExp(`{${t}}`, "g"), "" + t);
			}
		}

		return arr;
	}
}
