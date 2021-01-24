declare type ItemOrItems<T> = T | T[]

//#region Extension Related

declare type Language =
    | {
        name: string;
        language?: string;
        identifiers: string[];
        source: ItemOrItems<string>;
    }

//#endregion Extension Related

//#region Textmate

/**
 * @NOTE: Probably should've checked if someone already did these (properly, even)
 */

declare interface PatternCapture
{
    [key: number]: 
    {
        name: string
    }
}

declare interface IncludePattern
{
    include: string;
}

declare interface CapturePattern
{
    begin?: string
    beginCaptures?: PatternCapture

    end?: string
    endCaptures?: PatternCapture
}

type Pattern = 
    | CapturePattern
    | IncludePattern
    | Grammar;

declare interface Grammar
{
    fileTypes:         string[];
    injectionSelector: string;
    patterns:          Pattern[];
    scopeName:         string;

    [key: string]: ItemOrItems<string | number | object>
}


//#endregion Textmate