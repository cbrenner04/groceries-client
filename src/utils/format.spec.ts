import { formatDate, formatDueBy, prettyDueBy, capitalize, prettyListType } from './format';

describe('format', () => {
  describe('formatDate', () => {
    it('returns formatted date', () => {
      expect(formatDate(new Date('02/02/2020'))).toBe('February 02 2020, 12:00:00 am');
    });
  });

  describe('formatDueBy', () => {
    describe('when date supplied', () => {
      it('returns formatted date', () => {
        expect(formatDueBy(new Date('02/20/2020'))).toBe('2020-02-20');
      });
    });

    describe('when date not supplied', () => {
      it('returns empty string', () => {
        expect(formatDueBy(undefined)).toBe(undefined);
      });
    });
  });

  describe('prettyDueBy', () => {
    it('returns pretty format for due by', () => {
      expect(prettyDueBy(new Date('02/02/2020'))).toBe('February 2, 2020');
    });
  });

  describe('capitalize', () => {
    it('returns a capitalized output of input', () => {
      expect(capitalize('foo bar baz')).toBe('Foo bar baz');
    });
  });

  describe('prettyListType', () => {
    it('returns pretty form of input', () => {
      expect(prettyListType('groceryList')).toBe('grocery List');
    });
  });
});
