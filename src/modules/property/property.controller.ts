import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../../generated/prisma'; // Sesuaikan path prisma client Anda

const prisma = new PrismaClient();

export class PropertyController {
  
  async getAllProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const properties = await prisma.property.findMany({
        include: {
          rooms: true,    
          pictures: true, 
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json({
        message: "Get all properties success",
        data: properties
      });
    } catch (error) {
      next(error);
    }
  }
}