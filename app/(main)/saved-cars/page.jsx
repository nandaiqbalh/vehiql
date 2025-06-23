import React from 'react'
import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";
import {getSavedCars} from "@/actions/CarListing";
import SavedCarsList from "@/app/(main)/saved-cars/_components/SavedCarsList";

const SavedCarsPage = async () => {

    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in?redirect=/saved-cars");
    }

    // fetch saved cars from the server
    const savedCarResult = await getSavedCars();

    return (
        <div className={`container mx-auto px-4 py-12`}>

            <h1 className={`text-6xl mb-6 gradient-title`}>Your Saved Cars</h1>

            <SavedCarsList initialData={savedCarResult} />

        </div>
    )
}
export default SavedCarsPage
