//custom base64 or base85 compressor

const through = require("through2");
const PluginError = require("plugin-error");
const path = require("path");
const base85enc = require("./base85");

const PLUGIN_NAME = "baseCompressor";

const fileTypes = {

	json: { mime: "application/json", noEncode: true },
	atlas: { mime: "text/plain", noEncode: true },

	//images
	jpeg: { mime: "image/jpeg" },
	jpg: { mime: "image/jpeg" },
	png: { mime: "image/png" },

	//audio
	mp3: { mime: "audio/mp3" },
	wav: { mime: "audio/wav" },
	ogg: { mime: "audio/ogg" }
};

const normalize = input => {
	const isExtendedLengthPath = /^\\\\\?\\/.test(input);
	const hasNonAscii = /[^\u0000-\u0080]+/.test(input); // eslint-disable-line no-control-regex

	if (isExtendedLengthPath || hasNonAscii) {
		return input;
	}

	return input.replace(/\\/g, "/");
};

const jsonCompress = text => {
	return text.replace(/\n|\r|\t|\f/g, "");
};

const escape = text => {
	return text
		.replace(/\'/g, "\\'")
		.replace(/\\\\/g, "\\")
		.replace(/\//g, "/")
		.replace(/\"/g, '"')
		.replace(/\r/g, "\\r")
		.replace(/\t/g, "\\t")
		.replace(/\n/g, "\\n")
		.replace(/\f/g, "\\f");
};


//characters from0x21 to 0x75, replace qu and \
const escapeBase85 = text => {
	return text
		.replace(/\\/g, "w")
		.replace(/`/g, "{")
		.replace(/'/g, "|")
		.replace(/"/g, "}");
};

const def_map = (entries, options) => {
	let result = "";
	for (let name in entries) {
		const childs = entries[name] || {};
		const data = Object.keys(childs)
			.map(e => {
				let ret = `['${e}'] : {\n`;
				for (let key in childs[e]) {
					const format = childs[e][key];
					ret += `\t${key} : '${format}',\n`;
				}
				ret += "}";

				return ret;
			})
			.join(",\n");

		if (options.es6) {
			if (name == "default") result += `export default {\n${data}}`;
			else result += `export const ${name} = {\n${data}}`;
		} else {
			result += `const ${name} = {\n${data}}`;
		}
	}

	return result;
};

module.exports = function( options = {
										groupname: "default",
										filename: "out.js",
										mapper: def_map,
										map_options: { es6: true, base: "base64" } 
									} )  
	{

	const map_options = options.map_options || { base: "base64", es6 : true };
	const mapper = options.mapper || def_map;
	const group = options.groupname || "default";
	const fname = options.filename || "out.js";
	
	const data_buffer = {};
	let latestfile = undefined;

	function collect(file, encoder, cb) {
		
		latestfile = file;

		let data = {
			path : normalize(path.relative(file.base, file.path)),
			name : normalize(file.basename),
			data : undefined,
			mime : ""
		};

		if (!data_buffer[group])
			data_buffer[group] = {};

		if (data_buffer[group][data.path] || file.isNull()) 
			return cb();

		const ext = file.basename.split(".")[1];
		const type = fileTypes[ext];

		if (!type) return cb();

		data.mime = type.mime;

		if (file.isStream()) {
			this.emit("error", new PluginError(PLUGIN_NAME, "Streams not supported!"));
			return cb(null, file);
		}

		if (file.isBuffer()) {
			if (!type.noEncode) {
				if (map_options.base !== "base64") {

					let base85 = base85enc.fromByteArray(file.contents);
					//base85 = escapeBase85(base85);
					data.data = `data:${type.mime};base85,${base85}`;
				} else {
					data.data = `data:${type.mime};base64,${file.contents.toString("base64")}`;
				}
			} else {
				let text = new String(file.contents);
				if (data.mime == "application/json") {
					text = jsonCompress(text);
				}
				data.data = `data:${type.mime};,${escape(text.toString())}`;
			}
		}

		data_buffer[group][data.path] = data;

		return cb();
	}

	function write(cb) {
		if (latestfile.isNull() || !data_buffer) 
			return cb();

		const mapped_data = mapper(data_buffer, map_options);
		const file = latestfile.clone({ contents: false });

		file.path = path.join(file.base, fname);
		file.contents = Buffer.from(mapped_data);
		return cb(null, file);
	}

	return through.obj(collect, write);
};
