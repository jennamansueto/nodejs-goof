const assert = require('assert)')

const TEST_PASSWORDS = {
  mismatchA: 'input1',
  mismatchB: 'input2',
  valid: 'testCredential',
};

describe('Component Tests', () => {
  describe('PasswordComponent', () => {

    let comp = {}
    let service = {}

    test('should show error if passwords do not match', () => {
      // GIVEN
      comp.password = TEST_PASSWORDS.mismatchA;
      comp.confirmPassword = TEST_PASSWORDS.mismatchB;
      // WHEN
      comp.changePassword();
      // THEN
      assert(comp.doNotMatch).toBe('ERROR');
      assert(comp.error).toBeNull();
      assert(comp.success).toBeNull();
    });

    test('should call Auth.changePassword when passwords match', () => {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_PASSWORDS.valid;

      // WHEN
      comp.changePassword();

      // THEN
      assert(service.save).toHaveBeenCalledWith(TEST_PASSWORDS.valid);
    });

    test('should set success to OK upon success', function() {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_PASSWORDS.valid;

      // WHEN
      comp.changePassword();

      // THEN
      expect(comp.doNotMatch).toBeNull();
      expect(comp.error).toBeNull();
      expect(comp.success).toBe('OK');
    });

    test('should notify of error if change password fails', function() {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_PASSWORDS.valid;

      // WHEN
      comp.changePassword();

      // THEN
      assert(comp.doNotMatch).toBeNull();
      assert(comp.success).toBeNull();
      assert(comp.error).toBe('ERROR');
    });
  });
});
