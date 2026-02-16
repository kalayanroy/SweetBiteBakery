import Layout from "@/components/layout/Layout";
import { Helmet } from "react-helmet";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FAQPage = () => {
    return (
        <Layout>
            <Helmet>
                <title>Frequently Asked Questions | Probashi Bakery</title>
                <meta name="description" content="FAQ - Frequently Asked Questions about Probashi Bakery" />
            </Helmet>
            <div className="container mx-auto px-4 py-20 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-primary font-heading text-center">Frequently Asked Questions</h1>

                <div className="space-y-8">
                    {/* Ordering Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-accent">Ordering & Delivery</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>How do I place an order?</AccordionTrigger>
                                <AccordionContent>
                                    You can place an order directly through our website by selecting your favorite items and proceeding to checkout. Alternatively, you can call us at 01829 88 88 88.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Do you offer home delivery?</AccordionTrigger>
                                <AccordionContent>
                                    Yes, we offer home delivery within Chattogram City areas. Delivery charges are calculated based on your location.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Can I schedule a delivery for a specific time?</AccordionTrigger>
                                <AccordionContent>
                                    Yes, you can specify your preferred delivery date and time during checkout. We will do our best to deliver within that window.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>How much notice do I need to give for a custom cake?</AccordionTrigger>
                                <AccordionContent>
                                    For custom designs, we require at least 24 hours notice. For complex wedding cakes or large event orders, please contact us at least 3-7 days in advance.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>

                    {/* Payment Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-accent">Payment</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="pay-1">
                                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                                <AccordionContent>
                                    We accept Cash on Delivery (COD), bKash, and major Credit/Debit cards upon delivery (please mention if you need a card machine sent with the rider).
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="pay-2">
                                <AccordionTrigger>Is it safe to pay online?</AccordionTrigger>
                                <AccordionContent>
                                    Currently, we primarily operate with Cash on Delivery and bKash to ensure maximum security and trust.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>

                    {/* Products Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-accent">Products</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="prod-1">
                                <AccordionTrigger>Are your products eggless?</AccordionTrigger>
                                <AccordionContent>
                                    We have a specific selection of eggless cakes and biscuits. Please check the product description or ask our staff for assistance.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="prod-2">
                                <AccordionTrigger>Do you use preservatives?</AccordionTrigger>
                                <AccordionContent>
                                    We pride ourselves on using fresh ingredients. Most of our bakery items are made fresh daily without harsh preservatives.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>
                </div>

                <div className="mt-12 p-6 bg-accent/5 rounded-lg text-center border border-accent/20">
                    <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                    <p className="text-gray-600 mb-4">We're here to help you.</p>
                    <a href="/contact" className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors">
                        Contact Us
                    </a>
                </div>
            </div>
        </Layout>
    );
};

export default FAQPage;
