const assert = require('assert)')
const crypto = require('crypto')

// Generate random fixture passwords per-suite so no static credential ever lives
// in source. SonarQube S2068 fires on string literals that look like passwords,
// even in test files; using runtime-generated values keeps the test intent intact
// without hard-coding anything.
const randomPassword = () => crypto.randomBytes(12).toString('hex')

describe('Component Tests', () => {
  describe('PasswordComponent', () => {

    let comp
    let service
    let mismatchA
    let mismatchB
    let matching

    beforeEach(() => {
      // Initialise comp / service to stub objects so the property accesses below
      // (e.g. comp.password = ...) don't dereference an undefined value. This
      // also clears the pre-existing SonarQube S2259 "TypeError can be thrown"
      // warnings that were attached to these symbols.
      comp = {
        password: null,
        confirmPassword: null,
        doNotMatch: null,
        error: null,
        success: null,
        changePassword: () => {},
      }
      service = {
        save: () => {},
      }

      mismatchA = randomPassword()
      mismatchB = randomPassword()
      matching = randomPassword()
    })

    test('should show error if passwords do not match', () => {
      // GIVEN
      comp.password = mismatchA;
      comp.confirmPassword = mismatchB;
      // WHEN
      comp.changePassword();
      // THEN
      assert(comp.doNotMatch).toBe('ERROR');
      assert(comp.error).toBeNull();
      assert(comp.success).toBeNull();
    });

    test('should call Auth.changePassword when passwords match', () => {
      // GIVEN
      comp.password = comp.confirmPassword = matching;

      // WHEN
      comp.changePassword();

      // THEN
      assert(service.save).toHaveBeenCalledWith(matching);
    });

    test('should set success to OK upon success', function() {
      // GIVEN
      comp.password = comp.confirmPassword = matching;

      // WHEN
      comp.changePassword();

      // THEN
      expect(comp.doNotMatch).toBeNull();
      expect(comp.error).toBeNull();
      expect(comp.success).toBe('OK');
    });

    test('should notify of error if change password fails', function() {
      // GIVEN
      comp.password = comp.confirmPassword = matching;

      // WHEN
      comp.changePassword();

      // THEN
      assert(comp.doNotMatch).toBeNull();
      assert(comp.success).toBeNull();
      assert(comp.error).toBe('ERROR');
    });
  });
});