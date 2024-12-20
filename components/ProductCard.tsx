import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";

interface Props {
  product: Product;
}
function ProductCard({ product }: Props) {
  return (
    <Link href={`/products/${product._id}`} className="product-card">
      <div className="product-card_img-container">
        <Image
          src={product.image}
          alt={product.title}
          width={200}
          height={200}
          className="product-card_img"
        />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="product-title">{product.title}</h3>

        <div className="flex justify-between">
          <p className="text-black opacity-50 text-lg capitalize">//</p>

          <p className="text-black text-lg font-semibold">
            {product.outOfStock == true ? (
              <span className="text-1xl font-semibold text-red-600">
                Out of stock.
              </span>
            ) : (
              <>
                <span>{product?.currency}</span>
                <span>{product?.currentPrice}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
