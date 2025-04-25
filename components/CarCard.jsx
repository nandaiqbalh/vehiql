"use client";

import React, {useEffect, useState} from "react";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import { CarIcon, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";

const CarCard = ({ car }) => {
  const [formattedPrice, setFormattedPrice] = useState('');

  useEffect(() => {
    setFormattedPrice(car.price.toLocaleString());
  }, [car.price]);

  const [isSaved, setIsSaved] = useState(car.wishlisted);
  const router = useRouter();

  const handleToggleSave = async (e) => {};

  return (
    <Card className="overflow-hidden hover:shadow-lg transition group py-0">
      <div className="relative h-48">
        {car.images && car.images.length > 0 ? (
          <div className="relative h-full w-full">
            <Image
              src={car.images[0]}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            ></Image>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <CarIcon className="h-12 w-12 text-gray-400"></CarIcon>
          </div>
        )}

        <Button
          variant={`ghost`}
          size={`icon`}
          className={`absolute top-2 right-2 bg-white/90 rounded-full p-1.5 ${
            isSaved
              ? "text-red-500 hover:text-red-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={handleToggleSave}
        >
          <Heart className={isSaved ? "fill-current" : ""} size={20} />
        </Button>
      </div>

      {/* content details */}
      <CardContent className={`p-4`}>
        {/* model and price */}
        <div className="flex flex-col mb-2">
          <h3 className="text-lg font-bold line-clamp-1">{`${car.make} ${car.model}`}</h3>
          <span className="text-xl font-bold text-blue-600">{formattedPrice}</span>
        </div>

        {/* year and engine */}
        <div className="text-gray-600 mb-2 flex items-center">
          <span>{car.year}</span>
          <span className="mx-2">•</span>
          <span>{car.bodyType}</span>
          <span className="mx-2">•</span>
          <span>{car.fuelType}</span>
        </div>

        {/* mileage and color */}
        <div className="flex flex-wrap gap-1 mb-4">
          <Badge
            variant={`outline`}
            className="bg-gray-50"
          >{`${car.bodyType}`}</Badge>
          <Badge
            variant={`outline`}
            className="bg-gray-50"
          >{`${new Intl.NumberFormat('en-US').format(car.mileage)} miles`}
          </Badge>
          <Badge
            variant={`outline`}
            className="bg-gray-50"
          >{`${car.color}`}</Badge>
        </div>

        {/* view car button */}
        <div className="flex justify-between">
          <Button
            className="w-full py-2 px-4 cursor-pointer"
            onClick={() => router.push(`/cars/${car.id}`)}
          >
            View Car
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarCard;
