import React from 'react';

interface PreferencesFormProps {
  formik: any;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ formik }) => {
  return (
    <div>
      <h3>Client Preferences</h3>
      <p>Client preferences form fields will be displayed here.</p>
    </div>
  );
};

export default PreferencesForm; 