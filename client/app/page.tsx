"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GraduationCap, Layers, Lightbulb, ChevronDown, UserSquare2 } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      id: "upload",
      title: "Upload your sources",
      desc: "Upload PDFs, websites, YouTube videos, audio files, Google Docs, Google Slides and more, and Gemini Notebook will summarize them and make interesting connections between topics, all powered by the latest version of Gemini's multimodal understanding capabilities.",
      media: "https://notebook.google/_/static/v4/videos/upload_your_sources.mp4",
      type: "video"
    },
    {
      id: "insights",
      title: "Instant insights",
      desc: "Ask questions and get answers grounded entirely in the documents you provided. No hallucinations.",
      media: "https://notebook.google/_/static/v4/video_placeholder_2_replacement.png",
      type: "image"
    },
    {
      id: "source",
      title: "See the source",
      desc: "Every answer comes with precise citations and jumping-off points directly to the original material.",
      media: "https://notebook.google/_/static/v4/videos/see_the_source_not_just_the_answer.mp4",
      type: "video"
    },
    {
      id: "listen",
      title: "Listen and learn",
      desc: "Turn your complex documents into an engaging, conversational Audio Overview podcast.",
      media: "https://notebook.google/_/static/v4/videos/listen_and_learn_on_the_go.mp4",
      type: "video"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans relative overflow-x-hidden">
      {/* Navigation (Sticky Header) */}
      <nav className="sticky top-0 z-50 h-16 bg-white border-b border-[#F0F0F0] flex items-center justify-between px-5 md:px-10">
        <div className="flex items-center gap-3">
          <Image src="/favicon.jpg" alt="Logo" width={32} height={32} className="rounded-full" />
          <span className="font-medium text-lg tracking-tight">Gemini Notebook</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[#777777] text-sm font-medium">
          <Link href="#" className="hover:text-black transition-colors">Overview</Link>
          <Link href="#" className="hover:text-black transition-colors">Plans</Link>
          <div className="flex items-center gap-4 border-l border-[#F0F0F0] pl-8">
            <Link href="/auth" className="text-black hover:opacity-80 font-medium">
              Get the App
            </Link>
          </div>
        </div>
        <div className="md:hidden flex items-center">
            <Link href="/auth" className="text-black font-medium text-sm">Get the App</Link>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-5 md:px-10 pb-20 relative z-10">
        
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-[64px] leading-tight font-normal mb-6">
            Understand{" "}
            <span 
              className="font-medium text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(to right, #5B8DEF, #4BC0F0, #1EC989, #2DD4A4)"
              }}
            >
              Anything
            </span>
          </h1>
          <p className="text-[#777777] text-base md:text-lg mb-10 max-w-2xl">
            Your research and thinking partner. Upload your sources, ask questions, and unlock deeper insights with the power of Gemini.
          </p>
          <Link 
            href="/auth" 
            className="bg-black text-white px-12 py-4 rounded-full text-base font-medium hover:scale-[1.02] transition-transform duration-150 inline-block w-full sm:w-auto"
          >
            Try Gemini Notebook
          </Link>
        </section>

        {/* Section 1: Your AI-Powered Research Partner */}
        <section className="py-16 md:py-24">
          <h2 className="text-[40px] font-medium leading-tight text-center mb-16">Your AI-Powered Research Partner</h2>
          <div className="grid md:grid-cols-[1fr_1.5fr] gap-12 items-start">
            
            {/* Left Column: Interactive Tabs */}
            <div className="flex flex-col gap-6">
              {features.map((feature, idx) => {
                const isActive = activeTab === idx;
                return (
                  <div 
                    key={feature.id}
                    onClick={() => setActiveTab(idx)}
                    className={`cursor-pointer transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
                  >
                    <div className="flex flex-col">
                      {isActive && (
                        <div className="mb-4 text-black">
                          <UserSquare2 size={32} strokeWidth={1.5} />
                        </div>
                      )}
                      <h3 className="text-2xl font-medium mb-3">{feature.title}</h3>
                      {isActive && (
                        <p className="text-[#777777] leading-relaxed text-[15px]">
                          {feature.desc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Media Display */}
            <div className="bg-[#1A1A1A] rounded-[32px] overflow-hidden shadow-2xl relative min-h-[400px] md:min-h-[500px] w-full flex items-center justify-center border border-white/10">
                {features.map((feature, idx) => {
                  const isActive = activeTab === idx;
                  if (!isActive) return null;
                  
                  return (
                    <div key={feature.id} className="absolute inset-0 w-full h-full animate-in fade-in duration-500">
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
                  );
                })}
            </div>
          </div>
        </section>

        {/* Section 2: How people are using Gemini Notebook */}
        <section className="py-16 md:py-24">
          <h2 className="text-[32px] font-medium text-center mb-16">How people are using Gemini Notebook</h2>
          <div className="grid md:grid-cols-3 gap-12 md:gap-12">
            <div className="group cursor-default">
              <div className="mb-6 inline-block transform transition-transform duration-200 group-hover:scale-[1.02]">
                <GraduationCap size={56} className="text-[#5B8DEF]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Power study</h3>
              <p className="text-[#777777] mb-4 leading-relaxed">
                Upload lecture recordings, readings, and notes to instantly generate study guides and quiz yourself on the material.
              </p>
              <p className="text-[#5B8DEF] italic font-medium">Learn faster and deeper.</p>
            </div>
            
            <div className="group cursor-default">
              <div className="mb-6 inline-block transform transition-transform duration-200 group-hover:scale-[1.02]">
                <Layers size={56} className="text-[#5B8DEF]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Organize your thinking</h3>
              <p className="text-[#777777] mb-4 leading-relaxed">
                Upload your source material and research notes to outline essays, summarize reports, or draft comprehensive briefs.
              </p>
              <p className="text-[#5B8DEF] italic font-medium">Present with confidence.</p>
            </div>

            <div className="group cursor-default">
              <div className="mb-6 inline-block transform transition-transform duration-200 group-hover:scale-[1.02]">
                <Lightbulb size={56} className="text-[#5B8DEF]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Spark new ideas</h3>
              <p className="text-[#777777] mb-4 leading-relaxed">
                Upload brainstorming notes and disparate articles to connect the dots and uncover insights you might have missed.
              </p>
              <p className="text-[#5B8DEF] italic font-medium">Unlock your creative potential.</p>
            </div>
          </div>
        </section>

        {/* Section 3: Social Proof */}
        <section className="py-16 md:py-24">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: "\"A completely new way to interact with the information you care about.\"", author: "HardFork" },
              { text: "\"The Audio Overview feature is mind-blowing. It literally turns your PDFs into a podcast.\"", author: "The Verge" },
              { text: "\"This might be Google's most useful AI product yet for students and researchers.\"", author: "WSJ" },
              { text: "\"I upload all my research papers here now. It's fundamentally changed my workflow.\"", author: "Andrej Karpathy" },
              { text: "\"It grounds the AI perfectly. No hallucinated facts, just your documents.\"", author: "CNBC" },
              { text: "\"An essential tool for organizing massive amounts of unstructured data.\"", author: "Barron's" }
            ].map((quote, i) => (
              <div key={i} className="bg-[#F9F9F9] p-6 rounded-2xl flex flex-col justify-between transition-transform duration-200 hover:scale-[1.02]">
                <p className="text-[#777777] text-[14px] leading-relaxed mb-4">{quote.text}</p>
                <p className="text-black font-medium text-sm">— {quote.author}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Privacy */}
        <section className="py-16 md:py-24 flex justify-center">
          <div className="max-w-[600px] text-center">
            <p className="text-[#777777] text-[15px] leading-relaxed">
              As an organization or school, your data will stay private. Your uploaded documents and interactions are not used to train our public models without your explicit permission. We value your privacy and trust above all.
            </p>
          </div>
        </section>

        {/* Section 5: FAQ */}
        <section className="py-16 md:py-24 flex flex-col items-center">
          <div className="w-full max-w-[900px]">
            <FAQItem 
              question="How do I report a result in Gemini Notebook that I believe creates a safety concern or is inappropriate?" 
              answer="You can report safety concerns directly through the app by clicking the flag icon on any generated response." 
            />
            <FAQItem 
              question="If I find a bug or have a feature idea, how can I submit my feedback?" 
              answer="We welcome feedback! Please use the 'Send Feedback' option in the settings menu or join our Discord community to share your ideas." 
            />
            <FAQItem 
              question="Is Gemini Notebook the same product as NotebookLM?" 
              answer="Gemini Notebook is inspired by the principles of NotebookLM but built as a robust open-source alternative with direct Gemini integrations." 
            />
          </div>
        </section>
      </main>

      {/* Atmospheric Gradient Blur above footer */}
      <div className="relative w-full h-40 md:h-64 overflow-hidden pointer-events-none mt-[-100px] z-0">
        <div className="absolute bottom-0 left-[10%] w-[40%] h-full bg-[#5B8DEF]/30 blur-[120px] rounded-full mix-blend-multiply"></div>
        <div className="absolute bottom-[-20%] right-[20%] w-[45%] h-full bg-[#2DD4A4]/25 blur-[120px] rounded-full mix-blend-multiply"></div>
        <div className="absolute bottom-[10%] left-[40%] w-[35%] h-[120%] bg-[#A85BEF]/15 blur-[100px] rounded-full mix-blend-multiply"></div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#F0F0F0] py-[60px] px-5 md:px-10 relative z-10 bg-transparent">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <span className="text-black font-semibold text-lg tracking-tight">Google</span>
             <span className="text-[#777777] text-[13px] ml-4 hover:text-black transition-colors cursor-pointer">Privacy & Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#F0F0F0] overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-8 flex justify-between items-start focus:outline-none group"
      >
        <span className="text-[24px] font-normal text-[#5B8DEF] group-hover:opacity-80 transition-opacity pr-8 leading-tight">{question}</span>
        <ChevronDown 
          className={`text-[#5B8DEF] transition-transform duration-200 ease-out mt-1 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
          size={24} 
        />
      </button>
      <div 
        className={`transition-all duration-200 ease-out ${isOpen ? 'max-h-60 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-[#777777] leading-relaxed text-[16px]">{answer}</p>
      </div>
    </div>
  );
}
