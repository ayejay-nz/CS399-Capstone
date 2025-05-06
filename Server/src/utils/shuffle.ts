/**
 * Randomly shuffle the elements of an array in-place using the Fisher-Yates algorithm.
 *
 * @template T
 *  The type of elements in the input array.
 * @param arr
 *  The array whose elements are to be shuffled.
 * @returns
 *  The same array with its elements randomly permuted.
 */
export function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i]!, arr[j]!] = [arr[j]!, arr[i]!];
    }
    return arr;
}

/**
 * Generate a random ordering of option indicies from 0 up to `optionCount`-1.
 *
 * This creates an array [0, 1, ..., `optionCount`-1] and then shuffles it.
 *
 * @param optionCount
 *  The total number of options to include.
 * @returns
 *  A new array of length `optionCount` containing integers 0 through `optionCount`-1
 *  in a randomised order.
 */
export function generateOptionOrder(optionCount: number) {
    // Create an array of integers 0 to optionCount-1
    const optionOrder = Array.from({ length: optionCount }, (_, i) => i);
    return shuffle(optionOrder);
}
