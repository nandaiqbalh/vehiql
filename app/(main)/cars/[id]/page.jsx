import {getCarById} from "@/actions/CarListing";

export async function generateMetadata({params}){
    const {id} = await params;
    const result = await getCarById(id);

    if (!result.success){
        return {
            title: "Car Not Found | Vehiql",
            description: "The requested car could not be found.",
        }
    }

    const car = result.data;

    return {
        title: `${car.year} ${car.make} ${car.model} | Vehiql`,
        description: car.description.substring(0, 160),
        openGraph: {
            images: car.images?.[0] ? [car.images[0]] : []
        }
    }
}

const Page =async ({params}) => {

    const {id} = await params

    return (
        <div>CarPage: {id}</div>
    )
}
export default Page
