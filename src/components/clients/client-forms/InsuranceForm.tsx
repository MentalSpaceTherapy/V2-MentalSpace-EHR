import React from 'react';

interface InsuranceFormProps {
  formik: any;
}

const InsuranceForm: React.FC<InsuranceFormProps> = ({ formik }) => {
  return (
    <div>
      <h3>Insurance Information</h3>
      <p>Insurance form fields will be displayed here.</p>
    </div>
  );
};

export default InsuranceForm; 