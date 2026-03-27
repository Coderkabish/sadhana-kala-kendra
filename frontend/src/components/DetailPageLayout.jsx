import React from "react";
import { Link } from "react-router-dom";

const DetailPageLayout = ({
  backTo,
  backLabel,
  imageSrc,
  imageAlt,
  imageFitClass = "object-contain",
  title,
  description,
  stats = [],
  sections,
  actions,
}) => {
  return (
    <section className="bg-gray-50 min-h-screen py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to={backTo} className="text-[#cf0408] font-semibold hover:underline">
            {backLabel}
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {imageSrc ? (
            <div className="w-full h-64 md:h-96 bg-gray-100">
              <img src={imageSrc} alt={imageAlt || title} className={`w-full h-full ${imageFitClass}`} />
            </div>
          ) : null}

          <div className="p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#191938] mb-3">{title}</h1>
            <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-8">{description}</p>

            {stats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-base font-semibold text-[#191938]">{stat.value}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {sections}

            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailPageLayout;
