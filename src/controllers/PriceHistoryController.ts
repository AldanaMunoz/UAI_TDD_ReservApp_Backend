import type { Request, Response } from "express";
import PriceHistoryModel from "../models/PriceHistoryModel";
import type { IPriceHistory } from "../interfaces/PriceHistoryInterface";

export async function getAllPriceHistory(_req: Request, res: Response) {
  try {
    const data = await PriceHistoryModel.find();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching price history", error });
  }
}

export async function getPriceHistoryById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const item = await PriceHistoryModel.findById(id);
    if (!item) return res.status(404).json({ message: "Price history not found" });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching price history", error });
  }
}

export async function createPriceHistory(req: Request, res: Response) {
  try {
    const body = req.body as IPriceHistory;
    const created = await PriceHistoryModel.create(body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: "Error creating price history", error });
  }
}

export async function updatePriceHistory(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const patch: Partial<IPriceHistory> = { ...req.body };

    const updated = await PriceHistoryModel.updatePartial(id, patch);
    if (!updated) return res.status(404).json({ message: "Price history not found" });

    return res.status(200).json({ message: "Price history updated", priceHistory: updated });
  } catch (error) {
    return res.status(500).json({ message: "Error updating price history", error });
  }
}

export async function hardDeletePriceHistory(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const ok = await PriceHistoryModel.hardDelete(id);
    if (!ok) return res.status(404).json({ message: "Price history not found" });
    return res.status(200).json({ message: "Price history hard deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Error hard deleting price history", error });
  }
}

export default {
  getAllPriceHistory,
  getPriceHistoryById,
  createPriceHistory,
  updatePriceHistory,
  hardDeletePriceHistory,
};
