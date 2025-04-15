import React from 'react';
import Link from 'next/link';

export default function PreviewPage() {
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
  
       
  
        <div className="min-h-screen bg-white flex flex-col items-center px-4 py-8">
      
            {/* Welcome Message */}
            <section className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Welcome to StackScope
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                Login to access all features shown below
                </p>
            </section>

            {/* Image Stack */}
            <div className="flex flex-col gap-10 items-center w-full max-w-5xl">
                
                {/* Top image */}
                <img
                src="/preview-top.png"
                alt="Architecture"
                className="w-full rounded shadow-md"
                />

                {/* Side-by-side images */}
                <div className="flex flex-col md:flex-row justify-between gap-6 w-full">
                <img
                    src="/preview-vm.png"
                    alt="VM Information"
                    className="w-full md:w-1/2 rounded shadow-md"
                />
                <img
                    src="/preview-disk.png"
                    alt="Disk Information"
                    className="w-full md:w-1/2 rounded shadow-md"
                />
                </div>
            </div>
        </div>
  
       {/* Call to Action */}
        <section className="bg-blue-800 text-white px-6 py-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <h3 className="text-xl font-semibold mb-4 md:mb-0">Get Started Today!</h3>
            <Link href="/login">
              <button className="bg-black px-6 py-2 rounded hover:bg-gray-900 transition">
                Login/Signup
              </button>
            </Link>
          </div>
        </section>
  
  
      </div>
    );
  }
  