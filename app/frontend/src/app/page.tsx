"use client";

import { useState } from "react";
import Authorization from "./components/authorization"; // Adjust path as needed
// Removed unused import

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

// Welcome page for unauthorized users
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
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
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
  const handleSignIn = () => {
    // This function should trigger the Google sign-in process
    // from your Authorization component
    console.log("Triggering sign in");
  };

  return (
    <Authorization>
      <HomePage />
      <WelcomePage onSignIn={handleSignIn} />
    </Authorization>
  );
}
