export class Utils {
	static LightCopy<T extends PIXI.DisplayObject>(from: PIXI.DisplayObject) {
        
        let obj
        
        if(from instanceof PIXI.Sprite){
            obj = new PIXI.Sprite(from.texture);
            obj.tint = from.tint;
            obj.anchor = from.anchor;    
        }
        else if(from instanceof PIXI.Container) {
            obj = new PIXI.Container()
        }
        
        this._mapTransform(from, obj);

        return (obj as any) as T;
	}

	private static _mapTransform(from: PIXI.DisplayObject, to: PIXI.DisplayObject) {
        
        if (from.parent) {
			from.parent.addChild(to);
        }

        to.pivot.copyFrom(from.pivot);
        to.position.copyFrom(from.position);
		to.scale.copyFrom(from.scale);
		to.rotation = from.rotation;

		to.updateTransform();
    }
    
    public static findOn<T extends PIXI.DisplayObject>(container:PIXI.Container, path: string) {

        if (!(container instanceof PIXI.Container) || container.children.length == 0)
            return undefined;
        
        let result: PIXI.DisplayObject | undefined = container;
    
        const split = path.split("/");
        const isIndex =  new RegExp("(?:\{{0})-?\d+(?=\})");
    
        for (const p of split) {
            if (result == undefined || !(result instanceof PIXI.Container)) {
                result = undefined;
                break;
            }
    
            if (p.trim().length == 0)
                continue;
    
            // find by index
            const mathes = p.match(isIndex);
            if (mathes) {
                let index = parseInt(mathes[0]);
                if (index < 0) {
                    index += result.children.length;
                }
                if (index >= result.children.length) {
                    result = undefined;
                } else {
                    result = result.children[index];
                }
                continue;
            }
    
            //default by name
            result = (result as PIXI.Container).getChildByName(p);
        }
    
        return result as T;
    }
}
