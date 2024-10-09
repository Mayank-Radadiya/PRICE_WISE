import axios from "axios";
import * as cheerio from "cheerio";
import { extractDescription, extractPrice } from "../utils";

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  const userName = String(process.env.BRIGHT_DATA_USERNAME);
  const userPassword = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;
  const options: any = {
    auth: {
      userName: `${userName}-session-${session_id}`,
      userPassword,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };

  // main function start here....
  try {
    const response = await axios.get(url, options);

    //Cheerio is a library that allows you to work with HTML more conveniently. You can load HTML into Cheerio and then use its methods to find elements and extract information.
    const $ = cheerio.load(response.data);

    //fetch data from amazon website...

    const title = $("#productTitle").text().trim();

    const currentPrice = extractPrice(
      // find the price element and extract the price text
      $(".a-price-whole"),
      $("a-price-symbol"),
      $(".a-price aok-align-center reinventPricePriceToPayMargin priceToPay")
    );

    const originalPrice = extractPrice(
      $("#priceblock_ourprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#listPrice"),
      $("#priceblock_dealprice"),
      $(".a-size-base.a-color-price")
    );

    const outOfStock = (originalPrice && currentPrice) === "";

    const images =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";

    const imageUrls = Object.keys(JSON.parse(images));

    const currencySymbol = $(".a-price-symbol").text().trim().slice(0, 1);

    const discountRate = $(".savingsPercentage")
      .text()
      .trim()
      .replace(/[-%]/g, "");

    const stars = $(".a-icon-alt").text().trim().slice(0, 3);

    const reviewsCount = $("#acrCustomerReviewText").text().trim();

    const description = extractDescription($);

    const data = {
      url,
      currency: currencySymbol || "$",
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      discountRate: Number(discountRate),
      outOfStock,
      stars: Number(stars) || 0,
      reviewsCount,
      priceHistory: [],
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
      description,
    };

    return data;
  } catch (error: any) {
    throw new Error(
      `Failed to Scrape Product from Scraper scrapeAmazonProduct Function: ${error.message} `
    );
  }
}
