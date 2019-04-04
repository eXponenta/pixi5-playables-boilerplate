import { Utils } from './Utils';
export class Button extends PIXI.Container {
    
    _disabled: boolean;

    _disabledSprite: PIXI.Sprite;
    _mainSprite: PIXI.Sprite;
    _text: PIXI.Text;

    constructor(main: PIXI.Sprite, disabled?: PIXI.Sprite, text?: TiledOG.TiledContainer) {
        super();
        if(!main) return;
         
        [main, disabled, text].forEach((e)=>{
            if(e) e.interactive = e.buttonMode = false;
        });

        this.interactive = this.buttonMode = true;

        this._mainSprite = main;
        this._disabledSprite = disabled; 
        this._text = text ? text.text : undefined;
        this._disabled = false;

        this.addChild(...[main, disabled, text].filter((e) => e));
        const bounds  = this.getLocalBounds();
        this.children.forEach(e=>{
            e.x -= bounds.x;
            e.y -= bounds.y;
        });
        this.x = bounds.x;
        this.y = bounds.y;
        
        this.disabled = false;

        this.reset();
    }

    on(event: "b-click" | any, func: (d: any) => void, ctx?: any ) {
        super.on(event, func, ctx);
        return this;
    }
    
    clicked(e: any) {
        this.emit("b-click", this);
    }

    set disabled(v: boolean) {
        this._disabled = v;
        this.interactive = this.buttonMode = !v;

        this._mainSprite.visible = !v;
        if(this._disabledSprite)
            this._disabledSprite.visible = v;
    }

    get disabled() {
        return this._disabled;
    }

    reset() {
        this.removeAllListeners();

        this.on("click", this.clicked, this);
        this.on("tap", this.clicked, this);
    }
    
}