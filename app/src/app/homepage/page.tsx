'use client';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export default function HomePage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const fileInputRef = useRef(null);
  const [jsonData, setJsonData] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Top Nav */}
      <div className="bg-[#1A1A2E] text-white w-full px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold">StackScope</div>
        <div className="flex gap-6">
          <button onClick={() => { setShowPopup(true); setPopupType('edit'); }} className="text-sm hover:text-gray-300">EDIT</button>
          <button onClick={() => { setShowPopup(true); setPopupType('add'); }} className="text-sm hover:text-gray-300">ADD</button>
          <button onClick={() => { setShowPopup(true); setPopupType('delete'); }} className="text-sm hover:text-gray-300">DELETE</button>
          <Link href="/">
            <button className="bg-black px-4 py-2 rounded text-sm hover:bg-gray-800 transition">LOGOUT</button>
          </Link>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="bg-[#0d223f] text-white w-64 flex flex-col justify-between relative">
          <div>
            <ul>
              <li className="px-6 py-2 hover:bg-[#102b4e] cursor-pointer">Dashboard</li>
              <li className="px-6 py-2 hover:bg-[#102b4e] cursor-pointer relative">
                <div className="flex justify-between items-center" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <span>Compute</span>
                  <ChevronDown size={18} />
                </div>
                {dropdownOpen && (
                  <ul className="absolute left-full top-10 bg-[#102b4e] text-sm shadow-md z-10 w-28 rounded">
                    <li className="px-4 py-2 hover:bg-[#1a3a63]">Disk 1</li>
                    <li className="px-4 py-2 hover:bg-[#1a3a63]">Disk 2</li>
                    <li className="px-4 py-2 hover:bg-[#1a3a63]">Disk 3</li>
                  </ul>
                )}
              </li>
              <li className="px-6 py-2 hover:bg-[#102b4e] cursor-pointer">
                <Link href="/settings">Settings</Link>
              </li>
              <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">
                <li className="px-6 py-2 hover:bg-[#102b4e] cursor-pointer">GCP Cloud Console</li>
              </a>
            </ul>
          </div>
          <div className="p-4">
            <Link href="/">
              <button className="w-full bg-gray-700 text-white px-4 py-2 text-sm rounded">Logout</button>
            </Link>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 flex flex-col items-center justify-start mt-10 px-4">
          <h2 className="text-xl font-bold mb-2">Disk 1</h2>
          <h3 className="text-lg mb-6">Information</h3>

          <div className="w-full max-w-md space-y-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input type="text" value="Disk 1" readOnly className="w-full px-3 py-2 border rounded text-black" />
            </div>

            <div>
              <label className="block text-sm mb-1">IP</label>
              <input type="text" value="123.123.123.123" readOnly className="w-full px-3 py-2 border rounded text-black" />
            </div>

            <div>
              <label className="block text-sm mb-1">OS</label>
              <input
                type="text"
                value="projects/ubuntu-os-cloud/family/ubuntu-2204-lts"
                readOnly
                className="w-full px-3 py-2 border rounded text-xs text-black"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">System Notification</label>
              <textarea
                readOnly
                value="No system failure detected."
                className="w-full px-3 py-2 border rounded text-sm h-24 text-black"
              />
            </div>

            <div className="flex justify-center">
              <button className="bg-black text-white w-32 py-2 rounded shadow-lg" style={{ backgroundImage: 'linear-gradient(to right, #300000, #000)' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <section className="bg-blue-800 text-white px-6 py-10">
        <h3 className="text-4xl font-semibold">Stackscope</h3>
      </section>

      {/* Hidden File Input for JSON Upload */}
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const json = JSON.parse(event.target.result);
                setJsonData(json);
                console.log('Uploaded JSON:', json);
              } catch (err) {
                alert('Invalid JSON file');
              }
            };
            reader.readAsText(file);
          }
        }}
      />

      {/* Modal Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-w-full relative text-black">
            <button
              onClick={() => {
                setShowPopup(false);
                setUploadSuccess(false);
              }}
              className="absolute top-4 right-4 text-xl font-bold"
            >
              ✖
            </button>

            <h2 className="text-2xl font-semibold text-center mb-6">Project Management</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (jsonData) {
                  console.log('Submitting JSON:', jsonData);
                  setUploadSuccess(true);
                  setTimeout(() => {
                    setShowPopup(false);
                    setUploadSuccess(false);
                  }, 2000);
                } else {
                  alert('No JSON file selected');
                }
              }}
            >
              <div className="border border-black rounded-2xl p-4 space-y-3">
                {[
                  { id: 1, label: 'ConcentratedPinata7832' },
                  { id: 2, label: 'IndubitablyLight233' },
                  { id: 3, label: 'Struckhat124' },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center border p-2 rounded">
                    <button className="border border-black px-3 py-1 rounded" type="button">
                      {item.label}
                    </button>
                    <button className="text-red-600 text-lg" type="button">🗑️</button>
                  </div>
                ))}

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    className="border border-black px-2 py-1 rounded text-xl"
                    onClick={() => fileInputRef.current.click()}
                  >
                    ＋
                  </button>
                  <button className="text-xl" type="button">✎</button>
                </div>
              </div>

              {jsonData && (
                <div className="mt-4 text-sm bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
                  <p className="font-semibold">JSON loaded:</p>
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(jsonData, null, 2)}
                  </pre>
                </div>
              )}

              {uploadSuccess && (
                <div className="mt-4 text-green-600 font-medium text-center">
                  ✅ Successfully uploaded file
                </div>
              )}

              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="w-full text-white py-2 rounded"
                  style={{ backgroundImage: 'linear-gradient(to right, #300000, #000)' }}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
