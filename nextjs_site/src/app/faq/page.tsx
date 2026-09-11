"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is iHub-AWaDH?",
      answer: "IIT Ropar – Technology & Innovation Foundation (iHub-AWaDH) is one of the 25 Technology Innovation Hubs established under the National Mission on Interdisciplinary Cyber-Physical Systems (NM-ICPS) by the Department of Science and Technology (DST), Govt. of India."
    },
    {
      question: "What is the focus of the CPS LAB?",
      answer: "The CPS LAB focuses on building the future of intelligent systems through rigorous research, open innovation, and hardware-software integration across domains like AI, IoT, robotics, and embedded systems."
    },
    {
      question: "What kinds of products and kits do you provide?",
      answer: "We offer a comprehensive range of IoT hardware, including Arduino Development Kits, nRF52832/nRF52833 Robotic Kits, BLE Gateways, and a wide array of sensors (e.g., AHT20, BME680, LIS3DH, ultrasonic) tailored for Cyber-Physical Systems."
    },
    {
      question: "How can I monitor my sensor data in real-time?",
      answer: "You can visualize and monitor your data using our official applications: **Serial Monitor** (PC application for robust data visualization), **BLE Sense** (Android app for Bluetooth protocols), and **Cloud Sense** (Android app for weather and environmental monitoring)."
    },
    {
      question: "Where can I find manuals and open-source code?",
      answer: "We provide open-source access to our resources. You can find QuecPython UI Manuals, nRF Firmware Manuals, and our code repositories via the **CPS Lab Open GitHub** link located in the footer under \"Applications & Forms\"."
    },
    {
      question: "Can my college or institute become a CPS Lab Spoke Centre?",
      answer: "Yes! We are actively expanding our nationwide ecosystem. Institutions can submit an Expression of Interest (EOI) application to join us. The **College EOI Application** link is available in the footer of our website."
    },
    {
      question: "Is there a similar program for schools?",
      answer: "Absolutely. Schools can also apply to collaborate and bring Cyber-Physical Systems education to their students. You can apply using the **School EOI Application** link in the footer."
    },
    {
      question: "Do you offer training programs or workshops?",
      answer: "Yes, we provide extensive capacity-building initiatives, training, and workshops. To date, we have trained over 8,000+ students, researchers, and professionals through our Spoke Centres and Hub programs."
    },
   
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface pt-32 pb-24 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] opacity-30"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-[2px] bg-primary"></div>
            <span className="text-primary font-mono text-sm uppercase tracking-widest font-bold flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> FAQ
            </span>
            <div className="w-10 h-[2px] bg-primary"></div>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Frequently Asked Questions
          </h1>
          <p className="font-body text-base text-on-surface-variant max-w-2xl">
            Find answers to common questions about CPS LAB, our products, programs, and how you can get involved.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={index}
              className="bg-surface-container border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left focus:outline-none"
              >
                <span className="font-headline text-lg font-bold text-white group-hover:text-primary transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-0 font-body text-sm text-on-surface-variant leading-relaxed">
                      {faq.answer.split("**").map((text, i) =>
                        i % 2 === 1 ? (
                          <strong key={i} className="text-white font-semibold">
                            {text}
                          </strong>
                        ) : (
                          text
                        )
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
