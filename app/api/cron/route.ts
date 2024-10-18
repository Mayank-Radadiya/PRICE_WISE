import { dbConnection } from "@/lib/database/DBconnection";
import Product from "@/lib/models/product.model";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import {
  getAveragePrice,
  getEmailNotifyType,
  getHighestPrice,
  getLowestPrice,
} from "@/lib/utils";
import { NextResponse } from "next/server";

export const maxDuration = 1; // Function max duration for the hobby plan
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    dbConnection();

    const products = await Product.find({});

    if (!products) throw new Error("No product fetched");

    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        // Scrape product
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrapedProduct) return;

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          {
            price: scrapedProduct?.currentPrice,
          },
        ]; 

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        
        const updatedProduct = await Product.findOneAndUpdate(
          {
            url: product.url,
          },
          product
        );

        
        const emailNotifyType = getEmailNotifyType(
          scrapedProduct,
          currentProduct
        );

        if (emailNotifyType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };
          // Construct emailContent
          const emailContent = await generateEmailBody(
            productInfo,
            emailNotifyType
          );
          // Get array of user emails
          const userEmails = updatedProduct.users.map(
            (user: any) => user.email
          );
          // Send email notification
          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );
    console.log(updatedProducts);
    
    return NextResponse.json({
      message: "Ok",
      data: updatedProducts,
    });
  } catch (error: any) {
    throw new Error(`Failed to get all products: ${error.message}`);
  }
}
