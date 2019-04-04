import Cookies from "js-cookie";
import { App } from './index';
import { GA } from "./GA";

export interface GameApiInterface {
	getGameData(gameId: string): GameDataInterface | undefined;
	setGameData(gameId: string, data: GameDataInterface): GameDataInterface;
	submitGameState(gameId: string, phase: GameStateInterface): void;
	registerHook(gameId: string, callback: (arg: GameStateInterface) => void): void;
	removeHook(gameId: string): void;
}

export interface GameDataInterface {
	level: number;
	score: number;
	error?: boolean;
	lang?: string;
	data?: any;
}

export interface GameStateInterface {
	type: "init" | "loading" | "start" | "close" | "other" | "error" | "resume" | "pause";
	progress?: number; // для "loading" и "game"
	data?: any;
}

export class FakeGameApi implements GameApiInterface {
	_hook: { [key: string]: (arg: GameStateInterface) => void } = {};

	constructor() {
		console.warn("FakeAPI", "GameAPI object not found! Used Fake API");
	}

	invokeHook(name: string, data: GameStateInterface){
		if(this._hook[name]){
			this._hook[name](data);
			console.warn("FakeAPI", `Hook ${name} executed with`, data);
		}
		else{
			console.warn("FakeAPI", `Hook ${name} cant'be executed!`);
		}
	}

	cleanGameData() {
		Cookies.set("_GameSaves_", {});
		console.warn("FakeAPI", "Game data was cleaned!");
	}

	openAllLevels() {
		const all =  App.instance.games;
		let data = {} as any;
	
		for(let n in all) {
			data[n] = {
				level : 3
			}
		}
		Cookies.set("_GameSaves_", data);
		console.warn("FakeAPI", "God Mode enabled!");
	}

	getGameData(gameId: string): GameDataInterface {
		const data = Cookies.getJSON("_GameSaves_") || {};
		let gamedata = data[gameId] || {data : {}};
		console.log("FakeAPI", "Game requiest data:", gameId, gamedata);
		return gamedata;
	}

	setGameData(gameId: string, gamedata: GameDataInterface): GameDataInterface {
		const data = Cookies.getJSON("_GameSaves_") || {};
		data[gameId] = gamedata;
		Cookies.set("_GameSaves_", data);
		console.log("FakeAPI", "Game send data:", gameId, gamedata);
		return data;
	}

	submitGameState(gameId: string, phase: GameStateInterface): void {
		console.log("FakeAPI", "Game submit Phase:", gameId, phase);
	}

	registerHook(gameId: string, callback: (arg: GameStateInterface) => void): void {
		this._hook[gameId] = callback;
		console.log("FakeAPI", "Register hook of", gameId);
	}

	removeHook(gameId: string): void {
		this._hook[gameId] = undefined;
		console.log("FakeAPI", "Remove hook of", gameId);
	}
}

export class EmbeddedGameApi implements GameApiInterface {
	_hook: { [key: string]: (arg: GameStateInterface) => void } = {};
	api: any;

	constructor() {
		this.api = (window as any).InternalAPI;
		if (!this.api) { 
			const  err = new Error("Illegal state, InternalAPI is missing");
			GA.error(err, true);
			throw err;
		}
	}

	invokeHook(name: string, data: GameStateInterface){
		if(this._hook[name]){
			this._hook[name](data);
		}
	}

	getGameData(gameId: string): GameDataInterface {

		const res = this._invokeMethod("getGameData", 
		{
			gameId : gameId,
			data : {}
		}, true);

		if(res && res.gameId !== gameId) {
			const e = new Error(`Inlegal gameId. Expected: ${gameId}, got: ${res.gameId}`)
			GA.error(e, true);
			throw e;
		}
		return res ? res.data : undefined;
	}

	setGameData(gameId: string, gamedata: GameDataInterface): GameDataInterface {

		const res = this._invokeMethod("setGameData", 
		{
			gameId : gameId,
			data: gamedata
		});

		return res ? res.data : undefined;
	}

	submitGameState(gameId: string, phase: GameStateInterface): void {
		this._invokeMethod("submitGameState", 
		{
			gameId : gameId,
			data: phase
		});
	}

	registerHook(gameId: string, callback: (arg: GameStateInterface) => void): void {
		this._hook[gameId] = callback;
	}

	removeHook(gameId: string): void {
		this._hook[gameId] = undefined;
	}

	_invokeMethod(method: string, data: any, requireResult = false) : any {
		const str = JSON.stringify(data || {});
		
		try {
			const result = this.api[method](str);
			return JSON.parse(result || "null");

		} catch(e) {
			GA.error(e, true);
			throw e;
		}
		
	}
}
