class AuthController {
  constructor({ authService }) {
    this.authService = authService;
  }

  registerCaregiver = async (req, res, next) => {
    try {
      const { email, password, phone, name } = req.body;
      const newUser = await this.authService.registerCaregiver({
        email, password, phone, name,
      });
      res.status(201).json({
        status: 'success',
        message: 'Đăng ký tài khoản người thân thành công',
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  };

  loginUser = async (req, res, next) => {
    try {
      const { email, phone, password } = req.body;
      const result = await this.authService.loginUser({
        email,
        phone,
        password,
        deviceName: req.device,
      });
      res.json({
        status: 'success',
        message: 'Đăng nhập thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  loginPatient = async (req, res, next) => {
    try {
      const { caregiverPhone, authPin } = req.body;
      const result = await this.authService.loginPatient({
        caregiverPhone,
        authPin,
        deviceName: req.device,
      });
      res.json({
        status: 'success',
        message: 'Đăng nhập bệnh nhân thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  refreshUserToken = async (req, res, next) => {
    try {
      const { refreshToken, deviceId } = req.body;
      const tokens = await this.authService.refreshUserToken({
        refreshToken,
        deviceId,
        deviceName: req.device,
      });
      res.json({
        status: 'success',
        message: 'Làm mới token thành công',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  };

  logoutUser = async (req, res, next) => {
    try {
      const { deviceId } = req.body;
      const result = await this.authService.logoutUser({
        userId: req.user.userId,
        deviceId,
      });
      res.json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  registerAdmin = async (req, res, next) => {
    try {
      const { email, password, phone, name } = req.body;
      const newUser = await this.authService.registerAdmin({
        email, password, phone, name,
      });
      res.status(201).json({
        status: 'success',
        message: 'Đăng ký tài khoản admin thành công',
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
