import React from "react";
import Image from "next/image";

type props = {
  title: string;
  iconSrc: string;
  value: string;
};

function PriceInfoCard({ title, iconSrc, value }: props) {
  return (
    <div className={`price-info_card`}>
      <p className="text-base text-black-100">{title}</p>

      <div className="flex gap-1">
        <Image src={iconSrc} alt={title} width={24} height={24} />

        <p className="text-2xl font-bold text-secondary">{value}</p>
      </div>
    </div>
  );
}

export default PriceInfoCard;
