"use server"

import {db} from "@/lib/prisma";
import {serializeCarData} from "@/lib/Helpers";
import {request} from "@arcjet/next";
import aj from "@/lib/arcjet";
import {GoogleGenerativeAI} from "@google/generative-ai";


// Function to convert File to base64
async function fileToBase64(file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    return buffer.toString("base64");
}

export async function getFeaturedCars(limit = 3) {
    try {
        const cars = await db.car.findMany({
            where: {
                featured: true,
                status: "AVAILABLE",
            },
            take: limit,
            orderBy: {
                createdAt: "DESC",
            }
        })

        return cars.map(serializeCarData);
    } catch (e){
        throw new Error("Error fetching featured cars");
    }
}

export async function processImageSearch(file){
    try {
        // Rate limiting with arc jet
        const req = await request()

        const decision = await aj.protect(req, {
            requested: 1
        })

        if (decision.isDenied()){
            if (decision.reason.isRateLimit()){
                const { remaining, reset} = decision.reason

                console.error({
                    code: "RATE_LIMIT_EXCEEDED",
                    details: {
                        remaining,
                        resetInSeconds: reset,
                    }
                })

                throw new Error("To many requests. Please try again later");
            }

            throw new Error("Request blocked");
        }

        // check if gemini api key is available
        if (!process.env.GEMINI_API_KEY){
            throw new Error("Gemini API key is missing");
        }

        // Initialize Gemini API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convert image file to base64
        const base64Image = await fileToBase64(file);

        // Create image part for the model
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: file.type,
            },
        };

        // Define the prompt for car detail extraction
        const prompt = `
         Analyze this car image and extract the following information for a search query:
      1. Make (manufacturer) 
      5. Body type – Must be one of the following: "SUV", "Sedan", "Hatchback", "Convertible", "Coupe", "Wagon", "Pickup"
      3. Color

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "bodyType": "",
        "color": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
         `;

        // Get response from Gemini
        const result = await model.generateContent([imagePart, prompt]);
        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        // Parse the JSON response
        try {
            const carDetails = JSON.parse(cleanedText);

            // Return success response with data
            return {
                success: true,
                data: carDetails,
            };
        } catch (parseError) {
            return {
                success: false,
                error: "Failed to parse AI response",
            };
        }
    } catch (e) {
        throw new Error("Error process image search");
    }
}