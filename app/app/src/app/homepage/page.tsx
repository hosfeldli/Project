'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Server, HardDrive, Database, Box, Layers } from 'lucide-react';
import Cookies from 'js-cookie';
import Navbar from '@/components/navbar';

// Import Card here
import Card from '@/components/card'; // Adjust path if needed

interface Credential {
  _id: string;
  label?: string;
  data: any;
  uploadedAt: Date;
}

interface ResourceItem {
  assetType: string;
  name?: string;
  displayName?: string;
  description?: string;
  resource?: any;
  [key: string]: any;
}

interface ResourcesByKey {
  [key: number]: ResourceItem[];
}

const assetTypeIconMap: Record<string, JSX.Element> = {
  'compute.googleapis.com/Instance': <Server size={16} className="inline-block mr-1 text-gray-700" />,
  'compute.googleapis.com/Disk': <HardDrive size={16} className="inline-block mr-1 text-gray-700" />,
  'sqladmin.googleapis.com/Instance': <Database size={16} className="inline-block mr-1 text-gray-700" />,
  'storage.googleapis.com/Bucket': <Box size={16} className="inline-block mr-1 text-gray-700" />,
  default: <Layers size={16} className="inline-block mr-1 text-gray-700" />,
};

function getIconForAssetType(assetType: string) {
  if (assetTypeIconMap[assetType]) return assetTypeIconMap[assetType];
  if (assetType.startsWith('compute.googleapis.com/Instance')) return assetTypeIconMap['compute.googleapis.com/Instance'];
  if (assetType.startsWith('compute.googleapis.com/Disk')) return assetTypeIconMap['compute.googleapis.com/Disk'];
  if (assetType.startsWith('sqladmin.googleapis.com/Instance')) return assetTypeIconMap['sqladmin.googleapis.com/Instance'];
  if (assetType.startsWith('storage.googleapis.com/')) return assetTypeIconMap['storage.googleapis.com/Bucket'];
  return assetTypeIconMap.default;
}

// Quick utility to get short name from full resource name
function shortName(fullName: string | undefined) {
  if (!fullName) return 'Unknown';
  const parts = fullName.split('/');
  return parts[parts.length - 1] || fullName;
}

export default function HomePage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [credActionOpen, setCredActionOpen] = useState<null | 'edit' | 'add' | 'delete'>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<'edit' | 'add' | 'delete' | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [savingRename, setSavingRename] = useState(false);
  const [renameErrors, setRenameErrors] = useState<Record<string, string>>({});

  const [resources, setResources] = useState<ResourcesByKey>({});
  const [loadingResources, setLoadingResources] = useState(false);

  // State for selected resources shown in graph with order
  const [selectedResources, setSelectedResources] = useState<
    { keyIndex: number; resourceIndex: number; resource: ResourceItem }[]
  >([]);

  // Last clicked resource for details panel
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  const userId = Cookies.get('user');

  async function fetchCredentials() {
    if (!userId) {
      console.error('No user ID found');
      return;
    }
    try {
      setLoadingCredentials(true);
      const res = await fetch(`/api/credentials?id=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch credentials');
      const data: Credential[] = await res.json();
      const mapped = data.map((c, i) => ({ ...c, _id: i.toString() }));
      setCredentials(mapped);
      Cookies.set('credentials', JSON.stringify(mapped));
    } catch (err) {
      console.error('Fetch credentials error:', err);
    } finally {
      setLoadingCredentials(false);
    }
  }

  async function fetchResources() {
    if (!userId) {
      console.error('No user ID found');
      return;
    }
    try {
      setLoadingResources(true);

      // PUT update call before fetching
      await fetch('/api/resource_job', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      });

      const res = await fetch(`/api/resource_job?id=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch resources');

      const data = await res.json();
      const resourcesData = data.resources ?? data;
      setResources(resourcesData);
      Cookies.set('resources', JSON.stringify(resourcesData));
    } catch (err) {
      console.error('Fetch resources error:', err);
      setResources({});
    } finally {
      setLoadingResources(false);
    }
  }

  useEffect(() => {
    fetchCredentials();
    fetchResources();
  }, [userId]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const target = event.target;
      if (target && target.result) {
        try {
          const json = JSON.parse(target.result as string);
          setJsonData(json);
        } catch {
          alert('Invalid JSON file');
        }
      }
    };
    reader.readAsText(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!jsonData || !userId) return alert('Missing JSON data or user ID');
    try {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, data: jsonData }),
      });
      if (res.ok) {
        setUploadSuccess(true);
        setJsonData(null);
        setShowPopup(false);
        await fetchCredentials();
        if (fileInputRef.current) fileInputRef.current.value = '';
        await fetchResources();
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed due to error');
    }
  }

  async function handleDelete(id: string) {
    if (!userId) return;
    const idx = parseInt(id, 10);
    if (isNaN(idx)) {
      alert('Invalid credential index');
      return;
    }
    if (!confirm('Are you sure you want to delete this credential?')) return;
    try {
      const res = await fetch(`/api/credentials?id=${userId}&index=${idx}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCredentials((prev) => prev.filter((c) => c._id !== id));
        setCredActionOpen(null);
        setShowPopup(false);
        await fetchCredentials();
        await fetchResources();
      } else {
        alert('Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Delete failed due to error');
    }
  }

  function handleRenameChange(id: string, newLabel: string) {
    setCredentials((prev) =>
      prev.map((c) => (c._id === id ? { ...c, label: newLabel } : c))
    );
    setRenameErrors((errs) => {
      const copy = { ...errs };
      delete copy[id];
      return copy;
    });
  }

  async function handleRenameSave(id: string) {
    if (!userId) return;
    const cred = credentials.find(c => c._id === id);
    if (!cred) return;
    if (!cred.label || cred.label.trim() === '') {
      setRenameErrors((errs) => ({ ...errs, [id]: 'Label cannot be empty' }));
      return;
    }
    const index = parseInt(id, 10);
    if (isNaN(index)) {
      alert('Invalid credential index');
      return;
    }
    setSavingRename(true);
    try {
      const res = await fetch('/api/credentials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          index,
          label: cred.label.trim(),
        }),
      });
      if (!res.ok) {
        alert('Rename failed');
        await fetchCredentials();
      } else {
        await fetchCredentials();
        setCredActionOpen(null);
        setShowPopup(false);
        await fetchResources();
      }
    } catch (err) {
      console.error('Rename error:', err);
      alert('Rename failed due to error');
    } finally {
      setSavingRename(false);
    }
  }

  function openCredAction(action: 'edit' | 'add' | 'delete') {
    setShowPopup(true);
    setPopupType(action);
    if (action !== 'add') {
      fetchCredentials();
    }
    setCredActionOpen(null);
  }

  function closeModal() {
    setShowPopup(false);
    setPopupType(null);
    setJsonData(null);
    setRenameErrors({});
    setUploadSuccess(false);
    setCredActionOpen(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // When user selects resource from dropdown: add to selectedResources (no duplicates), select it, close dropdown
  function handleResourceSelect(keyIndex: number, resourceIndex: number) {
    const resource = resources[keyIndex]?.[resourceIndex];
    if (!resource) return;
    const exists = selectedResources.find(r => r.keyIndex === keyIndex && r.resourceIndex === resourceIndex);
    if (!exists) {
      setSelectedResources(prev => [...prev, { keyIndex, resourceIndex, resource }]);
    }
    setSelectedResource(resource);
    setDropdownOpen(false);
  }

  // == NEW: Add All resources button handler
  function handleAddAllResources() {
    if (!resources) return;

    // Flatten existing selected resources keys for quick lookup:
    // We'll build a set keyed by: `${keyIndex}-${resourceIndex}`
    const existingKeys = new Set(
      selectedResources.map(({ keyIndex, resourceIndex }) => `${keyIndex}-${resourceIndex}`)
    );

    let lastAddedResource: ResourceItem | null = null;

    const toAdd: { keyIndex: number; resourceIndex: number; resource: ResourceItem }[] = [];

    // Iterate all resources by keyIndex
    Object.entries(resources).forEach(([keyStr, resArr]) => {
      const keyIndex = Number(keyStr);
      if (!Array.isArray(resArr)) return;
      resArr.forEach((resource, resourceIndex) => {
        const key = `${keyIndex}-${resourceIndex}`;
        if (!existingKeys.has(key)) {
          toAdd.push({ keyIndex, resourceIndex, resource });
          existingKeys.add(key);
          lastAddedResource = resource;
        }
      });
    });

    if (toAdd.length === 0) {
      // Nothing to add
      alert('All resources are already added.');
      return;
    }

    setSelectedResources(prev => [...prev, ...toAdd]);
    if (lastAddedResource) setSelectedResource(lastAddedResource);
    setDropdownOpen(false);
  }

  // Build relational structure: for each selected VM show disks explicitly linked.

  // Filter selected VMs and Disks
  const vms = selectedResources.filter(({resource}) =>
    resource.assetType === 'compute.googleapis.com/Instance'
  );
  const disks = selectedResources.filter(({resource}) =>
    resource.assetType === 'compute.googleapis.com/Disk'
  );

  // Map disks by their resource name (full URL) trim to clean keys
  const diskMap: Record<string, ResourceItem> = {};
  disks.forEach(({ resource }) => {
    // The 'resource' field has the actual data, look for resource.name or resource.selfLink
    const diskName: string | undefined =
      resource.resource?.name ||
      resource.resource?.selfLink ||
      resource.name ||
      resource.displayName;
    if (diskName) diskMap[diskName] = resource;
  });

  // Normalize disk source URLs for matching (strip https prefix and trailing slash)
  function normalizeDiskRef(ref: string) {
    return ref.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  // Build lookup: disk short name -> ResourceItem
  const diskByShortName: Record<string, ResourceItem> = {};
  disks.forEach(({ resource }) => {
    const nName = resource.resource?.name || resource.resource?.selfLink || resource.name || resource.displayName;
    if (nName) {
      diskByShortName[shortName(nName)] = resource;
    }
  });

  // For each VM, extract attached disks using 'resource.data.disks' array
  // Match 'source' URLs from VM disks to disk resources by normalized URL or by short names if needed
  function getAttachedDisks(vmRes: ResourceItem): ResourceItem[] {
    if (!vmRes.resource?.data?.disks || !Array.isArray(vmRes.resource.data.disks)) return [];
    const attached: ResourceItem[] = [];
    vmRes.resource.data.disks.forEach((d: any) => {
      if (!d.source) return;
      // Normalize source from VM disk
      const vmDiskSourceNorm = normalizeDiskRef(d.source);
      // Try match any disk resource with same normalized ref:
      for (const diskKey in diskMap) {
        if (normalizeDiskRef(diskKey) === vmDiskSourceNorm) {
          attached.push(diskMap[diskKey]);
          return; // found
        }
      }
      // If no full match on normalized, fallback try short name match
      const srcShort = shortName(d.source);
      if (diskByShortName[srcShort]) attached.push(diskByShortName[srcShort]);
    });
    return attached;
  }

  // Set of attached disks, so we know which disks are unattached
  const attachedDisksSet = new Set<ResourceItem>();
  vms.forEach(({ resource }) => {
    getAttachedDisks(resource).forEach(disk => attachedDisksSet.add(disk));
  });

  // Unattached disks are those disks selected but not attached to any selected VM
  const unattachedDisks = disks
    .map(d => d.resource)
    .filter(disk => !attachedDisksSet.has(disk));

  return (
    <>
      {/* Top Nav */}
      {/*<nav className="bg-blue-900 p-4 flex justify-between items-center text-white font-sans">
        <div className="font-bold text-xl">StackScope</div>
        <div className="flex space-x-4">
          <Link href="/"></Link>
        </div>
      </nav>*/}
      <Navbar />
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <nav
          aria-label="Sidebar"
          className="bg-[#0a1f3b] text-[#e8edf4] w-64 flex flex-col justify-between relative font-sans select-none sticky top-0 h-screen"
        >
          <div className="flex flex-col p-4 space-y-2">
            {/* Credentials Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCredActionOpen((v) => (v ? null : 'edit'))}
                aria-expanded={credActionOpen !== null}
                aria-controls="credential-actions-dropdown"
                className="inline-flex justify-between items-center w-full rounded-md px-3 py-2 hover:bg-[#142c54] focus:bg-[#193774] focus:outline-none transition-colors font-medium select-none"
              >
                Credentials
                <ChevronDown
                  size={18}
                  className={`ml-2 transition-transform duration-200 ${
                    credActionOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>

              {credActionOpen && (
                <ul
                  id="credential-actions-dropdown"
                  role="menu"
                  className="absolute left-0 top-full mt-1 bg-[#142c54] text-sm shadow-lg z-20 w-full rounded-md max-h-48 overflow-auto border border-[#193774]"
                >
                  <li role="none">
                    <button
                      type="button"
                      onClick={() => openCredAction('edit')}
                      className="w-full text-left px-4 py-2 hover:bg-[#193774] focus:bg-[#1d3b73] focus:outline-none transition-colors"
                      role="menuitem"
                    >
                      Edit Credentials
                    </button>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      onClick={() => openCredAction('add')}
                      className="w-full text-left px-4 py-2 hover:bg-[#193774] focus:bg-[#1d3b73] focus:outline-none transition-colors"
                      role="menuitem"
                    >
                      Add Credential
                    </button>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      onClick={() => openCredAction('delete')}
                      className="w-full text-left px-4 py-2 hover:bg-[#193774] focus:bg-[#1d3b73] focus:outline-none transition-colors"
                      role="menuitem"
                    >
                      Delete Credential
                    </button>
                  </li>
                </ul>
              )}
            </div>

            {/* Existing Resources Dropdown */}
            <div className="relative mt-4">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-controls="resources-dropdown"
                className="inline-flex justify-between items-center w-full rounded-md px-3 py-2 hover:bg-[#142c54] focus:bg-[#193774] focus:outline-none transition-colors font-medium"
              >
                <span>Resources</span>
                <ChevronDown
                  size={18}
                  className={`ml-2 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>

              {dropdownOpen && (
                <ul
                  id="resources-dropdown"
                  role="menu"
                  className="absolute left-0 top-full mt-1 bg-[#142c54] text-sm shadow-lg z-20 w-full rounded-md max-h-52 overflow-auto border border-[#193774]"
                >
                  {Object.keys(resources).length > 0 && (
                    <li role="none" className="px-4 py-1 border-b border-[#193774]">
                      <button
                        type="button"
                        className="w-full text-left px-2 py-1 hover:bg-[#193774] focus:bg-[#1d3b73] focus:outline-none transition-colors font-semibold text-blue-400"
                        onClick={handleAddAllResources}
                        role="menuitem"
                      >
                        + Add All Resources
                      </button>
                    </li>
                  )}

                  {Object.keys(resources).length > 0 ? (
                    Object.entries(resources).map(([keyIndex, resArr]) => (
                      <li key={keyIndex} role="none" className="pb-2">
                  
                        {Array.isArray(resArr) && resArr.length > 0 ? (
                          resArr.map((resource, idx) => {
                            const dispName = shortName(resource.displayName || resource.name || resource.assetType);
                            return (
                              <button
                                key={idx}
                                type="button"
                                className="w-full text-left px-6 py-1 hover:bg-[#193774] focus:bg-[#1d3b73] focus:outline-none transition-colors text-sm truncate flex items-center"
                                onClick={() => handleResourceSelect(Number(keyIndex), idx)}
                                role="menuitem"
                                title={dispName}
                              >
                                {getIconForAssetType(resource.assetType)}
                                {resource.assetType === 'compute.googleapis.com/Instance'
                                  ? `VM: ${dispName}`
                                  : resource.assetType === 'compute.googleapis.com/Disk'
                                  ? `Disk: ${dispName}`
                                  : dispName}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-6 py-2 text-gray-400 select-text text-sm">No resources</div>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-400 select-text">No resources</li>
                  )}
                </ul>
              )}
            </div>

            <a
              href="https://console.cloud.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6"
            >
              <button
                type="button"
                className="w-full rounded-md px-3 py-2 hover:bg-[#142c54] focus:bg-[#193774] focus:outline-none transition-colors font-medium text-left"
              >
                GCP Cloud Console
              </button>
            </a>
          </div>

          <div className="p-4 border-t border-[#193774]">
            
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 flex flex-col items-start justify-start mt-10 px-6 font-sans max-w-4xl w-full min-h-[60vh]">

          <h2 className="text-2xl font-semibold mb-4 w-full">Resources Overview</h2>

          {/* Vertical relational graph */}
          <Card className="flex flex-col w-full max-h-[68vh] overflow-y-auto border rounded bg-white shadow-md p-4">
            {loadingResources ? (
              <p>Loading resources...</p>
            ) : selectedResources.length === 0 ? (
              <p className="text-gray-500 italic select-text text-center mt-16">
                Select resources from the dropdown to see relationships here.
              </p>
            ) : (
              <>
                {/* Show VMs with attached disks */}
                {vms.length > 0 ? vms.map(({ keyIndex, resourceIndex, resource }) => {
                  const disksForVm = getAttachedDisks(resource);
                  const isSelectedVm = selectedResource === resource;
                  return (
                    <div key={`${keyIndex}-${resourceIndex}`} className="mb-6 border p-3 rounded shadow-sm hover:shadow-md transition bg-gray-50 cursor-default">
                      <button
                        type="button"
                        className={`flex items-center gap-2 font-semibold mb-2 text-lg select-text w-full text-left transition ${
                          isSelectedVm ? 'text-blue-700' : 'text-gray-900'
                        }`}
                        onClick={() => setSelectedResource(resource)}
                        title={resource.displayName || resource.name}
                      >
                        {getIconForAssetType(resource.assetType)}
                        {shortName(resource.displayName || resource.name)}
                      </button>
                      <div className="pl-6 flex flex-col space-y-1 max-w-md">
                        {disksForVm.length === 0 ? (
                          <p className="text-gray-500 italic select-text">No attached disks</p>
                        ) : (
                          disksForVm.map((disk, idx) => {
                            const isSelectedDisk = selectedResource === disk;
                            return (
                              <button
                                key={`${disk.name ?? idx}`}
                                type="button"
                                onClick={() => setSelectedResource(disk)}
                                className={`flex items-center gap-2 px-2 py-1 rounded select-text text-sm transition w-full text-left ${
                                  isSelectedDisk ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-800 hover:bg-gray-100'
                                }`}
                                title={disk.displayName || disk.name}
                              >
                                {getIconForAssetType(disk.assetType)}
                                {shortName(disk.displayName || disk.name)}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-gray-500 italic select-text text-center">No VMs selected</p>
                )}

                {/* Unattached disks */}
                {unattachedDisks.length > 0 && (
                  <div className="border-t pt-4 mt-auto">
                    <h3 className="font-semibold mb-2 text-gray-700 select-text flex items-center gap-1">
                      <HardDrive size={18} /> Unattached Disks
                    </h3>
                    <div className="flex flex-col space-y-1 max-w-md ml-2">
                      {unattachedDisks.map((disk, idx) => {
                        const isSelectedDisk = selectedResource === disk;
                        return (
                          <Card key={`${disk.name ?? idx}-unattached`} className="mb-2 border p-2 rounded shadow-sm hover:shadow-md transition bg-gray-50 cursor-default">
                          <button
                            key={`${disk.name ?? idx}-unattached`}
                            type="button"
                            onClick={() => setSelectedResource(disk)}
                            className={`flex items-center gap-2 px-2 py-1 rounded select-text text-sm transition w-full text-left ${
                              isSelectedDisk ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-800 hover:bg-gray-100'
                            }`}
                            title={disk.displayName || disk.name}
                          >
                            {getIconForAssetType(disk.assetType)}
                            {shortName(disk.displayName || disk.name)}
                          </button></Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Details Panel */}
          <section className="w-full mt-6 max-h-[30vh] overflow-auto border rounded p-4 bg-gray-50 shadow-inner font-mono text-sm whitespace-pre-wrap break-words">
            {selectedResource ? (
              <>
                <div className="flex items-center gap-2 mb-3 font-semibold text-lg select-text">
                  {getIconForAssetType(selectedResource.assetType)}
                  <span>{shortName(selectedResource.displayName || selectedResource.name)}</span>
                </div>
                {JSON.stringify(selectedResource, null, 2)}
              </>
            ) : (
              <p className="text-gray-500 italic select-text text-center">
                Click on a resource above to see detailed data here.
              </p>
            )}
          </section>
        </main>
      </div>

      {/* Footer */}
      {/*<footer className="bg-blue-800 text-white px-6 py-10 text-center font-sans">
        <h3 className="text-4xl font-semibold">Stackscope</h3>
      </footer>*/}

      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {showPopup && popupType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto relative p-6 font-sans">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {popupType === 'edit' && 'Edit Credentials'}
                {popupType === 'add' && 'Add Credential'}
                {popupType === 'delete' && 'Delete Credential'}
              </h2>
              <button
                onClick={closeModal}
                aria-label="Close"
                className="text-gray-500 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {popupType === 'edit' && (
              <>
                {loadingCredentials ? (
                  <p>Loading credentials...</p>
                ) : credentials.length === 0 ? (
                  <p>No credentials available to edit.</p>
                ) : (
                  <div className="space-y-4">
                    {credentials.map((cred) => (
                      <div key={cred._id} className="flex flex-col gap-1">
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            className={`flex-1 border rounded px-3 py-2 ${
                              renameErrors[cred._id]
                                ? 'border-red-500 focus:ring-red-500 focus:ring-1'
                                : 'border-gray-300 focus:ring-blue-500 focus:ring-1'
                            } outline-none transition`}
                            value={cred.label || ''}
                            onChange={(e) => handleRenameChange(cred._id, e.target.value)}
                            placeholder="Enter label"
                          />
                          <button
                            onClick={() => handleRenameSave(cred._id)}
                            disabled={savingRename}
                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-blue-600"
                            type="button"
                          >
                            Save
                          </button>
                        </div>
                        {renameErrors[cred._id] && (
                          <p className="text-red-500 text-sm">{renameErrors[cred._id]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {popupType === 'add' && (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p>Upload a JSON file to add a new credential.</p>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      className="border border-gray-300 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    >
                      Choose File
                    </button>
                    {jsonData && (
                      <span className="ml-2 text-green-600 font-semibold">File loaded</span>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={!jsonData}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                  {uploadSuccess && (
                    <p className="text-green-600 font-semibold">Upload successful!</p>
                  )}
                </form>
              </>
            )}

            {popupType === 'delete' && (
              <>
                {loadingCredentials ? (
                  <p>Loading credentials...</p>
                ) : credentials.length === 0 ? (
                  <p>No credentials available to delete.</p>
                ) : (
                  <ul className="space-y-3 max-h-64 overflow-y-auto border rounded p-4">
                    {credentials.map((cred, i) => (
                      <li key={cred._id} className="flex justify-between items-center">
                        <span>{cred.label || `Credential ${i + 1}`}</span>
                        <button
                          onClick={() => handleDelete(cred._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                          type="button"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 text-right">
                  <button
                    onClick={closeModal}
                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}