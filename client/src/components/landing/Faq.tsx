import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

interface FaqItem {
  question: string;
  answer: string;
}

export default function Faq() {
  const faqs: FaqItem[] = [
    {
      question: "When will LaunchPad be available?",
      answer: "We're currently in private beta and will be rolling out invites to our waitlist in batches starting Q1 2023. Join the waitlist to secure your spot and get early access."
    },
    {
      question: "How much will LaunchPad cost?",
      answer: "We'll offer multiple pricing tiers to accommodate teams of all sizes. Early adopters from our waitlist will receive special pricing and benefits. Detailed pricing will be announced closer to public launch."
    },
    {
      question: "Is there a free plan available?",
      answer: "Yes, we'll offer a free tier with core functionality for small teams or individuals. Premium features will be available in our paid plans, with options to scale as your needs grow."
    },
    {
      question: "What platforms does LaunchPad support?",
      answer: "LaunchPad is a cloud-based solution accessible through any modern web browser. We also offer native mobile apps for iOS and Android, with desktop applications for Windows and Mac coming soon after launch."
    },
    {
      question: "How secure is my data with LaunchPad?",
      answer: "Security is our top priority. We use industry-standard encryption for data in transit and at rest. Our infrastructure is hosted on secure cloud providers with SOC 2 compliance, and we follow strict data protection protocols."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-primary text-sm font-medium">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">Questions & Answers</h2>
          <p className="text-lg text-gray-600">Get answers to the most common questions about LaunchPad.</p>
        </div>
        
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200 py-2">
                <AccordionTrigger className="text-lg font-bold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
