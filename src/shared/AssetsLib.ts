import { Config } from './Config';
//relative src from
export const Assets = {
	BaseDir: Config.BaseResDir,
	//default
	Assets: {
		"ui-atlas" : {
			name: "ui-atlas",
			url: "./ui/en_US/ui-atlas.json"
		},
        "ui-map" : { 
            name: "ui-map", 
            url: "./ui/ui-map.json" 
		}
	},
	AssetsTranslated : {
		'en_US' : {
			"ui-atlas" : {
				name: "ui-atlas",
				url: "./ui/en_US/ui-atlas.json"
			}
		}
	}
};
