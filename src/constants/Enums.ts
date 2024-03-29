export enum LayerType {
    GRID = 0,
    CELL = 1,
    MOLECULE = 2,
    OVERLAY = 3
}

export enum CellType {
    GRID = "grid",
    STRAIGHT = "straight",
    SLIGHT_LEFT = 'slight_left',
    SLIGHT_RIGHT = 'slight_right',
    FUSION = 'fuse',
    COMBINE = 'combine',
    MERGE = 'merge',
    META = 'meta',
    SPLIT = 'split',
    SOURCE = 'source',
    SINK = 'sink',
}

export enum CellSlot {
    CENTER = 0,
    FORWARD = 1,
    FORWARD_RIGHT = 2,
    BACKWARD_RIGHT = 3,
    BACKWARD = 4,
    BACKWARD_LEFT = 5,
    FORWARD_LEFT = 6
}

/**
 * Typescript enum lookup doesn't handle reverse lookups of string enums. This utility function makes 
 * does reverse/forward lookups for both number and string enums
 * Based on https://stackoverflow.com/a/76073674
 * @param enumType The Enum type to lookup against
 * @param keyOrValue A key or value from the enum
 * @returns The value of the enum (but typed against the enum)
 */
export function enumLookup<T>(enumType: any, keyOrValue: T[keyof T] | string | number) :  T | null {
    let enumKeys = (Object.keys(enumType as {}) as (keyof T)[]);

    let keyResult = (enumKeys.find((k) => k === keyOrValue || enumType[k] === keyOrValue) as keyof T) || null;

    return (keyResult ? enumType[keyResult] : null) as T | null;
}