/**
 * Convert a number to an 8-character string, padding with leading zeros.
 *
 * @param n
 *  The integer to format.
 * @returns
 *  A string representation of `n` that is exactly 8 characters long,
 *  with `0` characters added on the left if `n.toString()` is shorter.
 */
export function padTo8(n: number) {
    return n.toString().padStart(8, '0');
}

export function toPercentage2dp(n: number) {
    return parseFloat((n * 100).toFixed(2));
}

export function percentageToDecimal2dp(p: number) {
    return (p / 100).toFixed(2);
}
