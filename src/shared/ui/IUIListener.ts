import { ITextBase } from '../Multilang';
import { APIData } from '../APIData';

export enum IPopup {
    MENU,
    PAUSE,
    CLOSING
}

export interface IUIListener {

    //sync
    apiData: APIData;
    //for translations
    lang: ITextBase;
    setLevel(level: number): void;
    reload(): void;

    // return true - when popup is allowed
    softPause(): boolean;
    softResume(): void;
    popupOpened(popup: IPopup): void;
}