import Layout from "@/components/layout/Layout";
import { Helmet } from "react-helmet";

const RefundPolicyPage = () => {
    return (
        <Layout>
            <Helmet>
                <title>Refund Policy | Probashi Bakery</title>
                <meta name="description" content="Refund Policy for Probashi Bakery - Timelines and Methods" />
            </Helmet>
            <div className="container mx-auto px-4 py-20 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-primary font-heading">Refund Policy</h1>
                <div className="prose max-w-none text-gray-700 space-y-4">
                    <p>Thank you for shopping at Probashi Bakery. If, for any reason, You are not completely satisfied with a purchase, we are here to help. This policy outlines how refunds are processed. For item returns, please refer to our <a href="/return-policy" className="underline font-semibold hover:text-primary">Return Policy</a>.</p>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">Interpretation and Definitions</h2>
                    <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">Your Order Cancellation Rights</h2>
                    <p>You are entitled to cancel Your Order within various timeframes depending on the product type:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>For non-perishable items: You may cancel within 24 hours of placing the order if it has not been shipped.</li>
                        <li>For perishable (bakery) items: Cancellation is only possible if the preparation has not started. Once preparation has begun, orders cannot be cancelled.</li>
                    </ul>
                    <p>If there is no specific cancellation possibility for a custom order, it will be clearly communicated at the time of purchase.</p>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">Refund Timeline</h2>
                    <p className="font-semibold">If your refund is approved, we will initiate a refund to your credit card (or original method of payment). You will receive the credit within a certain amount of days.</p>
                    <div className="bg-neutral p-4 rounded-lg border border-primary/20 my-4">
                        <p className="font-bold text-primary">Standard Refund Timeline: 7 to 10 working days</p>
                        <p className="text-sm mt-1">Please note that after we process the refund, it may take 7-10 working days for the amount to reflect in your account depending on your card issuer's policies.</p>
                    </div>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">Refund Methods</h2>
                    <p>Refunds will be issued to the original payment method used during the purchase:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Credit/Debit Cards:</strong> Refunded to the same card.</li>
                        <li><strong>bKash/Mobile Wallets:</strong> Refunded to the same mobile number.</li>
                        <li><strong>Cash on Delivery:</strong> If you paid cash and a refund is due (e.g., for returned defective items), we will issue a refund via bKash or Bank Transfer upon agreement.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-6 mb-3 text-primary">Contact Us</h2>
                    <p>If you have any questions about our Returns and Refunds Policy, please contact us:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>By email: probashibakery@gmail.com</li>
                        <li>By phone: 01829 88 88 88</li>
                    </ul>
                </div>
            </div>
        </Layout>
    );
};

export default RefundPolicyPage;
