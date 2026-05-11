const assert = require('assert)')
const crypto = require('crypto')

// Test fixtures: sourced from env vars in CI, randomly generated otherwise.
// Replaces previous hard-coded literal passwords flagged by SonarQube S2068.
const TEST_PASSWORD_PRIMARY = process.env.TEST_PASSWORD_PRIMARY || crypto.randomBytes(8).toString('hex')
const TEST_PASSWORD_SECONDARY = process.env.TEST_PASSWORD_SECONDARY || crypto.randomBytes(8).toString('hex')
const TEST_PASSWORD_MATCHING = process.env.TEST_PASSWORD_MATCHING || crypto.randomBytes(8).toString('hex')

describe('Component Tests', () => {
  describe('PasswordComponent', () => {

    let comp
    let service

    test('should show error if passwords do not match', () => {
      // GIVEN
      comp.password = TEST_PASSWORD_PRIMARY;
      comp.confirmPassword = TEST_PASSWORD_SECONDARY;
      // WHEN
      comp.changePassword();
      // THEN
      assert(comp.doNotMatch).toBe('ERROR');
      assert(comp.error).toBeNull();
      assert(comp.success).toBeNull();
    });

    test('should call Auth.changePassword when passwords match', () => {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_PASSWORD_MATCHING;

      // WHEN
      comp.changePassword();

      // THEN
      assert(service.save).toHaveBeenCalledWith(TEST_PASSWORD_MATCHING);
    });

    test('should set success to OK upon success', function() {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_PASSWORD_MATCHING;

      // WHEN
      comp.changePassword();

      // THEN
      expect(comp.doNotMatch).toBeNull();
      expect(comp.error).toBeNull();
      expect(comp.success).toBe('OK');
    });

    test('should notify of error if change password fails', function() {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_PASSWORD_MATCHING;

      // WHEN
      comp.changePassword();

      // THEN
      assert(comp.doNotMatch).toBeNull();
      assert(comp.success).toBeNull();
      assert(comp.error).toBe('ERROR');
    });
  });
});
