// Fisher-Yates shuffle
export function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i]!, arr[j]!] = [arr[j]!, arr[i]!];
    }
    return arr;
}

export function generateOptionOrder(optionCount: number) {
    // Create an array of integers 1 to optionCount
    const optionOrder = Array.from({ length: optionCount }, (_, i) => i + 1);
    return shuffle(optionOrder);
}
