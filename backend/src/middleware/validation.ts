import { Request, Response, NextFunction } from 'express';

export function validateHouse(req: Request, res: Response, next: NextFunction) {
  const house = req.query.house || req.body?.house;
  if (house && house !== 'Lok Sabha' && house !== 'Rajya Sabha') {
    return res.status(400).json({
      success: false,
      message: 'Invalid house parameter. Must be either "Lok Sabha" or "Rajya Sabha".',
    });
  }
  next();
}
