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

export const maxDuration = 60; // Function max duration for the hobby plan
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Ensure DB connection
    await dbConnection();

    // Fetch all products (changed from findOne to find)
    const products = await Product.find({});

    if (!products) {
      throw new Error("No products found");
    }

    // Process all products concurrently
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct: any) => {
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrapedProduct) return null; // Skip if scraping failed

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          { price: scrapedProduct.currentPrice },
        ];

        const productData = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        // Update product in DB
        const updatedProduct = await Product.findOneAndUpdate(
          { url: currentProduct.url },
          productData
        );

        if (!updatedProduct) return null;

        // Determine if an email notification is needed
        const emailNotifyType = getEmailNotifyType(
          scrapedProduct,
          currentProduct
        );

        if (emailNotifyType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };

          // Generate email content
          const emailContent = await generateEmailBody(
            productInfo,
            emailNotifyType
          );

          // Collect user emails
          const userEmails = updatedProduct.users.map(
            (user: any) => user.email
          );

          // Send email notifications
          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    // Filter out null values from the result
    const successfulUpdates = updatedProducts.filter(Boolean);

    return NextResponse.json({
      message: "Ok",
      data: successfulUpdates,
    });
  } catch (error: any) {
    console.error("Error in GET function:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
