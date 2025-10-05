import React, { useEffect, useState } from 'react'
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
  Button,
  Stack,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  TableSortLabel,
  Pagination,
  SelectChangeEvent,
  Autocomplete,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import Close from '@mui/icons-material/Close'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import GetAppIcon from '@mui/icons-material/GetApp'
import HelpIcon from '@mui/icons-material/Help'
import { useSelector } from 'react-redux'
import { selectGlobalUser } from 'app/store/globalUser'
import FuseLoading from '@fuse/core/FuseLoading'
import { useGetGatewayReportListQuery } from 'app/store/api/gateway-report-api'
import axios from 'axios'
import jsonData from 'src/url.json'
const URL_BASE_LINK = jsonData.API_LOCAL_URL

interface FilterState {
  assessor: string
}

interface AssessorOption {
  id: string
  name: string
}

interface GatewayData {
  learner_first_name: string
  learner_last_name: string
  gateway_name: string
  gateway_created_date: string
  gateway_start_date: string
  gateway_end_date: string
  gateway_checklist_progress: number
  date_assessor_signed_off: string
  assessor_name_signed_off: string
  date_employer_signed_off: string
  employer_name_signed_off: string
  date_learner_signed_off: string
  date_checklist_signed_off: string
}

const GatewayReport = () => {
  const { pagination } = useSelector(selectGlobalUser)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedAssessor, setSelectedAssessor] =
    useState<AssessorOption | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    assessor: '',
  })
  const [sortField, setSortField] = useState<string>('learner_first_name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [assessors, setAssessors] = useState<AssessorOption[]>([])

  // RTK Query API calls
  const {
    data: gatewayReportData,
    isLoading: gatewayReportLoading,
    error: gatewayReportError,
    refetch: refetchGatewayReport,
  } = useGetGatewayReportListQuery({
    page: currentPage,
    limit: pageSize,
    search: searchKeyword,
    assessor_id: filters.assessor,
    sort_field: sortField,
    sort_order: sortOrder,
  })

  // Fetch assessors (Admin role)
  const fetchAssessors = async () => {
    try {
      const response = await axios.get(`${URL_BASE_LINK}/user/list?role=Admin`)
      const assessorList = response.data.data.map((user: any) => ({
        id: user.user_id.toString(),
        name: user.user_name || `${user.first_name} ${user.last_name}`.trim(),
      }))
      setAssessors(assessorList)
    } catch (error) {
      console.error('Error fetching assessors:', error)
      setAssessors([])
    }
  }

  useEffect(() => {
    fetchAssessors()
  }, [])

  // Mock data for demonstration when API fails
  const mockData: GatewayData[] = [
    {
      learner_first_name: 'John',
      learner_last_name: 'Smith',
      gateway_name: 'Level 3 Gateway',
      gateway_created_date: '2024-01-15',
      gateway_start_date: '2024-01-20',
      gateway_end_date: '2024-03-20',
      gateway_checklist_progress: 85,
      date_assessor_signed_off: '2024-03-18',
      assessor_name_signed_off: 'Jane Doe',
      date_employer_signed_off: '2024-03-19',
      employer_name_signed_off: 'ABC Company',
      date_learner_signed_off: '2024-03-20',
      date_checklist_signed_off: '2024-03-20',
    },
    {
      learner_first_name: 'Sarah',
      learner_last_name: 'Johnson',
      gateway_name: 'Level 2 Gateway',
      gateway_created_date: '2024-02-01',
      gateway_start_date: '2024-02-05',
      gateway_end_date: '2024-04-05',
      gateway_checklist_progress: 92,
      date_assessor_signed_off: '2024-04-02',
      assessor_name_signed_off: 'Mike Wilson',
      date_employer_signed_off: '2024-04-03',
      employer_name_signed_off: 'XYZ Corp',
      date_learner_signed_off: '2024-04-04',
      date_checklist_signed_off: '2024-04-04',
    },
    {
      learner_first_name: 'David',
      learner_last_name: 'Brown',
      gateway_name: 'Level 3 Gateway',
      gateway_created_date: '2024-01-10',
      gateway_start_date: '2024-01-15',
      gateway_end_date: '2024-03-15',
      gateway_checklist_progress: 67,
      date_assessor_signed_off: '',
      assessor_name_signed_off: '',
      date_employer_signed_off: '',
      employer_name_signed_off: '',
      date_learner_signed_off: '',
      date_checklist_signed_off: '',
    },
    {
      learner_first_name: 'Emily',
      learner_last_name: 'Davis',
      gateway_name: 'Level 4 Gateway',
      gateway_created_date: '2024-03-01',
      gateway_start_date: '2024-03-05',
      gateway_end_date: '2024-05-05',
      gateway_checklist_progress: 45,
      date_assessor_signed_off: '',
      assessor_name_signed_off: '',
      date_employer_signed_off: '',
      employer_name_signed_off: '',
      date_learner_signed_off: '',
      date_checklist_signed_off: '',
    },
    {
      learner_first_name: 'Michael',
      learner_last_name: 'Wilson',
      gateway_name: 'Level 2 Gateway',
      gateway_created_date: '2024-02-15',
      gateway_start_date: '2024-02-20',
      gateway_end_date: '2024-04-20',
      gateway_checklist_progress: 78,
      date_assessor_signed_off: '2024-04-18',
      assessor_name_signed_off: 'Lisa Anderson',
      date_employer_signed_off: '2024-04-19',
      employer_name_signed_off: 'Tech Solutions Ltd',
      date_learner_signed_off: '',
      date_checklist_signed_off: '',
    },
  ]

  // Use API data or fallback to mock data
  const gatewayData = gatewayReportData?.data || mockData
  const totalItems = gatewayReportData?.meta_data?.items || mockData.length
  const totalPages = gatewayReportData?.meta_data?.pages || 1
  const loading = gatewayReportLoading

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setCurrentPage(1)
      refetchGatewayReport()
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value)
  }

  const clearSearch = () => {
    setSearchKeyword('')
    setCurrentPage(1)
    refetchGatewayReport()
  }

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const applyFilters = () => {
    setCurrentPage(1)
    refetchGatewayReport()
  }

  const clearFilters = () => {
    setFilters({
      assessor: '',
    })
    setSelectedAssessor(null)
    setCurrentPage(1)
    refetchGatewayReport()
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setPageSize(event.target.value as number)
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
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

  const exportToExcel = () => {
    // Implement Excel export functionality
    const headers = [
      'Learner First Name',
      'Learner Last Name',
      'Gateway Name',
      'Gateway Created Date',
      'Gateway Start Date',
      'Gateway End Date',
      'Gateway Checklist Progress %',
      'Date Assessor Signed Off',
      'Assessor Name Signed Off',
      'Date Employer Signed Off',
      'Employer Name Signed Off',
      'Date Learner Signed Off',
      'Date Checklist Signed Off',
    ]

    const csvContent = [
      headers.join(','),
      ...gatewayData.map((row) =>
        [
          row.learner_first_name,
          row.learner_last_name,
          row.gateway_name,
          formatDate(row.gateway_created_date),
          formatDate(row.gateway_start_date),
          formatDate(row.gateway_end_date),
          row.gateway_checklist_progress,
          formatDate(row.date_assessor_signed_off),
          row.assessor_name_signed_off || '',
          formatDate(row.date_employer_signed_off),
          row.employer_name_signed_off || '',
          formatDate(row.date_learner_signed_off),
          formatDate(row.date_checklist_signed_off),
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `gateway-report-${new Date().toISOString().split('T')[0]}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const showHelp = () => {
    alert(
      'Gateway Report Help:\n\n' +
        '• Use the search box to filter by learner name\n' +
        '• Type in the assessor field to search and select an assessor\n' +
        '• Clear and Filter buttons are enabled only when an assessor is selected\n' +
        '• Use the "Show entries" dropdown to change the number of rows displayed\n' +
        '• Click on column headers to sort the data\n' +
        '• Use the Export to Excel button to download the current view as CSV\n' +
        '• The progress bar shows completion percentage for each gateway'
    )
  }

  if (loading) {
    return <FuseLoading />
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

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
              Gateway Report
            </Typography>

            {/* Filter Section */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
              <Grid container spacing={2} alignItems='center'>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography
                    variant='subtitle2'
                    sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}
                  >
                    Select Admin
                  </Typography>
                  <Autocomplete
                    options={assessors}
                    getOptionLabel={(option) => option.name}
                    value={selectedAssessor}
                    onChange={(event, newValue) => {
                      setSelectedAssessor(newValue)
                      handleFilterChange('assessor', newValue?.id || '')
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value?.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size='small'
                        placeholder='Use this text box to search for an Admin'
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          },
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component='li' {...props}>
                        {option.name}
                      </Box>
                    )}
                    noOptionsText='No admins found'
                    clearOnEscape
                    clearOnBlur={false}
                    selectOnFocus
                    handleHomeEndKeys
                  />
                </Grid>

                <Grid item xs={12} sm={12} md={8}>
                  <Stack
                    direction='row'
                    spacing={2}
                    justifyContent='flex-end'
                    sx={{ mt: 2 }}
                  >
                    <Button
                      variant='outlined'
                      onClick={clearFilters}
                      startIcon={<ClearIcon />}
                      disabled={!selectedAssessor && filters.assessor === ''}
                      sx={{
                        backgroundColor:
                          selectedAssessor || filters.assessor
                            ? '#ff9800'
                            : '#e0e0e0',
                        color:
                          selectedAssessor || filters.assessor
                            ? 'white'
                            : '#9e9e9e',
                        borderColor:
                          selectedAssessor || filters.assessor
                            ? '#ff9800'
                            : '#e0e0e0',
                        '&:hover': {
                          backgroundColor:
                            selectedAssessor || filters.assessor
                              ? '#f57c00'
                              : '#e0e0e0',
                          borderColor:
                            selectedAssessor || filters.assessor
                              ? '#f57c00'
                              : '#e0e0e0',
                        },
                        '&:disabled': {
                          backgroundColor: '#e0e0e0',
                          color: '#9e9e9e',
                          borderColor: '#e0e0e0',
                        },
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1.2,
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      variant='contained'
                      onClick={applyFilters}
                      startIcon={<FilterListIcon />}
                      disabled={!selectedAssessor && filters.assessor === ''}
                      sx={{
                        backgroundColor:
                          selectedAssessor || filters.assessor
                            ? '#e91e63'
                            : '#e0e0e0',
                        '&:hover': {
                          backgroundColor:
                            selectedAssessor || filters.assessor
                              ? '#c2185b'
                              : '#e0e0e0',
                        },
                        '&:disabled': {
                          backgroundColor: '#e0e0e0',
                          color: '#9e9e9e',
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
                      variant='contained'
                      onClick={exportToExcel}
                      startIcon={<GetAppIcon />}
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
                      Export to Excel
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Table Controls */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  Show
                </Typography>
                <FormControl size='small' sx={{ minWidth: 80 }}>
                  <Select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    sx={{ borderRadius: '8px' }}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant='body2' color='text.secondary'>
                  entries
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  Search:
                </Typography>
                <TextField
                  size='small'
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearch}
                  sx={{
                    minWidth: 200,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
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
                            onClick={() => refetchGatewayReport()}
                            size='small'
                          >
                            <SearchIcon fontSize='small' />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            {/* Table Section */}
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0',
              }}
            >
              <Table sx={{ minWidth: 1200 }} aria-label='gateway report table'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      <TableSortLabel
                        active={sortField === 'learner_first_name'}
                        direction={
                          sortField === 'learner_first_name' ? sortOrder : 'asc'
                        }
                        onClick={() => handleSort('learner_first_name')}
                      >
                        Learner First Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      <TableSortLabel
                        active={sortField === 'learner_last_name'}
                        direction={
                          sortField === 'learner_last_name' ? sortOrder : 'asc'
                        }
                        onClick={() => handleSort('learner_last_name')}
                      >
                        Learner Last Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Gateway Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Gateway Created Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Gateway Start Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Gateway End Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Gateway Checklist Progress %
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Date Assessor Signed Off
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Assessor Name Signed Off
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Date Employer Signed Off
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Employer Name Signed Off
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Date Learner Signed Off
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Date Checklist Signed Off
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gatewayData?.length > 0 ? (
                    gatewayData.map((row: GatewayData, index: number) => (
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
                          {row.learner_first_name}
                        </TableCell>
                        <TableCell>{row.learner_last_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.gateway_name}
                            size='small'
                            color='primary'
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell>
                          {formatDate(row.gateway_created_date)}
                        </TableCell>
                        <TableCell>
                          {formatDate(row.gateway_start_date)}
                        </TableCell>
                        <TableCell>
                          {formatDate(row.gateway_end_date)}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: '100%',
                                height: 8,
                                backgroundColor: '#e0e0e0',
                                borderRadius: 4,
                                overflow: 'hidden',
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${row.gateway_checklist_progress}%`,
                                  height: '100%',
                                  backgroundColor:
                                    row.gateway_checklist_progress >= 80
                                      ? '#4caf50'
                                      : row.gateway_checklist_progress >= 60
                                      ? '#ff9800'
                                      : '#f44336',
                                  transition: 'width 0.3s ease',
                                }}
                              />
                            </Box>
                            <Typography
                              variant='body2'
                              sx={{ minWidth: 35, fontWeight: 600 }}
                            >
                              {row.gateway_checklist_progress}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {formatDate(row.date_assessor_signed_off)}
                        </TableCell>
                        <TableCell>
                          {row.assessor_name_signed_off || '-'}
                        </TableCell>
                        <TableCell>
                          {formatDate(row.date_employer_signed_off)}
                        </TableCell>
                        <TableCell>
                          {row.employer_name_signed_off || '-'}
                        </TableCell>
                        <TableCell>
                          {formatDate(row.date_learner_signed_off)}
                        </TableCell>
                        <TableCell>
                          {formatDate(row.date_checklist_signed_off)}
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
                            No data available in table
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            No gateway records found matching the current
                            filters.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Section */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 3,
              }}
            >
              <Typography variant='body2' color='text.secondary'>
                Showing {startItem} to {endItem} of {totalItems} entries
              </Typography>

              <Stack direction='row' spacing={1} alignItems='center'>
                <Button
                  variant='contained'
                  onClick={() => handleChangePage(null, currentPage - 1)}
                  disabled={currentPage === 1}
                  sx={{
                    backgroundColor: '#e91e63',
                    '&:hover': {
                      backgroundColor: '#c2185b',
                    },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                  }}
                >
                  Previous
                </Button>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handleChangePage}
                  color='primary'
                  shape='rounded'
                  size='small'
                />
                <Button
                  variant='contained'
                  onClick={() => handleChangePage(null, currentPage + 1)}
                  disabled={currentPage === totalPages}
                  sx={{
                    backgroundColor: '#e91e63',
                    '&:hover': {
                      backgroundColor: '#c2185b',
                    },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                  }}
                >
                  Next
                </Button>

                {/* Help Button */}
                <IconButton
                  onClick={showHelp}
                  sx={{
                    backgroundColor: '#e91e63',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#c2185b',
                    },
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    ml: 2,
                  }}
                >
                  <HelpIcon />
                </IconButton>
              </Stack>
            </Box>
          </div>
        </div>
      </Card>
    </Grid>
  )
}

export default GatewayReport
