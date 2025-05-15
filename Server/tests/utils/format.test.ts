import { padTo8 } from '../../src/utils/format';

describe('padTo8()', () => {
    it('pads numbers shorter than 8 digits with leading zeroes', () => {
        expect(padTo8(123)).toBe('00000123');
        expect(padTo8(0)).toBe('00000000');
    });

    it('returns the number as a string if it has exactly 8 digits', () => {
        expect(padTo8(12345678)).toBe('12345678');
    });

    it('returns the full string if the number has more than 8 digits', () => {
        expect(padTo8(123456789)).toBe('123456789');
    });
});
