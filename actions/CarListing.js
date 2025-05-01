"use server"

import {db} from "@/lib/prisma";
import {auth} from "@clerk/nextjs/server";
import {serializeCarData} from "@/lib/Helpers";
import {revalidatePath} from "next/cache";

export async function getCarFilter(){

    try {
        const makes = await db.car.findMany({
            where: {
                status: "AVAILABLE",
            },
            select: {
                make: true
            },
            distinct: [
                "make"
            ],
            orderBy: {
                make: "asc"
            }
        })

        const bodyTypes = await db.car.findMany({
            where: {
                status: "AVAILABLE",
            },
            select: {
                bodyType: true
            },
            distinct: [
                "bodyType"
            ],
            orderBy: {
                bodyType: "asc"
            }
        })

        const fuelTypes = await db.car.findMany({
            where: {
                status: "AVAILABLE",
            },
            select: {
                fuelType: true
            },
            distinct: [
                "fuelType"
            ],
            orderBy: {
                fuelType: "asc"
            }
        })

        const transmissions = await db.car.findMany({
            where: {
                status: "AVAILABLE",
            },
            select: {
                transmission: true
            },
            distinct: [
                "transmission"
            ],
            orderBy: {
                transmission: "asc"
            }
        })

        const priceAggregations = await db.car.aggregate({
            where: {
                status: "AVAILABLE",
            },
            _min: {
                price: true
            },
            _max: {
                price: true
            }
        })

        return {
            success: true,
            data: {
                makes: makes.map((item) => item.make),
                bodyTypes: bodyTypes.map((item) => item.bodyType),
                fuelTypes: fuelTypes.map((item) => item.fuelType),
                transmissions: transmissions.map((item) => item.transmission),
                priceRange: {
                    min: priceAggregations._min.price ? parseFloat(priceAggregations._min.price.toString()) : 0,
                    max: priceAggregations._max.price ? parseFloat(priceAggregations._max.price.toString()) : 100000,
                }
            }
        }
    } catch (e){
        throw new Error(`Error ${e}`);
    }
}

export async function getCars(
    {
        search = "",
        make = "",
        bodyType = "",
        fuelType = "",
        transmissions = "",
        minPrice = 0,
        maxPrice = Number.MAX_SAFE_INTEGER,
        sortBy = "newest",
        page = 1,
        limit = 6,
    }
){
    try {

        const { userId } = await auth()
        let dbUser = null

        if (userId){
            dbUser = await db.user.findUnique({
                where: {
                    clerkUserId: userId
                }
            })
        }

        let where = {
            status: "AVAILABLE",
        }

        if (search){
            where.OR = [
                { make: { contains: search, mode: "insensitive" } },
                { model: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ]
        }

        if (make) where.make = { equals: make, mode: "insensitive" };
        if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" };
        if (fuelType) where.fuelType = { equals: fuelType, mode: "insensitive" };
        if (transmissions) where.transmissions = { equals: transmissions, mode: "insensitive" };

        where.price = {
            gte: parseFloat(minPrice) || 0
        }

        if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER){
            where.price.lte = parseFloat(maxPrice)
        }

        const skip = (page - 1) * limit

        let orderBy

        switch (sortBy){
            case "priceAsc":
                orderBy = {
                    price: "asc",
                }
                break;
            case "priceDesc":
                orderBy = {
                    price: "desc",
                }
                break;
            case "newest":
            default:
                orderBy = {
                    createdAt: "desc"
                }
                break;
        }

        const totalCars = await db.car.count({ where })

        // execute main query
        const cars = await db.car.findMany({
            where: where,
            take: limit,
            skip: skip,
            orderBy: orderBy,
        })

        let wishlisted = new Set()

        if (dbUser){
            const savedCars = await db.userSavedCar.findMany({
                where: { userId: dbUser.id },
                select: { carId: true}
            })

            wishlisted = new Set(savedCars.map((saved) => saved.carId))
        }

        const serializedCars = cars.map((car) => {
            return serializeCarData(car, wishlisted.has(car.id));
        });

        return {
            success: true,
            data: { serializedCars},
            pagination: {
                total: totalCars,
                page,
                limit,
                pages: Math.ceil(totalCars / limit),
            }
        }

    } catch (e) {
        throw new Error(`Error get cars: ${e}`);
    }
}

export async function toggleSavedCar(carId){
    try {
        const { userId} = await db.auth()
        if (!userId){
            throw new Error("Unauthorized")
        }

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        })

        if (!user){
            throw new Error("User not found")
        }

        // check if car exists
        const car = await db.car.findUnique({
            where: {
                id: carId
            }
        })

        if (!car){
            return{
                success: false,
                error: "No car found"
            }
        }

        // check is already saved?
        const existingSave = await db.userSavedCar.findUnique({
            where: {
                userId_carId: {
                    userId: user.id,
                    carId
                }
            }
        })

        // if already saved, remove them
        if (existingSave){
            await db.userSavedCar.delete({
                where: {
                    userId_carId:{
                        userId: user.id,
                        carId
                    }
                }
            })

            revalidatePath("/saved-cars")
            return {
                success: true,
                saved: false,
                message: "Car removed from favorites"
            }
        }

        // if car is not saved
        await db.userSavedCar.create({
            data: {
                userId: user.id,
                carId
            }
        })

        revalidatePath("/saved-cars")
        return {
            success: true,
            saved: true,
            message: "Car added to favorites"
        }

    } catch (e){
        throw new Error(`Error saving car: ${e}`);
    }
}