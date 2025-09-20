import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Box, CircularProgress, Alert } from '@mui/material';

import ResourceForm from 'src/app/component/ResourceForm/ResourceForm';
import {
  useGetAdminResourcesQuery,
  useUpdateResourceMutation,
} from 'app/store/api/resourcesApi';

const EditResourcePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [updateResource, { isLoading: isUpdating }] = useUpdateResourceMutation();

  // Fetch the specific resource data
  const {
    data: resourcesData,
    isLoading: isLoadingResource,
    error: resourceError,
  } = useGetAdminResourcesQuery({
    page: 1,
    limit: 1000, // Get all resources to find the one we need
  });

  // Find the specific resource by ID
  const resource = resourcesData?.data?.find(r => r.id === id);

  const handleSubmit = async (data: any) => {
    if (!id) {
      enqueueSnackbar('Resource ID not found', { variant: 'error' });
      return;
    }

    try {
      await updateResource({ id, payload: data }).unwrap();
      enqueueSnackbar('Resource updated successfully', { variant: 'success' });
      navigate('/admin/resources');
    } catch (error) {
      console.error('Error updating resource:', error);
      enqueueSnackbar('Failed to update resource', { variant: 'error' });
      throw error; // Re-throw to let the form handle the error state
    }
  };

  const handleCancel = () => {
    navigate('/admin/resources');
  };

  // Loading state
  if (isLoadingResource) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (resourceError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load resource data. Please try again.
        </Alert>
      </Box>
    );
  }

  // Resource not found
  if (!resource) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          Resource not found. It may have been deleted or the ID is invalid.
        </Alert>
      </Box>
    );
  }

  return (
    <ResourceForm
      mode="edit"
      initialData={resource}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isUpdating}
    />
  );
};

export default EditResourcePage;
