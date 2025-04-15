'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings saved!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Top Navigation (Same as HomePage) */}
      <div className="bg-[#1A1A2E] text-white w-full px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold">StackScope</div>
        <div className="flex gap-6">
          <Link href="/homepage">
            <button className="bg-black px-4 py-2 rounded text-sm hover:bg-gray-800 transition">BACK TO DASHBOARD</button>
          </Link>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar (Same as HomePage) */}
        <div className="bg-[#0d223f] text-white w-64 flex flex-col justify-between">
          <div>
            <ul>
              <li className="px-6 py-2 hover:bg-[#102b4e] cursor-pointer">
                <Link href="/homepage">Dashboard</Link>
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

        {/* Settings Content */}
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          
          {/* Tabs Navigation */}
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'security' ? 'border-b-2 border-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'notifications' ? 'border-b-2 border-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'preferences' ? 'border-b-2 border-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
          </div>

          {/* Tab Content */}
          <div className="max-w-2xl">
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Change Password</h3>
                  <input
                    type="password"
                    placeholder="Current Password"
                    className="w-full px-3 py-2 border rounded mb-2"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full px-3 py-2 border rounded mb-2"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-medium">Email Notifications</label>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                    className="h-5 w-5"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="font-medium">SMS Alerts</label>
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                  />
                </div>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Save Preferences
                </button>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-medium">Dark Mode</label>
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    className="h-5 w-5"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="font-medium">Language</label>
                  <select className="px-3 py-2 border rounded">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Save Preferences
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer (Same as HomePage) */}
      <section className="bg-blue-800 text-white px-6 py-10">
        <h3 className="text-4xl font-semibold">Stackscope</h3>
      </section>
    </div>
  );
}