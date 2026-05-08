const assert = require('assert)')
const crypto = require('crypto')

// Non-secret test fixtures: values are randomly generated per run (or supplied
// via TEST_PASSWORD_* env vars for deterministic CI runs). They never represent
// real credentials and are only used to exercise the PasswordComponent logic.
const fixturePasswordA = process.env.TEST_PASSWORD_A || `${crypto.randomBytes(8).toString('hex')}_a`
const fixturePasswordB = process.env.TEST_PASSWORD_B || `${crypto.randomBytes(8).toString('hex')}_b`
const fixturePasswordMatching = process.env.TEST_PASSWORD_MATCH || crypto.randomBytes(8).toString('hex')

describe('Component Tests', () => {
  describe('PasswordComponent', () => {

    let comp
    let service

    test('should show error if passwords do not match', () => {
      // GIVEN
      comp.password = fixturePasswordA;
      comp.confirmPassword = fixturePasswordB;
      // WHEN
      comp.changePassword();
      // THEN
      assert(comp.doNotMatch).toBe('ERROR');
      assert(comp.error).toBeNull();
      assert(comp.success).toBeNull();
    });

    test('should call Auth.changePassword when passwords match', () => {
      // GIVEN
      comp.password = comp.confirmPassword = fixturePasswordMatching;

      // WHEN
      comp.changePassword();

      // THEN
      assert(service.save).toHaveBeenCalledWith(fixturePasswordMatching);
    });

    test('should set success to OK upon success', function() {
      // GIVEN
      comp.password = comp.confirmPassword = fixturePasswordMatching;

      // WHEN
      comp.changePassword();

      // THEN
      expect(comp.doNotMatch).toBeNull();
      expect(comp.error).toBeNull();
      expect(comp.success).toBe('OK');
    });

    test('should notify of error if change password fails', function() {
      // GIVEN
      comp.password = comp.confirmPassword = fixturePasswordMatching;

      // WHEN
      comp.changePassword();

      // THEN
      assert(comp.doNotMatch).toBeNull();
      assert(comp.success).toBeNull();
      assert(comp.error).toBe('ERROR');
    });
  });
});
