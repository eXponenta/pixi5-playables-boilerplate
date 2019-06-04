import {DisplayObject} from "pixi.js";

export default function() {
	DisplayObject.prototype.replaceWithTransform = function(from: DisplayObject) {
        
        from.updateTransform();
        
        if(from.parent)
            from.parent.addChildAt(this, from.parent.getChildIndex(from));
        
        this.position.copy(from.position);
        this.scale.copy(from.scale);
        this.rotation = from.rotation;
        
        this.updateTransform();
    }
}