import { Router } from "express";
import ClassesController from "./controllers/ClassesController";
import ConnectionsController from "./controllers/ConnectionsController";

const routes = Router();
const classesController = new ClassesController();
const connectionController = new ConnectionsController();

// Aulas
routes.post("/classes", classesController.create);
routes.get("/classes", classesController.index);

// Conexões
routes.post("/connections", connectionController.create);
routes.get("/connections", connectionController.index);

export default routes;
