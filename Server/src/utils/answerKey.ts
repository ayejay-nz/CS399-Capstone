/**
 * Convert teleform answer style (i.e. 1, 2, 4, 8, 16) to
 * index form (i.e. 0, 1, 2, 3, 4).
 *
 * @param answer
 *  The teleform answer number to convert.
 * @returns
 *  Index form of the teleform answer.
 */
export function teleformAnswerToIndex(answer: number) {
    return Math.log2(answer);
}

/**
 * Convert index form (i.e. 0, 1, 2, 3, 4) to teleform
 * answer style (i.e. 1, 2, 4, 8, 16).
 *
 * @param index
 *  The index number to convert.
 * @returns
 *  Teleform answer form of the given `index`.
 */
export function indexToTeleformAnswer(index: number) {
    return Math.pow(2, index);
}
