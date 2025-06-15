import { indexToTeleformAnswer, teleformAnswerToIndex } from '../../src/utils/answerKey';

describe('indexToTeleformAnswer()', () => {
    it('converts 0 to 1', () => {
        expect(indexToTeleformAnswer(0)).toBe(1);
    });

    it('converts 1 to 2', () => {
        expect(indexToTeleformAnswer(1)).toBe(2);
    });

    it('converts 2 to 4', () => {
        expect(indexToTeleformAnswer(2)).toBe(4);
    });

    it('converts 3 to 8', () => {
        expect(indexToTeleformAnswer(3)).toBe(8);
    });

    it('converts 4 to 16', () => {
        expect(indexToTeleformAnswer(4)).toBe(16);
    });
});

describe('teleformAnswerToIndex()', () => {
    it('converts 1 to 0', () => {
        expect(teleformAnswerToIndex(1)).toBe(0);
    });

    it('converts 2 to 1', () => {
        expect(teleformAnswerToIndex(2)).toBe(1);
    });

    it('converts 4 to 2', () => {
        expect(teleformAnswerToIndex(4)).toBe(2);
    });

    it('converts 8 to 3', () => {
        expect(teleformAnswerToIndex(8)).toBe(3);
    });

    it('converts 16 to 4', () => {
        expect(teleformAnswerToIndex(16)).toBe(4);
    });
});
