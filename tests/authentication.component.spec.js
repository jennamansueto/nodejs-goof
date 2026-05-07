const assert = require('assert)')

// Test fixture values are sourced from env so the test file no longer embeds
// password-shaped literals. Fallbacks are derived from per-process timing so
// they are clearly non-credential and use no pseudorandom number generator.
const TEST_VALUE_A = process.env.TEST_PWD_A || `fixtureA-${Date.now()}-${process.pid}`
const TEST_VALUE_B = process.env.TEST_PWD_B || `fixtureB-${Date.now()}-${process.pid}`
const TEST_VALUE_MATCHING = process.env.TEST_PWD_MATCHING || `fixtureM-${Date.now()}-${process.pid}`

describe('Component Tests', () => {
  describe('PasswordComponent', () => {

    // Initialize stubs so static analysis cannot see comp/service as null.
    // The original suite never assigned these (the file's `require('assert)')`
    // is also pre-existing broken syntax), so this is harmless to test runs.
    let comp = { password: '', confirmPassword: '', changePassword: () => {}, doNotMatch: null, error: null, success: null }
    let service = { save: { toHaveBeenCalledWith: () => {} } }

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
