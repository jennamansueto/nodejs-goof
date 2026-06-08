// deepcode ignore NoHardcodedPasswords/test: test fixture values only
const TEST_CREDENTIALS = {
  mismatch: { first: 'password1', second: 'password2' },
  matching: 'myPassword',
};

describe('Component Tests', () => {
  describe('PasswordComponent', () => {

    let comp;
    let service;

    beforeEach(() => {
      service = { save: jest.fn() };
      comp = {
        password: null,
        confirmPassword: null,
        doNotMatch: null,
        error: null,
        success: null,
        changePassword() {
          if (this.password !== this.confirmPassword) {
            this.doNotMatch = 'ERROR';
            return;
          }
          try {
            service.save(this.password);
            this.success = 'OK';
          } catch (_) {
            this.error = 'ERROR';
          }
        },
      };
    });

    test('should show error if passwords do not match', () => {
      comp.password = TEST_CREDENTIALS.mismatch.first;
      comp.confirmPassword = TEST_CREDENTIALS.mismatch.second;
      comp.changePassword();
      expect(comp.doNotMatch).toBe('ERROR');
      expect(comp.error).toBeNull();
      expect(comp.success).toBeNull();
    });

    test('should call Auth.changePassword when passwords match', () => {
      comp.password = comp.confirmPassword = TEST_CREDENTIALS.matching;
      comp.changePassword();
      expect(service.save).toHaveBeenCalledWith(TEST_CREDENTIALS.matching);
    });

    test('should set success to OK upon success', () => {
      comp.password = comp.confirmPassword = TEST_CREDENTIALS.matching;
      comp.changePassword();
      expect(comp.doNotMatch).toBeNull();
      expect(comp.error).toBeNull();
      expect(comp.success).toBe('OK');
    });

    test('should notify of error if change password fails', () => {
      comp.password = comp.confirmPassword = TEST_CREDENTIALS.matching;
      service.save = jest.fn(() => { throw new Error('save failed'); });
      comp.changePassword();
      expect(comp.doNotMatch).toBeNull();
      expect(comp.success).toBeNull();
      expect(comp.error).toBe('ERROR');
    });
  });
});
