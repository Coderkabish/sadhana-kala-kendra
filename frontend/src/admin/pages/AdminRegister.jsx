import React, { useState, useEffect, useCallback } from "react";

import RegisterService from "../services/registerServices.js";

// --- Existing Icons remain the same ---
const Icons = {
  Trash2: (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  Edit: (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
  Eye: (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s5-5 10-5 10 5 10 5-5 5-10 5-10-5-10-5z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  MailOpen: (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7.5L12 15l10-4.5" />
      <path d="m22 7.5-10-4.5L2 7.5" />
    </svg>
  ),
  Mail: (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7-10-7" />
    </svg>
  ),
  ClipboardCheck: (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="4" width="6" height="4" rx="1" />
      <path d="M8 22h8" />
      <path d="M5 22h4" />
      <path d="M16 22h3a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h3" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  ),
  Users: (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

// --- Modal Component (Consistent Styling) ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      // Using a utility class that implies 50% opacity if available, or keep inline style for accuracy
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-xl max-h-[95vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
        <h3 className="text-2xl font-extrabold text-gray-800 mb-5 border-b pb-3 flex justify-between items-center">
          {title}
        </h3>
        {children}
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition border border-gray-200"
        >
          Close Details
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---
const AdminRegister = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [activeTab, setActiveTab] = useState("Unread"); // State for the tabbed interface

  // --- Data Fetching Logic ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const registrationResponse = await RegisterService.getAllRegistrations();
      setRegistrations(registrationResponse);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        `Failed to load registration data. Error: ${
          err.message || "Check API connection."
        }`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Status Toggle Logic ---
  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "Read" ? "Unread" : "Read";
    try {
      await RegisterService.updateRegistrationStatus(id, newStatus);

      // Optimistically update the list
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.registration_id === id ? { ...reg, status: newStatus } : reg
        )
      );

      // If the modal is open, update the modal data state as well
      if (modalData && modalData.registration_id === id) {
        setModalData((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(`Error updating status:`, err);
      setError(
        `Failed to change status to '${newStatus}'. Please check RegisterService.updateRegistrationStatus and backend API.`
      );
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        `Are you sure you want to delete registration ID ${id}? This action is irreversible.`
      )
    )
      return;
    try {
      await RegisterService.deleteRegistration(id);
      // Update UI without full refresh (better UX)
      setRegistrations((prev) =>
        prev.filter((reg) => reg.registration_id !== id)
      );
    } catch (err) {
      console.error(`Error deleting registration:`, err);
      setError(`Failed to delete registration.`);
    }
  };

  const openEditModal = (data) => {
    setModalData(data);
    setIsModalOpen(true);
    // Automatically mark as 'Read' when opening the detail view
    if (data.status === "Unread") {
      handleStatusToggle(data.registration_id, "Unread");
    }
  };

  // --- Redesigned RegistrationForm (Modal Content) ---
  const RegistrationForm = ({ data }) => {
    const statusBadge =
      data.status === "Read" ? (
        <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-teal-100 text-teal-800 border border-teal-200">
          Reviewed
        </span>
      ) : (
        <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200 animate-pulse">
          New Submission
        </span>
      );

    return (
      <div className="space-y-6">
        {/* Status & ID Header */}
        <div className="flex justify-between items-center pb-2 border-b">
          <h4 className="text-lg font-bold text-gray-600">
            ID:{" "}
            <span className="text-gray-900 font-extrabold">
              {data.registration_id}
            </span>
          </h4>
          {statusBadge}
        </div>

        {/* Student Details Grid */}
        <div className="p-5 bg-gray-50 rounded-xl grid grid-cols-2 gap-x-6 gap-y-3 text-sm border border-gray-200">
          <h4 className="col-span-2 font-extrabold text-base text-teal-700 border-b pb-1 mb-2">
            Student Information
          </h4>

          <DetailItem label="Name" value={data.student_name} />
          <DetailItem label="Age" value={data.age} />
        <DetailItem label="Course" value={data.course_name} />
          <DetailItem
            label="Email"
            value={data.email}
            isLink={true}
            prefix="mailto:"
          />
          <DetailItem
            label="Phone"
            value={data.phone}
            isLink={true}
            prefix="tel:"
          />
          <DetailItem label="Occupation" value={data.occupation} />
          {/* Consistent date format */}
          <DetailItem
            label="Date"
            value={new Date(data.registration_date).toLocaleDateString(
              "en-US",
              { year: "numeric", month: "short", day: "numeric" }
            )}
          />
          <DetailItem label="Address" value={data.address} fullWidth={true} />
        </div>

        {/* Control Button: Mark as Unread (Only visible if currently Read) */}
        {data.status === "Read" && (
          <button
            onClick={() =>
              handleStatusToggle(data.registration_id, data.status)
            }
            className="w-full bg-yellow-100 text-yellow-700 p-3 rounded-xl hover:bg-yellow-200 transition font-medium flex items-center justify-center space-x-2 border border-yellow-300"
          >
            <Icons.Mail className="w-5 h-5" />
            <span>Mark as Unread (Re-review)</span>
          </button>
        )}
      </div>
    );
  };

  // Helper component for cleaner detail display
  const DetailItem = ({
    label,
    value,
    fullWidth = false,
    isLink = false,
    prefix = "",
  }) => (
    <p className={fullWidth ? "col-span-2" : "col-span-1"}>
      <strong className="text-gray-600 block">{label}:</strong>
      {isLink && value ? (
        // Use consistent blue link color
        <a
          href={`${prefix}${value}`}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {value}
        </a>
      ) : (
        <span className="text-gray-800 font-medium">{value || "N/A"}</span>
      )}
    </p>
  );

  // --- Redesigned RegistrationTable (Data Grid) ---
  const RegistrationTable = ({ data }) => {
    if (data.length === 0)
      return (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed mt-4">
          <Icons.MailOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-lg">No submissions found in this category.</p>
        </div>
      );

    return (
      <div className="mt-4 overflow-x-auto shadow-lg rounded-xl border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Student Name
              </th>
<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
  Course
</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contact Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((reg) => {
              const isUnread = reg.status === "Unread";
              // Slightly adjust hover colors for better contrast
              const rowClass = isUnread
                ? "bg-red-50 hover:bg-red-100"
                : "hover:bg-gray-50";

              return (
                <tr
                  key={reg.registration_id}
                  className={rowClass + " transition duration-150 ease-in-out"}
                >
                  {/* Status Icon Toggle */}
                  <td className="px-6 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() =>
                        handleStatusToggle(reg.registration_id, reg.status)
                      }
                      // Apply explicit styles for better look
                      className={`p-1 rounded-full transition ${
                        isUnread
                          ? "text-red-600 hover:bg-red-200 bg-red-100/70"
                          : "text-teal-600 hover:bg-teal-100/70"
                      }`}
                      title={isUnread ? "Mark as Read" : "Mark as Unread"}
                    >
                      {isUnread ? (
                        <Icons.Mail className="w-5 h-5" />
                      ) : (
                        <Icons.MailOpen className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  {/* Essential Columns */}
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {reg.student_name || "N/A"}
                  </td>
<td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
  {reg.course_name || "N/A"}
</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                    {reg.email || "N/A"}
                  </td>
                  {/* Consistent date format in table */}
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reg.registration_date).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "short", day: "numeric" }
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => openEditModal(reg)}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded transition"
                      title="View Details"
                    >
                      <Icons.Eye className="w-5 h-5 inline-block" />
                    </button>
                    <button
                      onClick={() => handleDelete(reg.registration_id)}
                      className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded transition"
                      title="Delete Registration"
                    >
                      <Icons.Trash2 className="w-5 h-5 inline-block" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Separate registrations into two lists
  const unreadRegistrations = registrations.filter(
    (reg) => reg.status === "Unread"
  );
  const readRegistrations = registrations.filter(
    (reg) => reg.status === "Read"
  );
  const totalRegistrations = registrations.length;

  // Determine which data to show based on the active tab
  const displayData =
    activeTab === "Unread" ? unreadRegistrations : readRegistrations;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10 text-slate-900">
      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Registration Console</h1>
              <p className="text-slate-500 text-sm md:text-base mt-1">Manage all registrations and submissions.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {loading && (
          <div className="p-8 text-center text-gray-500">Loading data...</div>
        )}

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-xl border border-red-300 mb-6 font-medium">
            {error}
          </div>
        )}

        {!loading && (
          <>
            {/* --- 1. Summary Metrics --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Count */}
              <MetricCard
                icon={Icons.Users}
                title="Total Registrations"
                value={totalRegistrations}
                color="text-teal-700"
                bg="bg-white"
              />
              {/* Unread Count */}
              <MetricCard
                icon={Icons.Mail}
                title="New Submissions"
                value={unreadRegistrations.length}
                color="text-red-700"
                bg="bg-red-50"
                isAttention={true}
              />
              {/* Read Count */}
              <MetricCard
                icon={Icons.MailOpen}
                title="Reviewed Submissions"
                value={readRegistrations.length}
                color="text-gray-700"
                bg="bg-white"
              />
            </div>

            {/* --- 2. Tabbed Interface for Tables --- */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

              {/* Render the Table based on activeTab */}
              <RegistrationTable data={displayData} />
            </div>
          </>
        )}

        {/* --- 3. Modal for Details --- */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Registration Details: #${modalData?.registration_id}`}
        >
          {modalData && <RegistrationForm data={modalData} />}
        </Modal>
      </div>
    </div>
  );
};

export default AdminRegister;

// --- New Helper Components for UX (Refined Styling) ---

// Metric Card Component for Summary
const MetricCard = ({
  icon: Icon,
  title,
  value,
  color,
  bg,
  isAttention = false,
}) => (
  <div
    className={`p-5 rounded-xl shadow-md flex items-center justify-between transition-shadow duration-300 ${bg} border ${
      isAttention ? "border-red-300 ring-2 ring-red-400" : "border-gray-200"
    }`}
  >
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
      </div>
    <Icon className={`w-8 h-8 ${color} opacity-70`} />
  </div>
);

// Tab Navigation Component
const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { name: "Unread", label: "New Submissions" },
    { name: "Read", label: "Reviewed Submissions" },
  ];

  return (
    <div className="flex border-b border-gray-200 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => setActiveTab(tab.name)}
          className={`
                        py-2 px-4 text-lg font-semibold transition-colors duration-200 
                        ${
                          activeTab === tab.name
                            ? // Use consistent teal focus color
                              "border-b-4 border-teal-500 text-teal-600"
                            : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                        }
                    `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};