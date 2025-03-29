// StaffForm.jsx
import React, { useState } from "react";

const StaffForm = () => {
  const [staffData, setStaffData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    type_of_clinician: "",
    npi_number: "",
    supervisor_id: "",
    role: "",
    email: "",
    phone: "",
    can_receive_texts: false,
    work_phone: "",
    address: "",
    city_state: "",
    zip_code: "",
    license_state: "",
    license_taxonomy: "",
    license_expiration: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStaffData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(staffData),
      });
      const result = await response.json();
      if (!response.ok) {
        alert("Error: " + result.message);
      } else {
        alert("Staff created successfully! ID: " + result.staff.id);
        // Optionally reset form:
        setStaffData({
          first_name: "",
          middle_name: "",
          last_name: "",
          suffix: "",
          type_of_clinician: "",
          npi_number: "",
          supervisor_id: "",
          role: "",
          email: "",
          phone: "",
          can_receive_texts: false,
          work_phone: "",
          address: "",
          city_state: "",
          zip_code: "",
          license_state: "",
          license_taxonomy: "",
          license_expiration: "",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Staff</h2>
      <div>
        <label>First Name:</label>
        <input
          type="text"
          name="first_name"
          value={staffData.first_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Middle Name:</label>
        <input
          type="text"
          name="middle_name"
          value={staffData.middle_name}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Last Name:</label>
        <input
          type="text"
          name="last_name"
          value={staffData.last_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Suffix:</label>
        <input
          type="text"
          name="suffix"
          value={staffData.suffix}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Type of Clinician:</label>
        <select
          name="type_of_clinician"
          value={staffData.type_of_clinician}
          onChange={handleChange}
        >
          <option value="">--Select--</option>
          <option value="Licensed Clinical Psychologist">
            Licensed Clinical Psychologist
          </option>
          <option value="Licensed Professional Counselor">
            Licensed Professional Counselor
          </option>
          <option value="Clinical Social Worker">
            Clinical Social Worker
          </option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label>NPI Number:</label>
        <input
          type="text"
          name="npi_number"
          value={staffData.npi_number}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Supervisor ID (if any):</label>
        <input
          type="number"
          name="supervisor_id"
          value={staffData.supervisor_id}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Role:</label>
        <select name="role" value={staffData.role} onChange={handleChange}>
          <option value="">--Select--</option>
          <option value="Practice Administrator">Practice Administrator</option>
          <option value="Clinician">Clinician</option>
          <option value="Intern/Assistant/Associate">
            Intern/Assistant/Associate
          </option>
          <option value="Supervisor">Supervisor</option>
          <option value="Clinical Administrator">Clinical Administrator</option>
          <option value="Scheduler">Scheduler</option>
          <option value="Biller">Biller</option>
        </select>
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={staffData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Phone:</label>
        <input
          type="text"
          name="phone"
          value={staffData.phone}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Can Receive Texts:</label>
        <input
          type="checkbox"
          name="can_receive_texts"
          checked={staffData.can_receive_texts}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Work Phone:</label>
        <input
          type="text"
          name="work_phone"
          value={staffData.work_phone}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={staffData.address}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>City/State:</label>
        <input
          type="text"
          name="city_state"
          value={staffData.city_state}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Zip Code:</label>
        <input
          type="text"
          name="zip_code"
          value={staffData.zip_code}
          onChange={handleChange}
        />
      </div>
      <hr />
      <h3>License Information</h3>
      <div>
        <label>License State:</label>
        <input
          type="text"
          name="license_state"
          value={staffData.license_state}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Taxonomy:</label>
        <input
          type="text"
          name="license_taxonomy"
          value={staffData.license_taxonomy}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>License Expiration (mm/dd/yyyy):</label>
        <input
          type="text"
          name="license_expiration"
          value={staffData.license_expiration}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Save New Staff</button>
    </form>
  );
};

export default StaffForm;