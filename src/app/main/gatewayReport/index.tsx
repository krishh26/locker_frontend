import FuseLoading from '@fuse/core/FuseLoading'
import Close from '@mui/icons-material/Close'
import GetAppIcon from '@mui/icons-material/GetApp'
import SearchIcon from '@mui/icons-material/Search'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography
} from '@mui/material'
import { useGetLearnerPlanListQuery } from 'app/store/api/learner-plan-api'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
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
  learner_uln: string
  course_name: string
  trainer_name: string
  session_book_date: string
  gateway_progress: number
  assessor_id?: number | null
}

const GatewayReport = () => {
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

  // RTK Query API call
  const {
    data,
    isLoading,
    isError,
    error,
    refetch: getLearnerPlanList,
  } = useGetLearnerPlanListQuery(
    {
      type: 'Gateway Ready',
      meta: true,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  )

  // Fetch assessors (Admin role)
  const fetchAssessors = async () => {
    try {
      const response = await axios.get(`${URL_BASE_LINK}/user/list?role=Trainer`)
      const assessorList = response.data.data.map((user: any) => ({
        id: user.user_id.toString(),
        name: `${user.first_name} ${user.last_name}`.trim(),
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

  // Transform learner plan data to gateway data format
  const transformLearnerPlanData = (learnerPlanData: any[]): GatewayData[] => {
    const transformedData: GatewayData[] = []
    
    learnerPlanData?.forEach((plan) => {
      // Get course names from the plan
      const courseNames = plan.courses?.map((course: any) => course.course_name).join(', ') || '-'
      
      // Get trainer name from assessor_id (use first_name and last_name)
      let trainerName = '-'
      if (plan.assessor_id) {
        const trainerFirstName = plan.assessor_id.first_name || ''
        const trainerLastName = plan.assessor_id.last_name || ''
        
        if (trainerFirstName || trainerLastName) {
          trainerName = `${trainerFirstName} ${trainerLastName}`.trim()
        } else if (plan.assessor_id.user_name) {
          // Fallback to user_name if first_name and last_name are not available
          trainerName = plan.assessor_id.user_name
        }
      }
      
      plan.learners?.forEach((learner: any) => {
        // Use first_name and last_name directly from learner object
        let firstName = learner.first_name || ''
        let lastName = learner.last_name || ''
        
        // Parse user_name as fallback if first_name and last_name are not available
        if (!firstName && !lastName && learner.user_name) {
          const nameParts = learner.user_name.split('_')
          firstName = nameParts[0] || ''
          lastName = nameParts[1] || ''
        }
        
        transformedData.push({
          learner_first_name: firstName || '-',
          learner_last_name: lastName || '-',
          learner_uln: learner.uln || '-',
          course_name: courseNames,
          trainer_name: trainerName,
          session_book_date: plan.created_at || '',
          gateway_progress: 0, // This would come from actual progress data
          assessor_id: plan.assessor_id?.user_id || null, // Add for filtering
        } as any)
      })
    })
    
    return transformedData
  }

  // Use API data and apply frontend filtering
  const allGatewayData = data?.data ? transformLearnerPlanData(data.data) : []
  
  // Apply frontend filtering
  const filteredData = allGatewayData.filter((row) => {
    // Filter by assessor/trainer
    if (filters.assessor && row.assessor_id !== Number(filters.assessor)) {
      return false
    }
    
    // Filter by search keyword
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      const matchesFirstName = row.learner_first_name.toLowerCase().includes(keyword)
      const matchesLastName = row.learner_last_name.toLowerCase().includes(keyword)
      const matchesULN = row.learner_uln.toLowerCase().includes(keyword)
      const matchesCourseName = row.course_name.toLowerCase().includes(keyword)
      const matchesTrainerName = row.trainer_name.toLowerCase().includes(keyword)
      
      if (!matchesFirstName && !matchesLastName && !matchesULN && !matchesCourseName && !matchesTrainerName) {
        return false
      }
    }
    
    return true
  })
  
  // Apply pagination on filtered data
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const gatewayData = filteredData.slice(startIndex, endIndex)
  
  const totalItems = filteredData.length
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const loading = isLoading

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setCurrentPage(1)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value)
    setCurrentPage(1)
  }

  const clearSearch = () => {
    setSearchKeyword('')
    setCurrentPage(1)
  }

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
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
      'Learner ULN',
      'Course Name',
      'Trainer Name',
      'Session Book Date',
      'Gateway Progress %',
    ]

    const csvContent = [
      headers.join(','),
      ...filteredData.map((row) =>
        [
          row.learner_first_name,
          row.learner_last_name,
          row.learner_uln,
          `"${row.course_name}"`, // Wrap in quotes to handle commas in course names
          row.trainer_name,
          formatDate(row.session_book_date),
          row.gateway_progress,
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
                    Select Trainer
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
                        placeholder='Use this text box to search for a Trainer'
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
                    noOptionsText='No trainers found'
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
              <Table sx={{ minWidth: 1000 }} aria-label='gateway report table'>
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
                      Learner ULN
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
                      Trainer Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Session Book Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#2c3e50',
                        borderBottom: '2px solid #dee2e6',
                      }}
                    >
                      Gateway Progress %
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
                        <TableCell>{row.learner_uln}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.course_name}
                            size='small'
                            color='primary'
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell>{row.trainer_name}</TableCell>
                        <TableCell>
                          {formatDate(row.session_book_date)}
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
                                  width: `${row.gateway_progress}%`,
                                  height: '100%',
                                  backgroundColor:
                                    row.gateway_progress >= 80
                                      ? '#4caf50'
                                      : row.gateway_progress >= 60
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
                              {row.gateway_progress}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align='center' sx={{ py: 8 }}>
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
                {/* <IconButton
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
                </IconButton> */}
              </Stack>
            </Box>
          </div>
        </div>
      </Card>
    </Grid>
  )
}

export default GatewayReport
