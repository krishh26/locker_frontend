import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import ResourceForm from 'src/app/component/ResourceForm/ResourceForm';
import {
  useAddResourceMutation,
} from 'app/store/api/resourcesApi';

const AddResourcePage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [addResource, { isLoading }] = useAddResourceMutation();

  const handleSubmit = async (data: any) => {
    try {
      await addResource(data).unwrap();
      enqueueSnackbar('Resource added successfully', { variant: 'success' });
      navigate('/wellbeing/resources');
    } catch (error) {
      console.error('Error adding resource:', error);
      enqueueSnackbar('Failed to add resource', { variant: 'error' });
      throw error; // Re-throw to let the form handle the error state
    }
  };

  const handleCancel = () => {
    navigate('/wellbeing/resources');
  };

  return (
    <ResourceForm
      mode="add"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  );
};

export default AddResourcePage;
