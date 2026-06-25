class AuthController {
    constructor({ authService }) {
        this.authService = authService;
    }

    registerUser = async (req, res, next) => {
        try {
            const { email, password, phone, name, roleId, authPin, birthday, gender } = req.body;
            const newUser = await this.authService.registerUser({ email, password, phone, name, roleId, authPin, birthday, gender });
            res.status(201).json({
                status: 'success',
                message: 'User registered successfully',
                data: newUser
            });
        }catch (error) {
            next(error);
        }
    }
}

export default AuthController;