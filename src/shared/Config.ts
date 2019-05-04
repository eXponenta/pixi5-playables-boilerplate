export const Config = {

	ReferenceSize: {
		width: 1390,
		height: 640,
		resolution: 1//window.devicePixelRatio
	},
	AllowAudio: false,
	PausedInBackground: true,
	TextStyle : {
		fontSize: 32,
	},
	BaseResDir:  '/* @echo RES_PATH */' || "./../res",
	Translations: "/translations/manifest.json" //relative BaseResDir
}