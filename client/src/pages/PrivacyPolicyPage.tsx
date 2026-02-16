import Layout from "@/components/layout/Layout";
import { Helmet } from "react-helmet";

const PrivacyPolicyPage = () => {
    return (
        <Layout>
            <Helmet>
                <title>Privacy Policy | Probashi Bakery</title>
                <meta name="description" content="Privacy Policy for Probashi Bakery" />
            </Helmet>
            <div className="container mx-auto px-4 py-20 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-primary font-heading">Privacy Policy</h1>
                <div className="prose max-w-none text-gray-700 space-y-4">
                    <p>At Probashi Bakery, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Probashi Bakery and how we use it.</p>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">Information We Collect</h2>
                    <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">How we use your information</h2>
                    <p>We use the information we collect in various ways, including to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Provide, operate, and maintain our website</li>
                        <li>Improve, personalize, and expand our website</li>
                        <li>Understand and analyze how you use our website</li>
                        <li>Develop new products, services, features, and functionality</li>
                        <li>Communicate with you, either directly or through one of our partners</li>
                        <li>Send you emails</li>
                        <li>Find and prevent fraud</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">Log Files</h2>
                    <p>Probashi Bakery follows a standard procedure of using log files. These files log visitors when they visit websites.</p>

                    <p className="mt-8 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </Layout>
    );
};

export default PrivacyPolicyPage;
