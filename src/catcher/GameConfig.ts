
export const ObjectType = {
    ALIEN : "alien",
    NORMAL: "normal",
    BROKEN: "broken",
    METEOR: "meteor"
}

export const VARIANTS = {
    [ObjectType.NORMAL] : 4,
    [ObjectType.BROKEN] : 4,
    [ObjectType.METEOR]: 4,
    [ObjectType.ALIEN] : 3
}

export interface ILevelData {
    catchsToWin: number;
    dropsToLoose: number;
    maxDistance: number;
    spavnDelta: number;
    fallingSpeed: number;
    probs: {[key: string]: number}
}
export const GameConfig = {

    playerSpeed: 10,
    deltaMult: 0.75,
    speedMult: 1.5,

    costs: {
        [ObjectType.NORMAL] : 1,
        [ObjectType.BROKEN] : -1,
        [ObjectType.ALIEN] : -2,
        [ObjectType.METEOR] : -3,
    },
    levels:
    [
        {
            spavnDelta: 1.5,
            catchsToWin: 30,
            dropsToLoose: 50,
            maxDistance: 500,
            fallingSpeed: 30,

            probs: {
                [ObjectType.NORMAL] : 0.6,
                [ObjectType.BROKEN] : 0.2,
                [ObjectType.ALIEN] : 0.1,
                [ObjectType.METEOR] : 0.1,
            }
        },
        {
            spavnDelta: 1.25,
            catchsToWin: 40,
            dropsToLoose: 30,
            maxDistance: 700,
            fallingSpeed: 40,

            probs: {
                [ObjectType.NORMAL] : 0.5,
                [ObjectType.BROKEN] : 0.3,
                [ObjectType.ALIEN] : 0.1,
                [ObjectType.METEOR] : 0.1,
            }
        },
        {
            spavnDelta: 1,
            catchsToWin: 50,
            dropsToLoose: 40,
            maxDistance: 800,
            fallingSpeed: 45,

            probs: {
                [ObjectType.NORMAL] : 0.5,
                [ObjectType.BROKEN] : 0.3,
                [ObjectType.ALIEN] : 0.15,
                [ObjectType.METEOR] : 0.15,
            }
        },
   ]
}
