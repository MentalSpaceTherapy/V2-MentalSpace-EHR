import React from 'react';

interface ClientAppointmentsTabProps {
  clientId: string;
}

export const ClientAppointmentsTab: React.FC<ClientAppointmentsTabProps> = ({ clientId }) => {
  return (
    <div>
      <h2>Appointments</h2>
      <p>Client ID: {clientId}</p>
      <p>Appointments tab content will go here.</p>
    </div>
  );
}; 