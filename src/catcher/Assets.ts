import { Config } from '../shared/Config';

export const Assets = {
    BaseDir: Config.BaseResDir + "/game4",
    Assets : {
        "game-atlas": {
            name : "game-atlas",
            url : '/game4-atlas.json'
        },
        "bg":{
            name : "bg",
            url : "/nature.jpg",
        },
        "fg":{
            name: "fg",
            url: "/foreground.png"
        },
        "player": {
            name : "player",
            url : "Player/Game Character.json" 
        }
    }
}