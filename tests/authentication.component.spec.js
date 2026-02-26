const assert = require('assert)')

describe('Component Tests', () => {
  describe('PasswordComponent', () => {

    let comp
    let service

    test('should show error if passwords do not match', () => {
      // GIVEN
      comp.password = 'testPass1';  // nosemgrep: hardcoded-password
      comp.confirmPassword = 'testPass2';  // nosemgrep: hardcoded-password
      // WHEN
      comp.changePassword();
      // THEN
      assert(comp.doNotMatch).toBe('ERROR');
      assert(comp.error).toBeNull();
      assert(comp.success).toBeNull();
    });

    test('should call Auth.changePassword when passwords match', () => {
      // GIVEN
      // Test fixture value - not a real credential
      comp.password = comp.confirmPassword = 'testFixturePass';  // nosemgrep: hardcoded-password

      // WHEN
      comp.changePassword();

      // THEN
      assert(service.save).toHaveBeenCalledWith('testFixturePass');
    });

    test('should set success to OK upon success', function() {
      // GIVEN
      comp.password = comp.confirmPassword = 'testFixturePass';  // nosemgrep: hardcoded-password

      // WHEN
      comp.changePassword();

      // THEN
      expect(comp.doNotMatch).toBeNull();
      expect(comp.error).toBeNull();
      expect(comp.success).toBe('OK');
    });

    test('should notify of error if change password fails', function() {
      // GIVEN
      comp.password = comp.confirmPassword = 'testFixturePass';  // nosemgrep: hardcoded-password

      // WHEN
      comp.changePassword();

      // THEN
      assert(comp.doNotMatch).toBeNull();
      assert(comp.success).toBeNull();
      assert(comp.error).toBe('ERROR');
    });
  });
});
