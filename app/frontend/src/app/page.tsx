"use client";

import { useState } from "react";
import Authorization from "./components/authorization"; // Adjust path as needed
import Navbar from "./components/navbar";

// Define a type for service account data
interface ServiceAccountData {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<ServiceAccountData | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateServiceAccountFile = (content: any): content is ServiceAccountData => {
    return (
      content &&
      typeof content === 'object' &&
      content.type === 'service_account' &&
      typeof content.project_id === 'string' &&
      typeof content.private_key_id === 'string' &&
      typeof content.private_key === 'string' &&
      typeof content.client_email === 'string'
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setFileData(null);
    
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Check if file is JSON
      if (file.type !== "application/json" && !file.name.endsWith('.json')) {
        setFileError("Please select a JSON file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          if (validateServiceAccountFile(content)) {
            setFileData(content);
          } else {
            setFileError("Invalid service account credentials format");
          }
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
      console.log("Service account file ready for upload:", fileData.project_id);
      // In a real application, you would securely send this to your backend
      alert(`Successfully processed service account for project: ${fileData.project_id}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="flex flex-col items-center gap-8 w-full max-w-md">
        <h1 className="text-2xl font-bold">Upload Service Account Credentials</h1>
        
        <div className="w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="border border-dashed border-gray-300 p-6 rounded-md text-center">
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
                <p className="mt-2 text-sm text-gray-500">
                  Selected: {selectedFile.name}
                </p>
              )}
              {fileError && (
                <p className="mt-2 text-sm text-red-500">
                  {fileError}
                </p>
              )}
              {fileData && (
                <p className="mt-2 text-sm text-green-500">
                  Valid service account for project: {fileData.project_id}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              disabled={!fileData}
            >
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
      <HomePage />
    </Authorization>
  );
}
