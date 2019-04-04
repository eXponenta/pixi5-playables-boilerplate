export default function() {
	PIXI.Container.prototype.getChildByPath = function<T extends PIXI.DisplayObject>(path: string) {
		if (!(this instanceof PIXI.Container) || this.children.length == 0) return undefined;

		let result: PIXI.DisplayObject | undefined = this;

		const split = path.split("/");
		const isIndex = new RegExp("(?:{{0})-?d+(?=})");

		for (const p of split) {
			if (result == undefined || !(result instanceof PIXI.Container)) {
				result = undefined;
				break;
			}

			if (p.trim().length == 0) continue;

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
	
	PIXI.Container.prototype.addGlobalChild = function(...child: PIXI.DisplayObject[]) {
		//TODO: better to convert global position to current matrix
		this.transform.updateLocalTransform();
		const loc = new PIXI.Matrix();
		const invert = this.transform.localTransform.clone().invert();
		for (let i = 0; i < child.length; i++) {

			const newChild = child[i];
			newChild.transform.updateLocalTransform();
			loc.copyFrom(invert);
			loc.append(newChild.localTransform);
			child[i].transform.setFromMatrix(loc);
		}

		return this.addChild(...child);
	}
}
