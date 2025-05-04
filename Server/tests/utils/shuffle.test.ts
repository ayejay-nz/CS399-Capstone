import { shuffle, generateOptionOrder } from '../../src/utils/shuffle';

describe('shuffle()', () => {
    let originalMathRandom: () => number;

    // Store original Math.random before all tests
    beforeAll(() => {
        originalMathRandom = Math.random;
    });

    // Restore original Math.random after all tests
    afterAll(() => {
        Math.random = originalMathRandom;
    });

    // Restore original Math.random after each test
    afterEach(() => {
        jest.restoreAllMocks();
        Math.random = originalMathRandom;
    });

    it('returns the same elements in a different order (most of the time at least)', () => {
        const originalList = [1, 2, 3, 4];
        const shuffledList = shuffle([...originalList]);

        expect(shuffledList).toHaveLength(originalList.length);
        expect([...shuffledList].sort()).toEqual([...originalList].sort());
    });

    it('should handle an empty array', () => {
        const originalList: number[] = [];
        const shuffledList = shuffle([...originalList]);

        expect(shuffledList).toEqual([]);
        expect(shuffledList).toHaveLength(0);
    });

    it('should handle an array with 1 element', () => {
        const originalList = [0];
        const shuffledList = shuffle([...originalList]);

        expect(shuffledList).toEqual([0]);
        expect(shuffledList).toHaveLength(1);
    });

    it('should produce predictable results with Math.random is mocked', () => {
        const originalList = [1, 2, 3];
        const mockRandom = jest
            .fn()
            .mockReturnValueOnce(0.5) // for i = 2 - swap arr[2] and arr[1]
            .mockReturnValueOnce(0.2); // for i = 1 - swap arr[1] and arr[0]

        Math.random = mockRandom;

        const shuffledList = shuffle([...originalList]);

        expect(shuffledList).toEqual([3, 1, 2]);
        expect(mockRandom).toHaveBeenCalledTimes(2);
    });
});

describe('generateOptionOrder()', () => {
    it('should generate a list of the specified length', () => {
        const optionCount = 4;
        const optionOrder = generateOptionOrder(optionCount);

        expect(optionOrder).toHaveLength(optionCount);
    });

    it('should generate a list containing numbers from 1 to optionCount', () => {
        const optionCount = 5;
        const optionOrder = generateOptionOrder(optionCount);

        expect(optionOrder.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    // Probabilistic check -- ensure that it generates a randomised list
    it('should generate a randomised list of numbers 1 to optionCount', () => {
        const optionCount = 10;
        const orderedList = Array.from({ length: optionCount }, (_, i) => i + 1);
        const optionOrder = generateOptionOrder(optionCount);

        expect(optionOrder).toHaveLength(10);
        expect(optionOrder).not.toEqual(orderedList); // 1 in 3 628 800 chance of being the same
        expect([...optionOrder].sort((a, b) => a - b)).toEqual(orderedList);
    });
});
