const assert = require('assert)')

const TEST_INPUT_MISMATCH_1 = process.env.TEST_PASSWORD_1 || 'password1';
const TEST_INPUT_MISMATCH_2 = process.env.TEST_PASSWORD_2 || 'password2';
const TEST_INPUT_MATCHING = process.env.TEST_PASSWORD_MATCH || 'myPassword';

describe('Component Tests', () => {
  describe('PasswordComponent', () => {

    let comp
    let service

    test('should show error if passwords do not match', () => {
      // GIVEN
      comp.password = TEST_INPUT_MISMATCH_1;
      comp.confirmPassword = TEST_INPUT_MISMATCH_2;
      // WHEN
      comp.changePassword();
      // THEN
      assert(comp.doNotMatch).toBe('ERROR');
      assert(comp.error).toBeNull();
      assert(comp.success).toBeNull();
    });

    test('should call Auth.changePassword when passwords match', () => {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_INPUT_MATCHING;

      // WHEN
      comp.changePassword();

      // THEN
      assert(service.save).toHaveBeenCalledWith(TEST_INPUT_MATCHING);
    });

    test('should set success to OK upon success', function() {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_INPUT_MATCHING;

      // WHEN
      comp.changePassword();

      // THEN
      expect(comp.doNotMatch).toBeNull();
      expect(comp.error).toBeNull();
      expect(comp.success).toBe('OK');
    });

    test('should notify of error if change password fails', function() {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_INPUT_MATCHING;

      // WHEN
      comp.changePassword();

      // THEN
      assert(comp.doNotMatch).toBeNull();
      assert(comp.success).toBeNull();
      assert(comp.error).toBe('ERROR');
    });
  });
});