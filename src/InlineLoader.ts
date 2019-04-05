import Resources from "./inline/resources";

export interface IPacket {
	data: string;
	mime: string;
	name: string;
	path: string;
}

export interface BundledResources extends PIXI.LoaderResource{
    pack: IPacket
}

export type IBundle = { [key: string]: IPacket };

const unescape = (text: string) => {
	return text.replace(/\'/g, "'").replace(/\n/g, "\\n");
};

const sheetParser = {
    use: async (item: IPacket, res: IBundle) => {
        const image_name = (item.data as any).meta.image;
        let path = item.path;
        path = path.substr(0, path.lastIndexOf("/") + 1) + image_name;
        
        const data = {
			name: item.name,
            data: JSON.parse(unescape(item.data)),
            pack: item,
            type: PIXI.LoaderResource.TYPE.JSON
		} as BundledResources;

        data.children = [
            await textureParser.use(res[path], res)
        ];

        return data;
    },

    post: async (item: BundledResources, res: PIXI.IResourceDictionary) => {
        
        const image_name = (item.data as any).meta.image;
        let path = item.pack.path;
        path = path.substr(0, path.lastIndexOf("/") + 1) + image_name;
        const tex = res[path].texture.baseTexture;

        const sheet = new PIXI.Spritesheet(tex, item.data);
        await new Promise((r)=>{
            sheet.parse((e)=>r());
        });

        item.spritesheet = sheet;
        item.textures = sheet.textures;
        return item;
    }
}

const spineParser = {
    use: async (item: IPacket, res: IBundle) => {
        const atlasRes = res[item.path.replace(".json", ".atlas")];
        const texture = res[item.path.replace(".json", ".png")];
    },

	post: async (item: BundledResources, res: PIXI.IResourceDictionary) => {

        const path = item.pack.path;
        const atlasRes = res[path.replace(".json", ".atlas")];
		const texture = res[path.replace(".json", ".png")].texture;
		
		if (!texture) return;

		const spineAtlas = new PIXI.spine.core.TextureAtlas(atlasRes.data, (path, cb) => {
			//elem.onload =()=>{
			cb(texture.baseTexture);
			//}
		});

		const spineJsonParser = new PIXI.spine.core.SkeletonJson(new PIXI.spine.core.AtlasAttachmentLoader(spineAtlas));
        const spineData = spineJsonParser.readSkeletonData(item.data);
        
        item.spineData = spineData;
        atlasRes.spineAtlas = spineAtlas;
	}
};

const imageAsPromise = (data: string) => {
	const image = new Image();

	return new Promise<HTMLImageElement>((res, rej) => {
		image.onload = () => res(image);
		image.onerror = () => rej(image);

		image.src = data;
	});
};

const textureParser = {
	use: async (item: IPacket, bundle: IBundle) => {
		const image = await imageAsPromise(item.data);
		return {
			texture: PIXI.Texture.from(image),
			name: item.name,
            isDataUrl: true,
            pack: item
		} as BundledResources;
	}
};

const dataParser = {
	use: async (item: IPacket, bundle: IBundle) =>  {
        let data = item.data;
        let json : any;
		if (item.mime == "application/json") {
            json = JSON.parse(unescape(data));

            //spine
            
            //spine
            if(json.bones) {
                return spineParser.use(item, bundle);
            }
            
            //sheet
            if(json.frames) {
                await sheetParser.use(item, bundle);
            }   
		}

		return {
			name: item.name,
            data: json || data,
            pack: item,
            type: json ? PIXI.LoaderResource.TYPE.JSON : PIXI.LoaderResource.TYPE.TEXT
		} as BundledResources;
	}
};

const parsers = {
    atlas: dataParser,
	json: dataParser,
	png: textureParser,
	jpeg: textureParser,
	jpg: textureParser,
};

const trimPath = (path: string) =>{    
    const slash = path.indexOf("/");
    if(slash <= 1)
        return path.substr(slash + 1);
    return path;
}

export class InlinedResources {
	static resources: PIXI.IResourceDictionary = {};

	public static async parse(aliases?: Array<{name:string, url: string}>) {
        const all = Resources as IBundle;
        const interable = aliases ? aliases : Object.values(all).map( e => ({name : e.path, url: e.path}));

		for (let key of interable) {
            
            //already exist
            if(this.resources[key.name])
                continue;

            const trimmed = trimPath(key.url);
			const pack = all[trimmed];
			const ext = pack.path.split(".")[1];
			const parser = (parsers as any)[ext];
			if (!parser) {
				console.warn("InlineResource", `Parser missing for ext '${ext}', file: ${pack.path}`);
				continue;
            }
            
            const res = await parser.use(pack, all) as BundledResources;
            this.resources[trimmed] = this.resources[key.name] = res;
            res.children.forEach((r: any)=>{
                this.resources[r.pack.path] = r;
            })
        }

        for(let key in this.resources) {
            const elem = this.resources[key] as BundledResources;

            //spine
            if(elem.data && (elem.data as any).bones) {
                spineParser.post(elem, this.resources);
            }

            if(elem.data && (elem.data as any).frames) {
                await sheetParser.post(elem, this.resources);
            }
        }

        return this.resources;
	}
}
