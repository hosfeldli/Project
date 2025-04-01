"use client";

import { useState } from "react";
import Authorization from "./components/authorization"; // Adjust path as needed

function WelcomePage({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">Welcome to Service Account Manager</h1>
        <p className="mb-6 text-gray-600">
          Securely upload and manage your Google service account credentials.
          Please sign in to continue.
        </p>
        <button
          onClick={onSignIn}
          className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium shadow-sm hover:bg-gray-50 w-full"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

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
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="flex flex-col items-center gap-8 w-full max-w-md">
        <h1 className="text-2xl font-bold">Upload Service Account Credentials</h1>

        <div className="w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="border border-dashed border-gray-300 p-6 rounded-md text-center">
              <input type="file" id="file-upload" onChange={handleFileChange} accept=".json" className="hidden" />
              <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-800">
                Click to select a service account JSON file
              </label>
              {selectedFile && !fileError && <p className="mt-2 text-sm text-gray-500">Selected: {selectedFile.name}</p>}
              {fileError && <p className="mt-2 text-sm text-red-500">{fileError}</p>}
            </div>

            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700" disabled={!fileData}>
              Upload Credentials
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Authorization>
      {(isAuthenticated) => (isAuthenticated ? <HomePage /> : <WelcomePage onSignIn={() => console.log("Triggering sign in")} />)}
    </Authorization>
  );
}
