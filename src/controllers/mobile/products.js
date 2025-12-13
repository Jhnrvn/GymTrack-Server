import Product from "../../models/Product.js";
import Orders from "../../models/Orders.js";
import Notification from "../../models/Notification.js";

const getAllAvailableProducts = async (req, res) => {
  try {
    const Products = await Product.find({ product_stocks: { $gt: 0 } });
    return res.status(200).json(Products);
  } catch (error) {
    res.status(error.status || 500).json({ header: "Error", message: error.message, success: false });
  }
};

const getAllUserPendingOrders = async (req, res) => {
  const { id } = req.user;

  try {
    const orders = await Orders.find({ member: id, status: "Pending" }).populate("product").sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    res.status(error.status || 500).json({ header: "Error", message: error.message, success: false });
  }
};

const getAllUserConfirmedOrders = async (req, res) => {
  const { id } = req.user;
  try {
    const orders = await Orders.find({ member: id, status: "Confirmed" }).populate("product").sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    res.status(error.status || 500).json({ header: "Error", message: error.message, success: false });
  }
};

const orderProduct = async (req, res) => {
  const { id, quantity, transaction_method } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ header: "Error", message: "Product not found", success: false });
    }

    if (product.product_stocks < quantity) {
      return res.status(400).json({ header: "Error", message: "Insufficient stocks", success: false });
    }

    product.product_stocks -= quantity;
    await product.save();

    const order = new Orders({
      member: req.user.id,
      product: id,
      product_quantity: quantity,
      total_amount: product.product_price * quantity,
      transaction_method,
    });

    // create notification for the member
    const notification = new Notification({
      user: req.user.id,
      type: "Product",
      title: "Product Ordered",
      message: "Product ordered successfully",
      details: {
        product_name: product.product_name,
        quantity: quantity,
        total_amount: product.product_price * quantity,
        payment_method: transaction_method,
      },
    });

    const admin_notification = new Notification({
      user: req.user.id,
      role_target: ["Admin", "Staff"],
      type: "Order",
      title: "Product Ordered",
      message: "Member ordered a product",
      details: {
        product_name: product.product_name,
        quantity: quantity,
        total_amount: product.product_price * quantity,
        payment_method: transaction_method,
      },
    });

    await notification.save();
    await admin_notification.save();
    await order.save();

    return res.status(201).json({ header: "Success", message: "Product ordered successfully", success: true });
  } catch (error) {
    res.status(error.status || 500).json({ header: "Error", message: error.message, success: false });
  }
};

/**
 * function to cancel orders
 *
 * @async
 * @returns {*}
 */
const cancelOrders = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Orders.findByIdAndDelete(id);
  
    const product = await Product.findById(order.product);

    product.product_stocks += order.product_quantity;
    await product.save();

    // add notification to notify admin and staffs

    res.status(200).json({ header: "Success", message: "Order cancelled successfully", success: true });
  } catch (error) {
    res.status(error.status || 500).json({ header: "Error", message: error.message, success: false });
  }
};

const uploadProofOfPayment = async (req, res) => {
  const { image_url } = req.body;
  const { id } = req.params;

  try {
    const order = await Orders.findById(id).populate("product");
    if (!order) {
      return res.status(404).json({ header: "Error", message: "Order not found", success: false });
    }

    order.proof = image_url;
    order.proof_uploaded = true;
    await order.save();

    const notification = new Notification({
      user: req.user.id,
      role_target: ["Admin", "Staff"],
      type: "Order",
      title: "Proof of payment uploaded",
      message: "Member uploaded proof of payment, please confirm the order",
      details: {
        product_name: order.product.product_name,
        quantity: order.product_quantity,
        total_amount: order.total_amount,
        payment_method: order.transaction_method,
      },
    });

    notification.save();

    res.status(200).json({ header: "Success", message: "Proof of payment uploaded successfully", success: true });
  } catch (error) {
    res.status(error.status || 500).json({ header: "Error", message: error.message, success: false });
  }
};

export {
  getAllAvailableProducts,
  orderProduct,
  cancelOrders,
  getAllUserPendingOrders,
  getAllUserConfirmedOrders,
  uploadProofOfPayment,
};
