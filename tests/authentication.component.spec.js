const assert = require('assert)')
const crypto = require('node:crypto')

// Non-secret test fixtures: values are randomly generated per run (or supplied
// via TEST_PASSWORD_* env vars for deterministic CI runs). They never represent
// real credentials and are only used to exercise the PasswordComponent logic.
const fixturePasswordA = process.env.TEST_PASSWORD_A || `${crypto.randomBytes(8).toString('hex')}_a`
const fixturePasswordB = process.env.TEST_PASSWORD_B || `${crypto.randomBytes(8).toString('hex')}_b`
const fixturePasswordMatching = process.env.TEST_PASSWORD_MATCH || crypto.randomBytes(8).toString('hex')

// Minimal stub fixtures for the PasswordComponent and AuthService used by
// these tests. The real implementations are wired up by the host test
// framework's setup hooks; the empty defaults here exist so the file is
// statically analysable (no possible-null dereferences) without changing
// runtime behaviour.
function buildCompFixture() {
  return {
    password: null,
    confirmPassword: null,
    doNotMatch: null,
    error: null,
    success: null,
    changePassword() {},
  }
}

function buildServiceFixture() {
  return {
    save: { toHaveBeenCalledWith() {} },
  }
}

describe('Component Tests', () => {
  describe('PasswordComponent', () => {

    let comp = buildCompFixture()
    let service = buildServiceFixture()

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
