class CaregiverPatientController {
  constructor({ caregiverPatientService }) {
    this.caregiverPatientService = caregiverPatientService;
  }

  getMyPatients = async (req, res, next) => {
    try {
      const data = await this.caregiverPatientService.getMyPatients({
        caregiverId: req.user.userId,
      });
      res.json({
        status: 'success',
        message: 'Lấy danh sách bệnh nhân thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  createPatient = async (req, res, next) => {
    try {
      const { name, authPin, birthday, gender } = req.body;
      const result = await this.caregiverPatientService.createPatient({
        caregiverId: req.user.userId,
        name,
        authPin,
        birthday,
        gender,
      });

      res.status(201).json({
        status: 'success',
        message: 'Tạo bệnh nhân thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default CaregiverPatientController;
