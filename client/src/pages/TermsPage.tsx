import Layout from "@/components/layout/Layout";
import { Helmet } from "react-helmet";

const TermsPage = () => {
    return (
        <Layout>
            <Helmet>
                <title>Terms and Conditions | Probashi Bakery</title>
                <meta name="description" content="Terms and Conditions for Probashi Bakery" />
            </Helmet>
            <div className="container mx-auto px-4 py-20 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-primary font-heading">Terms and Conditions</h1>
                <div className="prose max-w-none text-gray-700 space-y-4">
                    <p>Welcome to Probashi Bakery. By accessing this website we assume you accept these terms and conditions. Do not continue to use Probashi Bakery if you do not agree to take all of the terms and conditions stated on this page.</p>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">Cookies</h2>
                    <p>We employ the use of cookies. By accessing Probashi Bakery, you agreed to use cookies in agreement with the Probashi Bakery's Privacy Policy.</p>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">License</h2>
                    <p>Unless otherwise stated, Probashi Bakery and/or its licensors own the intellectual property rights for all material on Probashi Bakery. All intellectual property rights are reserved.</p>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">Hyperlinking to our Content</h2>
                    <p>The following organizations may link to our Website without prior written approval: Government agencies; Search engines; News organizations.</p>

                    <p className="mt-8 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </Layout>
    );
};

export default TermsPage;
