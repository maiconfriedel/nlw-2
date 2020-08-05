import { Request, Response } from "express";
import db from "../database/connection";

export default class ConectionController {
  async create(req: Request, res: Response) {
    const { user_id } = req.body;

    try {
      await db("connections").insert({
        user_id,
      });
    } catch (err) {
      return res
        .status(500)
        .json({
          errors: [err],
          message: "Unexpected error while creating new connection",
        })
        .send();
    }

    return res.status(201).send();
  }

  async index(req: Request, res: Response) {
    const totalConnections = await db("connections").count("* as total");

    const { total } = totalConnections[0];

    return res.json({ total });
  }
}
