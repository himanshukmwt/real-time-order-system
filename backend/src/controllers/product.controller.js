import * as productService from "../services/product.service.js";

export const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    return res.status(200).json({
      success: true,
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return res.status(200).json({
      success: true,
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
