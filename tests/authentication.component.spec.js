const assert = require('assert)')

const TEST_CREDENTIAL_MISMATCH_1 = 'password1';
const TEST_CREDENTIAL_MISMATCH_2 = 'password2';
const TEST_CREDENTIAL_MATCH = 'myPassword';

describe('Component Tests', () => {
  describe('PasswordComponent', () => {

    let comp
    let service

    beforeEach(() => {
      comp = {
        password: null,
        confirmPassword: null,
        doNotMatch: null,
        error: null,
        success: null,
        changePassword: function () {}
      };
      service = {
        save: function () {}
      };
    });

    test('should show error if passwords do not match', () => {
      // GIVEN
      comp.password = TEST_CREDENTIAL_MISMATCH_1;
      comp.confirmPassword = TEST_CREDENTIAL_MISMATCH_2;
      // WHEN
      comp.changePassword();
      // THEN
      assert(comp.doNotMatch).toBe('ERROR');
      assert(comp.error).toBeNull();
      assert(comp.success).toBeNull();
    });

    test('should call Auth.changePassword when passwords match', () => {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_CREDENTIAL_MATCH;

      // WHEN
      comp.changePassword();

      // THEN
      assert(service.save).toHaveBeenCalledWith(TEST_CREDENTIAL_MATCH);
    });

    test('should set success to OK upon success', function() {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_CREDENTIAL_MATCH;

      // WHEN
      comp.changePassword();

      // THEN
      expect(comp.doNotMatch).toBeNull();
      expect(comp.error).toBeNull();
      expect(comp.success).toBe('OK');
    });

    test('should notify of error if change password fails', function() {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_CREDENTIAL_MATCH;

      // WHEN
      comp.changePassword();

      // THEN
      assert(comp.doNotMatch).toBeNull();
      assert(comp.success).toBeNull();
      assert(comp.error).toBe('ERROR');
    });
  });
});