import { Router } from 'express';
import { PropertyController } from './property.controller';

const router = Router();
const propertyController = new PropertyController();

router.get('/', propertyController.getAllProperties.bind(propertyController));

export default router;