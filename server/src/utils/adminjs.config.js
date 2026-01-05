import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { componentLoader, Components } from './componentLoader.js'; // Ensure this path is correct
import * as AdminJSMongoose from '@adminjs/mongoose';
import bcrypt from 'bcrypt';
import {
  Customer,
  DeliveryPartner,
  Admin,
  Order,
  Product,
  Category,
  Branch,
  Cart,
  Coupon,
} from '../models/index.js';
import { ADMIN_CREDENTIALS } from '../config/config.js';
import { deleteMultipleImages } from '../config/cloudinary.js';
import { BusinessUser } from '../models/index.js';

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

export const createAdminJS = () => {
  const adminOptions = {
    componentLoader,
    dashboard: {
      component: Components.Dashboard,
      handler: async () => {
        try {
          const pendingOrdersCount = await Order.countDocuments({ status: 'pending' });
          const recentOrders = await Order.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'name');

          // ✅ Fetch the 5 most recently cancelled orders
          const recentCancelledOrders = await Order.find({ status: 'cancelled' })
            .sort({ updatedAt: -1 }) // Sort by when it was last updated (i.e., cancelled)
            .limit(5)
            .populate('customer', 'name');

          return {
            pendingCount: pendingOrdersCount,
            recentOrders: recentOrders,
            recentCancelledOrders: recentCancelledOrders, // ✅ Pass the new data to the dashboard component
          };
        } catch (error) {
          console.error('AdminJS Dashboard Handler Error:', error);
          return {
            pendingCount: 0,
            recentOrders: [],
            recentCancelledOrders: [], // ✅ Ensure it returns an empty array on error
          };
        }
      },
    },
 
    resources: [
      {
        resource: Customer,
        options: {
          navigation: {
            name: 'User Management',
            icon: 'User',
          },
          properties: {
            password: { isVisible: false },
            createdAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            updatedAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
          },
          actions: {
            new: { isAccessible: false },
          },
        },
      },
      {
        resource: DeliveryPartner,
        options: {
          navigation: {
            name: 'User Management',
            icon: 'Truck',
          },
          properties: {
            password: {
              // This makes the password field appear on the 'new' and 'edit' forms.
              isVisible: { list: false, show: false, edit: true },
            },
            liveLocation: { isVisible: false },
            createdAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            updatedAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
          },
          // The 'actions' block that disabled the 'new' button has been removed,
          // which enables the create button.
        },
      },
      {
        resource: Admin,
        options: {
          navigation: {
            name: 'User Management',
            icon: 'Shield',
          },
          properties: {
            password: { isVisible: true },
            createdAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            updatedAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
          },
        },
      },
      {
        resource: BusinessUser,
        options: {
          navigation: {
            name: 'User Management',
            icon: 'Briefcase',
          },
          listProperties: [
            'businessDetails.companyName',
            'phone',
            'businessDetails.email',
            'verificationStatus',
            'createdAt',
          ],
          showProperties: [
            'phone',
            'businessDetails.companyName',
            'businessDetails.gstNumber',
            'businessDetails.contactPerson',
            'businessDetails.email',
            'businessDetails.address',
            'verificationStatus',
            'rejectionReason',
            'approvedBy',
            'approvedAt',
            'createdAt',
            'updatedAt',
          ],
          properties: {
            _id: { isVisible: false },
            __v: { isVisible: false },
            role: { isVisible: false },
            isActivated: { isVisible: false },

            phone: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },

            'businessDetails.companyName': {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            'businessDetails.gstNumber': {
              isVisible: { list: false, filter: true, show: true, edit: false },
            },
            'businessDetails.contactPerson': {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },
            'businessDetails.email': {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            'businessDetails.address': {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },

            // ✅ Admin approval field (Q10 - Simple status toggle)
            verificationStatus: {
              isVisible: { list: true, filter: true, show: true, edit: true },
              availableValues: [
                { value: 'Pending', label: 'Pending' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Rejected', label: 'Rejected' },
              ],
            },

            rejectionReason: {
              isVisible: { list: false, filter: false, show: true, edit: true },
              type: 'textarea',
              props: {
                rows: 3,
              },
            },

            approvedBy: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },
            approvedAt: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },

            createdAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            updatedAt: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },
          },

          // ✅ Auto-set approvedBy when admin approves
          actions: {
            edit: {
              before: async (request, context) => {
                const { payload, record } = request;

                // ✅ FIX: Get record ID from params
                const recordId = request.params?.recordId;

                if (!recordId) {
                  return request;
                }

                // ✅ Fetch the current record from database to get old status
                const currentRecord = await BusinessUser.findById(recordId);

                if (!currentRecord) {
                  throw new Error('Business user not found');
                }

                const oldStatus = currentRecord.verificationStatus;

                // If status changed to Approved
                if (
                  payload.verificationStatus === 'Approved' &&
                  oldStatus !== 'Approved'
                ) {
                  payload.approvedBy = context.currentAdmin._id;
                  payload.approvedAt = new Date();
                  payload.rejectionReason = undefined;
                }

                // If status changed to Rejected, require rejection reason
                if (
                  payload.verificationStatus === 'Rejected' &&
                  !payload.rejectionReason
                ) {
                  throw new Error(
                    'Rejection reason is required when rejecting a business account'
                  );
                }

                return request;
              },
            },
          },
        },
      },
      {
        resource: Product,
        options: {
          navigation: {
            name: 'Inventory',
            icon: 'Package',
          },
          listProperties: [
            'images',
            'name',
            'price',
            'category',
            'inStock',
            'stock',
            'createdAt',
          ],
          showProperties: [
            'images',
            'name',
            'description',
            'price',
            'discountPrice',
            'quantity',
            'unit',
            'category',
            'inStock',
            'stock',
            'rating',
            'tags',
            'createdAt',
            'updatedAt',
          ],
          properties: {
            _id: {
              isVisible: false,
            },
            __v: {
              isVisible: false,
            },
            images: {
              isVisible: { list: true, filter: false, show: true, edit: false },
              components: {
                list: Components.ImageThumbnail,
                show: Components.ImageGallery,
              },
            },
            imageFile: {
              isVisible: {
                list: false,
                filter: false,
                show: false,
                edit: true,
              },
              custom: { maxImages: 5 },
              components: {
                edit: Components.ImageUpload,
              },
            },
            imagePublicIds: {
              isVisible: false,
            },
            _imagesReplaced: {
              isVisible: false,
            },
            name: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            description: {
              isVisible: { list: false, filter: false, show: true, edit: true },
            },
            price: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            discountPrice: {
              isVisible: { list: false, filter: false, show: true, edit: true },
            },
            quantity: {
              isVisible: { list: false, filter: false, show: true, edit: true },
            },
            unit: {
              isVisible: { list: false, filter: true, show: true, edit: true },
            },
            category: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            inStock: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            stock: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            rating: {
              isVisible: { list: false, filter: true, show: true, edit: true },
            },
            tags: {
              isVisible: { list: false, filter: false, show: true, edit: true },
            },
            createdAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            updatedAt: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },
          },
          actions: {
            edit: {
              before: async (request) => {
                const productId = request.params.recordId;

                if (request.payload?._imagesReplaced === 'true') {
                  const existingProduct = await Product.findById(productId);

                  if (existingProduct?.imagePublicIds?.length > 0) {
                    await deleteMultipleImages(existingProduct.imagePublicIds);
                  }
                }

                delete request.payload._imagesReplaced;
                return request;
              },
            },
            delete: {
              before: async (request) => {
                const productId = request.params.recordId;
                const product = await Product.findById(productId);

                if (product?.imagePublicIds?.length > 0) {
                  await deleteMultipleImages(product.imagePublicIds);
                }

                return request;
              },
            },
          },
        },
      },
      {
        resource: Category,
        options: {
          navigation: {
            name: 'Inventory',
            icon: 'Grid',
          },
          listProperties: [
            'images',
            'name',
            'priority',
            'isActive',
            'createdAt',
          ],
          showProperties: [
            'images',
            'name',
            'priority',
            'isActive',
            'createdAt',
            'updatedAt',
          ],
          properties: {
            _id: {
              isVisible: false,
            },
            __v: {
              isVisible: false,
            },
            images: {
              isVisible: { list: true, filter: false, show: true, edit: false },
              components: {
                list: Components.ImageThumbnail,
                show: Components.ImageGallery,
              },
            },
            imageFile: {
              isVisible: {
                list: false,
                filter: false,
                show: false,
                edit: true,
              },
              custom: { maxImages: 3 },
              components: {
                edit: Components.ImageUpload,
              },
            },
            imagePublicIds: {
              isVisible: false,
            },
            _imagesReplaced: {
              isVisible: false,
            },
            name: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            priority: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            isActive: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            createdAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            updatedAt: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },
          },
          actions: {
            edit: {
              before: async (request) => {
                const categoryId = request.params.recordId;

                if (request.payload?._imagesReplaced === 'true') {
                  const existingCategory = await Category.findById(categoryId);

                  if (existingCategory?.imagePublicIds?.length > 0) {
                    await deleteMultipleImages(existingCategory.imagePublicIds);
                  }
                }

                delete request.payload._imagesReplaced;
                return request;
              },
            },
            delete: {
              before: async (request) => {
                const categoryId = request.params.recordId;
                const category = await Category.findById(categoryId);

                if (category?.imagePublicIds?.length > 0) {
                  await deleteMultipleImages(category.imagePublicIds);
                }

                return request;
              },
            },
          },
        },
      },
      {
        resource: Order,
        options: {
          navigation: {
            name: 'Orders',
            icon: 'ShoppingCart',
          },
          properties: {
            orderId: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            orderType: {
              isVisible: { list: true, filter: true, show: true, edit: false },
              availableValues: [
                { value: 'normal', label: 'Normal Order' },
                { value: 'print', label: 'Print Order' },
              ],
            },
              customer: {
    isVisible: { list: true, filter: true, show: true, edit: false },
    // Don't add type: 'reference' - AdminJS can't handle refPath
  },
  customerType: {
    isVisible: { list: true, filter: true, show: true, edit: false },
    availableValues: [
      { value: 'Customer', label: 'Regular Customer' },
      { value: 'BusinessUser', label: 'Business User' },
    ],
  },
            deliveryPartner: { type: 'reference' },
            branch: { type: 'reference' },
            status: {
              availableValues: [
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'picked', label: 'Picked' },
                { value: 'arriving', label: 'Arriving' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
              ],
            },
            'printDetails.totalPages': {
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
            'printDetails.colorType': {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            'printDetails.printCost': {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },
            'giftWrap.enabled': {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            'giftWrap.message': { // Make giftWrap.message visible
              isVisible: { list: false, filter: false, show: true, edit: false },
            },
            createdAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            updatedAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
          },
 actions: {
  list: {
    after: async (response, request, context) => {
      // Manually populate customer names for list view
      if (response.records) {
        for (const record of response.records) {
          try {
            // ✅ CHANGE: record.id() → record.id (it's a property, not a function)
            const order = await Order.findById(record.id)
              .populate('customer')
              .populate('deliveryPartner', 'name phone')
              .lean();
            
            if (order && order.customer) {
              // Add customer name to display
              record.params.customerName = order.customer.name || 
                order.customer.businessDetails?.companyName || 
                'Unknown Customer';
              record.params.customerPhone = order.customer.phone;
            }
          } catch (err) {
            console.error('Error populating order:', err);
          }
        }
      }
      return response;
    },
  },
  show: {
    after: async (response, request, context) => {
      // Manually populate customer details for show view
      try {
        // ✅ CHANGE: response.record.id() → response.record.id (it's a property, not a function)
        const order = await Order.findById(response.record.id)
          .populate('customer')
          .populate('deliveryPartner', 'name phone email vehicleDetails')
          .populate('branch', 'name address')
          .populate('items.item', 'name price images category')
          .lean();
        
        if (order && order.customer) {
          response.record.params.customerDetails = {
            name: order.customer.name || order.customer.businessDetails?.companyName,
            phone: order.customer.phone,
            email: order.customer.email || order.customer.businessDetails?.email,
            type: order.customerType,
          };
        }
      } catch (err) {
        console.error('Error populating order details:', err);
      }
      
      return response;
    },
  },
  assignPartner: {
    actionType: 'record',
    icon: 'User',
    label: 'Assign Partner',
    component: Components.AssignPartner,
    isVisible: (context) => {
      const { record } = context;
      return (
        record.params.status === 'pending' &&
        !record.params.deliveryPartner
      );
    },
    handler: async (request, response, context) => {
      return {
        record: context.record.toJSON(context.currentAdmin),
      };
    },
  },
  initiateRefund: {
    actionType: 'record',
    icon: 'Dollar',
    guard: 'Are you sure you want to refund this payment? This action cannot be undone.',
    component: false, // This is a backend-only action

    // The button will only be visible for orders that meet these criteria
    isVisible: (context) => {
      const { record } = context;
      return (
        record.params.status === 'cancelled' &&
        record.params['payment.method'] === 'razorpay' &&
        record.params['payment.status'] === 'success' // Ensure it hasn't been refunded already
      );
    },

    handler: async (request, response, context) => {
      const { record, currentAdmin } = context;
      try {
        const order = await Order.findById(record.id());

        if (!order) {
          return {
            record: record.toJSON(currentAdmin),
            notice: { message: 'Order not found.', type: 'error' },
          };
        }
        
        // Dynamically import the service to call the refund function
        const { refundPayment } = await import('../services/razorpay.service.js');
        const refundResult = await refundPayment(order.payment.razorpayPaymentId);

        if (!refundResult.success) {
          throw new Error(refundResult.message || 'Refund failed at payment gateway.');
        }

        // If refund is successful, update the order in the database
        order.payment.status = 'refunded';
        order.statusHistory.push({
          status: 'refunded',
          timestamp: new Date(),
          updatedBy: currentAdmin._id, // Log which admin initiated the refund
        });
        await order.save();

        return {
          record: record.toJSON(currentAdmin),
          notice: { message: 'Refund initiated successfully!', type: 'success' },
        };
      } catch (error) {
        return {
          record: record.toJSON(currentAdmin),
          notice: { message: `Refund failed: ${error.message}`, type: 'error' },
        };
      }
    },
  },
},
        },
      },
      {
        // This is the new, dedicated resource for Cancelled Orders
        resource: Order,
        options: {
          id: 'CancelledOrders', // A unique ID for this AdminJS resource view
          navigation: {
            name: 'Orders',
            icon: 'XCircle',
          },
          label: 'Cancelled Orders', // This is the name that will appear in the sidebar
          
          // By defining the actions block, we explicitly override the default behavior
          actions: {
            // We only need to customize the 'list' action for this view
            list: {
              // The 'before' hook applies our default filter
              before: async (request) => {
                request.query = {
                  ...request.query,
                  'filters.status': 'cancelled',
                };
                return request;
              },
              // It's important to also copy the 'after' hook from the main Order resource
              // so that customer details are still populated correctly in this view.
              after: async (response, request, context) => {
                if (response.records) {
                  for (const record of response.records) {
                    try {
                      const order = await Order.findById(record.id)
                        .populate('customer')
                        .populate('deliveryPartner', 'name phone')
                        .lean();
                      

                      if (order && order.customer) {
                        record.params.customerName = order.customer.name || 
                          order.customer.businessDetails?.companyName || 
                          'Unknown Customer';
                        record.params.customerPhone = order.customer.phone;
                      }
                    } catch (err) {
                      console.error('Error populating order:', err);
                    }
                  }
                }
                return response;
              },
            },
            // THE FIX IS HERE: We must explicitly re-add the initiateRefund action 
            // to this resource view because we overrode the actions block.
            initiateRefund: {
                actionType: 'record',
                icon: 'Dollar',
                guard: 'Are you sure you want to refund this payment? This action cannot be undone.',
                component: false,

                isVisible: (context) => {
                  const { record } = context;
                  return (
                    record.params.status === 'cancelled' &&
                    record.params['payment.method'] === 'razorpay' &&
                    record.params['payment.status'] === 'success'
                  );
                },

                handler: async (request, response, context) => {
                    const { record, currentAdmin } = context;
                    try {
                        const order = await Order.findById(record.id());
                        if (!order) {
                            return { record: record.toJSON(currentAdmin), notice: { message: 'Order not found.', type: 'error' } };
                        }
                        
                        const { refundPayment } = await import('../services/razorpay.service.js');
                        const refundResult = await refundPayment(order.payment.razorpayPaymentId);

                        if (!refundResult.success) {
                            throw new Error(refundResult.message || 'Refund failed at payment gateway.');
                        }

                        order.payment.status = 'refunded';
                        order.statusHistory.push({
                            status: 'refunded',
                            timestamp: new Date(),
                            updatedBy: currentAdmin._id,
                        });
                        await order.save();

                        return { record: record.toJSON(currentAdmin), notice: { message: 'Refund initiated successfully!', type: 'success' } };
                    } catch (error) {
                        return { record: record.toJSON(currentAdmin), notice: { message: `Refund failed: ${error.message}`, type: 'error' } };
                    }
                },
            },
            // We also re-enable the default 'show', 'edit' and 'delete' actions for convenience
            show: {},
            edit: {},
            delete: {},
          },
        },
      },
      {
        resource: Branch,
        options: {
          navigation: {
            name: 'Logistics',
            icon: 'MapPin',
          },
          properties: {
            deliveryPartners: { type: 'reference' },
            createdAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            updatedAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
          },
        },
      },
      {
        resource: Cart,
        options: {
          navigation: {
            name: 'Shopping',
            icon: 'ShoppingBag',
          },
          properties: {
            customer: { type: 'reference' },
            'items.item': { type: 'reference' },
            createdAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            updatedAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
          },
        },
      },
      {
        resource: Coupon,
        options: {
          navigation: {
            name: 'Marketing',
            icon: 'Tag',
          },
          properties: {
            code: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            discountType: {
              isVisible: { list: true, filter: true, show: true, edit: true },
              availableValues: [
                { value: 'percentage', label: 'Percentage' },
                { value: 'fixed', label: 'Fixed Amount' },
              ],
            },
            discountValue: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            minCartValue: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            maxDiscountValue: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            startDate: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            endDate: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            isActive: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            createdAt: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            updatedAt: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },
          },
          actions: {
            edit: {
              before: async (request) => {
                const couponId = request.params.recordId;

                if (request.payload?._imagesReplaced === 'true') {
                  const existingCoupon = await Coupon.findById(couponId);

                  if (existingCoupon?.imagePublicIds?.length > 0) {
                    await deleteMultipleImages(existingCoupon.imagePublicIds);
                  }
                }

                delete request.payload._imagesReplaced;
                return request;
              },
            },
            delete: {
              before: async (request) => {
                const couponId = request.params.recordId;
                const coupon = await Coupon.findById(couponId);

                if (coupon?.imagePublicIds?.length > 0) {
                  await deleteMultipleImages(coupon.imagePublicIds);
                }

                return request;
              },
            },
          },
        },
      },
    ],
    rootPath: '/admin',
    branding: {
      companyName: 'GoDrop Admin',
      logo: false,
      softwareBrothers: false,
    },
  };

  const admin = new AdminJS(adminOptions);
  if (process.env.NODE_ENV !== 'production') {
    admin.watch();
  }

  return admin;
};

export const createAdminRouter = (adminJs) => {
  const ADMIN = {
    email: process.env.ADMIN_EMAIL || 'admin@godrop.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
  };

  const router = AdminJSExpress.buildAuthenticatedRouter(
    adminJs,
    {
      authenticate: async (email, password) => {
        try {
          const admin = await Admin.findOne({ email }).select('+password');

          if (admin) {
            const isValid = await bcrypt.compare(password, admin.password);

            if (isValid) {
              return {
                email: admin.email,
                id: admin._id,
                role: admin.role,
                name: admin.name,
              };
            }
          }

          return null;
        } catch (error) {
          console.error('AdminJS authentication error:', error);
          return null;
        }
      },
      cookiePassword: process.env.JWT_SECRET || 'some-secret-password',
    },
    null,
    {
      resave: false,
      saveUninitialized: true,
      secret: process.env.JWT_SECRET || 'some-secret-password',
    }
  );

  return router;
};
