
declare module PIXI {
	export interface Container {
        getChildByPath<T extends PIXI.DisplayObject>(query: string): T | undefined;
        addGlobalChild(...child: PIXI.DisplayObject[]): PIXI.DisplayObject[]; 
	}
}

declare module PIXI {
	export interface DisplayObject {
		replaceWithTransform(from:DisplayObject): void
	}
}

declare module PIXI {
	export interface Loader {
		filter(func: (v: PIXI.LoaderResource) => boolean): PIXI.LoaderResource[];
		loadAsync() : Promise<PIXI.IResourceDictionary>;
	}
}
