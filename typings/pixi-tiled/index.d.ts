/// <reference types="pixi.js" />
declare namespace TiledOG.ContainerBuilder {
    function ApplyMeta(meta: any, target: PIXI.Container): void;
    function Build(meta: any): PIXI.DisplayObject;
}
declare module PIXI {
    interface Container {
        types?: ArrayLike<string>;
        parentGroup?: string;
        tiledId?: number;
    }
    var tiled: typeof TiledOG;
}
declare namespace TiledOG.SpriteBuilder {
    function Build(meta: any): PIXI.DisplayObject;
}
declare namespace TiledOG.TextBuilder {
    function Build(meta: any): PIXI.DisplayObject;
}
declare namespace Tiled {
    class MultiSpritesheet {
        sheets: PIXI.Spritesheet[];
        images: {
            [name: string]: PIXI.Texture;
        };
        constructor(sheets?: PIXI.Spritesheet[]);
        add(sheet?: PIXI.Spritesheet): void;
        addTexture(tex: PIXI.Texture, id: string): void;
        readonly textures: {
            [name: string]: PIXI.Texture;
        };
        readonly animations: {
            [name: string]: PIXI.Texture[];
        };
    }
}
declare namespace TiledOG {
    class TiledContainer extends PIXI.Container {
        layerHeight: number;
        layerWidth: number;
        text?: PIXI.Text;
        primitive?: TiledOG.Primitives.ITiledPtimitive;
        tiledId?: number;
    }
}
declare module PIXI.loaders {
    interface Resource {
        stage?: TiledOG.TiledContainer;
    }
}
declare namespace TiledOG {
    function CreateStage(res: PIXI.loaders.Resource | PIXI.Spritesheet | Tiled.MultiSpritesheet, loader: any): TiledOG.TiledContainer | undefined;
    class Parser {
        consructor(): void;
        Parse(res: PIXI.loaders.Resource, next: Function): void;
    }
}
declare namespace TiledOG.Primitives {
    interface ITiledPtimitive {
        name: string;
        types: Array<string>;
        visible: boolean;
    }
    class TiledRect extends PIXI.Rectangle implements ITiledPtimitive {
        name: string;
        types: string[];
        visible: boolean;
    }
    class TiledPoint extends PIXI.Point implements ITiledPtimitive {
        name: string;
        types: string[];
        visible: boolean;
        constructor(x?: number, y?: number);
    }
    class TiledPolygon extends PIXI.Polygon implements ITiledPtimitive {
        name: string;
        types: string[];
        visible: boolean;
        private _x;
        private _y;
        constructor(points: PIXI.Point[]);
        x: number;
        y: number;
        getBounds(): PIXI.Rectangle;
        width: number;
        height: number;
    }
    class TiledPolypine implements ITiledPtimitive {
        name: string;
        types: string[];
        visible: boolean;
        points: Array<PIXI.Point>;
        constructor(points: Array<PIXI.Point>);
    }
    class TiledEllipse extends PIXI.Ellipse implements ITiledPtimitive {
        name: string;
        types: string[];
        visible: boolean;
        constructor(x?: number, y?: number, hw?: number, hh?: number);
    }
    function BuildPrimitive(meta: any): ITiledPtimitive | undefined;
}
declare namespace Tiled.Utils {
    function HexStringToHexInt(value: string | number): number;
    function HexStringToAlpha(value: string | number): number;
    enum TiledObjectType {
        DEFAULT = 0,
        POINT = 1,
        POLYGON = 2,
        POLYLINE = 3,
        ELLIPSE = 4,
        TEXT = 5,
        IMAGE = 6
    }
    function Objectype(meta: any): TiledObjectType;
}
declare namespace TiledOG {
    let Config: ITiledProps;
    let Builders: Array<Function>;
    interface ITiledProps {
        defSpriteAnchor?: PIXI.Point;
        debugContainers?: boolean;
        usePixiDisplay?: boolean;
        roundFontAlpha?: boolean;
    }
    function InjectToPixi(props?: ITiledProps | undefined): void;
}
