import React from 'react';

interface ClientInsuranceTabProps {
  clientId: string;
}

export const ClientInsuranceTab: React.FC<ClientInsuranceTabProps> = ({ clientId }) => {
  return (
    <div>
      <h2>Insurance</h2>
      <p>Client ID: {clientId}</p>
      <p>Insurance tab content will go here.</p>
    </div>
  );
}; 