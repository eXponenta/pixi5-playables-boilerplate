export class M2 {
	static randint(a: number, b?: number) {
		if (b == undefined) {
			return Math.floor(M2.rand(a));
		}
		else {
			return Math.floor(M2.rand(b - a)) + a;
		}
	}
	static rand(a: number, b?: number) {
		if (b == undefined) {
			return Math.random() * a;
		}
		else {
			return Math.random() * (b - a) + a;
		}
	}

	static get mobile() {
		return (PIXI.utils.isMobile as any).any;
	}

	static randKey(pair: {[key:string]:number}, def?: string): string {		
		const probs = pair;

		// если нет объекта с наивысшей вероятностью, то нужно нормализовать и найти самый вероятный

		let scale = 1;
		let max = 0;
		if(!def) {
			scale = 0;
			for(let key in probs){
				
				if(max < probs[key]) {
					max = probs[key];
					def = key;
				}
				
				scale += probs[key];
			}	
		}

		let p = Math.random() * scale;

		for (let key in probs) {
			if (p < probs[key]) {
				return key as string;
			}
			p -= probs[key];
		}

		return def;
	}

	static AngleDist(a : number, b : number, deg: boolean = true) {
		const max = deg ? 360 : Math.PI * 2;
		const da = (b - a) % max;
		return 2 * da % max - da;
	}

	static clamp(val : number, left : number = 0, right: number = 1) {
		return Math.max(left, Math.min(right, val));
	}

	static Delay(ms: number) {
		return new Promise(res => setTimeout(res, ms));
	}
}
