import asyncHandler from 'express-async-handler';
import { Customer } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';

export const getProfile = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.userId).select('-__v');

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  res.json(
    new ApiResponse(200, { customer }, 'Profile retrieved successfully')
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const customer = await Customer.findById(req.userId);

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  if (name) customer.name = name;
  if (email) customer.email = email;

  await customer.save();



  res.json(
    new ApiResponse(
      200,
      {
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      },
      'Profile updated successfully'
    )
  );
});

export const addAddress = asyncHandler(async (req, res) => {
  const { label, address, landmark, city, state, pincode } = req.body;

  const customer = await Customer.findById(req.userId);

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  const isFirstAddress = customer.addresses.length === 0;

 
  customer.addresses.push({
    label,
    address: address.trim(),
    landmark: landmark?.trim() || '',
    city: city?.trim() || '',
    state: state?.trim() || '',
    pincode: pincode?.trim() || '',
    isDefault: isFirstAddress,
  });

  await customer.save();

  const newAddress = customer.addresses[customer.addresses.length - 1];

 

  res.status(201).json(
    new ApiResponse(
      201,
      {
        address: newAddress,
      },
      'Address added successfully'
    )
  );
});

export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { label, address, landmark, city, state, pincode } = req.body;

  const customer = await Customer.findById(req.userId);

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  const addressIndex = customer.addresses.findIndex(
    (addr) => addr._id.toString() === addressId
  );

  if (addressIndex === -1) {
    throw new ApiError(404, 'Address not found');
  }


  if (label) customer.addresses[addressIndex].label = label;
  if (address) customer.addresses[addressIndex].address = address.trim();
  if (landmark !== undefined)
    customer.addresses[addressIndex].landmark = landmark.trim();
  if (city !== undefined) customer.addresses[addressIndex].city = city.trim();
  if (state !== undefined)
    customer.addresses[addressIndex].state = state.trim();
  if (pincode !== undefined)
    customer.addresses[addressIndex].pincode = pincode.trim();

  await customer.save();



  res.json(
    new ApiResponse(
      200,
      {
        address: customer.addresses[addressIndex],
      },
      'Address updated successfully'
    )
  );
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const customer = await Customer.findById(req.userId);

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  const addressIndex = customer.addresses.findIndex(
    (addr) => addr._id.toString() === addressId
  );

  if (addressIndex === -1) {
    throw new ApiError(404, 'Address not found');
  }

  const wasDefault = customer.addresses[addressIndex].isDefault;

  customer.addresses.splice(addressIndex, 1);

  if (wasDefault && customer.addresses.length > 0) {
    customer.addresses[0].isDefault = true;
  }

  await customer.save();



  res.json(new ApiResponse(200, null, 'Address deleted successfully'));
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const customer = await Customer.findById(req.userId);

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  const addressIndex = customer.addresses.findIndex(
    (addr) => addr._id.toString() === addressId
  );

  if (addressIndex === -1) {
    throw new ApiError(404, 'Address not found');
  }

  customer.addresses.forEach((addr) => {
    addr.isDefault = false;
  });

  customer.addresses[addressIndex].isDefault = true;

  await customer.save();



  res.json(
    new ApiResponse(
      200,
      {
        address: customer.addresses[addressIndex],
      },
      'Default address set successfully'
    )
  );
});
