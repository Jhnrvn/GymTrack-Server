// models
import Product from "../../models/Product.js";
import Member from "../../models/Member.js";
import Notification from "../../models/Notification.js";
import Transaction from "../../models/Transaction.js";
import Log from "../../models/Log.js";
import Orders from "../../models/Orders.js";

/**
 * get all products
 *
 * @async
 * @param {*} req
 * @param {*} res
 * @returns {*} - the total number of products, the number of products with stocks less than or equal to 10, and an array of all products
 */
const getAllProducts = async (req, res) => {
  const { search = "" } = req.query;

  const query = search
    ? {
        $or: [
          { product_name: { $regex: search, $options: "i" } },
          { product_category: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  try {
    const products = await Product.find({ ...query, deleted: false }).sort({ product_stocks: -1 }); // get all products
    const total = await Product.countDocuments({ deleted: false }); // count the total number of products
    const lowStockProducts = await Product.countDocuments({ product_stocks: { $lte: 10 } }); // count the number of products with stocks less than or equal to 10

    res.status(200).json({ total, lowStockProducts, products });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find(); // get all members

    const memberList = members.map((member) => {
      return {
        value: member._id,
        label: `${member.firstName} ${member.lastName}`,
      };
    });

    res.status(200).json({ memberList });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

/**
 * add new product controller
 *
 * @async
 * @param {*} req
 * @param {*} res
 * @returns {*} - response message
 */
const addNewProducts = async (req, res) => {
  const { product_name, product_price, product_stocks, product_category, product_description, image_url } = req.body;
  const { role } = req.user;
  try {
    if (role !== "Admin") {
      return res
        .status(403)
        .json({ header: "Error", message: "You are not authorized to add products", success: false });
    }

    const product = new Product({
      product_name,
      product_price,
      product_stocks,
      product_category,
      product_description: product_description || "No Description",
      product_image: image_url,
    });

    const newProduct = await product.save();

    const log = new Log({
      action: "ADD",
      user: req.user.id,
      product: newProduct._id,
      message: "Added new product",
      status: true,
    });

    await log.save();

    res.status(201).json({ header: "Success", success: true, message: "Product added successfully" });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const buyProducts = async (req, res) => {
  const { product_id } = req.params;
  const { id } = req.user;
  const { buyer_id, quantity, payment_method } = req.body;
  try {
    // find the product and checks if the product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ header: "Error", message: "Product not found", success: false });
    }

    // get the total amount
    const totalPrice = product.product_price * quantity;

    // create a new transaction
    const transaction = new Transaction({
      member: buyer_id,
      type: "Product",
      product: product_id,
      product_quantity: quantity,
      total_amount: totalPrice,
      transaction_method: payment_method, // todo : add payment method
      handled_by: id,
      status: "Paid",
    });

    await transaction.save();

    // create a new log
    const log = new Log({
      action: "SELL",
      product: product_id,
      member: buyer_id,
      user: id,
      amount: totalPrice,
      message: "Sold product",
      status: true,
    });

    await log.save();

    // create notification
    const notification = new Notification({
      user: buyer_id,
      type: "Product",
      title: "Thank you for your purchase",
      message: "Your purchase has been completed successfully",
      details: {
        product_name: product.product_name,
        quantity: quantity,
        total_amount: totalPrice,
        payment_method: payment_method,
      },
    });

    // save the notification
    await notification.save();

    // update the product stocks
    product.product_stocks -= quantity;
    await product.save();

    res.status(200).json({ header: "Success", message: "Product bought successfully", success: true });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const restockProducts = async (req, res) => {
  const { role } = req.user;
  const { product_id } = req.params;
  const { quantity } = req.body;

  try {
    // check if user is admin
    if (role !== "Admin") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    // find the product and checks if the product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ header: "Error", message: "Product not found", success: false });
    }

    // update the product stocks
    product.product_stocks += quantity;
    await product.save();

    // create a new log
    const log = new Log({
      action: "RESTOCK",
      product: product_id,
      user: req.user.id,
      message: `Restocked product by ${quantity}`,
      status: true,
    });

    await log.save();

    res.status(200).json({ header: "Success", message: "Product restocked successfully", success: true });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const modifyCurrentStocks = async (req, res) => {
  const { role } = req.user;
  const { product_id } = req.params;
  const { quantity } = req.body;
  try {
    // check if user is admin
    if (role !== "Admin") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    // find the product and checks if the product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ header: "Error", message: "Product not found", success: false });
    }

    // change the product stocks
    product.product_stocks = quantity;
    await product.save();

    // create a new log
    const log = new Log({
      action: "UPDATE",
      product: product_id,
      user: req.user.id,
      message: `Modified product stocks to ${quantity}`,
      status: true,
    });

    await log.save();

    res.status(200).json({ header: "Success", message: "Product stocks modified successfully", success: true });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Orders.find({ status: "Pending" })
      .populate("member", "firstName lastName  profile_picture")
      .populate("product")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const confirmOrders = async (req, res) => {
  const { id } = req.body;
  const { role } = req.user;
  try {
    // check if user is admin
    if (role !== "Admin") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    // find the user order
    const order = await Orders.findById(id);
    if (!order) {
      return res.status(404).json({ header: "Error", message: "Order not found", success: false });
    }

    order.status = "Confirmed";
    await order.save();

    // create a new transaction
    const transaction = new Transaction({
      member: order.member,
      type: "Product",
      product: order.product,
      product_quantity: order.product_quantity,
      total_amount: order.total_amount,
      transaction_method: order.transaction_method,
      handled_by: req.user.id,
      status: "Paid",
    });
    await transaction.save();

    // create a new log
    const log = new Log({
      action: "CONFIRM",
      user: req.user.id,
      member: order.member,
      product: order.product,
      amount: order.total_amount,
      message: "Order has been confirmed",
      status: true,
      proof: order.proof || null,
    });
    await log.save();

    // create notification for the member
    const notification = new Notification({
      user: order.member,
      type: "Product",
      title: "Order confirmed",
      message: "Your order has been confirmed. You can now get your product at the Gym",
      details: {
        product_name: order.product.product_name,
        quantity: order.product_quantity,
        total_amount: order.total_amount,
        payment_method: order.transaction_method,
      },
    });
    await notification.save();

    res.status(200).json({ header: "Success", message: "Order confirmed successfully", success: true });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const cancelOrder = async (req, res) => {
  const { id } = req.body;

  try {
    // find the user order
    const order = await Orders.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ header: "Error", message: "Order not found", success: false });
    }

    const product = await Product.findById(order.product._id);
    product.product_stocks += order.product_quantity;
    await product.save();

    const notification = new Notification({
      user: order.member,
      type: "Product",
      title: "Order cancelled",
      message: "Your order has been cancelled",
      details: {
        product_name: order.product.product_name,
        quantity: order.product_quantity,
        total_amount: order.total_amount,
        payment_method: order.transaction_method,
      },
    });

    const log = new Log({
      action: "CANCEL",
      user: req.user.id,
      member: order.member,
      product: order.product,
      message: "Order has been cancelled",
      status: true,
      proof: order.proof || null,
    });

    await log.save();
    await notification.save();

    res.status(200).json({ header: "Success", message: "Order confirmed successfully", success: true });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const updateProducts = async (req, res) => {
  const { _id, product_name, product_description, image_file, product_price, product_category } = req.body;
  const { role } = req.user;
  try {
    if (role !== "Admin") {
      return res
        .status(403)
        .json({ header: "Error", message: "You are not authorized to update products", success: false });
    }

    const product = await Product.findById(_id);
    if (!product) {
      return res.status(404).json({ header: "Error", message: "Product not found", success: false });
    }

    product.product_name = product_name;
    product.product_description = product_description || "No Description";
    product.product_image = image_file;
    product.product_price = product_price;
    product.product_category = product_category;

    await product.save();

    const log = new Log({
      action: "UPDATE",
      user: req.user.id,
      product: product._id,
      message: "Update product",
      status: true,
    });

    await log.save();

    res.status(200).json({ header: "Success", message: "Product updated successfully", success: true });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;

  try {
    // check if user is admin
    if (role !== "Admin") {
      return res
        .status(401)
        .json({ header: "Unauthorized", message: "You are not authorized to perform this action", success: false });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ header: "Error", message: "Product not found", success: false });
    }

    product.deleted = true;
    await product.save();

    const log = new Log({
      action: "DELETE",
      user: req.user.id,
      product: product._id,
      message: "Deleted product",
      status: true,
    });

    await log.save();

    res.status(200).json({ header: "Success", message: "Product deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ header: "Error", message: error.message, success: false });
  }
};

export {
  getAllProducts,
  getAllMembers,
  addNewProducts,
  buyProducts,
  restockProducts,
  modifyCurrentStocks,
  getAllOrders,
  confirmOrders,
  cancelOrder,
  updateProducts,
  deleteProduct,
};
