import FuseLoading from '@fuse/core/FuseLoading'
import Close from '@mui/icons-material/Close'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import { useGetAwaitingSignatureListQuery } from 'app/store/api/awaiting-signature-api'
import { selectGlobalUser } from 'app/store/globalUser'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import CustomPagination from 'src/app/component/Pagination/CustomPagination'
import jsonData from 'src/url.json'
import { downloadCSV, generateFilename } from 'src/utils/csvExport'

interface FilterState {
  trainer: string
  course: string
  learner: string
}

const URL_BASE_LINK = jsonData.API_LOCAL_URL

const Index = () => {
  const { pagination } = useSelector(selectGlobalUser)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [trainers, setTrainers] = useState<
    Array<{ id: string; name: string }>
  >([])
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>(
    []
  )
  const [filters, setFilters] = useState<FilterState>({
    trainer: '',
    course: '',
    learner: '',
  })

  // Fetch trainers
  const fetchTrainers = async () => {
    try {
      const response = await axios.get(
        `${URL_BASE_LINK}/user/list?role=Trainer`
      )
      const trainerList = response.data.data.map((user: any) => ({
        id: user.user_id.toString(),
        name: user.user_name || `${user.first_name} ${user.last_name}`.trim(),
      }))
      setTrainers(trainerList)
    } catch (error) {
      console.error('Error fetching trainers:', error)
      setTrainers([])
    }
  }

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${URL_BASE_LINK}/course/list`)
      const courseList = response.data.data.map((course: any) => ({
        id: course.course_id.toString(),
        name: course.course_name,
      }))
      setCourses(courseList)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses([])
    }
  }

  // useEffect hooks
  useEffect(() => {
    fetchTrainers()
    fetchCourses()
  }, [])

  // API queries - Currently using static data for testing
  const {
    data: awaitingSignatureData,
    isLoading,
    error,
    refetch,
  } = useGetAwaitingSignatureListQuery({
    page: currentPage,
    limit: pagination?.page_size || 10,
    search: searchKeyword,
    trainer_id: filters.trainer,
    course_id: filters.course,
    learner_id: filters.learner,
  });

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setCurrentPage(1)
      refetch()
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value)
  }

  const clearSearch = () => {
    setSearchKeyword('')
    setCurrentPage(1)
    refetch()
  }

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const applyFilters = () => {
    setCurrentPage(1)
    refetch()
  }

  const clearFilters = () => {
    setFilters({
      trainer: '',
      course: '',
      learner: '',
    })
    setCurrentPage(1)
    refetch()
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getSignatureStatus = (signature: any) => {
    if (!signature) return '-'
    const received = signature.received_at
      ? `R: ${formatDate(signature.received_at)}`
      : ''
    const signed = signature.signed_at
      ? `S: ${formatDate(signature.signed_at)}`
      : ''
    return signed ? `${received} ${signed}` : received || '-'
  }

  const isSignaturePending = (signature: any) => {
    return signature && signature.received_at && !signature.signed_at
  }

  const exportToCSV = () => {
    // Define CSV headers
    const headers = [
      'Learner Name',
      'Course Name',
      'Course Code',
      'Employer Name',
      'Trainer Name',
      'File Type',
      'File Name',
      'File Description',
      'Upload Date',
      'Trainer Received',
      'Trainer Signed',
      'Learner Received',
      'Learner Signed',
      'Employer Received',
      'Employer Signed',
      'IQA Received',
      'IQA Signed',
    ]

    // Convert data to CSV rows
    const csvRows = data.map((row: any) => {
      return [
        `"${row.learner?.name || '-'}"`,
        `"${row.course?.name || '-'}"`,
        `"${row.course?.code || '-'}"`,
        `"${row.employer_name || '-'}"`,
        `"${row.trainer_name || '-'}"`,
        `"${row.file_type || '-'}"`,
        `"${row.file_name || '-'}"`,
        `"${row.file_description || '-'}"`,
        `"${formatDate(row.uploaded_at)}"`,
        `"${
          row.signatures?.Trainer?.received_at
            ? formatDate(row.signatures.Trainer.received_at)
            : '-'
        }"`,
        `"${
          row.signatures?.Trainer?.signed_at
            ? formatDate(row.signatures.Trainer.signed_at)
            : '-'
        }"`,
        `"${
          row.signatures?.Learner?.received_at
            ? formatDate(row.signatures.Learner.received_at)
            : '-'
        }"`,
        `"${
          row.signatures?.Learner?.signed_at
            ? formatDate(row.signatures.Learner.signed_at)
            : '-'
        }"`,
        `"${
          row.signatures?.Employer?.received_at
            ? formatDate(row.signatures.Employer.received_at)
            : '-'
        }"`,
        `"${
          row.signatures?.Employer?.signed_at
            ? formatDate(row.signatures.Employer.signed_at)
            : '-'
        }"`,
        `"${
          row.signatures?.IQA?.received_at
            ? formatDate(row.signatures.IQA.received_at)
            : '-'
        }"`,
        `"${
          row.signatures?.IQA?.signed_at
            ? formatDate(row.signatures.IQA.signed_at)
            : '-'
        }"`,
      ].join(',')
    })

    // Create CSV content
    const csvContent = [headers.join(','), ...csvRows].join('\n')

    // Generate filename with timestamp
    const filename = generateFilename('awaiting_signature')

    // Download CSV file
    downloadCSV(csvContent, filename)
  }

  if (isLoading) {
    return <FuseLoading />
  }

  const data = awaitingSignatureData?.data || []
  const metaData = awaitingSignatureData?.meta_data || {
    page: 1,
    pages: 1,
    items: 0,
  }

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
              Files and documents awaiting signatures from Trainer and learners.
            </Typography>

            {/* Filter Section */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
              <Grid container spacing={2} alignItems='center'>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Filter by Trainer</InputLabel>
                    <Select
                      value={filters.trainer}
                      label='Filter by Trainer'
                      onChange={(e) =>
                        handleFilterChange('trainer', e.target.value)
                      }
                    >
                      <MenuItem value=''>All</MenuItem>
                      {trainers.map((trainer) => (
                        <MenuItem key={trainer.id} value={trainer.id}>
                          {trainer.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Filter by Course</InputLabel>
                    <Select
                      value={filters.course}
                      label='Filter by Course'
                      onChange={(e) =>
                        handleFilterChange('course', e.target.value)
                      }
                    >
                      <MenuItem value=''>All</MenuItem>
                      {courses.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                          {course.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={12} md={3}>
                  <TextField
                    fullWidth
                    size='small'
                    label='Filter by Learner'
                    value={filters.learner}
                    onChange={(e) =>
                      handleFilterChange('learner', e.target.value)
                    }
                    placeholder='Enter learner name'
                  />
                </Grid>
              </Grid>
              <div className='flex items-end justify-end w-full gap-16 mt-16 flex-wrap'>
                <Button
                  variant='contained'
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
                <Button
                  variant='outlined'
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

                <Button
                  variant='contained'
                  onClick={exportToCSV}
                  startIcon={<FileDownloadIcon />}
                  disabled={!data || data.length === 0}
                  sx={{
                    backgroundColor: '#2196f3',
                    '&:hover': {
                      backgroundColor: '#1976d2',
                    },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1.2,
                  }}
                >
                  Export CSV
                </Button>
              </div>
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
                border: '1px solid #e0e0e0',
              }}
            >
              <Table
                sx={{ minWidth: 650 }}
                aria-label='awaiting signature table'
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Learner Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Course Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Employer Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Trainer Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      File Type
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      File Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      File Description
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Date File was uploaded
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Trainer Signed
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Learner Signed
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Employer Signed
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      IQA Signed
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
                          '&:hover': { backgroundColor: '#f8f9fa' },
                        }}
                      >
                        <TableCell
                          component='th'
                          scope='row'
                          sx={{
                            fontWeight: 500,
                            color: '#2c3e50',
                          }}
                        >
                          {row.learner?.name || '-'}
                        </TableCell>
                        <TableCell>{row.course?.name || '-'}</TableCell>
                        <TableCell>{row.employer_name || '-'}</TableCell>
                        <TableCell>{row.trainer_name || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.file_type}
                            size='small'
                            color={
                              row.file_type === 'Evidence'
                                ? 'primary'
                                : 'secondary'
                            }
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            maxWidth: '200px',
                            wordWrap: 'break-word',
                          }}
                        >
                          {row.file_name || '-'}
                        </TableCell>
                        <TableCell
                          sx={{
                            maxWidth: '200px',
                            wordWrap: 'break-word',
                          }}
                        >
                          {row.file_description || '-'}
                        </TableCell>
                        <TableCell>{formatDate(row.uploaded_at)}</TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              color: isSignaturePending(row.signatures?.Trainer)
                                ? '#e74c3c'
                                : 'inherit',
                            }}
                          >
                            {getSignatureStatus(row.signatures?.Trainer)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              color: isSignaturePending(row.signatures?.Learner)
                                ? '#e74c3c'
                                : 'inherit',
                            }}
                          >
                            {getSignatureStatus(row.signatures?.Learner)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              color: isSignaturePending(
                                row.signatures?.Employer
                              )
                                ? '#e74c3c'
                                : 'inherit',
                            }}
                          >
                            {getSignatureStatus(row.signatures?.Employer)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              color: isSignaturePending(row.signatures?.IQA)
                                ? '#e74c3c'
                                : 'inherit',
                            }}
                          >
                            {getSignatureStatus(row.signatures?.IQA)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={13} align='center' sx={{ py: 8 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <Typography variant='h6' color='text.secondary'>
                            No files awaiting signature
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            No files match the current filters.
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
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                }}
              >
                <Typography variant='body2' color='text.secondary'>
                  Total active tabs: <strong>{data.length}</strong>
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Files with pending signatures:{' '}
                  <strong>
                    {
                      data.filter(
                        (row: any) =>
                          isSignaturePending(row.signatures?.Trainer) ||
                          isSignaturePending(row.signatures?.Learner) ||
                          isSignaturePending(row.signatures?.Employer) ||
                          isSignaturePending(row.signatures?.IQA)
                      ).length
                    }
                  </strong>
                </Typography>
              </Box>
            )}
          </div>
        </div>
      </Card>
    </Grid>
  )
}

export default Index
