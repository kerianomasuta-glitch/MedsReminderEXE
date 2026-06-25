class CaregiverPatientController {
  constructor({ caregiverPatientService }) {
    this.caregiverPatientService = caregiverPatientService;
  }

  createPatient = async (req, res, next) => {
    try {
      const caregiverId = req.user.userId;
      const { name, authPin, birthday, gender } = req.body;

      const result = await this.caregiverPatientService.createPatient({
        caregiverId,
        name,
        authPin,
        birthday,
        gender,
      });

      res.status(201).json({
        status: 'success',
        message: 'Tạo hồ sơ bệnh nhân thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default CaregiverPatientController;
