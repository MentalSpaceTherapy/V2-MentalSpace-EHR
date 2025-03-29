import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import DocumentTemplateManager from '@/components/documentation/DocumentTemplateManager';

export default function TemplatesPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  if (!user) {
    return <div className="container mx-auto py-10">Please log in to access this page.</div>;
  }

  return (
    <div className="pb-10">
      <DocumentTemplateManager />
    </div>
  );
}