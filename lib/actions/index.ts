"use server";

import { dbConnection } from "../database/DBconnection";
import { scrapeAmazonProduct } from "../scraper";

export async function scrapeAndStoreProduct(url: string) {
  // If url missing return null
  if (!url) return;

  //
  try {
    dbConnection()

    const scrapeProduct = scrapeAmazonProduct(url);

    if (!scrapeProduct) return;

    let product = scrapeProduct

    

  } catch (error: any) {
    throw new Error(`Failed to Create/Update Product : ${error.message} `);
  }
}
