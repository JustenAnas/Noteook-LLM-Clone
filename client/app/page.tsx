"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Layers,
  Lightbulb,
  ChevronDown,
  UserCircle2,
  Sparkles,
  BookOpenCheck,
  Headphones,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      id: "upload",
      title: "Upload your sources",
      desc: "Upload PDFs, websites, YouTube videos, audio files, Google Docs, Google Slides and more, and Gemini Notebook will summarize them and make interesting connections between topics, all powered by the latest version of Gemini's multimodal understanding capabilities.",
      media:
        "https://notebook.google/_/static/v4/videos/upload_your_sources.mp4",
      type: "video",
      icon: UserCircle2,
    },
    {
      id: "insights",
      title: "Instant insights",
      desc: "With all of your sources in place, Gemini Notebook gets to work and becomes a personalized AI expert in the information that matters most to you.",
      media:
        "https://notebook.google/_/static/v4/video_placeholder_2_replacement.png",
      type: "image",
      icon: Sparkles,
    },
    {
      id: "source",
      title: "See the source",
      desc: "Gain confidence in every response because Gemini Notebook provides clear citations for its work, showing you the exact quotes from your sources.",
      media:
        "https://notebook.google/_/static/v4/videos/see_the_source_not_just_the_answer.mp4",
      type: "video",
      icon: BookOpenCheck,
    },
    {
      id: "listen",
      title: "Listen and learn",
      desc: "Our new Audio Overview feature can turn your sources into engaging “Deep Dive” discussions with one click.",
      media:
        "https://notebook.google/_/static/v4/videos/listen_and_learn_on_the_go.mp4",
      type: "video",
      icon: Headphones,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans relative overflow-x-hidden flex flex-col">
      {/* Navigation (Sticky Header) */}
      <nav className="sticky top-0 z-50 h-[72px] bg-white border-b border-[#F0F0F0] flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <Image
            src="/favicon.jpg"
            alt="Logo"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="font-medium text-lg tracking-tight">
            Gemini Notebook
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-[#777777] text-[15px] font-medium">
          <Link href="#" className="hover:text-black transition-colors">
            Overview
          </Link>
          <Link href="#" className="hover:text-black transition-colors">
            Plans
          </Link>
          <Link
            href="https://www.reddit.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition-colors"
          >
            {" "}
            <img
              src="https://notebook.google/_/static/v4/reddit.svg"
              alt="Reddit"
              className="w-6 h-6"
            />
          </Link>
          <Link
            href="https://www.discord.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition-colors"
          >
            {" "}
            <img
              src="https://notebook.google/_/static/v4/discord.svg"
              alt="discord"
              className="w-6 h-6"
            />
          </Link>
          <Link
            href="https://www.x.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition-colors"
          >
            {" "}
            <img
              src="https://notebook.google/_/static/v4/x.svg"
              alt="x"
              className="w-6 h-6"
            />
          </Link>
          <div className="flex items-center gap-4 border-l border-[#F0F0F0] pl-8">
            <Link
              href="/auth"
              className="text-black hover:opacity-80 font-medium"
            >
              Get the App
            </Link>
          </div>
        </div>
        <div className="md:hidden flex items-center">
          <Link href="/auth" className="text-black font-medium text-sm">
            Get the App
          </Link>
        </div>
      </nav>

      <main className="max-w-[1240px] w-full mx-auto px-6 md:px-12 pb-20 relative z-10 flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center">
          <h1 className="text-8xl md:text-[94px] leading-tight font-semibold mb-6">
            Understand{" "}
            <span
              className="font-medium text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #5B8DEF, #4BC0F0, #1EC989, #2DD4A4)",
              }}
            >
              Anything
            </span>
          </h1>
          <p className="text-[#777777] text-base md:text-xl mb-10 max-w-2xl font-medium leading-relaxed">
            Your research and thinking partner. Upload your sources, ask
            questions, and unlock deeper insights with the power of Gemini.
          </p>
          <Link
            href="/auth"
            className="bg-black text-white px-8 py-3.5 rounded-full text-[22px] font-medium hover:bg-black/90 transition-colors inline-block w-full sm:w-auto shadow-sm"
          >
            Try Gemini Notebook
          </Link>
        </section>

        {/* Section 1: Your AI-Powered Research Partner */}
        <section className="py-16 md:py-24">
          <h2 className="text-[40px] font-medium leading-tight text-center mb-24">
            Your AI-Powered Research Partner
          </h2>
          <div className="flex flex-col gap-32">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={feature.id}
                  className={`flex flex-col md:flex-row gap-12 md:gap-20 items-center ${!isEven ? "md:flex-row-reverse" : ""}`}
                >
                  {/* Text Column */}
                  <div className="flex-1 flex flex-col items-start text-left">
                    <div className="mb-6 text-black">
                      <Icon size={36} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[32px] font-medium mb-6">
                      {feature.title}
                    </h3>
                    <p className="text-[#5f6368] leading-[1.6] text-[18px]">
                      {feature.desc}
                    </p>
                  </div>

                  {/* Media Column */}
                  <div className="flex-[1.2] w-full">
                    <div className="bg-[#1A1A1A] rounded-[32px] overflow-hidden shadow-2xl relative aspect-[4/3] w-full flex items-center justify-center border border-black/5">
                      {feature.type === "video" ? (
                        <video
                          src={feature.media}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={feature.media}
                          alt={feature.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: How people are using Gemini Notebook */}
        <section className="py-16 md:py-24">
          <h2 className="text-[40px] font-medium text-center mb-20">
            How people are using Gemini Notebook
          </h2>
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            <div className="group cursor-default">
              <div className="mb-8 inline-block transform transition-transform duration-300 group-hover:-translate-y-1">
                <GraduationCap
                  size={48}
                  className="text-[#5B8DEF]"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-[22px] font-medium mb-4">Power study</h3>
              <p className="text-[#5f6368] mb-6 leading-relaxed text-[16px]">
                Upload lecture recordings, readings, and notes to instantly
                generate study guides and quiz yourself on the material.
              </p>
              <p className="text-[#5B8DEF] font-medium text-[15px]">
                Learn faster and deeper.
              </p>
            </div>

            <div className="group cursor-default">
              <div className="mb-8 inline-block transform transition-transform duration-300 group-hover:-translate-y-1">
                <Layers
                  size={48}
                  className="text-[#5B8DEF]"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-[22px] font-medium mb-4">
                Organize your thinking
              </h3>
              <p className="text-[#5f6368] mb-6 leading-relaxed text-[16px]">
                Upload your source material and research notes to outline
                essays, summarize reports, or draft comprehensive briefs.
              </p>
              <p className="text-[#5B8DEF] font-medium text-[15px]">
                Present with confidence.
              </p>
            </div>

            <div className="group cursor-default">
              <div className="mb-8 inline-block transform transition-transform duration-300 group-hover:-translate-y-1">
                <Lightbulb
                  size={48}
                  className="text-[#5B8DEF]"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-[22px] font-medium mb-4">Spark new ideas</h3>
              <p className="text-[#5f6368] mb-6 leading-relaxed text-[16px]">
                Upload brainstorming notes and disparate articles to connect the
                dots and uncover insights you might have missed.
              </p>
              <p className="text-[#5B8DEF] font-medium text-[15px]">
                Unlock your creative potential.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Social Proof */}
        <section className="py-16 md:py-24">
          <h1 className="text-center text-[32px] font-bold mb-8 mx-auto">What people are saying</h1>
          <div className="grid md:grid-cols-3 gap-6">
            
            {[
              {
                text: '"A completely new way to interact with the information you care about."',
                author: "HardFork",
              },
              {
                text: '"The Audio Overview feature is mind-blowing. It literally turns your PDFs into a podcast."',
                author: "The Verge",
              },
              {
                text: '"This might be Google\'s most useful AI product yet for students and researchers."',
                author: "WSJ",
              },
              {
                text: '"I upload all my research papers here now. It\'s fundamentally changed my workflow."',
                author: "Andrej Karpathy",
              },
              {
                text: '"It grounds the AI perfectly. No hallucinated facts, just your documents."',
                author: "CNBC",
              },
              {
                text: '"An essential tool for organizing massive amounts of unstructured data."',
                author: "Barron's",
              },
            ].map((quote, i) => (
              <div
                key={i}
                className="bg-[#F8F9FA] p-8 rounded-[24px] flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <p className="text-[#444746] text-[15px] leading-relaxed mb-6">
                  {quote.text}
                </p>
                <p className="text-black font-medium text-[14px]">
                  — {quote.author}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Privacy */}
        <section className="py-16 md:py-24 flex justify-center">
          <div className="max-w-[900px] w-full flex flex-col items-center text-center">
            <div className="max-w-[700px] text-center">
            <h1
              className="font-normal text-[40px] leading-[48px] mb-4 text-black"
              style={{
                fontFamily: '"Google Sans", Helvetica, Arial, sans-serif',
                fontWeight: 400,
                color: "rgb(0, 0, 0)",
              }}
            >
              We value your privacy and never use your organization's data to train Gemini Notebook
            </h1>
            <p
              className="font-normal text-[24px] leading-[36px]"
              style={{
                fontFamily: '"Google Sans", Helvetica, Arial, sans-serif',
                fontWeight: 400,
                color: "rgb(114, 111, 111)",
              }}
            >
              As an organization or school, your data will stay private to you. When you use Gemini Notebook as an individual, your data is not used for training unless you share feedback, see more details here.
            </p>
            </div>
            <img
              src="https://notebook.google/_/static/v4/privacy.png"
              alt="Privacy information"
              className="mt-12 w-full h-auto"
            />
          </div>
        </section>

        {/* Section 5: FAQ */}
        <section className="pt-16 pb-2 flex flex-col items-center">
  <div className="header w-full flex flex-col items-center text-center mb-12">
    <h1
      className="font-normal text-[40px] leading-[48px]"
      style={{
        fontFamily: '"Google Sans", Helvetica, Arial, sans-serif',
        fontWeight: 400,
        color: "rgb(0, 0, 0)",
      }}
    >
      Want to learn more?
    </h1>

    <p
      className="mt-3 font-normal text-[18px] leading-[28px]"
      style={{
        fontFamily: '"Google Sans Text", Helvetica, Arial, sans-serif',
        fontWeight: 400,
        color: "rgb(114, 111, 111)",
      }}
    >
      Here are some answers to common questions.
    </p>
  </div>

  <div className="w-full max-w-[900px]">
    <FAQItem
      question="Is Gemini Notebook the same product as NotebookLM?"
      answer={`Yes. NotebookLM is now Gemini Notebook as of July 2026. It is the same product you know and love, and all of your existing notebooks remain fully accessible.

This reflects a natural evolution of the product. We're continuing to expand notebooks beyond a standalone app into an integrated workspace that brings your context across our AI products.

You can continue to use Gemini Notebook across web and mobile as a standalone tool.`}
    />

    <FAQItem
      question="What makes Gemini Notebook different from other AI-powered note-taking apps?"
      answer={`As a research assistant, Gemini Notebook's advantage is being source-grounded. This helps deliver more accurate answers and insights based on your actual material — reducing the likelihood of AI errors and hallucinations.`}
    />

    <FAQItem
      question="How will the integration with Gemini AI improve Gemini Notebook?"
      answer={`Built with the latest Gemini model, Gemini Notebook gains a more nuanced understanding of your sources. This delivers more insightful summaries, helps identify deeper connections across documents, and provides more accurate answers to your questions.`}
    />

    <FAQItem
      question="What are the main advantages of Gemini Notebook compared to other AI learning apps?"
      answer={`Gemini Notebook offers several key advantages:

Direct control over sources: You provide the documents and information Gemini Notebook uses, ensuring the responses are grounded in your specific knowledge base.

Reduced hallucinations: By strictly referencing your uploaded sources, Notebook reduces the risk of the AI generating inaccurate information.

Personalized learning: It creates a highly personalized learning and research environment tailored to your specific needs and content.

Efficiency in information synthesis: It dramatically speeds up the process of understanding, synthesizing, and extracting insights from large volumes of text.

Trust and reliability: The transparency of knowing exactly where the AI's information comes from builds greater trust in its output.`}
    />

    <FAQItem
      question="Is Gemini Notebook the same product as NotebookLM?"
      answer={`Yes. NotebookLM is now Gemini Notebook as of July 2026. It is the same product you know and love, and all of your existing notebooks remain fully accessible.

This reflects a natural evolution of the product. We're continuing to expand notebooks beyond a standalone app into an integrated workspace that brings your context across our AI products.

You can continue to use Gemini Notebook across web and mobile as a standalone tool.`}
    />

    <FAQItem
      question="What makes Gemini Notebook different from other AI-powered note-taking apps?"
      answer={`As a research assistant, Gemini Notebook's advantage is being source-grounded. This helps deliver more accurate answers and insights based on your actual material — reducing the likelihood of AI errors and hallucinations.`}
    />

    <FAQItem
      question="How will the integration with Gemini AI improve Gemini Notebook?"
      answer={`Built with the latest Gemini model, Gemini Notebook gains a more nuanced understanding of your sources. This delivers more insightful summaries, helps identify deeper connections across documents, and provides more accurate answers to your questions.`}
    />

    <FAQItem
      question="What are the main advantages of Gemini Notebook compared to other AI learning apps?"
      answer={`Gemini Notebook offers several key advantages:

Direct control over sources: You provide the documents and information Gemini Notebook uses, ensuring the responses are grounded in your specific knowledge base.

Reduced hallucinations: By strictly referencing your uploaded sources, Notebook reduces the risk of the AI generating inaccurate information.

Personalized learning: It creates a highly personalized learning and research environment tailored to your specific needs and content.

Efficiency in information synthesis: It dramatically speeds up the process of understanding, synthesizing, and extracting insights from large volumes of text.

Trust and reliability: The transparency of knowing exactly where the AI's information comes from builds greater trust in its output.`}
    />
  </div>
</section>
      </main>

      {/* Atmospheric Gradient Blur above footer */}
      <div className="w-full h-[150px] mt-32 relative flex justify-center pointer-events-none z-0">
        <div
          className="absolute bottom-0 w-full h-[120px]"
          style={{
            background:
              "linear-gradient(to right, rgba(230, 230, 255, 0.8) 0%, rgba(138, 180, 248, 0.6) 25%, rgba(206, 254, 211, 1) 70%, rgba(255, 255, 255, 0) 100%)",
            filter: "blur(45px)",
            transform: "scale(1.1)",
          }}
        />
      </div>

      {/* Footer */}
      <footer className="w-full py-8 px-6 md:px-12 relative z-10 bg-white border-t border-[#F0F0F0]">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <span className="text-black font-medium text-[16px] tracking-tight">
              Google
            </span>
            <span className="text-[#5f6368] text-[14px] hover:text-black transition-colors cursor-pointer">
              Privacy & Terms
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#E3E3E3] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-8 flex justify-between items-start focus:outline-none group"
      >
        <span className="text-[26px] md:text-[32px] font-normal text-[#5B8DEF] group-hover:opacity-80 transition-opacity pr-8 leading-[1.3] tracking-tight">
          {question}
        </span>
        <ChevronDown
          className={`text-[#5B8DEF] transition-transform duration-300 ease-out mt-2 shrink-0 ${isOpen ? "rotate-180" : ""}`}
          size={24}
          strokeWidth={1.5}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-60 pb-8 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <p className="text-[#5f6368] leading-relaxed text-[16px]">{answer}</p>
      </div>
    </div>
  );
}
