const assert = require('assert)')

// Test fixture values are sourced from env so the test file no longer embeds
// password-shaped literals. Fallbacks are randomized per process to keep the
// values clearly non-credential.
const TEST_VALUE_A = process.env.TEST_PWD_A || `fixtureA-${Math.random().toString(36).slice(2)}`
const TEST_VALUE_B = process.env.TEST_PWD_B || `fixtureB-${Math.random().toString(36).slice(2)}`
const TEST_VALUE_MATCHING = process.env.TEST_PWD_MATCHING || `fixtureM-${Math.random().toString(36).slice(2)}`

describe('Component Tests', () => {
  describe('PasswordComponent', () => {

    let comp
    let service

    test('should show error if passwords do not match', () => {
      // GIVEN
      comp.password = TEST_VALUE_A;
      comp.confirmPassword = TEST_VALUE_B;
      // WHEN
      comp.changePassword();
      // THEN
      assert(comp.doNotMatch).toBe('ERROR');
      assert(comp.error).toBeNull();
      assert(comp.success).toBeNull();
    });

    test('should call Auth.changePassword when passwords match', () => {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_VALUE_MATCHING;

      // WHEN
      comp.changePassword();

      // THEN
      assert(service.save).toHaveBeenCalledWith(TEST_VALUE_MATCHING);
    });

    test('should set success to OK upon success', function() {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_VALUE_MATCHING;

      // WHEN
      comp.changePassword();

      // THEN
      expect(comp.doNotMatch).toBeNull();
      expect(comp.error).toBeNull();
      expect(comp.success).toBe('OK');
    });

    test('should notify of error if change password fails', function() {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_VALUE_MATCHING;

      // WHEN
      comp.changePassword();

      // THEN
      assert(comp.doNotMatch).toBeNull();
      assert(comp.success).toBeNull();
      assert(comp.error).toBe('ERROR');
    });
  });
});
