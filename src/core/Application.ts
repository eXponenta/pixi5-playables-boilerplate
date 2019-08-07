import { utils, Container, Ticker, Loader, Renderer} from 'pixi.js';

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

export class Application extends utils.EventEmitter {

    public renderer: Renderer;
    public ticker: Ticker = new Ticker();
    public stage: Container = new Container();
    public loader: Loader = new Loader();
  
    constructor(options: ApplicationOptions) {
        super();
        this.renderer = new Renderer(options);
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

    destory(params = {children : false}) {
        this.stage.destroy(params);
        this.ticker.destroy();
        this.renderer.destroy(true);
    }
}