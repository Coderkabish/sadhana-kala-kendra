import React, { useEffect, useState, useCallback } from "react";
import { getAllTeachers } from "../admin/services/teachersService";
import { SERVER_ROOT_URL } from "../admin/services/api";

const SERVER_BASE_URL = SERVER_ROOT_URL;

const Teachers = () => {
  const [teachers, setTeachers] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTeachers();
      setTeachers(data);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
      setError("Failed to load our teachers. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTeachers(); 
  }, [fetchTeachers]);

  const getImageUrl = (imagePath) => {
    return imagePath ? `${SERVER_BASE_URL}${imagePath}` : 'https://via.placeholder.com/300x400?text=Teacher+Image';
  };

  if (loading) {
    return (
        <section className="py-20 bg-gray-50 min-h-screen px-6 lg:px-16 font-['Roboto']">
            <div className="max-w-7xl mx-auto text-center py-20">
                <svg className="animate-spin h-10 w-10 text-red-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-xl text-gray-700">Loading teachers...</p>
            </div>
        </section>
    );
  }

  if (error) {
    return (
        <section className="py-20 bg-gray-50 min-h-screen px-6 lg:px-16 font-['Roboto']">
             <div className="max-w-7xl mx-auto text-center py-20 p-8 bg-red-100 border border-red-300 rounded-xl">
                <h2 className="text-2xl font-bold text-red-700 mb-4">Error</h2>
                <p className="text-lg text-red-600">{error}</p>
             </div>
        </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50 min-h-screen px-6 lg:px-16 font-['Roboto']">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
          Meet Our <span className="text-red-600">Teachers</span>
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
          Learn from our expert instructors who are passionate about teaching
          music, dance, and performing arts.
        </p>
      </div>

      {teachers.length === 0 ? (
        <div className="max-w-7xl mx-auto text-center p-8 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-200 shadow-sm">
            <p className="text-lg font-sans">No teachers have been added yet!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {teachers.map((teacher) => (
            <div
              key={teacher.teacher_id} 
              onClick={() => setSelectedTeacher(teacher)}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-3xl shadow-md hover:shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2">
                <div className="overflow-hidden">
                  <img
                    src={getImageUrl(teacher.profile_image)}
                    alt={teacher.full_name} 
className="w-full h-56 object-cover object-top transition-transform duration-500 hover:scale-105"                  />
                </div>

                <div className="p-8 text-center">
                  <h3 className="text-2xl font-semibold text-[#191938] mb-3 font-['Playfair Display']">
                    {teacher.full_name} 
                  </h3>
                  <p className="text-gray-600 mb-6 font-['Roboto']">
                    {teacher.specialization} 
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 relative overflow-y-auto max-h-[80vh]">
            <button
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-3xl font-bold"
            >
              &times;
            </button>

            <div className="text-center">
              <img
                src={getImageUrl(selectedTeacher.profile_image)}
                alt={selectedTeacher.full_name} 
                className="w-40 h-40 md:w-56 md:h-56 object-cover rounded-full mx-auto shadow-lg mb-6"
              />
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#191938] mb-2 font-['Inter']">
                {selectedTeacher.full_name} 
              </h2>
              <p className="text-red-600 text-lg md:text-xl font-semibold mb-4">
                {selectedTeacher.specialization} 
              </p>
              <p className="text-gray-600 mt-2">
                <span className="font-semibold text-red-600">Specialization:</span>{" "}
                {selectedTeacher.specialization} 
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Teachers;