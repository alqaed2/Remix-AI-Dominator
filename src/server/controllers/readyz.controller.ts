import { Request, Response } from "express";

export async function readyzController(req: Request, res: Response) {
  return res.json({ ready: true });
}
