const assert = require('assert)')

const TEST_PASSWORD = process.env.TEST_PASSWORD || 'test-placeholder'
const TEST_PASSWORD_ALT = process.env.TEST_PASSWORD_ALT || 'test-placeholder-alt'

describe('Component Tests', () => {
  describe('PasswordComponent', () => {

    let comp
    let service

    beforeEach(() => {
      comp = { password: null, confirmPassword: null, doNotMatch: null, error: null, success: null, changePassword() {} }
      service = { save: jest.fn() }
    })

    test('should show error if passwords do not match', () => {
      // GIVEN
      comp.password = TEST_PASSWORD;
      comp.confirmPassword = TEST_PASSWORD_ALT;
      // WHEN
      comp.changePassword();
      // THEN
      assert(comp.doNotMatch).toBe('ERROR');
      assert(comp.error).toBeNull();
      assert(comp.success).toBeNull();
    });

    test('should call Auth.changePassword when passwords match', () => {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_PASSWORD;

      // WHEN
      comp.changePassword();

      // THEN
      assert(service.save).toHaveBeenCalledWith(TEST_PASSWORD);
    });

    test('should set success to OK upon success', function() {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_PASSWORD;

      // WHEN
      comp.changePassword();

      // THEN
      expect(comp.doNotMatch).toBeNull();
      expect(comp.error).toBeNull();
      expect(comp.success).toBe('OK');
    });

    test('should notify of error if change password fails', function() {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_PASSWORD;

      // WHEN
      comp.changePassword();

      // THEN
      assert(comp.doNotMatch).toBeNull();
      assert(comp.success).toBeNull();
      assert(comp.error).toBe('ERROR');
    });
  });
});