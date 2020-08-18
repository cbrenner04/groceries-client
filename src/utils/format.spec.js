import {
  formatDate,
  defaultDueBy,
  formatDueBy,
  prettyDueBy,
  listTypeToSnakeCase,
  capitalize,
  prettyListType,
} from './format';

describe('format', () => {
  describe('formatDate', () => {
    it('returns formatted date', () => {
      expect(formatDate(new Date('02/02/2020'))).toBe('February 02 2020, 12:00:00 am');
    });
  });

  describe('defaultDueBy', () => {
    it('returns default due by', () => {
      expect(defaultDueBy()).toBe('2020-05-24'); // default date set in setupTests
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
        expect(formatDueBy()).toBe('');
      });
    });
  });

  describe('prettyDueBy', () => {
    it('returns pretty format for due by', () => {
      expect(prettyDueBy(new Date('02/02/2020'))).toBe('February 2, 2020');
    });
  });

  describe('listTypeToSnakeCase', () => {
    it('returns snake case of given value', () => {
      expect(listTypeToSnakeCase('GroceryList')).toBe('grocery_list');
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
