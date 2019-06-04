import {utils} from "pixi.js"
export default function() {
    utils.EventEmitter.prototype.onceAsynce = async function(event: string) : Promise<any> {
        return new Promise((res)=>{
            this.once(event, res, this);
        })
    }
}