// deepcode ignore NoHardcodedPasswords/test: test fixture values only
const TEST_CREDENTIALS = {
  mismatch: { first: 'password1', second: 'password2' },
  matching: 'myPassword',
};

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
        changePassword() {
          if (this.password !== this.confirmPassword) {
            this.doNotMatch = 'ERROR';
          } else {
            service.save(this.password);
            this.success = 'OK';
          }
        },
      };
      service = { save: jest.fn() };
    });

    test('should show error if passwords do not match', () => {
      // GIVEN
      comp.password = TEST_CREDENTIALS.mismatch.first;
      comp.confirmPassword = TEST_CREDENTIALS.mismatch.second;
      // WHEN
      comp.changePassword();
      // THEN
      expect(comp.doNotMatch).toBe('ERROR');
      expect(comp.error).toBeNull();
      expect(comp.success).toBeNull();
    });

    test('should call Auth.changePassword when passwords match', () => {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_CREDENTIALS.matching;

      // WHEN
      comp.changePassword();

      // THEN
      expect(service.save).toHaveBeenCalledWith(TEST_CREDENTIALS.matching);
    });

    test('should set success to OK upon success', function() {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_CREDENTIALS.matching;

      // WHEN
      comp.changePassword();

      // THEN
      expect(comp.doNotMatch).toBeNull();
      expect(comp.error).toBeNull();
      expect(comp.success).toBe('OK');
    });

    test('should notify of error if change password fails', function() {
      // GIVEN
      comp.password = comp.confirmPassword = TEST_CREDENTIALS.matching;

      // WHEN
      comp.changePassword();

      // THEN
      expect(comp.doNotMatch).toBeNull();
      expect(comp.success).toBeNull();
      expect(comp.error).toBe('ERROR');
    });
  });
});
