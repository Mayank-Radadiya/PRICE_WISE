"use server";

import { revalidatePath } from "next/cache";
import { dbConnection } from "../database/DBconnection";
import Product from "../models/product.model";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

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

      const product = {
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
