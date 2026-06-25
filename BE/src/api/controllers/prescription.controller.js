class PrescriptionController {
  constructor({ prescriptionService }) {
    this.prescriptionService = prescriptionService;
  }

  #actor(req) {
    return { userId: req.user.userId, roleName: req.user.roleName };
  }

  createPrescription = async (req, res, next) => {
    try {
      const { patientId, title, medications, startDate, endDate, prescribedAt, doctorName, note } = req.body;
      const prescription = await this.prescriptionService.createPrescription({
        actor: this.#actor(req),
        patientId,
        createdBy: req.user.userId,
        title,
        medications,
        startDate,
        endDate,
        prescribedAt,
        doctorName,
        note,
      });
      res.status(201).json({
        status: 'success',
        message: 'Tạo đơn thuốc thành công',
        data: prescription,
      });
    } catch (error) {
      next(error);
    }
  };

  updatePrescription = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, medications, startDate, endDate, prescribedAt, doctorName, note, isActive } = req.body;
      const prescription = await this.prescriptionService.updatePrescription({
        actor: this.#actor(req),
        id,
        data: { title, medications, startDate, endDate, prescribedAt, doctorName, note, isActive },
      });
      res.json({
        status: 'success',
        message: 'Cập nhật đơn thuốc thành công',
        data: prescription,
      });
    } catch (error) {
      next(error);
    }
  };

  getPrescriptionsByPatient = async (req, res, next) => {
    try {
      const { patientId } = req.params;
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

      const { prescriptions, total } = await this.prescriptionService.getPrescriptionsByPatient({
        actor: this.#actor(req),
        patientId,
        limit,
        page,
      });
      res.json({
        status: 'success',
        message: 'Lấy danh sách đơn thuốc thành công',
        data: { prescriptions, total, page, limit },
      });
    } catch (error) {
      next(error);
    }
  };

  getPrescriptionById = async (req, res, next) => {
    try {
      const prescription = await this.prescriptionService.getPrescriptionById({
        actor: this.#actor(req),
        id: req.params.id,
      });
      res.json({
        status: 'success',
        message: 'Lấy thông tin đơn thuốc thành công',
        data: prescription,
      });
    } catch (error) {
      next(error);
    }
  };

  deletePrescription = async (req, res, next) => {
    try {
      await this.prescriptionService.deletePrescription({
        actor: this.#actor(req),
        id: req.params.id,
      });
      res.json({
        status: 'success',
        message: 'Xóa đơn thuốc thành công',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default PrescriptionController;
