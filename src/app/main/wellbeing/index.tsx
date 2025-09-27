import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';

import { themeHelpers } from 'src/app/utils/themeUtils';
import { exportFeedbacksToCSV, downloadCSV, generateFilename } from 'src/utils/csvExport';

import {
  useGetAdminResourcesQuery,
  useToggleResourceMutation,
  useDeleteResourceMutation,
} from 'app/store/api/resourcesApi';
import type { WellbeingResource } from 'app/store/api/resourcesApi';

// Theme-aware styled components
const ThemedBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}));

const ThemedPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: themeHelpers.getShadow(theme, 1),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: themeHelpers.getShadow(theme, 2),
  },
}));

const ThemedTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

const ThemedButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: themeHelpers.getShadow(theme, 3),
  },
}));

const ThemedTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

const ThemedTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  '& .MuiTable-root': {
    '& .MuiTableHead-root': {
      '& .MuiTableCell-root': {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        borderBottom: `2px solid ${theme.palette.divider}`,
        fontWeight: 600,
      },
    },
    '& .MuiTableBody-root': {
      '& .MuiTableRow-root': {
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        '& .MuiTableCell-root': {
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
      },
    },
  },
}));

const AdminResourcesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<WellbeingResource | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedResource, setSelectedResource] = useState<WellbeingResource | null>(null);

  // API hooks
  const {
    data: resourcesData,
    isLoading,
    error,
    refetch,
  } = useGetAdminResourcesQuery({
    search: searchTerm || undefined,
    page: page + 1,
    limit: rowsPerPage,
  });

  const [toggleResource, { isLoading: isToggling }] = useToggleResourceMutation();
  const [deleteResource, { isLoading: isDeleting }] = useDeleteResourceMutation();

  // Event handlers
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  }, []);

  const handleToggleActive = useCallback(async (resource: WellbeingResource) => {
    try {
      await toggleResource({
        id: resource.id,
        isActive: !resource.isActive,
      }).unwrap();
      
      enqueueSnackbar(
        `Resource ${resource.isActive ? 'deactivated' : 'activated'} successfully`,
        { variant: 'success' }
      );
    } catch (error) {
      enqueueSnackbar(
        `Failed to ${resource.isActive ? 'deactivate' : 'activate'} resource`,
        { variant: 'error' }
      );
    }
  }, [toggleResource, enqueueSnackbar]);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, resource: WellbeingResource) => {
    setAnchorEl(event.currentTarget);
    setSelectedResource(resource);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedResource(null);
  }, []);

  const handleEdit = useCallback(() => {
    if (selectedResource) {
      navigate(`/wellbeing/resources/edit/${selectedResource.id}`);
    }
    handleMenuClose();
  }, [selectedResource, navigate, handleMenuClose]);

  const handleDeleteClick = useCallback(() => {
    if (selectedResource) {
      setResourceToDelete(selectedResource);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  }, [selectedResource, handleMenuClose]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!resourceToDelete) return;

    try {
      await deleteResource(resourceToDelete.id).unwrap();
      enqueueSnackbar('Resource deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
    } catch (error) {
      enqueueSnackbar('Failed to delete resource', { variant: 'error' });
    }
  }, [resourceToDelete, deleteResource, enqueueSnackbar]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setResourceToDelete(null);
  }, []);

  const handleAddResource = useCallback(() => {
    navigate('/wellbeing/resources/add');
  }, [navigate]);

  const handleExportFeedbacks = useCallback(() => {
    if (!resourcesData?.data) {
      enqueueSnackbar('No data available to export', { variant: 'warning' });
      return;
    }

    try {
      // Filter resources that have feedbacks
      const resourcesWithFeedbacks = resourcesData.data.filter(resource => 
        resource.feedbacks && resource.feedbacks.length > 0
      );

      if (resourcesWithFeedbacks.length === 0) {
        enqueueSnackbar('No feedback data available to export', { variant: 'info' });
        return;
      }

      // Export to CSV
      const csvContent = exportFeedbacksToCSV(resourcesWithFeedbacks);
      const filename = generateFilename('wellbeing_feedbacks');
      downloadCSV(csvContent, filename);

      enqueueSnackbar(`Feedback report exported successfully as ${filename}`, { variant: 'success' });
    } catch (error) {
      console.error('Export error:', error);
      enqueueSnackbar('Failed to export feedback report', { variant: 'error' });
    }
  }, [resourcesData, enqueueSnackbar]);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // Format date helper
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load resources. Please try again.
        </Alert>
      </Box>
    );
  }

  const resources = resourcesData?.data || [];
  const totalCount = resourcesData?.total || 0;

  return (
    <ThemedBox p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <ThemedTypography variant="h4">
          Wellbeing Resources Management
        </ThemedTypography>
        <Box display="flex" gap={2}>
          <ThemedButton
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportFeedbacks}
            sx={{ minWidth: 180 }}
          >
            Export Feedbacks
          </ThemedButton>
          <ThemedButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddResource}
            sx={{ minWidth: 150 }}
          >
            Add Resource
          </ThemedButton>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box mb={3}>
        <ThemedTextField
          fullWidth
          placeholder="Search resources by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Resources Table */}
      <ThemedPaper elevation={1}>
        <ThemedTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Created By</TableCell>
                {/* <TableCell align="center">Actions</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {resources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <ThemedTypography variant="body1" color="text.secondary">
                      No resources found
                    </ThemedTypography>
                  </TableCell>
                </TableRow>
              ) : (
                resources.map((resource) => (
                  <TableRow key={resource.id} hover>
                    <TableCell>
                      <Box>
                        <ThemedTypography variant="subtitle2" fontWeight="medium">
                          {resource.resource_name}
                        </ThemedTypography>
                        <ThemedTypography variant="body2" color="text.secondary" noWrap>
                          {resource.description}
                        </ThemedTypography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={resource.isActive}
                            onChange={() => handleToggleActive(resource)}
                            disabled={isToggling}
                            size="small"
                          />
                        }
                        label={
                          <Chip
                            label={resource.isActive ? 'Active' : 'Inactive'}
                            color={resource.isActive ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        }
                        labelPlacement="end"
                      />
                    </TableCell>
                    <TableCell>
                      <ThemedTypography variant="body2">
                        {formatDate(resource.createdAt)}
                      </ThemedTypography>
                    </TableCell>
                    <TableCell>
                      <ThemedTypography variant="body2">
                        {resource.createdByName}
                      </ThemedTypography>
                    </TableCell>
                    {/* <TableCell align="center">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, resource)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell> */}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ThemedTableContainer>

        {/* Pagination */}
        {totalCount > 0 && (
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <ThemedTypography variant="body2" color="text.secondary">
              Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount} resources
            </ThemedTypography>
            <Box display="flex" alignItems="center" gap={2}>
              <ThemedTypography variant="body2">Rows per page:</ThemedTypography>
              <ThemedTextField
                select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                size="small"
                sx={{ minWidth: 80 }}
              >
                {[5, 10, 25, 50].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </ThemedTextField>
              <Box display="flex" gap={1}>
                <ThemedButton
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  size="small"
                >
                  Previous
                </ThemedButton>
                <ThemedButton
                  disabled={(page + 1) * rowsPerPage >= totalCount}
                  onClick={() => setPage(page + 1)}
                  size="small"
                >
                  Next
                </ThemedButton>
              </Box>
            </Box>
          </Box>
        )}
      </ThemedPaper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        {/* <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem> */}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Resource</DialogTitle>
        <DialogContent>
          <ThemedTypography>
            Are you sure you want to delete "{resourceToDelete?.resource_name}"? This action cannot be undone.
          </ThemedTypography>
        </DialogContent>
        <DialogActions>
          <ThemedButton onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </ThemedButton>
          <ThemedButton
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </ThemedButton>
        </DialogActions>
      </Dialog>
    </ThemedBox>
  );
};

export default AdminResourcesPage;
