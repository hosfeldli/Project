'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  X,
  Server,
  HardDrive,
  Database,
  Box,
  Layers,
} from 'lucide-react';
import Navbar from '@/components/navbar';

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
  'compute.googleapis.com/Instance': (
    <Server size={16} className="inline-block mr-1 text-gray-700" />
  ),
  'compute.googleapis.com/Disk': (
    <HardDrive size={16} className="inline-block mr-1 text-gray-700" />
  ),
  'sqladmin.googleapis.com/Instance': (
    <Database size={16} className="inline-block mr-1 text-gray-700" />
  ),
  'storage.googleapis.com/Bucket': (
    <Box size={16} className="inline-block mr-1 text-gray-700" />
  ),
  default: (
    <Layers size={16} className="inline-block mr-1 text-gray-700" />
  ),
};

function getIconForAssetType(assetType: string) {
  if (assetTypeIconMap[assetType]) return assetTypeIconMap[assetType];
  if (assetType.startsWith('compute.googleapis.com/Instance'))
    return assetTypeIconMap['compute.googleapis.com/Instance'];
  if (assetType.startsWith('compute.googleapis.com/Disk'))
    return assetTypeIconMap['compute.googleapis.com/Disk'];
  if (assetType.startsWith('sqladmin.googleapis.com/Instance'))
    return assetTypeIconMap['sqladmin.googleapis.com/Instance'];
  if (assetType.startsWith('storage.googleapis.com/'))
    return assetTypeIconMap['storage.googleapis.com/Bucket'];
  return assetTypeIconMap.default;
}

// Extract the last segment after slash
function shortName(fullName: string | undefined) {
  if (!fullName) return 'Unknown';
  const parts = fullName.split('/');
  return parts[parts.length - 1] || fullName;
}

// Dummy preset data for preview

const dummyCredentials: Credential[] = [
  {
    _id: '0',
    label: 'Demo Credential 1',
    data: {},
    uploadedAt: new Date(),
  },
  {
    _id: '1',
    label: 'Demo Credential 2',
    data: {},
    uploadedAt: new Date(),
  },
];

const dummyResources: ResourcesByKey = {
  0: [
    {
      assetType: 'compute.googleapis.com/Instance',
      name: 'projects/demo-project/zones/us-central1-a/instances/demo-vm1',
      displayName: 'demo-vm1',
      description: 'Demo VM Instance 1',
      resource: {
        name: 'projects/demo-project/zones/us-central1-a/instances/demo-vm1',
        data: {
          disks: [
            {
              source:
                'projects/demo-project/zones/us-central1-a/disks/demo-disk1',
            },
            {
              source:
                'projects/demo-project/zones/us-central1-a/disks/demo-disk2',
            },
          ],
        },
      },
    },
    {
      assetType: 'compute.googleapis.com/Instance',
      name: 'projects/demo-project/zones/us-central1-a/instances/demo-vm2',
      displayName: 'demo-vm2',
      description: 'Demo VM Instance 2',
      resource: {
        name: 'projects/demo-project/zones/us-central1-a/instances/demo-vm2',
        data: {
          disks: [
            {
              source:
                'projects/demo-project/zones/us-central1-a/disks/demo-disk3',
            },
          ],
        },
      },
    },
  ],
  1: [
    {
      assetType: 'compute.googleapis.com/Disk',
      name: 'projects/demo-project/zones/us-central1-a/disks/demo-disk1',
      displayName: 'demo-disk1',
      description: 'Demo Disk 1',
      resource: {
        name: 'projects/demo-project/zones/us-central1-a/disks/demo-disk1',
      },
    },
    {
      assetType: 'compute.googleapis.com/Disk',
      name: 'projects/demo-project/zones/us-central1-a/disks/demo-disk2',
      displayName: 'demo-disk2',
      description: 'Demo Disk 2',
      resource: {
        name: 'projects/demo-project/zones/us-central1-a/disks/demo-disk2',
      },
    },
    {
      assetType: 'compute.googleapis.com/Disk',
      name: 'projects/demo-project/zones/us-central1-a/disks/demo-disk3',
      displayName: 'demo-disk3',
      description: 'Demo Disk 3',
      resource: {
        name: 'projects/demo-project/zones/us-central1-a/disks/demo-disk3',
      },
    },
    {
      assetType: 'compute.googleapis.com/Disk',
      name: 'projects/demo-project/zones/us-central1-a/disks/unused-disk',
      displayName: 'unused-disk',
      description: 'Unused Disk',
      resource: {
        name: 'projects/demo-project/zones/us-central1-a/disks/unused-disk',
      },
    },
  ],
  2: [
    {
      assetType: 'storage.googleapis.com/Bucket',
      name: 'projects/_/buckets/demo-bucket',
      displayName: 'demo-bucket',
      description: 'Demo Storage Bucket',
      resource: {
        name: 'projects/_/buckets/demo-bucket',
      },
    },
  ],
};

export default function PreviewPage() {
  // We'll use dummy data instead of API calls for preview mode

  // State for dropdown menus
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [credActionOpen, setCredActionOpen] = useState<null | 'edit' | 'add' | 'delete'>(null);
  const [showIntroModal, setShowIntroModal] = useState(true);

  // State for selected resource in graph and selected resources list
  const [selectedResources, setSelectedResources] = useState<
    { keyIndex: number; resourceIndex: number; resource: ResourceItem }[]
  >(() => {
    // For preview, preselect some resources for initial display
    return [
      { keyIndex: 0, resourceIndex: 0, resource: dummyResources[0][0] }, // demo-vm1
      { keyIndex: 0, resourceIndex: 1, resource: dummyResources[0][1] }, // demo-vm2
      { keyIndex: 1, resourceIndex: 0, resource: dummyResources[1][0] }, // demo-disk1
      { keyIndex: 1, resourceIndex: 1, resource: dummyResources[1][1] }, // demo-disk2
      { keyIndex: 1, resourceIndex: 2, resource: dummyResources[1][2] }, // demo-disk3
      { keyIndex: 1, resourceIndex: 3, resource: dummyResources[1][3] }, // unused-disk
      { keyIndex: 2, resourceIndex: 0, resource: dummyResources[2][0] }, // demo-bucket
    ];
  });

  // Selected resource for details panel:
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(
    dummyResources[0][0]
  );

  // Credentials and resources use dummy data
  const [credentials] = React.useState<Credential[]>(dummyCredentials);
  const [resources] = React.useState<ResourcesByKey>(dummyResources);

  // Dropdown and credentials action handlers (no actual API calls)

  function handleResourceSelect(keyIndex: number, resourceIndex: number) {
    const resource = resources[keyIndex]?.[resourceIndex];
    if (!resource) return;
    const exists = selectedResources.find(
      (r) => r.keyIndex === keyIndex && r.resourceIndex === resourceIndex
    );
    if (!exists) {
      setSelectedResources((prev) => [...prev, { keyIndex, resourceIndex, resource }]);
    }
    setSelectedResource(resource);
    setDropdownOpen(false);
  }

  function handleAddAllResources() {
    if (!resources) return;
    const existingKeys = new Set(
      selectedResources.map(({ keyIndex, resourceIndex }) => `${keyIndex}-${resourceIndex}`)
    );

    const toAdd: { keyIndex: number; resourceIndex: number; resource: ResourceItem }[] = [];

    Object.entries(resources).forEach(([keyStr, resArr]) => {
      const keyIndex = Number(keyStr);
      if (!Array.isArray(resArr)) return;
      resArr.forEach((resource, resourceIndex) => {
        const key = `${keyIndex}-${resourceIndex}`;
        if (!existingKeys.has(key)) {
          toAdd.push({ keyIndex, resourceIndex, resource });
          existingKeys.add(key);
        }
      });
    });

    if (toAdd.length === 0) {
      alert('All resources are already added.');
      return;
    }

    setSelectedResources((prev) => [...prev, ...toAdd]);
    setSelectedResource(toAdd[toAdd.length - 1].resource);
    setDropdownOpen(false);
  }

  // Helper: Normalize disk reference string (strip protocol and trailing slash)
  function normalizeDiskRef(ref: string) {
    return ref.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  // Build disk maps for attached/unattached calculations
  const vms = selectedResources.filter(
    ({ resource }) => resource.assetType === 'compute.googleapis.com/Instance'
  );
  const disks = selectedResources.filter(
    ({ resource }) => resource.assetType === 'compute.googleapis.com/Disk'
  );

  const diskMap: Record<string, ResourceItem> = {};
  disks.forEach(({ resource }) => {
    const diskName: string | undefined =
      resource.resource?.name || resource.resource?.selfLink || resource.name || resource.displayName;
    if (diskName) diskMap[diskName] = resource;
  });

  const diskByShortName: Record<string, ResourceItem> = {};
  disks.forEach(({ resource }) => {
    const nName =
      resource.resource?.name || resource.resource?.selfLink || resource.name || resource.displayName;
    if (nName) {
      diskByShortName[shortName(nName)] = resource;
    }
  });

  function getAttachedDisks(vmRes: ResourceItem): ResourceItem[] {
    if (!vmRes.resource?.data?.disks || !Array.isArray(vmRes.resource.data.disks)) return [];
    const attached: ResourceItem[] = [];
    vmRes.resource.data.disks.forEach((d: any) => {
      if (!d.source) return;
      const vmDiskSourceNorm = normalizeDiskRef(d.source);
      for (const diskKey in diskMap) {
        if (normalizeDiskRef(diskKey) === vmDiskSourceNorm) {
          attached.push(diskMap[diskKey]);
          return;
        }
      }
      const srcShort = shortName(d.source);
      if (diskByShortName[srcShort]) attached.push(diskByShortName[srcShort]);
    });
    return attached;
  }

  const attachedDisksSet = new Set<ResourceItem>();
  vms.forEach(({ resource }) => {
    getAttachedDisks(resource).forEach((d) => attachedDisksSet.add(d));
  });

  const unattachedDisks = disks
    .map((d) => d.resource)
    .filter((disk) => !attachedDisksSet.has(disk));

  return (
    <>
      <Navbar />

      {/* Intro Modal */}
      {showIntroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto relative p-6 font-sans">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Welcome to Stackscope Demo</h2>
              <button
                onClick={() => setShowIntroModal(false)}
                aria-label="Close modal"
                className="text-gray-500 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4 text-gray-800 text-base leading-relaxed">
              <p>
                This is a demo preview screen showing a sample dataset with dummy credentials and resources.
              </p>
              <p>
                <strong>Available features:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Select resources (VMs, Disks, Buckets) from the sidebar dropdown.</li>
                <li>View relationships between VMs and attached Disks in the overview.</li>
                <li>See details of any selected resource in the details panel below.</li>
                <li>Explore an "Add All Resources" button to see all dummy resources at once.</li>
                <li>Navigate the sidebar and use dropdown menus (though these actions won't modify data).</li>
              </ul>
              <p>
                <strong>Not available in demo:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Adding, editing, or deleting credentials (buttons will show informational alerts only).</li>
                <li>Uploading JSON files or real API interaction.</li>
                <li>Real user login/logout functionality.</li>
                <li>Resource updates from real backend data.</li>
              </ul>
              <p>
                Feel free to interact with the dropdowns and resources to get a sense of how the real application will look and behave.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowIntroModal(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-[calc(100vh-132px)]">
        {/* Sidebar */}
        <nav
          aria-label="Sidebar"
          className="bg-[#0a1f3b] text-[#e8edf4] w-64 flex flex-col justify-between relative font-sans select-none"
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
                      onClick={() =>
                        alert('Edit Credentials action (preview only)')
                      }
                      className="w-full text-left px-4 py-2 hover:bg-[#193774] focus:bg-[#1d3b73] focus:outline-none transition-colors"
                      role="menuitem"
                    >
                      Edit Credentials
                    </button>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      onClick={() =>
                        alert('Add Credential action (preview only)')
                      }
                      className="w-full text-left px-4 py-2 hover:bg-[#193774] focus:bg-[#1d3b73] focus:outline-none transition-colors"
                      role="menuitem"
                    >
                      Add Credential
                    </button>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      onClick={() =>
                        alert('Delete Credential action (preview only)')
                      }
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
                    <li
                      role="none"
                      className="px-4 py-1 border-b border-[#193774]"
                    >
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
                            const dispName = shortName(
                              resource.displayName || resource.name || resource.assetType
                            );
                            return (
                              <button
                                key={idx}
                                type="button"
                                className="w-full text-left px-6 py-1 hover:bg-[#193774] focus:bg-[#1d3b73] focus:outline-none transition-colors text-sm truncate flex items-center"
                                onClick={() =>
                                  handleResourceSelect(Number(keyIndex), idx)
                                }
                                role="menuitem"
                                title={dispName}
                              >
                                {getIconForAssetType(resource.assetType)}
                                {resource.assetType ===
                                'compute.googleapis.com/Instance'
                                  ? `VM: ${dispName}`
                                  : resource.assetType ===
                                    'compute.googleapis.com/Disk'
                                  ? `Disk: ${dispName}`
                                  : dispName}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-6 py-2 text-gray-400 select-text text-sm">
                            No resources
                          </div>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-400 select-text">
                      No resources
                    </li>
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
            <Link href="/">
              <button
                type="button"
                className="w-full bg-[#193774] hover:bg-[#22509e] text-[#e8edf4] font-semibold rounded-md px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                Logout
              </button>
            </Link>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 flex flex-col items-start justify-start mt-10 px-6 font-sans max-w-4xl w-full min-h-[60vh]">
          <h2 className="text-2xl font-semibold mb-4 w-full">Resources Overview</h2>

          {/* Vertical relational graph */}
          <div className="flex flex-col w-full max-h-[68vh] overflow-y-auto border rounded bg-white shadow-md p-4">
            {selectedResources.length === 0 ? (
              <p className="text-gray-500 italic select-text text-center mt-16">
                Select resources from the dropdown to see relationships here.
              </p>
            ) : (
              <>
                {vms.length > 0 ? (
                  vms.map(({ keyIndex, resourceIndex, resource }) => {
                    const disksForVm = getAttachedDisks(resource);
                    const isSelectedVm = selectedResource === resource;
                    return (
                      <div
                        key={`${keyIndex}-${resourceIndex}`}
                        className="mb-6 border p-3 rounded shadow-sm hover:shadow-md transition bg-gray-50 cursor-default"
                      >
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
                            <p className="text-gray-500 italic select-text">
                              No attached disks
                            </p>
                          ) : (
                            disksForVm.map((disk, idx) => {
                              const isSelectedDisk = selectedResource === disk;
                              return (
                                <button
                                  key={`${disk.name ?? idx}`}
                                  type="button"
                                  onClick={() => setSelectedResource(disk)}
                                  className={`flex items-center gap-2 px-2 py-1 rounded select-text text-sm transition w-full text-left ${
                                    isSelectedDisk
                                      ? 'bg-blue-100 text-blue-800 font-semibold'
                                      : 'text-gray-800 hover:bg-gray-100'
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
                  })
                ) : (
                  <p className="text-gray-500 italic select-text text-center">
                    No VMs selected
                  </p>
                )}

                {unattachedDisks.length > 0 && (
                  <div className="border-t pt-4 mt-auto">
                    <h3 className="font-semibold mb-2 text-gray-700 select-text flex items-center gap-1">
                      <HardDrive size={18} /> Unattached Disks
                    </h3>
                    <div className="flex flex-col space-y-1 max-w-md ml-2">
                      {unattachedDisks.map((disk, idx) => {
                        const isSelectedDisk = selectedResource === disk;
                        return (
                          <button
                            key={`${disk.name ?? idx}-unattached`}
                            type="button"
                            onClick={() => setSelectedResource(disk)}
                            className={`flex items-center gap-2 px-2 py-1 rounded select-text text-sm transition w-full text-left ${
                              isSelectedDisk
                                ? 'bg-blue-100 text-blue-800 font-semibold'
                                : 'text-gray-800 hover:bg-gray-100'
                            }`}
                            title={disk.displayName || disk.name}
                          >
                            {getIconForAssetType(disk.assetType)}
                            {shortName(disk.displayName || disk.name)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Details Panel */}
          <section className="w-full mt-6 max-h-[30vh] overflow-auto border rounded p-4 bg-gray-50 shadow-inner font-mono text-sm whitespace-pre-wrap break-words">
            {selectedResource ? (
              <>
                <div className="flex items-center gap-2 mb-3 font-semibold text-lg select-text">
                  {getIconForAssetType(selectedResource.assetType)}
                  <span>{shortName(selectedResource.displayName || selectedResource.name)}</span>
                </div>
                <pre>{JSON.stringify(selectedResource, null, 2)}</pre>
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
      <footer className="bg-blue-800 text-white px-6 py-10 text-center font-sans">
        <h3 className="text-4xl font-semibold">Stackscope</h3>
      </footer>
    </>
  );
}