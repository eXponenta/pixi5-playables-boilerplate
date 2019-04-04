export const Config = {

	ReferenceSize: {
		width: 1080,
		height: 1720,
		resolution: 1//window.devicePixelRatio
	},
	AllowAudio: true,
	PausedInBackground: true,
	TextStyle : {
		fontSize: 32,
	},
	BaseResDir:  '/* @echo RES_PATH */' || "./../res",
	Translations: "/translations/manifest.json" //relative BaseResDir
}