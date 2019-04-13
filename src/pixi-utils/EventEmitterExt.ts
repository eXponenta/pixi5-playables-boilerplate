export default function() {
    PIXI.utils.EventEmitter.prototype.onceAsynce = async function(event: string) : Promise<any> {
        return new Promise((res)=>{
            this.once(event, res, this);
        })
    }
}