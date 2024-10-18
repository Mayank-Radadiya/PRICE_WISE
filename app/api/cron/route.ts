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

export const maxDuration = 30; // Function max duration for the hobby plan
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Ensure DB connection is established
    await dbConnection();

    // Fetch all products from the database
    const products = await Product.find({});

    if (!products || products.length === 0) {
      throw new Error("No products found");
    }

    // Process each product
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct: any) => {
        // Scrape product details
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (
          !scrapedProduct ||
          typeof scrapedProduct.currentPrice !== "number"
        ) {
          console.warn(
            `Skipping product with URL: ${currentProduct.url} - No valid scraped data`
          );
          return null; // Skip if scraping fails or price is not a number
        }

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          {
            price: scrapedProduct.currentPrice,
          },
        ];

        const productData = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        // Update product in the database
        const updatedProduct = await Product.findOneAndUpdate(
          { url: currentProduct.url },
          productData,
          { new: true } // Return the updated document
        );

        if (!updatedProduct) {
          console.warn(
            `Failed to update product with URL: ${currentProduct.url}`
          );
          return null; // Skip if update fails
        }

        // Check if email notification is needed
        const emailNotifyType = getEmailNotifyType(
          scrapedProduct,
          currentProduct
        );

        if (emailNotifyType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };

          // Construct the email content
          const emailContent = await generateEmailBody(
            productInfo,
            emailNotifyType
          );

          // Get the array of user emails
          const userEmails = updatedProduct.users.map(
            (user: any) => user.email
          );

          // Send the email notification
          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    // Filter out null values from the result
    const successfulUpdates = updatedProducts.filter(Boolean);

    // Return the updated products
    return NextResponse.json({
      message: "Ok",
      data: successfulUpdates,
    });
  } catch (error: any) {
    console.error("Failed to get all products:", error);
    return NextResponse.json(
      { message: `Failed to get all products: ${error.message}` },
      { status: 500 }
    );
  }
}
