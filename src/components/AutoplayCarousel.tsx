import React from "react";
import "./autoplaycarousel.scss";
import { cardDetails } from "./carousel-config";
import CarouselItem from "./CarouselItem.tsx";

export default function AutoplayCarousel() {
  return (
    <div className="carousel-container">
      <div className="carousel-track">
        {Object.keys(cardDetails).map((detailKey) => (
          <CarouselItem
            key={detailKey}
            imgUrl={cardDetails[Number(detailKey) as keyof typeof cardDetails].imgUrl}
            imgTitle={cardDetails[Number(detailKey) as keyof typeof cardDetails].title}
          />
        ))}
        {/* Duplicate items for seamless looping */}
        {Object.keys(cardDetails).map((detailKey) => (
          <CarouselItem
            key={`duplicate-${detailKey}`}
            imgUrl={cardDetails[Number(detailKey) as keyof typeof cardDetails].imgUrl}
            imgTitle={cardDetails[Number(detailKey) as keyof typeof cardDetails].title}
          />
        ))}
      </div>
    </div>
  );
}
