import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { showMessage } from 'app/store/fuse/messageSlice';
import { 
  useGetLearnerResourcesQuery, 
  useTrackResourceOpenMutation,
  WellbeingResource 
} from 'app/store/api/resourcesApi';

// Styled components
const StyledContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: '0 auto',
  width: '100%',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.paper,
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '& .MuiTableCell-head': {
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

interface ResourceTypeChipProps {
  resourceType: 'FILE' | 'URL';
}

const ResourceTypeChip = styled(Chip)<ResourceTypeChipProps>(({ theme, resourceType }) => ({
  backgroundColor: resourceType === 'FILE' 
    ? theme.palette.primary.light 
    : theme.palette.secondary.light,
  color: resourceType === 'FILE' 
    ? theme.palette.primary.contrastText 
    : theme.palette.secondary.contrastText,
  fontWeight: 600,
  fontSize: '0.75rem',
}));

const LearnerWellbeingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // API hooks
  const { 
    data: resourcesResponse, 
    isLoading, 
    error, 
    refetch 
  } = useGetLearnerResourcesQuery();

  const [trackResourceOpen, { isLoading: isTracking }] = useTrackResourceOpenMutation();

  const resources = resourcesResponse?.data || [];

  // Handle resource opening/downloading
  const handleResourceAction = async (resource: WellbeingResource) => {
    try {
      // Track resource opening
      await trackResourceOpen(resource.id).unwrap();
      
      if (resource.resourceType === 'FILE') {
        // For files, open in new tab
        window.open(resource.content, '_blank');
      } else if (resource.resourceType === 'URL') {
        // For URLs, open external link
        window.open(resource.content, '_blank');
      }
    } catch (error) {
      console.error('Error tracking resource:', error);
      dispatch(showMessage({ 
        message: 'Failed to track resource access', 
        variant: 'error' 
      }));
    }
  };

  // Handle view details navigation
  const handleViewDetails = (resourceId: string) => {
    navigate(`/learner/resources/${resourceId}`);
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  // Get paginated data
  const paginatedResources = resources.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Loading state
  if (isLoading) {
    return (
      <StyledContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </StyledContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <StyledContainer>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Failed to load learner resources. Please try again.
        </Alert>
      </StyledContainer>
    );
  }

  // Empty state
  if (!resources || resources.length === 0) {
    return (
      <StyledContainer>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="400px"
          textAlign="center"
        >
          <FuseSvgIcon size={64} color="disabled">
            heroicons-outline:document-text
          </FuseSvgIcon>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            No resources available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for new wellbeing resources
          </Typography>
        </Box>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Learner Wellbeing Resources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access your wellbeing resources and track your progress
        </Typography>
      </Box>

      <StyledTableContainer>
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell>Resource Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Last Opened</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {paginatedResources.map((resource) => (
              <StyledTableRow key={resource.id}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {resource.resource_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      maxWidth: 300,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {resource.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <ResourceTypeChip 
                    label={resource.resourceType} 
                    size="small"
                    resourceType={resource.resourceType}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(resource.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {resource.lastOpenedDate ? formatDate(resource.lastOpenedDate) : 'Never'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" gap={1} justifyContent="center">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleResourceAction(resource)}
                      disabled={isTracking}
                      startIcon={
                        resource.resourceType === 'FILE' 
                          ? <FuseSvgIcon size={16}>heroicons-outline:download</FuseSvgIcon>
                          : <FuseSvgIcon size={16}>heroicons-outline:external-link</FuseSvgIcon>
                      }
                    >
                      {resource.resourceType === 'FILE' ? 'Open / Download' : 'Visit Link'}
                    </Button>
                    
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(resource.id)}
                        color="primary"
                      >
                        <FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={resources.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </StyledContainer>
  );
};

export default LearnerWellbeingPage;
