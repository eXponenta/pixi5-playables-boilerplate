

import { Utils } from './Utils';

export const EXT_FONT_SETTING = {
    dropShadow: true,
	dropShadowAlpha: 0.4,
    dropShadowAngle: 0.4,
    dropShadowBlur: 2,
    dropShadowColor: "#307a37",
    dropShadowDistance: 4,
    stroke: "#307a37",
    strokeThickness: 2
}

export class Progress extends PIXI.Container {

    maxValue: number = 100;
    minValue: number = 0;
    maxLevels: number = 3;
    _progress: number = 0;

    progressHint: string = "Platform: {current}/{from} Done";
    levelHint: string = "Level {index}/{from}";
    
    _backSprite: PIXI.Sprite;
    _progressSprite: PIXI.Sprite;
    _text: PIXI.Text;

    _levelText: PIXI.Text;
    _levelIndex: number;

    constructor(ref: PIXI.Container) {
        super();

        const progress = Utils.findOn<PIXI.Container>(ref, "progress-bar");
        this.addChild(...progress.children);

        const cont = Utils.findOn<TiledOG.TiledContainer>(this, "progress-bar-text")
        this._text = cont.text;

        this._progressSprite = Utils.findOn(this, "slider");
        this.name = progress.name;

        this._levelText = Utils.findOn<TiledOG.TiledContainer>(this, "progress-title-text").text;

        for(let prop in EXT_FONT_SETTING) {
           this._text.style[prop] = (EXT_FONT_SETTING as any)[prop];
           this._levelText.style[prop] = (EXT_FONT_SETTING as any)[prop];
        }

        progress.destroy();
        this.progress = 0;
    }

    set progress(value: number) {
        this._progress = Math.max(this.minValue, Math.min(value, this.maxValue));
        this._progressSprite.scale.x = (this._progress - this.minValue) / (this.maxValue - this.minValue);
        this._text.text = this._formatText();
    }

    get progress(): number {
        return this._progress;
    }

    set levelIndex(i: number) {
        this._levelIndex = i;
        
        let ltext = this.levelHint
            .replace("{current}", ""+i)
            .replace("{total}", ""+this.maxLevels);
        this._levelText.text = ltext;
        
    }
    get levelIndex() {
        return this._levelIndex;
    }
    
    _formatText(): string {
        let text = this.progressHint.replace("{current}", this._progress.toFixed(0));
        text = text.replace("{total}", this.maxValue.toFixed(0));
        return text;
    }
}