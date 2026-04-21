'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';
import { parseFormErrors, clearFieldError } from '@/utils/errorHandler';
import { teachersService } from '@/services/teachersService';
import type { ParsedError } from '@/utils/errorHandler';

interface TeacherFormData {
  full_name: string;
  specialization: string;
  display_order: number | '';
}

interface TeacherFormProps {
  teacher?: any;
  teacherId?: number;
  isEdit?: boolean;
}

/**
 * Template for Admin Forms with Field-Specific Error Handling
 * 
 * This component demonstrates how to properly handle and display
 * field-specific error messages from the API.
 */
export default function TeacherFormTemplate({ teacher, teacherId, isEdit = false }: TeacherFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<TeacherFormData>({
    full_name: teacher?.full_name || '',
    specialization: teacher?.specialization || '',
    display_order: teacher?.display_order || '',
  });

  // Field-specific errors object: { fieldName: "error message" }
  const [errors, setErrors] = useState<ParsedError['fieldErrors']>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts editing
    if (errors[name]) {
      setErrors(prev => clearFieldError(prev, name));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const submitData = {
        full_name: formData.full_name,
        specialization: formData.specialization,
        display_order: formData.display_order || 0,
      };

      if (isEdit && teacherId) {
        await teachersService.update(teacherId, submitData);
      } else {
        await teachersService.create(submitData);
      }

      router.push('/admin/teachers');
    } catch (err: any) {
      // Parse API response and extract field-specific errors
      const fieldErrors = parseFormErrors(err);
      setErrors(fieldErrors.fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Submit error (general error message) */}
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{errors.submit}</p>
        </div>
      )}

      {/* Field-specific error for full_name */}
      <FormInput
        label="Teacher Name"
        name="full_name"
        value={formData.full_name}
        onChange={handleChange}
        error={errors.full_name}
        placeholder="Enter teacher's full name"
        required
        disabled={loading}
      />

      {/* Field-specific error for specialization */}
      <FormTextarea
        label="Specialization"
        name="specialization"
        value={formData.specialization}
        onChange={handleChange}
        error={errors.specialization}
        placeholder="Enter specialization (e.g., Vocal, Guitar)"
        disabled={loading}
      />

      {/* Field-specific error for display_order */}
      <FormInput
        label="Display Order"
        name="display_order"
        type="number"
        value={formData.display_order}
        onChange={handleChange}
        error={errors.display_order}
        placeholder="0"
        min="0"
        disabled={loading}
      />

      {/* Submit button */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Teacher' : 'Create Teacher'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
