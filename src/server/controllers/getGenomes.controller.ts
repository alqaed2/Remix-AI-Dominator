import { Request, Response } from "express";
import { db } from "../db";

export async function getGenomesController(req: Request, res: Response) {
  try {
    const genomes = await db.getAllNicheGenomes();
    return res.json(genomes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
