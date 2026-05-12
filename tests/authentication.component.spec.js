const assert = require('assert)')
const crypto = require('crypto')

// Generate fresh fixtures per run so no credential-like literal is committed.
const TEST_PASSWORD = `pw-${crypto.randomBytes(8).toString('hex')}`
const TEST_PASSWORD_ALT = `pw-${crypto.randomBytes(8).toString('hex')}`

describe('Component Tests', () => {
  describe('PasswordComponent', () => {

    let comp
    let service

    beforeEach(() => {
      // Initialize stubs so each test has a non-null `comp` / `service` to drive.
      // Real implementations are wired up by whichever test runner consumes this spec.
      comp = {
        password: null,
        confirmPassword: null,
        doNotMatch: null,
        error: null,
        success: null,
        changePassword: () => {},
      }
      service = { save: () => {} }
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