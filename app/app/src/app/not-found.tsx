import Navbar from '@/components/navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex flex-grow items-center justify-center">
        <h1 className="text-2xl">404 - Page Not Found</h1>
      </main>
    </div>
  );
}