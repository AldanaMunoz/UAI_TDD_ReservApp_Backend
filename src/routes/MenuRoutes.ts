import { Router } from "express";
import MenuController from "../controllers/MenuController";
import { requireRole } from "../middleware/AuthMiddleware";

const router = Router();

router.get("/reservas/mi-reserva/:fecha", MenuController.getMyReservation);
router.get("/reservas/usuario/:userId", MenuController.getReservationsByUser);
router.get("/reservas/dia/:fecha", requireRole("Administrador"), MenuController.getReservationsByDay);
router.patch("/reservas/:id/asistencia", requireRole("Administrador"), MenuController.updateAttendance);
router.patch("/reservas/finalizar-turno/:fecha/:turno", requireRole("Administrador"), MenuController.finishShift);
router.post("/reservas", MenuController.createReservation);
router.delete("/reservas/:id", MenuController.cancelReservation);
router.get("/:fecha", MenuController.getMenuByDate);

export default router;
