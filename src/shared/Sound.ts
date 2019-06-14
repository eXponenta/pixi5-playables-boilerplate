import { Config } from "./Config";
import * as Sounds from "../sounds.json";
import { Howl } from "howler";
import {IResourceDictionary, utils} from "pixi.js";

export interface ISound {
	name: string;
	src: string;
	preload?: boolean;
}

export interface IPlayingParams {
	loop?: boolean;
	volume?: number;
	fade?: boolean;
}

export class SoundGrouper {
	static managers: { [key: string]: SoundManager } = {};

	static createManager(groupId: string, res: IResourceDictionary) {

		const manager = new SoundManager();
		this.managers[groupId] = manager;

		if(!Config.AllowAudio){
			console.warn("Audio disabled in Config.AllowAudio! SoundManager is blank");
			return manager;
		}

		const baseDir = Config.BaseResDir;
		groupId = groupId || "Any"; // empty

		const assets = Sounds.list
			.filter(e => {
				return e.split("/")[1].trim() == groupId;
			})
			.map(e => {
				const name = e.substring(e.lastIndexOf("/") + 1, e.lastIndexOf("."));
				const preload = Sounds.preloads.filter(e => name.indexOf(e) > -1).length > 0;
				return {
					name: name,
					src: `/${Sounds.baseDir}/${e}`.replace(/\/\/+/g, '/'),
					preload: Sounds.preloadAny || preload
				} as ISound;
			});


		manager.preload(assets || [], res);
		return manager;
	}
}

export class SoundManager extends utils.EventEmitter {
	sounds: { [id: string]: Howl } = {};

	private _totalsPreloads = 0;
	private _loaded = 0;
	private _errors = 0;

	preload(manifest: ISound[], res?: IResourceDictionary) {
		for (const etry of manifest) {
			
			let srcOrBlob = etry.src;
			if(res){
				if(!res[etry.src]){
					console.warn("Sound can't found in resources", etry.src);
					continue;
				}
				srcOrBlob = res[etry.src].url;
			}

			const sound = new Howl({
				src:  [srcOrBlob],
				preload: etry.preload
			});

			if (etry.preload) {
				this._totalsPreloads++;
				sound.on("load", () => {
					this._loaded++;
					this.emit("progress", { progress: this._loaded / this._totalsPreloads });
					if (this._totalsPreloads == this._errors + this._loaded) {
						this.emit("load", this);
					}
				});

				sound.on("loaderror", e => {
					this._errors++;
					this.emit("loaderror", e);

					if (this._totalsPreloads == this._errors + this._loaded) {
						this.emit("load", this);
					}
				});
			}

			this.sounds[etry.name] = sound;
		}
	}

	Play(name: string, params: IPlayingParams = {}): Howl {
		const s = this.sounds[name];
		if (s) {
			if (s.state() == "unloaded") {
				s.load();
				s.once("load", () => {
					this.Play(name, params);
				});
				return;
			}

			s.loop(params.loop);
			s.play();
			if (params.fade) {
				s.fade(0, params.volume == undefined ? 1 : params.volume, 1);
			} else {
				s.volume(params.volume == undefined ? 1 : params.volume);
			}
		}
		return s;
	}

	PlayShotAsync(name: string) {
		const how = this.Play(name);
		if(!how)
			return how;
		
		return new Promise(res =>{
			how.once("end", () => res(how));
		})
	}

	Stop(name?: string, fadeout: boolean = false) {
		if (!name) {
			//@ts-ignore
			Object.values(this.sounds).forEach(e => e.stop());
			return;
		}

		if (this.sounds[name]) {
			if (!fadeout) {
				this.sounds[name].stop();
			} else {
				const v = this.sounds[name].volume();
				this.sounds[name].fade(v, 0, 1);
				setTimeout(() => {
					this.sounds[name].stop();
				}, 500);
			}
		}
	}
}
