const { StringDecoder} = require('string_decoder');
const {TextEncoder} = require('util');

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#";

"use strict";
var ascii85 = (function() {
	const TUPLE_BITS = [24, 16, 8, 0];
	const POW_85_4 = [85 * 85 * 85 * 85, 85 * 85 * 85, 85 * 85, 85, 1];

	function getEncodedChunk(tuple, bytes = 4) {
		var output;
		let d = ((tuple[0] << 24) | (tuple[1] << 16) | (tuple[2] << 8) | tuple[3]) >>> 0;

		if (d === 0 && bytes == 4) {
			output = new Uint8Array(1);
			output[0] = 0x7a; // z
		} else {
			output = new Uint8Array(bytes + 1);

			for (let i = 4; i >= 0; i--) {
				if (i <= bytes) {
					output[i] =  ALPHABET.charCodeAt(d % 85); //d % 85) + 0x21; // 0x21 = '!'
				}

				d /= 85;
			}
		}

		return output;
	}

	function fromByteArray(byteArray) {
        let output = [];
        
		for (let i = 0; i < byteArray.length; i += 4) {
			let tuple = new Uint8Array(4);
			let bytes = 4;

			for (let j = 0; j < 4; j++) {
				if (i + j < byteArray.length) {
					tuple[j] = byteArray[i + j];
				} else {
					tuple[j] = 0x00;
					bytes--;
				}
            }
        
			let chunk = getEncodedChunk(tuple, bytes);
			for (let j = 0; j < chunk.length; j++) {
				output.push(chunk[j]);
			}
		}
		return new StringDecoder("utf8").write(Buffer.from(output));
	}

	function encode(text) {
		return fromByteArray(new TextEncoder().encode(text));
	}

	function getByteArrayPart(tuple, bytes = 4) {
		let output = new Uint8Array(bytes);

		for (let i = 0; i < bytes; i++) {
			output[i] = (tuple >> TUPLE_BITS[i]) & 0x00ff;
		}

		return output;
	}

	function toByteArray(text) {
		function pushPart() {
			let part = getByteArrayPart(tuple, tupleIndex - 1);
			for (let j = 0; j < part.length; j++) {
				output.push(part[j]);
			}
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

	function decode(text, charset) {
		return new TextDecoder(charset || "UTF-8").decode(toByteArray(text));
	}

	return {
		fromByteArray: fromByteArray,
		toByteArray: toByteArray,
		encode: encode,
		decode: decode
	};
})();

var base85 = ascii85;
if (typeof module != "undefined" && module.exports) module.exports = ascii85;
