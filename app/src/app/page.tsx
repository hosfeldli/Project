import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navbar */}
      <nav className="bg-[#1A1A2E] text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">StackScope</h1>
        <Link href="/login">
          <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">
            Login/Signup
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-12 px-6">
        <div className="flex gap-6 justify-center">
          <img src="/stack-left.png" alt="Left Stack" className="w-32 h-32" />
          <img src="/stack-right.png" alt="Right Stack" className="w-32 h-32" />
        </div>
        <h2 className="text-3xl font-semibold mt-8">Welcome to StackScope</h2>
        <p className="mt-2 text-gray-700">
          Login to access all features shown below
        </p>
      </section>

      

      {/* Main Features */}
      <section className="px-6 py-12">
        <h3 className="text-2xl font-semibold text-center mb-8">Main Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div>
            <img src="/feature-1.png" alt="Visualize" className="mx-auto mb-4 w-24 h-24" />
            <h4 className="font-bold mb-2">Visualize Cloud Resources</h4>
            <p className="text-gray-600">
              Gain real-time insights into your cloud infrastructure with intuitive visualizations.
            </p>
          </div>
          <div>
            <img src="/feature-2.png" alt="Recycle" className="mx-auto mb-4 w-24 h-24" />
            <h4 className="font-bold mb-2">Eliminate Waste</h4>
            <p className="text-gray-600">
              Identify and remove underutilized resources to cut costs and improve efficiency.
            </p>
          </div>
          <div>
            <img src="/feature-3.png" alt="Tagging" className="mx-auto mb-4 w-24 h-24" />
            <h4 className="font-bold mb-2">Resource Tagging & Organization</h4>
            <p className="text-gray-600">
              Keep your cloud assets structured and easily manageable with smart tagging.
            </p>
          </div>
        </div>
      </section>

      {/* Divider Section */}
      <section className="bg-[#1A1A2E] text-white text-center py-8">
        <h3 className="text-xl font-semibold">                      </h3>
        <p className="mt-2 text-sm text-gray-300">                                              </p>
      </section>

      {/* Impact Section */}
      <section className="bg-gray-100 px-6 py-12">
        <h3 className="text-2xl font-semibold text-center mb-8">Impact for Users</h3>
        <div className="flex flex-col lg:flex-row justify-center items-center gap-10">
          <div className="max-w-md space-y-4">
            <div>
              <h4 className="font-bold">Enhanced Visibility</h4>
              <p>Easily track and manage cloud resources with clear, organized insights.</p>
            </div>
            <div>
              <h4 className="font-bold">Optimized Cost & Performance</h4>
              <p>Reduce expenses and maximize efficiency by eliminating wasted resources.</p>
            </div>
            <div>
              <h4 className="font-bold">Improved Security</h4>
              <p>Reduce risks by identifying vulnerabilities and enforcing cloud best practices.</p>
            </div>
          </div>
          <img src="/impact.png" alt="Impact" className="w-56 h-56" />
        </div>
      </section>

     {/* Call to Action */}
      <section className="bg-blue-800 text-white px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <h3 className="text-xl font-semibold mb-4 md:mb-0">Get Started Today!</h3>
          <Link href="/preview">
            <button className="bg-black px-6 py-2 rounded hover:bg-gray-900 transition">
              See Preview
            </button>
          </Link>
        </div>
      </section>


    </div>
  );
}
