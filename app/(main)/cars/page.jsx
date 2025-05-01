import {getCarFilter} from "@/actions/CarListing";
import CarFilter from "@/app/(main)/cars/_components/CarFilter";
import CarListing from "@/app/(main)/cars/_components/CarListing";

export const metadata = {
    title: 'Cars | Vehiql',
    description: "Browse and search for your dream car"
}

const CarsPage = async () => {

    const filtersData = await getCarFilter()
    return (
        <div className={`container mx-auto px-4 py-12`}>
            <h1 className={`text-6xl mb-4 gradient-title`}>Browse Car</h1>

            <div className={`flex flex-col lg:flex-row gap-8`}>
                {/*filters*/}
                <div className={`w-full lg:w-80 flex-shrink-0 `}>
                    <CarFilter filters={filtersData.data} />
                </div>

                {/*list*/}
                <div className={`flex-1`}>
                    <CarListing />
                </div>
            </div>
        </div>
    )
}
export default CarsPage
