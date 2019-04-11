export function delay(ms: number) {
    ms = Math.max(ms, 0);
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export function random(lower: number, upper: number) {
    return Math.floor(Math.random() * upper) + lower
}