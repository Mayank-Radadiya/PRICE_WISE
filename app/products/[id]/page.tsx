import { GetProductBtId, GetSimilarProducts } from "@/lib/actions";
import { Product } from "@/types";
import { redirect } from "next/navigation";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import PriceInfoCard from "@/components/PriceInfoCard";
import ProductCard from "@/components/ProductCard";
import Modal from "@/components/Modal";

// type props = {
//   params: { id: string };
// };

async function productDetails({ params: { id } }: any) {

  function randomNumber() {
    return Math.floor(Math.random() * (99 - 75 + 1)) + 75;
  }
  const product: Product = await GetProductBtId(id);
  if (!product) redirect("/");

  const similarProducts = await GetSimilarProducts(id);

  function getRandomProducts(products: any, limit: number) {
    return products
      .sort(() => 0.5 - Math.random()) // Shuffle the array randomly
      .slice(0, limit); // Take the first `limit` items
  }

  return (
    <div className="product-container">
      <div className="flex gap-28 xl:flex-row flex-col">
        <div className="product-image">
          <Image
            src={product.image}
            alt={product.title}
            width={580}
            height={400}
            className="mx-auto"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-5 flex-wrap pb-6">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] text-secondary font-semibold">
                {product.title}
              </p>
              <Link
                href={product.url}
                target="_blank"
                className="text-base text-black opacity-50"
              >
                Visit Product
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="product-hearts">
                <Image
                  src="/assets/icons/red-heart.svg"
                  alt="heart"
                  width={20}
                  height={20}
                />

                <p className="text-base font-semibold text-[#D46F77]">
                  {product.reviewsCount}
                </p>
              </div>

              <div className="p-2 bg-white-200 rounded-10">
                <Image
                  src="/assets/icons/bookmark.svg"
                  alt="bookmark"
                  width={20}
                  height={20}
                />
              </div>

              <div className="p-2 bg-white-200 rounded-10">
                <Image
                  src="/assets/icons/share.svg"
                  alt="share"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          </div>

          <div className="product-info">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-5">
                {product.outOfStock == true ? (
                  <h3 className="text-3xl font-semibold text-red-600">
                    This product is out of stock.
                  </h3>
                ) : (
                  <>
                    <p className="text-[34px] text-secondary font-bold">
                      {product.currency} {formatNumber(product.currentPrice)}
                    </p>
                    <p className="text-[21px] text-black opacity-50 line-through">
                      {product.currency} {formatNumber(product.originalPrice)}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="product-stars">
                  <Image
                    src="/assets/icons/star.svg"
                    alt="star"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm text-primary-orange font-semibold">
                    {product.stars || "25"}
                  </p>
                </div>

                <div className="product-reviews">
                  <Image
                    src="/assets/icons/comment.svg"
                    alt="comment"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm text-secondary font-semibold">
                    {product.reviewsCount} Reviews
                  </p>
                </div>
              </div>

              <p className="text-sm text-black opacity-50">
                <span className="text-primary-green font-semibold">
                  {randomNumber()}%{" "}
                </span>{" "}
                of buyers have recommended this.
              </p>
            </div>
          </div>

          <div className="my-7 flex flex-col gap-5">
            <div className="flex gap-5 flex-wrap">
              <PriceInfoCard
                title="Current Price"
                iconSrc="/assets/icons/price-tag.svg"
                value={`${product.currency} ${formatNumber(
                  product.currentPrice
                )}`}
              />
              <PriceInfoCard
                title="Average Price"
                iconSrc="/assets/icons/chart.svg"
                value={`${product.currency} ${formatNumber(
                  product.averagePrice
                )}`}
              />
              <PriceInfoCard
                title="Highest Price"
                iconSrc="/assets/icons/arrow-up.svg"
                value={`${product.currency} ${formatNumber(
                  product.highestPrice
                )}`}
              />
              <PriceInfoCard
                title="Lowest Price"
                iconSrc="/assets/icons/arrow-down.svg"
                value={`${product.currency} ${formatNumber(
                  product.lowestPrice
                )}`}
              />

              <div className="flex  gap-16">
                <Modal productId={id} />
                <Link
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="btn w-fit mx-auto flex items-center justify-center gap-3 min-w-[200px]">
                    <Image
                      src="/assets/icons/bag.svg"
                      alt="check"
                      width={22}
                      height={22}
                    />
                    Buy Now
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {similarProducts && similarProducts?.length > 0 && (
        <div className="py-14 flex flex-col gap-2 w-full">
          <p className="section-text">Similar Products</p>

          <div className="flex flex-wrap gap-10 mt-7 w-full">
            {getRandomProducts(similarProducts, 3).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default productDetails;
