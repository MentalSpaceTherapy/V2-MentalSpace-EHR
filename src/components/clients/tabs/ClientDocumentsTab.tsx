import React from 'react';

interface ClientDocumentsTabProps {
  clientId: string;
}

export const ClientDocumentsTab: React.FC<ClientDocumentsTabProps> = ({ clientId }) => {
  return (
    <div>
      <h2>Documents</h2>
      <p>Client ID: {clientId}</p>
      <p>Documents tab content will go here.</p>
    </div>
  );
}; 