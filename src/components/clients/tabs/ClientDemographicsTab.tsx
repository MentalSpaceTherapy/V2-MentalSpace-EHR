import React from 'react';

interface ClientDemographicsTabProps {
  clientId: string;
}

export const ClientDemographicsTab: React.FC<ClientDemographicsTabProps> = ({ clientId }) => {
  return (
    <div>
      <h2>Demographics</h2>
      <p>Client ID: {clientId}</p>
      <p>Demographics tab content will go here.</p>
    </div>
  );
}; 