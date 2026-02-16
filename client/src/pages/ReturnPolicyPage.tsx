import Layout from "@/components/layout/Layout";
import { Helmet } from "react-helmet";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const ReturnPolicyPage = () => {
    return (
        <Layout>
            <Helmet>
                <title>Return Policy | Probashi Bakery</title>
                <meta name="description" content="Product Return Policy for Probashi Bakery" />
            </Helmet>
            <div className="container mx-auto px-4 py-20 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-primary font-heading">Return Policy</h1>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                This policy outlines the conditions under which products can be returned or exchanged. For money refunds, please refer to our <a href="/refund-policy" className="underline font-semibold hover:text-blue-900">Refund Policy</a>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="prose max-w-none text-gray-700 space-y-4">
                    <p className="lead text-lg text-gray-600">
                        At Probashi Bakery, we take great pride in our products. We want you to be completely satisfied with your purchase.
                    </p>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">Conditions for Returns</h2>
                    <p>In order for the Goods to be eligible for a return, please ensure that:</p>
                    <div className="grid md:grid-cols-2 gap-4 my-4">
                        <div className="flex items-start bg-white p-4 rounded border border-gray-100">
                            <CheckCircle2 className="text-green-500 mr-3 mt-1 shrink-0" />
                            <span>The Goods were purchased in the last 24 hours (for perishable items) or 2 days (for packaged goods).</span>
                        </div>
                        <div className="flex items-start bg-white p-4 rounded border border-gray-100">
                            <CheckCircle2 className="text-green-500 mr-3 mt-1 shrink-0" />
                            <span>The Goods are in the original packaging.</span>
                        </div>
                        <div className="flex items-start bg-white p-4 rounded border border-gray-100">
                            <CheckCircle2 className="text-green-500 mr-3 mt-1 shrink-0" />
                            <span>You have the receipt or proof of purchase.</span>
                        </div>
                        <div className="flex items-start bg-white p-4 rounded border border-gray-100">
                            <CheckCircle2 className="text-green-500 mr-3 mt-1 shrink-0" />
                            <span>The item is defective, damaged, or incorrect.</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">Non-Returnable Items</h2>
                    <p>Due to the nature of our business, certain items cannot be returned:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Custom-made cakes or special orders (unless there is a quality issue).</li>
                        <li>Perishable goods (cakes, pastries, breads) that were delivered correctly and in good condition but simply "unwanted" after acceptance.</li>
                        <li>Goods that have been partially consumed.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">How to Initiate a Return</h2>
                    <p>If you receive a damaged or incorrect item, please follow these steps immediately:</p>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li><strong>Do not accept</strong> the delivery if the cake/item is visibly damaged upon arrival.</li>
                        <li>Take clear photos of the damaged or incorrect item.</li>
                        <li>Contact our customer support immediately at <strong>01829 88 88 88</strong> or email <strong>probashibakery@gmail.com</strong>.</li>
                        <li>Our team will assess the issue and offer a replacement or process a return accordingly.</li>
                    </ol>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">Exchanges</h2>
                    <p>
                        We only replace items if they are defective or damaged. If you need to exchange it for the same item, contact us immediately upon delivery.
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default ReturnPolicyPage;
