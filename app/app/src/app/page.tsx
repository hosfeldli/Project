"use client";

import { useState } from "react";
import Navbar from "./components/navbar"; 
import Authorization from "./components/authorization";

//
// 1) SPLASH / WELCOME PAGE (Non-Authenticated)
//    - Updated to match the Figma design with sections for
//      features, user impact, and a CTA button.
//
function WelcomePage({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO / INTRO SECTION */}
      <section className="pt-16 pb-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-5xl font-bold mb-4">Welcome to StackScope</h1>
            <p className="text-xl text-gray-600">
              Login to access all features shown below
            </p>
          </div>

          {/* MAIN FEATURES SECTION */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="w-full md:w-1/3 text-center p-4">
              {/* Use whichever local image or SVG you have. Example placeholder: /public/globe.svg */}
              <img 
                src="/globe.svg" 
                alt="Visualize Cloud Resources" 
                className="mx-auto mb-4 h-16 w-16"
              />
              <h2 className="text-xl font-semibold">Visualize Cloud Resources</h2>
              <p className="text-gray-600 mt-2">
                Gain real-time insights into your infrastructure with
                intuitive visualization.
              </p>
            </div>

            <div className="w-full md:w-1/3 text-center p-4">
              <img
                src="/file.svg"
                alt="Eliminate Waste"
                className="mx-auto mb-4 h-16 w-16"
              />
              <h2 className="text-xl font-semibold">Eliminate Waste</h2>
              <p className="text-gray-600 mt-2">
                Identify and remove unnecessary resources to cut costs
                and improve efficiency.
              </p>
            </div>

            <div className="w-full md:w-1/3 text-center p-4">
              <img
                src="/window.svg"
                alt="Resource Tagging & Organization"
                className="mx-auto mb-4 h-16 w-16"
              />
              <h2 className="text-xl font-semibold">Resource Tagging &amp; Organization</h2>
              <p className="text-gray-600 mt-2">
                Keep your cloud resources organized and easily manageable
                with smart tagging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT FOR USERS SECTION */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-6">Impact for Users</h2>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div className="max-w-sm mx-auto">
              <h3 className="text-xl font-bold">Enhanced Visibility</h3>
              <p className="mt-2 text-gray-600">
                Easily track and manage cloud resources with clear,
                organized insights.
              </p>
            </div>
            <div className="max-w-sm mx-auto">
              <h3 className="text-xl font-bold">Optimized Cost &amp; Performance</h3>
              <p className="mt-2 text-gray-600">
                Reduce unnecessary spending and improve resource performance.
              </p>
            </div>
            <div className="max-w-sm mx-auto">
              <h3 className="text-xl font-bold">Improved Security</h3>
              <p className="mt-2 text-gray-600">
                Increase security by identifying vulnerabilities and
                enforcing best practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL-TO-ACTION SECTION */}
      <section className="py-16 bg-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-4">Get Started Today!</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            Start streamlining your cloud environment to maximize efficiency.
          </p>
          <button
            onClick={onSignIn}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium"
          >
            Login / Signup
          </button>
        </div>
      </section>
    </div>
  );
}

//
// 2) AUTHENTICATED / HOME PAGE (After Sign-In)
//    - Kept the file upload logic, but you can style it similarly
//      to your Figma design if desired.
//
function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setFileData(null);

    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          setFileData(content);
        } catch (error) {
          setFileError("Error parsing JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (fileData) {
      console.log("Service account file ready for upload:", fileData);
      alert(`Successfully processed service account`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* NAVBAR */}
      <Navbar />

      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-6">Upload Service Account Credentials</h1>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-8 w-full max-w-md">
          <div className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center mb-4">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              Click to select a service account JSON file
            </label>
            {selectedFile && !fileError && (
              <p className="mt-2 text-sm text-gray-500">Selected: {selectedFile.name}</p>
            )}
            {fileError && <p className="mt-2 text-sm text-red-500">{fileError}</p>}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700"
            disabled={!fileData}
          >
            Upload Credentials
          </button>
        </form>
      </main>
    </div>
  );
}

//
// 3) ROOT COMPONENT WITH AUTH LOGIC
//    - If user is authenticated, show HomePage
//    - Otherwise, show the improved WelcomePage
//
export default function Home() {
  return (
    <Authorization>
      {(isAuthenticated) =>
        isAuthenticated ? (
          <HomePage />
        ) : (
          <WelcomePage onSignIn={() => console.log("Triggering sign in")} />
        )
      }
    </Authorization>
  );
}
