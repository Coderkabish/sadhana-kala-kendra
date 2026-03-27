import React from "react";

const EmptyState = ({ title, description, className = "" }) => {
  return (
    <div
      className={`col-span-full text-center text-gray-500 text-lg p-8 bg-yellow-50 rounded-lg font-['Roboto'] ${className}`}
    >
      <h3 className="text-xl font-semibold text-gray-700 font-['Playfair_Display']">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 text-gray-500 font-['Roboto']">{description}</p>
      ) : null}
    </div>
  );
};

export default EmptyState;
