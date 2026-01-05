import express from 'express';
import {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/customer.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  updateProfileValidator,
  addAddressValidator,
  updateAddressValidator,
  addressIdValidator,
} from '../validators/index.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('Customer'));

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileValidator), updateProfile);
router.post('/address', validate(addAddressValidator), addAddress);
router.put(
  '/address/:addressId',
  validate(updateAddressValidator),
  updateAddress
);
router.delete(
  '/address/:addressId',
  validate(addressIdValidator),
  deleteAddress
);
router.put(
  '/address/:addressId/default',
  validate(addressIdValidator),
  setDefaultAddress
);

export default router;
