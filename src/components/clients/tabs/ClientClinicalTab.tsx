import React from 'react';

interface ClientClinicalTabProps {
  clientId: string;
}

export const ClientClinicalTab: React.FC<ClientClinicalTabProps> = ({ clientId }) => {
  return (
    <div>
      <h2>Clinical Info</h2>
      <p>Client ID: {clientId}</p>
      <p>Clinical tab content will go here.</p>
    </div>
  );
}; 