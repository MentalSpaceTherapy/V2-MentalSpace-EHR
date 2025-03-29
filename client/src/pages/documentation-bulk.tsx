import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import BulkDocumentOperations from '@/components/documentation/BulkDocumentOperations';
import { useAuth } from '@/hooks/use-auth';

export default function DocumentationBulk() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64">
          <TopBar title="Bulk Documentation" />
          <div className="p-6 bg-neutral-50 min-h-screen flex items-center justify-center">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64">
          <TopBar title="Bulk Documentation" />
          <div className="p-6 bg-neutral-50 min-h-screen flex items-center justify-center">
            <p>Please log in to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar title="Bulk Documentation" />
        <div className="p-6 bg-neutral-50 min-h-screen">
          <BulkDocumentOperations />
        </div>
      </div>
    </div>
  );
}