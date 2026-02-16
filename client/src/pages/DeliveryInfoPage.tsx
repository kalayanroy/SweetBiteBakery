import Layout from "@/components/layout/Layout";
import { Helmet } from "react-helmet";
import { Truck, Clock, MapPin, DollarSign } from "lucide-react";

const DeliveryInfoPage = () => {
    return (
        <Layout>
            <Helmet>
                <title>Delivery Information | Probashi Bakery</title>
                <meta name="description" content="Delivery Information for Probashi Bakery - Areas, Times, and Charges" />
            </Helmet>
            <div className="container mx-auto px-4 py-20 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-primary font-heading">Delivery Information</h1>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="bg-accent/10 p-3 rounded-full mr-4">
                                <Clock className="text-accent h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-primary">Delivery Hours</h3>
                        </div>
                        <p className="text-gray-600">
                            We deliver automatically between <span className="font-semibold text-primary">7:00 AM to 12:00 AM</span> every day.
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                            * Orders placed after 11:00 PM may be delivered the next morning.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="bg-accent/10 p-3 rounded-full mr-4">
                                <MapPin className="text-accent h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-primary">Delivery Areas</h3>
                        </div>
                        <p className="text-gray-600">
                            Currently serving <span className="font-semibold text-primary">Chattogram City</span> areas.
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                            Specific zones: GEC, Nasirabad, Khulshi, Agrabad, Halishahar, Chawkbazar, Jamal Khan.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="bg-accent/10 p-3 rounded-full mr-4">
                                <Truck className="text-accent h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-primary">Delivery Time</h3>
                        </div>
                        <p className="text-gray-600">
                            Standard delivery time is <span className="font-semibold text-primary">45-60 minutes</span> after order confirmation.
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                            For custom cakes, please order at least 24 hours in advance.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="bg-accent/10 p-3 rounded-full mr-4">
                                <DollarSign className="text-accent h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-primary">Delivery Charges</h3>
                        </div>
                        <p className="text-gray-600">
                            Flat rate of <span className="font-semibold text-primary">60 BDT</span> for all orders within Chattogram City.
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                            Free delivery on orders over 2000 BDT.
                        </p>
                    </div>
                </div>

                <div className="prose max-w-none text-gray-700 space-y-4">
                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">Important Delivery Notes</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Please ensure someone is available to receive the package at the delivery address.</li>
                        <li>We take utmost care in packaging to ensure your items arrive in perfect condition.</li>
                        <li>In case of heavy rain or traffic, delivery might be slightly delayed. We appreciate your patience.</li>
                        <li>For any delivery issues, please contact our hotline immediately at <span className="font-semibold">01829 88 88 88</span>.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">Self Pickup</h2>
                    <p>
                        You can also choose to pick up your order from our outlet:
                        <br />
                        <span className="font-semibold">Probashi Bakery</span>
                        <br />
                        25 katalgonj, Panchalish Thana, Chattogram, 4203.
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default DeliveryInfoPage;
