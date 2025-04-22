import React from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-16 px-6">
        <div className="flex gap-8 justify-center items-center">
          <img
            src="/stack-left.png"
            alt="Left Stack"
            className="w-32 h-32 object-contain transform hover:scale-110 transition-transform duration-300"
          />
          <img
            src="/stack-right.png"
            alt="Right Stack"
            className="w-32 h-32 object-contain transform hover:scale-110 transition-transform duration-300"
          />
        </div>
        <h1 className="text-5xl font-extrabold mt-10 leading-tight max-w-3xl">
          Welcome to{" "}
          <span className="text-black dark:text-white">StackScope</span>
        </h1>
        <p className="mt-4 text-base max-w-xl mx-auto text-gray-700 dark:text-gray-300">
          Login to access all features shown below and maximize your cloud
          management capabilities.
        </p>
        {/* Replaced <a> inside Link with just button-like div and onClick navigation */}
        <Link href="/login" passHref legacyBehavior={false}>
          <button
            type="button"
            className="mt-8 cursor-pointer bg-black text-white font-semibold px-8 py-3 rounded-full shadow-md hover:bg-gray-800 transition-colors"
          >
            Login Now
          </button>
        </Link>
      </section>

      {/* Main Features */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center mb-12">
          Main Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            {
              img: "/feature-1.png",
              title: "Visualize Cloud Resources",
              desc: `Gain real-time insights into your cloud infrastructure with intuitive visualizations.`,
              alt: "Visualize",
            },
            {
              img: "/feature-2.png",
              title: "Eliminate Waste",
              desc: `Identify and remove underutilized resources to cut costs and improve efficiency.`,
              alt: "Recycle",
            },
            {
              img: "/feature-3.png",
              title: "Resource Tagging & Organization",
              desc: `Keep your cloud assets structured and easily manageable with smart tagging.`,
              alt: "Tagging",
            },
          ].map(({ img, title, desc, alt }) => (
            <div
              key={title}
              className="bg-[var(--background)] dark:bg-[#121212] rounded-xl p-8 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={img}
                alt={alt}
                className="mx-auto mb-6 w-24 h-24 object-contain"
              />
              <h3 className="text-xl font-semibold mb-3">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider Section with subtle quote */}
      <section className="bg-[var(--background)] text-center py-12 px-6 border-y border-gray-300 dark:border-gray-700">
        <h3 className="text-xl font-semibold italic max-w-3xl mx-auto text-gray-800 dark:text-gray-200">
          "Empowering cloud efficiency, one resource at a time."
        </h3>
        <p className="mt-4 text-gray-500 dark:text-gray-400 italic max-w-xl mx-auto">
          – StackScope Team
        </p>
      </section>

      {/* Impact Section */}
      <section className="bg-[var(--background)] dark:bg-[#121212] px-6 py-20 max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center mb-14">
          Impact for Users
        </h2>
        <div className="flex flex-col lg:flex-row justify-center items-center gap-14">
          <div className="max-w-md space-y-8 text-gray-700 dark:text-gray-300">
            {[
              {
                title: "Enhanced Visibility",
                desc:
                  "Easily track and manage cloud resources with clear, organized insights.",
              },
              {
                title: "Optimized Cost & Performance",
                desc:
                  "Reduce expenses and maximize efficiency by eliminating wasted resources.",
              },
              {
                title: "Improved Security",
                desc:
                  "Reduce risks by identifying vulnerabilities and enforcing cloud best practices.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="relative pl-8">
                <h4 className="font-semibold text-lg text-black dark:text-white">
                  {title}
                </h4>
                <p className="mt-1 leading-relaxed">{desc}</p>
                {/* Custom bullet */}
                <span className="absolute left-0 top-2 w-5 h-5 bg-black dark:bg-white rounded-full"></span>
              </div>
            ))}
          </div>
          <img
            src="/impact.png"
            alt="Impact"
            className="w-72 h-72 object-contain rounded-lg shadow-md"
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-black text-white px-6 py-14">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <h3 className="text-3xl font-extrabold">Get Started Today!</h3>
          <Link href="/preview" passHref legacyBehavior={false}>
            <button
              type="button"
              className="bg-[var(--background)] text-black font-semibold px-8 py-3 rounded-full shadow-md hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              See Preview
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}