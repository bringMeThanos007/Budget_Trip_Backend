const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Product1 = require("../models/productModel1");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Create new Order
// exports.newOrder = catchAsyncErrors(async (req, res, next) => {
//   const {
//     shippingInfo,
//     orderItems,
//     paymentInfo,
//     itemsPrice,
//     taxPrice,
//     shippingPrice,
//     totalPrice,
//     user,
//   } = req.body;

//   // Create an array to hold the individual orders
//   const orders = [];
// //  console.log(orderItems);
//   // Iterate over each order item and create a separate order for each
//   for (const orderItem of orderItems) {
//     const order = await Order.create({
//       shippingInfo,
//       orderItems: [orderItem], // Create a separate order with each order item
//       paymentInfo,
//       itemsPrice,
//       taxPrice,
//       shippingPrice,
//       totalPrice,
//       paidAt: Date.now(),
//       user,
//     });

//     orders.push(order); // Add the created order to the orders array
//   }

//   res.status(201).json({
//     success: true,
//     orders, // Send the array of orders in the response
//   });
// });

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    user,
  } = req.body;

  // Create an array to hold the individual orders
  const orders = [];
  //  console.log(orderItems)
  // Iterate over each order item and create a separate order for each
  for (const orderItem of orderItems) {
    // Convert the orderItem into the required format
    const formattedOrderItem = {
      name: orderItem.name,
      price: orderItem.price,
      image: orderItem.image,
      product: orderItem.product1 ? [orderItem.product1] : [orderItem.product],
      type: orderItem.type,
      vendor: orderItem.vendor,
      quantity: orderItem.quantity,
    };

    const order = await Order.create({
      shippingInfo,
      orderItems: [formattedOrderItem], // Create a separate order with each order item
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user,
    });

    orders.push(order); // Add the created order to the orders array
  }

  res.status(201).json({
    success: true,
    orders, // Send the array of orders in the response
  });
});

// get Single Order-order details
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// get logged in user  Orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id;
  //   console.log(userId);
  const orders = await Order.find({ user: userId });

  res.status(200).json({
    success: true,
    orders,
  });
});

// get all Orders -- vendor
// exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
//     const orders = await Order.find();

//     let totalAmount = 0;

//     orders.forEach((order) => {
//         totalAmount += order.totalPrice;
//     });

//     res.status(200).json({
//         success: true,
//         totalAmount,
//         orders,
//     });
// });
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const vendorId = req.params.id; // Assuming the vendor ID is part of the URL

  const orders = await Order.find({ "orderItems.vendor": vendorId });

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update Order Status -- vendor
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHander("You have already delivered this order", 400));
  }

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });
  }
  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  const product1 = await Product1.findById(id);

  if (product) {
    product.Stock -= quantity;
    await product.save({ validateBeforeSave: false });
  }

  if (product1) {
    product1.Stock -= quantity;
    await product1.save({ validateBeforeSave: false });
  }
}

// delete Order -- vendor
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});
