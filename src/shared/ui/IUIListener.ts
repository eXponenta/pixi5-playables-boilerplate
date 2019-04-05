import { ITextBase } from '../Multilang';
import { APIData } from '../APIData';
import { IScene } from "../../core/IScene";

export enum IPopup {
    MENU,
    PAUSE,
    CLOSING
}

export interface IUIListener extends IScene {

    //sync
    apiData: APIData;
    //for translations
    lang: ITextBase;
    setLevel(level: number): void;
    reload(): void;

    popupOpened(popup: IPopup): void;
}