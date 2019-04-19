const TUPLE_BITS = [24, 16, 8, 0];
const POW_85_4 = [85 **4 , 85 ** 3, 85 * 85, 85, 1];

const getPart= (tuple: number, bytes = 4) => {
	const output = new Uint8Array(bytes);
	for (let i = 0; i < bytes; i++) {
		output[i] = (tuple >> TUPLE_BITS[i]) & 0x00ff;
	}
	return output;
}

export function decodeToByteArray(text: string) {
	const pushPart = () => {
		getPart(tuple, tupleIndex - 1).forEach((e)=> output.push(e));
		tuple = tupleIndex = 0;
	}

	let output = [];
    let stop = false;
    
	let tuple = 0;
	let tupleIndex = 0;

	let i = text.startsWith("<~") && text.length > 2 ? 2 : 0;
	do {
		// Skip whitespace
		if (text.charAt(i).trim().length === 0) continue;

		let charCode = text.charCodeAt(i);

		switch (charCode) {
			case 0x7a: // z
				if (tupleIndex != 0) {
					throw new Error("Unexpected 'z' character at position " + i);
				}

				for (let j = 0; j < 4; j++) {
					output.push(0x00);
				}
				break;
			case 0x7e: // ~
				let nextChar = "";
				let j = i + 1;
				while (j < text.length && nextChar.trim().length == 0) {
					nextChar = text.charAt(j++);
				}

				if (nextChar != ">") {
					throw new Error("Broken EOD at position " + j);
				}

				if (tupleIndex) {
					tuple += POW_85_4[tupleIndex - 1];
					pushPart();
				}

				stop = true;
				break;
			default:
				if (charCode < 0x21 || charCode > 0x75) {
					throw new Error("Unexpected character with code " + charCode + " at position " + i);
				}

				tuple += (charCode - 0x21) * POW_85_4[tupleIndex++];
				if (tupleIndex >= 5) {
					pushPart();
				}
		}
	} while (i++ < text.length && !stop);

	return new Uint8Array(output);
}

export function decodeToBase64(input: string) {
	const buff = decodeToByteArray(input);
	return btoa(Array.prototype.map.call(buff, (e:number) => String.fromCharCode(e)).join(""));
}
