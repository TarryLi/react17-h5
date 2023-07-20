import { validateEmail, validateFullname } from './validator';

describe('validator', () => {
  describe('validateFullname', () => {
    test('normal', () => {
      expect(validateFullname({})).toBeFalsy();
      expect(validateFullname('a')).toBeFalsy();
      expect(validateFullname('1asd')).toBeFalsy();
      expect(validateFullname('John Doe')).toBeTruthy();
    });
  });

  describe('validateEmail', () => {
    test('normal', () => {
      expect(validateEmail({})).toBeFalsy();
      expect(validateEmail('a@aaa')).toBeFalsy();
      expect(validateEmail('xxx@airwallex.com')).toBeTruthy();
    });
  });
});
