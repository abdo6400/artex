import { useState, ChangeEvent } from 'react';
import { ContactFormData } from '../types';

const initialFormData: ContactFormData = {
  name: '',
  company: '',
  service: '',
  budget: '',
  message: '',
};

export function useContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  return {
    formData,
    setFormData,
    handleChange,
    resetForm,
  };
}
