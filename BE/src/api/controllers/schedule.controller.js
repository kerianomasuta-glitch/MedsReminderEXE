class ScheduleController {
  constructor({ scheduleService }) {
    this.scheduleService = scheduleService;
  }

  #actor(req) {
    return { userId: req.user.userId, roleName: req.user.roleName };
  }

  createSchedule = async (req, res, next) => {
    try {
      const { patientId, prescriptionId, startDate, endDate, frequencyType, timeSlots, daysOfWeek, intervalDays, reminderMinutesBefore, timezone } = req.body;
      const schedule = await this.scheduleService.createSchedule({
        actor: this.#actor(req),
        patientId,
        prescriptionId,
        createdBy: req.user.userId,
        startDate,
        endDate,
        frequencyType,
        timeSlots,
        daysOfWeek,
        intervalDays,
        reminderMinutesBefore,
        timezone,
      });
      res.status(201).json({
        status: 'success',
        message: 'Tạo lịch uống thuốc thành công',
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSchedule = async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        patientId,
        prescriptionId,
        startDate,
        endDate,
        frequencyType,
        timeSlots,
        daysOfWeek,
        intervalDays,
        reminderMinutesBefore,
        timezone,
        isActive,
      } = req.body;
      const schedule = await this.scheduleService.updateSchedule({
        actor: this.#actor(req),
        id,
        data: {
          patientId,
          prescriptionId,
          startDate,
          endDate,
          frequencyType,
          timeSlots,
          daysOfWeek,
          intervalDays,
          reminderMinutesBefore,
          timezone,
          isActive,
        },
      });
      res.json({
        status: 'success',
        message: 'Cập nhật lịch uống thuốc thành công',
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  };

  getSchedulesByPatient = async (req, res, next) => {
    try {
      const { patientId } = req.params;
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

      const { schedules, total } = await this.scheduleService.getSchedulesByPatient({
        actor: this.#actor(req),
        patientId,
        limit,
        page,
      });
      res.json({
        status: 'success',
        message: 'Lấy danh sách lịch thành công',
        data: { schedules, total, page, limit },
      });
    } catch (error) {
      next(error);
    }
  };

  getScheduleById = async (req, res, next) => {
    try {
      const schedule = await this.scheduleService.getScheduleById({
        actor: this.#actor(req),
        id: req.params.id,
      });
      res.json({
        status: 'success',
        message: 'Lấy thông tin lịch thành công',
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteSchedule = async (req, res, next) => {
    try {
      await this.scheduleService.deleteSchedule({
        actor: this.#actor(req),
        id: req.params.id,
      });
      res.json({
        status: 'success',
        message: 'Xóa lịch uống thuốc thành công',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ScheduleController;
