class MedicationController {
  constructor({ medicationService }) {
    this.medicationService = medicationService;
  }

  #actor(req) {
    return { userId: req.user.userId, roleName: req.user.roleName };
  }

  createMedication = async (req, res, next) => {
    try {
      const { patientId, name, form, dosage, unit, usageNote, description } = req.body;
      const medication = await this.medicationService.createMedication({
        actor: this.#actor(req),
        patientId,
        createdBy: req.user.userId,
        name,
        form,
        dosage,
        unit,
        usageNote,
        description,
      });
      res.status(201).json({
        status: 'success',
        message: 'Tạo thuốc thành công',
        data: medication,
      });
    } catch (error) {
      next(error);
    }
  };

  updateMedication = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, form, dosage, unit, usageNote, description } = req.body;
      const medication = await this.medicationService.updateMedication({
        actor: this.#actor(req),
        id,
        data: { name, form, dosage, unit, usageNote, description },
      });
      res.json({
        status: 'success',
        message: 'Cập nhật thuốc thành công',
        data: medication,
      });
    } catch (error) {
      next(error);
    }
  };

  getMedicationsByPatient = async (req, res, next) => {
    try {
      const { patientId } = req.params;
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

      const { medications, total } = await this.medicationService.getMedicationsByPatient({
        actor: this.#actor(req),
        patientId,
        limit,
        page,
      });
      res.json({
        status: 'success',
        message: 'Lấy danh sách thuốc thành công',
        data: { medications, total, page, limit },
      });
    } catch (error) {
      next(error);
    }
  };

  getMedicationById = async (req, res, next) => {
    try {
      const medication = await this.medicationService.getMedicationById({
        actor: this.#actor(req),
        id: req.params.id,
      });
      res.json({
        status: 'success',
        message: 'Lấy thông tin thuốc thành công',
        data: medication,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMedication = async (req, res, next) => {
    try {
      await this.medicationService.deleteMedication({
        actor: this.#actor(req),
        id: req.params.id,
      });
      res.json({
        status: 'success',
        message: 'Xóa thuốc thành công',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default MedicationController;
