import { Assets } from './Assets';
import { M2 } from '../shared/M2';
import { VARIANTS } from './GameConfig';

export class ObjectBuilder {
    
    _tex: PIXI.ITextureDictionary;
    _parent: PIXI.Container;

    constructor(res: PIXI.IResourceDictionary, objectsParent: PIXI.Container){
        this._tex = res[Assets.Assets["game-atlas"].name].textures;
        this._parent = objectsParent;
    }

    createObject(type: string, pos?: {x: number, y: number}, scale: number = 1) {

        let tex = this.getRandomTexture(type);
        
        const obj = new PIXI.Sprite(tex);
        obj.name = type;
        obj.anchor.set(0.5);
        obj.scale.set(scale);
        
        (obj as any).type = type;

        if(pos) {
            obj.x = pos.x;
            obj.y = pos.y;
        }

        if(this._parent) {
            this._parent.addChild(obj);
        }

        return obj;
    } 

    getRandomTexture(type: string) {
        const varvr = VARIANTS[type];
        let select = type;
        if(varvr){
            const prefex = 1 + M2.randint(varvr);
            select += ' ' + prefex;
        }
        select += '.png';
        return this._tex[select];
    }
}