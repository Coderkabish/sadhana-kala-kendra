'use client';

import React, { useState } from 'react';

interface TeamMember {
  id?: number;
  name?: string;
  designation?: string;
  description?: string;
  image_url?: string;
  display_order?: number;
}

interface TeamMemberFormProps {
  member?: TeamMember;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export default function TeamMemberForm({ member, onSubmit, onCancel, isSaving }: TeamMemberFormProps) {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    subtitle: member?.designation || '',
    display_order: member?.display_order || 0,
    description: member?.description || '',
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(member?.image_url ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${member.image_url}` : '');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'display_order' ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('subtitle', formData.subtitle);
      submitData.append('display_order', String(formData.display_order));
      submitData.append('description', formData.description);

      if (image) {
        submitData.append('image_url', image);
      } else if (member?.image_url && !imagePreview) {
        submitData.append('clear_image', 'true');
      }

      await onSubmit(submitData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {member?.id ? 'Edit Team Member' : 'Add New Team Member'}
        </h2>
        <p className="text-slate-600 text-sm">Fill in the team member details below.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span className="text-sm">{error}</span>
          <button type="button" onClick={() => setError('')} className="text-lg leading-none font-bold">×</button>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Team Member Details</h3>
        
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Full Name *"
          required
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

        <input
          type="text"
          name="subtitle"
          value={formData.subtitle}
          onChange={handleInputChange}
          placeholder="Designation/Role (e.g., Teacher, Coordinator) *"
          required
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Short description"
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Team Member Image */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Team Member Image</h3>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition">
          {imagePreview ? (
            <div className="space-y-4">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-white shadow-md">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-red-600 hover:text-red-800 font-semibold text-sm"
              >
                Remove Image
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="team-image"
              />
              <label htmlFor="team-image" className="cursor-pointer block">
                <div className="text-4xl mb-2">📷</div>
                <p className="font-semibold text-slate-700">Click to upload team member image</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Display Order */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Display Order</label>
        <input
          type="number"
          name="display_order"
          value={formData.display_order}
          onChange={handleInputChange}
          min="0"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="0"
        />
        <p className="text-xs text-slate-500 mt-1">Determines order on the page</p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-slate-400"
        >
          {isSaving ? 'Saving...' : member?.id ? 'Update Member' : 'Add Member'}
        </button>
      </div>
    </form>
  );
}
