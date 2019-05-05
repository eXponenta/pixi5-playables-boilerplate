const TUPLE_BITS = [24, 16, 8, 0];
const POW_85_4 = [85 **4 , 85 ** 3, 85 * 85, 85, 1];

//@ts-ignore
const z85chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#";
const charToByte85 = Array.from(z85chars).reduce((acc, e, index)=>{
	acc[e.charCodeAt(0)] = index;
	return acc;
}, []);

const byte2Blob = (array : Uint8Array) => {
	const b = new Blob([array]);
	return URL.createObjectURL(b);
}

const byte2Base64 = (array: Uint8Array) => {
	const step = 1000;
	const size = array.length;
	let res: string[] = []
	for(let i = 0; i < size; i += step) {
		const sub = array.subarray(i, i + step );
		res.push(String.fromCharCode.apply(null, sub));
	}

	return btoa(res.join(""));
}

export function decode85(text: string, skip = 0, blob = false) {

	const size = Math.ceil( (text.length - skip) * 4 / 5);
	let output = new Uint8Array(size);
	let arrayIndex = 0;

	const pushPart = () => {
		for (let i = 0; i < tupleIndex - 1; i++) {
			output[arrayIndex ++ ] = ((tuple >> TUPLE_BITS[i]) & 0x00ff);
		}
		tuple = tupleIndex = 0;
	}

	let tuple = 0;
	let tupleIndex = 0;

	let i = skip;

	do {
		// Skip whitespace
		if (text.charAt(i).trim().length === 0) continue;

		let charCode = text.charCodeAt(i);
		tuple += (charToByte85[charCode]) * POW_85_4[tupleIndex++];
		if (tupleIndex >= 5) {
			pushPart();
		}
	} while (i++ < text.length);
	
	if (tupleIndex) {
		tuple += POW_85_4[tupleIndex - 1];
		pushPart();
	}

	if(blob)
		return byte2Blob(output);
	return byte2Base64(output);
}

