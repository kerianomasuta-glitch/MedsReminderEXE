class AuthController {
  constructor({ authService }) {
    this.authService = authService;
  }

  registerUser = async (req, res, next) => {
    try {
      const { email, password, phone, name, roleId, authPin, birthday, gender } = req.body;
      const newUser = await this.authService.registerUser({
        email, password, phone, name, roleId, authPin, birthday, gender,
      });
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
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
}

export default AuthController;
