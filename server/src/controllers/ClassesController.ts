import { Request, Response } from "express";
import db from "../database/connection";
import convertHourToMinutes from "../utils/convertHourToMinutes";

interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export default class ClassesController {
  async create(req: Request, res: Response) {
    const { name, avatar, whatsapp, bio, subject, cost, schedule } = req.body;

    const trx = await db.transaction();

    try {
      const insertedUsersIds = await trx("users").insert({
        name,
        avatar,
        whatsapp,
        bio,
      });

      const insertedClassesIds = await trx("classes").insert({
        subject,
        cost,
        user_id: insertedUsersIds[0],
      });

      const classSchedule = schedule.map((item: ScheduleItem) => {
        return {
          week_day: item.week_day,
          from: convertHourToMinutes(item.from),
          to: convertHourToMinutes(item.to),
          class_id: insertedClassesIds[0],
        };
      });

      await trx("class_schedules").insert(classSchedule);

      await trx.commit();

      return res.status(201).send();
    } catch (err) {
      await trx.rollback();

      return res.status(500).json({
        errors: [err],
        message: "Unexpected error while creating new class",
      });
    }
  }

  async index(req: Request, res: Response) {
    const filters = req.query;

    if (!filters.subject || !filters.week_day || !filters.time) {
      return res.status(400).json({
        errors: ["Missing filters to search classes"],
      });
    }

    const timeInMinutes = convertHourToMinutes(filters.time as string);

    const classes = await db("classes")
      .whereExists(function () {
        this.select("class_schedules.*")
          .from("class_schedules")
          .whereRaw("`class_schedules`.`class_id` = `classes`.`id`")
          .whereRaw("`class_schedules`.`week_day` = ??", [
            Number(filters.week_day),
          ])
          .whereRaw("`class_schedules`.`from` <= ??", [timeInMinutes])
          .whereRaw("`class_schedules`.`to` > ??", [timeInMinutes]);
      })
      .where("classes.subject", "=", filters.subject as string)
      .join("users", "classes.user_id", "=", "users.id")
      .select(["classes.*", "users.*"]);

    return res.json(classes);
  }
}
