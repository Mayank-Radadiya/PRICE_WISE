"use client"
import React from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";

const heroImages = [
  { imgUrl: "/assets/images/hero-1.svg", alt: "smartwatch" },
  { imgUrl: "/assets/images/hero-2.svg", alt: "bag" },
  { imgUrl: "/assets/images/hero-3.svg", alt: "lamp" },
  { imgUrl: "/assets/images/hero-4.svg", alt: "air fryer" },
  { imgUrl: "/assets/images/hero-5.svg", alt: "chair" },
];
function HeroComponent() {
    
  return (
    <>
      <div className="hero-carousel">
        <Carousel
          showThumbs={false}
          // autoPlay
          // interval={2 500}
          infiniteLoop
          showArrows={false}
          showStatus={false}
        >
          {heroImages.map((img) => (
            <Image
              className="object-contain"
              key={img.alt}
              src={img.imgUrl}
              alt={img.alt}
              width={484}
              height={484}
            ></Image>
          ))}
        </Carousel>

        <Image
          src="assets/icons/hand-drawn-arrow.svg"
          alt="arrow"
          width={175}
          height={175}
          className="max-xl:hidden absolute -left-[15%] bottom-0 z-0"
        />
      </div>
    </>
  );
}

export default HeroComponent;
