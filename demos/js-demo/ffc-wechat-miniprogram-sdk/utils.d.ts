import { ICSS, IOption, IUser, UrlMatchType } from "./types";
export declare function ffcguid(): string;
export declare function uuid(): string;
export declare function validateUser(user: IUser): string | null;
export declare function validateOption(option: IOption): string | null;
/******************** draggable begin ************************/
export declare function makeElementDraggable(el: any): void;
/******************** draggable end ************************/
export declare function addCss(element: HTMLElement, style: {
    [key: string]: string;
}): void;
export declare function generateConnectionToken(text: string): string;
/********************** encode text end *****************************/
export declare function isUrlMatch(matchType: UrlMatchType, url: string): boolean;
export declare function groupBy(xs: any, key: string): {
    [key: string]: any;
};
export declare function extractCSS(css: string): ICSS[];
