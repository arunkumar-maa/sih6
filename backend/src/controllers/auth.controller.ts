import { Request, Response } from 'express';
import { getUserDataScope } from '../utils/rbac.js';
import * as fs from 'fs';
import * as path from 'path';

export async function getProfile(req: Request, res: Response) {
  try {
    if (!req.profile) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const scope = getUserDataScope(req.profile);
    return res.json({
      success: true,
      data: {
        profile: req.profile,
        scope,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getDemoAccounts(req: Request, res: Response) {
  try {
    const jsonPath = path.resolve(process.cwd(), 'src/data/demoAccounts.json');
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      return res.json({ success: true, data });
    }
    return res.json({ success: true, data: [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
