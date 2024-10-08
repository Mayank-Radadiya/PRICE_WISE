"use server";

import { scrapeAmazonProduct } from "../scraper";

export async function scrapeAndStoreProduct(url: string) {
  // If url missing return null
  if (!url) return;

  //
  try {
    const scrapeProduct = scrapeAmazonProduct(url);
    
  } catch (error: any) {
    throw new Error(`Failed to Create/Update Product : ${error.message} `);
  }
}
