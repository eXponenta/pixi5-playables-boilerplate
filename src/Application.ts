
export interface ApplicationOptions {
        autoStart?: boolean;
        width?: number;
        height?: number;
        view?: HTMLCanvasElement;
        transparent?: boolean;
        autoDensity?: boolean;
        antialias?: boolean;
        preserveDrawingBuffer?: boolean;
        resolution?: number;
        backgroundColor?: number;
        clearBeforeRender?: boolean;
        forceFXAA?: boolean;
        powerPreference?: string;
        resizeTo?: Window | HTMLElement;
}

export class Application extends PIXI.utils.EventEmitter {

    public renderer: PIXI.Renderer;
    public ticker: PIXI.Ticker = new PIXI.Ticker();
    public stage: PIXI.Container = new PIXI.Container();
    public loader: PIXI.Loader = new PIXI.Loader();
  
    constructor(options: ApplicationOptions) {
        super();
        this.renderer = new PIXI.Renderer(options);
        this.renderer.plugins.interaction.moveWhenInside = true;

        if(options.autoStart)
            this.ticker.start()
    }

    get view(): HTMLCanvasElement {
        return this.renderer.view;
    }

    get width() {
        return this.size.width;
    }
    
    get height() {
        return this.size.height;
    }

    get size() {
        return this.renderer.screen;
    }

    render() {
        this.renderer.render(this.stage);
    }

    start(params?: any ) {
        this.ticker.start();
    }

    stop() {
        this.ticker.stop();
    }

    destory(params = {children:false}) {
        this.stage.destroy(params);
        this.ticker.destroy();
        this.renderer.destroy(true);
    }
}