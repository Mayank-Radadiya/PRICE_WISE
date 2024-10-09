import axios from "axios";
import * as cheerio from "cheerio";
import { extractPrice } from "../utils";

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
    const title = $("#productTitle").text().trim();

    const currentPrice = extractPrice(
      // find the price element and extract the price text
      $(".a-price-whole"),
      $("a-price-symbol"),
      $(".a-price aok-align-center reinventPricePriceToPayMargin priceToPay")
    );

    const realPrice = extractPrice(
      //   $(".a-price a-text-price"),
      //   $(".a-offscreen"),
      //   $("#a-offscreen"),
      //   $("#a-size-small aok-offscreen"),
      //   $("#a-size-small a-color-secondary aok-align-center basisPrice"),
      //   $("#a-size-small aok-align-center basisPriceLegalMessage"),
      //   $("#aok-relative"),
      //   $("#a-size-small aok-offscreen"),
      $("#priceblock_ourprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#listPrice"),
      $("#priceblock_dealprice"),
      $(".a-size-base.a-color-price")
    );

    const outOfStock = (realPrice && currentPrice) === "";
    // Class base code not working.....  :(

    // $(".a-size-medium a-color-success").text().trim().toLowerCase() ===
    //   "currently unavailable" ||
    // $(".availability span").text().trim().toLowerCase() ===
    //   "currently unavailable" ||
    // $("#availability_feature_div").text().trim().toLowerCase() ===
    //   "currently unavailable" ||
    // $("span a-section a-spacing-base a-spacing-top-micro")
    //   .text()
    //   .trim()
    //   .toLowerCase() === "currently unavailable";

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

    const reviewCount = $("#acrCustomerReviewText").text().trim();

    const data = {
      url,
      currency: currencySymbol || "$",
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice),
      originalPrice: Number(realPrice),
      discountRate: Number(discountRate),
      outOfStock,
      stars,
      reviewCount,
    };

    console.log(data);
  } catch (error: any) {
    throw new Error(
      `Failed to Scrape Product from Scraper scrapeAmazonProduct Function: ${error.message} `
    );
  }
}
