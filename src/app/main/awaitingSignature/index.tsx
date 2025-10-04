import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Autocomplete,
  Button,
  Stack,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Close from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useSelector } from 'react-redux';
import { selectGlobalUser } from 'app/store/globalUser';
import {
  useGetAwaitingSignatureListQuery,
} from 'app/store/api/awaiting-signature-api';
import FuseLoading from '@fuse/core/FuseLoading';
import CustomPagination from 'src/app/component/Pagination/CustomPagination';
import Breadcrumb from 'src/app/component/Breadcrumbs';
import { AdminRedirect } from 'src/app/contanst';
import axios from 'axios';
import jsonData from 'src/url.json';

interface FilterState {
  assessor: string;
  course: string;
  learner: string;
  fileType: string;
}

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

const Index = () => {
  const { pagination } = useSelector(selectGlobalUser);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [assessors, setAssessors] = useState<Array<{ id: string; name: string }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);
  const [fileTypes, setFileTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [filters, setFilters] = useState<FilterState>({
    assessor: '',
    course: '',
    learner: '',
    fileType: '',
  });

  // Fetch assessors (Trainer role)
  const fetchAssessors = async () => {
    try {
      const response = await axios.get(`${URL_BASE_LINK}/user/list?role=Trainer`);
      const assessorList = response.data.data.map((user: any) => ({
        id: user.user_id.toString(),
        name: user.user_name || `${user.first_name} ${user.last_name}`.trim()
      }));
      setAssessors(assessorList);
    } catch (error) {
      console.error('Error fetching assessors:', error);
      setAssessors([]);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${URL_BASE_LINK}/course/list`);
      const courseList = response.data.data.map((course: any) => ({
        id: course.course_id.toString(),
        name: course.course_name
      }));
      setCourses(courseList);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  // Fetch file types
  const fetchFileTypes = async () => {
    try {
      const response = await axios.get(`${URL_BASE_LINK}/awaiting-signature/file-types`);
      const fileTypeList = response.data.data.map((fileType: any) => ({
        id: fileType.id.toString(),
        name: fileType.name
      }));
      setFileTypes(fileTypeList);
    } catch (error) {
      console.error('Error fetching file types:', error);
      setFileTypes([]);
    }
  };

  // useEffect hooks
  useEffect(() => {
    fetchAssessors();
    fetchCourses();
    fetchFileTypes();
  }, []);

  // API queries
  const {
    data: awaitingSignatureData,
    isLoading,
    error,
    refetch,
  } = useGetAwaitingSignatureListQuery({
    page: currentPage,
    limit: pagination?.page_size || 10,
    search: searchKeyword,
    assessor_id: filters.assessor,
    course_id: filters.course,
    learner_name: filters.learner,
    file_type: filters.fileType,
  });

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      refetch();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const clearSearch = () => {
    setSearchKeyword('');
    setCurrentPage(1);
    refetch();
  };

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    refetch();
  };

  const clearFilters = () => {
    setFilters({
      assessor: '',
      course: '',
      learner: '',
      fileType: '',
    });
    setCurrentPage(1);
    refetch();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSignatureStatus = (receivedDate: string, signedDate: string) => {
    if (!receivedDate) return '-';
    const received = receivedDate ? `R: ${formatDate(receivedDate)}` : '';
    const signed = signedDate ? `S: ${formatDate(signedDate)}` : '';
    return signed ? `${received} ${signed}` : received;
  };

  const isSignaturePending = (receivedDate: string, signedDate: string) => {
    return receivedDate && !signedDate;
  };

  if (isLoading) {
    return <FuseLoading />;
  }

  const data = awaitingSignatureData?.data || [];
  const metaData = awaitingSignatureData?.meta_data || { page: 1, pages: 1, items: 0 };

  return (
    <Grid>
      <Card className='m-12 rounded-6'>
        <div className='w-full h-full'>
          {/* Header Section */}
          <div className='p-24'>
            <Typography 
              variant='h4' 
              className='font-600 mb-8'
              sx={{ color: '#2c3e50' }}
            >
              Awaiting Signature
            </Typography>
            <Typography 
              variant='body1' 
              className='mb-24'
              sx={{ color: '#7f8c8d' }}
            >
              Files and documents awaiting signatures from assessors and learners.
            </Typography>

            {/* Filter Section */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter by Assessor</InputLabel>
                    <Select
                      value={filters.assessor}
                      label="Filter by Assessor"
                      onChange={(e) => handleFilterChange('assessor', e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {assessors.map((assessor) => (
                        <MenuItem key={assessor.id} value={assessor.id}>
                          {assessor.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter by Course</InputLabel>
                    <Select
                      value={filters.course}
                      label="Filter by Course"
                      onChange={(e) => handleFilterChange('course', e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {courses.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                          {course.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Filter by Learner"
                    value={filters.learner}
                    onChange={(e) => handleFilterChange('learner', e.target.value)}
                    placeholder="Enter learner name"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter by File Type</InputLabel>
                    <Select
                      value={filters.fileType}
                      label="Filter by File Type"
                      onChange={(e) => handleFilterChange('fileType', e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {fileTypes.map((fileType) => (
                        <MenuItem key={fileType.id} value={fileType.id}>
                          {fileType.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    onClick={applyFilters}
                    startIcon={<FilterListIcon />}
                    sx={{
                      backgroundColor: '#e91e63',
                      '&:hover': {
                        backgroundColor: '#c2185b',
                      },
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      py: 1.2,
                    }}
                  >
                    Filter
                  </Button>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      py: 1.2,
                    }}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Search Section */}
            <div className='mb-24'>
              <TextField
                label='Search'
                fullWidth
                size='small'
                value={searchKeyword}
                onChange={handleSearchChange}
                onKeyDown={handleSearch}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      {searchKeyword ? (
                        <Close
                          onClick={clearSearch}
                          sx={{
                            color: '#5B718F',
                            fontSize: 18,
                            cursor: 'pointer',
                          }}
                        />
                      ) : (
                        <IconButton
                          disableRipple
                          sx={{ color: '#5B718F' }}
                          onClick={() => refetch()}
                          size='small'
                        >
                          <SearchIcon fontSize='small' />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />
            </div>

            {/* Table Section */}
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
              }}
            >
              <Table sx={{ minWidth: 650 }} aria-label="awaiting signature table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      Learner Name
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      Course Name
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      Employer Name
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      Assessor Name
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      Secondary Assessor Name
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      File Type
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      File Name
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      File Description
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      Date File was uploaded
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      Assessor Signed
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      Secondary Assessor Signed
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6'
                      }}
                    >
                      Learner Signed
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.length > 0 ? (
                    data.map((row: any, index: number) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { backgroundColor: '#f8f9fa' }
                        }}
                      >
                        <TableCell 
                          component="th" 
                          scope="row"
                          sx={{ 
                            fontWeight: 500,
                            color: '#2c3e50'
                          }}
                        >
                          {row.learner_name}
                        </TableCell>
                        <TableCell>{row.course_name}</TableCell>
                        <TableCell>{row.employer_name}</TableCell>
                        <TableCell>{row.assessor_name}</TableCell>
                        <TableCell>{row.secondary_assessor_name || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.file_type}
                            size="small"
                            color={row.file_type === 'Evidence' ? 'primary' : 'secondary'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            maxWidth: '200px',
                            wordWrap: 'break-word'
                          }}
                        >
                          {row.file_name}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            maxWidth: '200px',
                            wordWrap: 'break-word'
                          }}
                        >
                          {row.file_description}
                        </TableCell>
                        <TableCell>{formatDate(row.upload_date)}</TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              color: isSignaturePending(row.assessor_received_date, row.assessor_signed_date) 
                                ? '#e74c3c' 
                                : 'inherit'
                            }}
                          >
                            {getSignatureStatus(row.assessor_received_date, row.assessor_signed_date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              color: isSignaturePending(row.secondary_assessor_received_date, row.secondary_assessor_signed_date) 
                                ? '#e74c3c' 
                                : 'inherit'
                            }}
                          >
                            {getSignatureStatus(row.secondary_assessor_received_date, row.secondary_assessor_signed_date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              color: isSignaturePending(row.learner_received_date, row.learner_signed_date) 
                                ? '#e74c3c' 
                                : 'inherit'
                            }}
                          >
                            {getSignatureStatus(row.learner_received_date, row.learner_signed_date)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} align="center" sx={{ py: 8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h6" color="text.secondary">
                            No files awaiting signature
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            All files have been signed or no files match the current filters.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Section */}
            {data?.length > 0 && (
              <CustomPagination
                pages={metaData?.pages}
                page={metaData?.page}
                handleChangePage={handleChangePage}
                items={metaData?.items}
              />
            )}

            {/* Summary Section */}
            {data?.length > 0 && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <Typography variant="body2" color="text.secondary">
                  Total files awaiting signature: <strong>{data.length}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Files with pending signatures: <strong>{data.filter((row: any) => 
                    isSignaturePending(row.assessor_received_date, row.assessor_signed_date) ||
                    isSignaturePending(row.secondary_assessor_received_date, row.secondary_assessor_signed_date) ||
                    isSignaturePending(row.learner_received_date, row.learner_signed_date)
                  ).length}</strong>
                </Typography>
              </Box>
            )}
          </div>
        </div>
      </Card>
    </Grid>
  );
};

export default Index;
