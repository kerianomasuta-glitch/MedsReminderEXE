class MedicationLogController {
  constructor({ medicationLogService }) {
    this.medicationLogService = medicationLogService;
  }

  #actor(req) {
    return { userId: req.user.userId, roleName: req.user.roleName };
  }

  createLog = async (req, res, next) => {
    try {
      const { patientId, scheduleId, prescriptionId, expectedTime } = req.body;
      const log = await this.medicationLogService.createLog({
        actor: this.#actor(req),
        patientId,
        scheduleId,
        prescriptionId,
        expectedTime,
      });
      res.status(201).json({
        status: 'success',
        message: 'Tạo bản ghi uống thuốc thành công',
        data: log,
      });
    } catch (error) {
      next(error);
    }
  };

  updateLogStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, actualTime, skipReason, note } = req.body;
      const log = await this.medicationLogService.updateLogStatus({
        actor: this.#actor(req),
        id,
        status,
        actualTime,
        skipReason,
        note,
      });
      res.json({
        status: 'success',
        message: 'Cập nhật trạng thái thành công',
        data: log,
      });
    } catch (error) {
      next(error);
    }
  };

  getLogsByPatient = async (req, res, next) => {
    try {
      const { patientId } = req.params;
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const status = req.query.status || undefined;

      const { logs, total } = await this.medicationLogService.getLogsByPatient({
        actor: this.#actor(req),
        patientId,
        limit,
        page,
        status,
      });
      res.json({
        status: 'success',
        message: 'Lấy danh sách bản ghi thành công',
        data: { logs, total, page, limit },
      });
    } catch (error) {
      next(error);
    }
  };

  getLogsBySchedule = async (req, res, next) => {
    try {
      const { scheduleId } = req.params;
      const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

      const { logs, total } = await this.medicationLogService.getLogsBySchedule({
        actor: this.#actor(req),
        scheduleId,
        limit,
        page,
      });
      res.json({
        status: 'success',
        message: 'Lấy danh sách bản ghi theo lịch thành công',
        data: { logs, total, page, limit },
      });
    } catch (error) {
      next(error);
    }
  };

  getLogById = async (req, res, next) => {
    try {
      const log = await this.medicationLogService.getLogById({
        actor: this.#actor(req),
        id: req.params.id,
      });
      res.json({
        status: 'success',
        message: 'Lấy chi tiết bản ghi thành công',
        data: log,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default MedicationLogController;
