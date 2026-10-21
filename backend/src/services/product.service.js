import prisma from "../lib/prisma.js";
import { getCache, setCache, deleteByPrefix } from "../utils/cache.utils.js";

export const getAllProducts = async () => {
  const key = "products:all";

  const cached = await getCache(key);
  if (cached) return cached; 

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  await setCache(key, products, 120);
  return products;
};

export const getProductById = async (id) => {
  if (!id || typeof id !== "string" || !id.trim()) {
    const error = new Error("Invalid product ID");
    error.statusCode = 400;
    throw error;
  }

  const cleanId = id.trim();
  const key = `products:${cleanId}`;

  const cached = await getCache(key);
  if (cached) return cached;

  const product = await prisma.product.findUnique({
    where: { id: cleanId },
  });

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  await setCache(key, product, 120);
  return product;
};

export const createProduct = async ({
  name,
  description,
  price,
  category,
  imageUrl,
  stock = 0,
}) => {
  // 1. Name validation
  if (!name || typeof name !== "string" || !name.trim()) {
    const error = new Error("Product name is required and must be a non-empty string");
    error.statusCode = 400;
    throw error;
  }

  // 2. Price validation
  const parsedPrice = Number(price);
  if (price === undefined || price === null || isNaN(parsedPrice) || parsedPrice <= 0) {
    const error = new Error("Product price is required and must be a positive number");
    error.statusCode = 400;
    throw error;
  }

  // 3. Stock validation
  const parsedStock = Number(stock);
  if (isNaN(parsedStock) || !Number.isInteger(parsedStock) || parsedStock < 0) {
    const error = new Error("Product stock must be a non-negative integer");
    error.statusCode = 400;
    throw error;
  }

  // 4. Create product in database
  const newProduct = await prisma.product.create({
    data: {
      name: name.trim(),
      description: description && typeof description === "string" ? description.trim() : null,
      price: parsedPrice,
      stock: parsedStock,
      category: category && typeof category === "string" ? category.trim() : null,
      imageUrl: imageUrl && typeof imageUrl === "string" ? imageUrl.trim() : null,
    },
  });
   await deleteByPrefix("products:");
  return newProduct;
};


export const updateProduct = async (id, updateData) => {
  if (!id || typeof id !== "string" || !id.trim()) {
    const error = new Error("Invalid product ID");
    error.statusCode = 400;
    throw error;
  }

  // Ensure product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id: id.trim() },
  });

  if (!existingProduct) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const dataToUpdate = {};

  if (updateData.name !== undefined) {
    if (!updateData.name || typeof updateData.name !== "string" || !updateData.name.trim()) {
      const error = new Error("Product name must be a non-empty string");
      error.statusCode = 400;
      throw error;
    }
    dataToUpdate.name = updateData.name.trim();
  }

  if (updateData.price !== undefined) {
    const parsedPrice = Number(updateData.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      const error = new Error("Product price must be a positive number");
      error.statusCode = 400;
      throw error;
    }
    dataToUpdate.price = parsedPrice;
  }

  if (updateData.stock !== undefined) {
    const parsedStock = Number(updateData.stock);
    if (isNaN(parsedStock) || !Number.isInteger(parsedStock) || parsedStock < 0) {
      const error = new Error("Product stock must be a non-negative integer");
      error.statusCode = 400;
      throw error;
    }
    dataToUpdate.stock = parsedStock;
  }

  if (updateData.description !== undefined) {
    dataToUpdate.description =
      updateData.description && typeof updateData.description === "string"
        ? updateData.description.trim()
        : null;
  }

  if (updateData.category !== undefined) {
    dataToUpdate.category =
      updateData.category && typeof updateData.category === "string"
        ? updateData.category.trim()
        : null;
  }

  if (updateData.imageUrl !== undefined) {
    dataToUpdate.imageUrl =
      updateData.imageUrl && typeof updateData.imageUrl === "string"
        ? updateData.imageUrl.trim()
        : null;
  }

  const updatedProduct = await prisma.product.update({
    where: { id: id.trim() },
    data: dataToUpdate,
  });
  await deleteByPrefix("products:");
  return updatedProduct;
};

export const deleteProduct = async (id) => {
  if (!id || typeof id !== "string" || !id.trim()) {
    const error = new Error("Invalid product ID");
    error.statusCode = 400;
    throw error;
  }

  // Ensure product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id: id.trim() },
  });

  if (!existingProduct) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  // Relational safety check
  const linkedOrderItemsCount = await prisma.orderItem.count({
    where: { productId: id.trim() },
  });

  if (linkedOrderItemsCount > 0) {
    const error = new Error(
      `Cannot delete product '${existingProduct.name}': it is associated with ${linkedOrderItemsCount} existing order item(s). Modifying or deleting this product would violate order history integrity.`
    );
    error.statusCode = 409;
    throw error;
  }

  const deletedProduct = await prisma.product.delete({
    where: { id: id.trim() },
  });
  await deleteByPrefix("products:");
  return deletedProduct;
};
