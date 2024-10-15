"use server";

import { revalidatePath } from "next/cache";
import { dbConnection } from "../database/DBconnection";
import Product from "../models/product.model";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import exp from "constants";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProduct(url: string) {
  // If url missing return null
  if (!url) return;

  //
  try {
    dbConnection();

    const scrapeProduct = await scrapeAmazonProduct(url);

    if (!scrapeProduct) return;

    let product = scrapeProduct;

    const existingProduct = await Product.findOne({ url: scrapeProduct.url });
    if (existingProduct) {
      const UpdatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapeProduct.currentPrice },
      ];

      product = {
        ...scrapeProduct,
        priceHistory: UpdatedPriceHistory,
        lowestPrice: getLowestPrice(UpdatedPriceHistory),
        highestPrice: getHighestPrice(UpdatedPriceHistory),
        averagePrice: getAveragePrice(UpdatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapeProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/product/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to Create/Update Product : ${error.message} `);
  }
}

export async function GetProductBtId(productId: string) {
  try {
    dbConnection();
    const product = await Product.findOne({ _id: productId });

    if (!product) return null;

    return product;
  } catch (error: any) {
    console.error(error.message);
  }
}

export async function GetAllProducts() {
  try {
    dbConnection();

    const product = await Product.find();

    if (!product) return null;

    return product;
  } catch (error: any) {
    console.error(error.message);
  }
}

export async function GetSimilarProducts(productId: string) {
  try {
    dbConnection();

    const product = await Product.findById(productId);

    if (!product) return null;

    const similarProduct = await Product.find({
      _id: { $ne: productId },
    });

    return similarProduct;
  } catch (error: any) {
    console.error(error.message);
  }
}

export async function addUserEmailToProduct(
  userEmail: string,
  productId: string
) {
  try {
    dbConnection();

    const product = await Product.findById(productId);
    if (!product) return null;
    
    
    const userExists = product.users.some(
      (user: User) => user.email === userEmail
    );

    if (!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error: any) {
    console.error(error.message);
  }
}
