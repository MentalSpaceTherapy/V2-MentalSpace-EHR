import React from 'react';

interface ClientBillingTabProps {
  clientId: string;
}

export const ClientBillingTab: React.FC<ClientBillingTabProps> = ({ clientId }) => {
  return (
    <div>
      <h2>Billing</h2>
      <p>Client ID: {clientId}</p>
      <p>Billing tab content will go here.</p>
    </div>
  );
}; 