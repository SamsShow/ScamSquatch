'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";

// Dynamically import the home content to prevent SSR issues
const HomeContent = dynamic(() => import('./home-content'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <p className="text-muted-foreground">Initializing...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return <HomeContent />;
}