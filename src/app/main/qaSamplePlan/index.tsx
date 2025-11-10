import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import jsonData from 'src/url.json'

type AssessmentMethod = {
  code: string
  title: string
}

type SamplePlanRecord = {
  assessor: string
  coAssessor?: string
  risk: 'Low' | 'Medium' | 'High'
  qaApproved: boolean
  learner: string
  employer: string
  unitsSelected: string
  units: Array<{
    code: string
    dueDate?: string
    assessmentMethod?: string
  }>
}

const assessmentMethods: AssessmentMethod[] = [
  { code: 'DO', title: 'Direct Observation' },
  { code: 'WT', title: 'Witness Testimony' },
  { code: 'PE', title: 'Product Evidence' },
  { code: 'QA', title: 'Questioning and Answers' },
  { code: 'PS', title: 'Personal Statement' },
]

const qaStatuses = ['All', 'QA Approved',]

const sampleTypes = [
  'Planned Sample',
  'Random Sample',
  'Targeted Sample',
  'Learner Risk Sample',
]

const plans = [
  {
    id: 'plan-1',
    label: 'TQUK Level 3 Diploma for Residential Childcare - 24/07/12 10:54',
  },
  {
    id: 'plan-2',
    label: 'Residential Childcare QA Sample Plan - Q4 FY24',
  },
  {
    id: 'plan-3',
    label: 'Residential Childcare QA Sample Plan - Q1 FY25',
  },
]

const URL_BASE_LINK = jsonData.API_LOCAL_URL

const rows: SamplePlanRecord[] = [
  {
    assessor: 'Tony Hamshaw',
    coAssessor: 'Kam Hirani',
    risk: 'Low',
    qaApproved: false,
    learner: 'Oluwatomiade Ayovalde Awobiyi',
    employer: 'Care Perspectives Ltd.',
    unitsSelected: 'Units: 2 (2)',
    units: [
      { code: 'Y6179739', dueDate: '07/01/2025', assessmentMethod: 'DO' },
      { code: 'Y6179740' },
    ],
  },
  {
    assessor: 'Tony Hamshaw',
    risk: 'Medium',
    qaApproved: false,
    learner: 'Fatou Ka',
    employer: 'Care Perspectives Ltd.',
    unitsSelected: 'Units: 1 (1)',
    units: [
      { code: 'Y6179739', dueDate: '19/07/2024', assessmentMethod: 'QA' },
    ],
  },
  {
    assessor: 'Tony Hamshaw',
    risk: 'Low',
    qaApproved: false,
    learner: 'Mistura Okuneye',
    employer: 'Laurel Leaf Homes',
    unitsSelected: 'Units: 0 (0)',
    units: [],
  },
  {
    assessor: 'Tony Hamshaw',
    risk: 'High',
    qaApproved: true,
    learner: 'Osama Elhaj',
    employer: 'Sams Home Services Ltd.',
    unitsSelected: 'Units: 2 (2)',
    units: [
      { code: 'Y6179739', dueDate: '22/10/2024', assessmentMethod: 'DO, PE' },
      { code: 'Y6179740', dueDate: '22/10/2024', assessmentMethod: 'QA, OT' },
    ],
  },
  {
    assessor: 'Tony Hamshaw',
    risk: 'Medium',
    qaApproved: false,
    learner: 'Simmi Sodhi',
    employer: 'Care Perspectives Ltd.',
    unitsSelected: 'Units: 3 (3)',
    units: [
      { code: 'Y6179739', dueDate: '22/10/2024', assessmentMethod: 'DO' },
      { code: 'Y6179740', dueDate: '22/10/2024', assessmentMethod: 'PE' },
      { code: 'Unit-03', dueDate: '22/10/2024', assessmentMethod: 'QA' },
    ],
  },
]

const riskPalette: Record<SamplePlanRecord['risk'], 'success' | 'warning' | 'error'> =
  {
    Low: 'success',
    Medium: 'warning',
    High: 'error',
  }

const Index: React.FC = () => {
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([])
  const [selectedMethods, setSelectedMethods] = useState<string[]>(
    assessmentMethods.map((method) => method.code)
  )
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [coursesLoading, setCoursesLoading] = useState<boolean>(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState(qaStatuses[0])
  const [sampleType, setSampleType] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [searchText, setSearchText] = useState<string>('')
  const [onlyIncomplete, setOnlyIncomplete] = useState<boolean>(false)
  const [filterApplied, setFilterApplied] = useState<boolean>(false)
  const [filterError, setFilterError] = useState<string>('')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true)
        const response = await axios.get(
          `${URL_BASE_LINK}/course/list?page=1&limit=500&meta=true`
        )
        const courseList = Array.isArray(response.data?.data)
          ? response.data.data
              .map((course: any) => ({
                id: course?.course_id ? course.course_id.toString() : '',
                name: course?.course_name || 'Untitled Course',
              }))
              .filter((course: { id: string }) => course.id)
          : []
        setCourses(courseList)
        setSelectedCourse((prev) => {
          const isValid =
            prev && courseList.some((course) => course.id === prev)
          if (!isValid) {
            setFilterApplied(false)
            return ''
          }
          return prev
        })
      } catch (error) {
        console.error('Failed to fetch courses:', error)
        setCourses([])
        setSelectedCourse('')
        setFilterApplied(false)
      } finally {
        setCoursesLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const visibleRows = useMemo(() => {
    if (!filterApplied) {
      return []
    }

    if (!searchText.trim()) {
      return rows
    }

    const lowered = searchText.toLowerCase()

    return rows.filter((row) => {
      return (
        row.assessor.toLowerCase().includes(lowered) ||
        row.learner.toLowerCase().includes(lowered) ||
        row.employer.toLowerCase().includes(lowered)
      )
    })
  }, [filterApplied, searchText])

  const toggleMethod = (code: string) => {
    setSelectedMethods((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    )
  }

  const resetFilters = () => {
    setSelectedMethods(assessmentMethods.map((method) => method.code))
    setSelectedCourse('')
    setSelectedPlan('')
    setSelectedStatus(qaStatuses[0])
    setSampleType('')
    setDateFrom('')
    setDateTo('')
    setSearchText('')
    setOnlyIncomplete(false)
    setFilterApplied(false)
    setFilterError('')
  }

  const handleApplyFilter = () => {
    if (!selectedCourse || !selectedPlan) {
      setFilterError('Please select both a course and a plan before filtering.')
      setFilterApplied(false)
      return
    }
    setFilterError('')
    setFilterApplied(true)
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '100%', margin: '0 auto' }}>
      <Typography variant='h4' sx={{ fontWeight: 600, mb: 2 }}>
        QA Sample Plan
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        Manage sampling plans, monitor assessor activity and keep QA stakeholders
        aligned. Configure the parameters on the left, filter the learner plan list
        on the right, and export your selections in one click.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              position: 'sticky',
              top: { xs: 0, md: 88 },
            }}
          >
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                Assessment Methods
              </Typography>
              <Paper
                variant='outlined'
                sx={{ p: 2, maxHeight: 220, overflow: 'auto', borderRadius: 2 }}
              >
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          selectedMethods.length === assessmentMethods.length
                        }
                        indeterminate={
                          selectedMethods.length > 0 &&
                          selectedMethods.length < assessmentMethods.length
                        }
                        onChange={() => {
                          if (selectedMethods.length === assessmentMethods.length) {
                            setSelectedMethods([])
                          } else {
                            setSelectedMethods(
                              assessmentMethods.map((method) => method.code)
                            )
                          }
                        }}
                      />
                    }
                    label='Select All'
                    sx={{ mb: 1, fontWeight: 600 }}
                  />
                  <Divider sx={{ mb: 1 }} />
                  {assessmentMethods.map((method) => (
                    <FormControlLabel
                      key={method.code}
                      control={
                        <Checkbox
                          checked={selectedMethods.includes(method.code)}
                          onChange={() => toggleMethod(method.code)}
                        />
                      }
                      label={`${method.code} - ${method.title}`}
                      sx={{ alignItems: 'flex-start' }}
                    />
                  ))}
                </FormGroup>
              </Paper>
            </Box>

            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                Assessment Processes
              </Typography>
              <Paper
                variant='outlined'
                sx={{
                  p: 3,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                There are no assessment processes available to select.
              </Paper>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='sample-type-label'>Sample Type</InputLabel>
                  <Select
                    labelId='sample-type-label'
                    label='Sample Type'
                    value={sampleType}
                    onChange={(event) => setSampleType(event.target.value)}
                  >
                    <MenuItem value=''>Select a sample type</MenuItem>
                    {sampleTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Planned Sample Date'
                  type='date'
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  size='small'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='QA Completion Date'
                  type='date'
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  size='small'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Stack spacing={2}>
              <Button
                variant='contained'
                size='large'
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Apply Samples
              </Button>
              <Button
                variant='outlined'
                size='large'
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Apply Random Samples
              </Button>
              <Button
                variant='outlined'
                size='large'
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderStyle: 'dashed',
                }}
              >
                Plan Management
              </Button>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={courses}
                  getOptionLabel={(option) => option.name || ''}
                  value={
                    courses.find((course) => course.id === selectedCourse) || null
                  }
                  onChange={(_, newValue) => {
                    setSelectedCourse(newValue?.id || '')
                    setSelectedPlan('')
                    setFilterApplied(false)
                    setFilterError('')
                  }}
                  loading={coursesLoading}
                  fullWidth
                  disabled={!courses.length && !coursesLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Select Course'
                      size='small'
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {coursesLoading ? (
                              <CircularProgress color='inherit' size={16} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  noOptionsText={coursesLoading ? 'Loading courses…' : 'No courses'}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='plan-select-label'>Select Plan</InputLabel>
                  <Select
                    labelId='plan-select-label'
                    label='Select Plan'
                    value={selectedPlan}
                    onChange={(event) => {
                      setSelectedPlan(event.target.value as string)
                      setFilterApplied(false)
                      setFilterError('')
                    }}
                    disabled={!selectedCourse}
                  >
                    <MenuItem value='' disabled>
                      {selectedCourse ? 'Choose a plan' : 'Select a course first'}
                    </MenuItem>
                    {plans.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        {plan.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='qa-status-label'>Select QA Status</InputLabel>
                  <Select
                    labelId='qa-status-label'
                    label='Select QA Status'
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                  >
                    {qaStatuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={onlyIncomplete}
                      onChange={(event) => setOnlyIncomplete(event.target.checked)}
                    />
                  }
                  label='Do not show learners with completed course status'
                />
              </Grid>
            </Grid>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems='center'
              justifyContent='space-between'
              sx={{ flexWrap: 'wrap', mb: 2 }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                <TextField
                  label='Date From'
                  type='date'
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  size='small'
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 160 }}
                />
                <TextField
                  label='Date To'
                  type='date'
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  size='small'
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 160 }}
                />
              </Stack>

              <Stack direction='row' spacing={1}>
                <Button
                  variant='contained'
                  color='secondary'
                  startIcon={<DownloadOutlinedIcon />}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                  disabled={!filterApplied || !visibleRows.length}
                >
                  Export
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<FilterListOutlinedIcon />}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                  onClick={handleApplyFilter}
                  disabled={!selectedCourse || !selectedPlan || coursesLoading}
                >
                  Filter
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<RestartAltOutlinedIcon />}
                  onClick={resetFilters}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Clear
                </Button>
              </Stack>
            </Stack>

            {filterError && (
              <Typography
                variant='body2'
                color='error'
                sx={{ mt: 1, fontWeight: 500 }}
              >
                {filterError}
              </Typography>
            )}

            <Paper
              variant='outlined'
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                borderColor: (theme) => theme.palette.divider,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'stretch', md: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                  p: 2,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                      ? theme.palette.grey[50]
                      : theme.palette.background.default,
                }}
              >
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Typography variant='body2' color='text.secondary'>
                    Show
                  </Typography>
                  <TextField
                    select
                    size='small'
                    defaultValue={10}
                    sx={{ width: 80 }}
                  >
                    {[10, 25, 50].map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant='body2' color='text.secondary'>
                    entries
                  </Typography>
                </Stack>

                <TextField
                  size='small'
                  placeholder='Search learners...'
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  sx={{ width: { xs: '100%', sm: 260 } }}
                  disabled={!filterApplied}
                />
              </Box>

              <TableContainer sx={{ maxHeight: 520 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Assessor</TableCell>
                      <TableCell>Assessor Risk</TableCell>
                      <TableCell>QA Approved</TableCell>
                      <TableCell>Learner</TableCell>
                      <TableCell>Employer</TableCell>
                      <TableCell align='center'>Actions</TableCell>
                      <TableCell>Number Selected</TableCell>
                      <TableCell>Units</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!filterApplied ? (
                      <TableRow>
                        <TableCell colSpan={8} align='center' sx={{ py: 6 }}>
                          <Typography variant='body2' color='text.secondary'>
                            Select a course and plan, then choose Filter to load
                            learners.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : visibleRows.length ? (
                      visibleRows.map((row) => (
                        <TableRow
                          key={`${row.assessor}-${row.learner}`}
                          hover
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant='body2' fontWeight={600}>
                                {row.assessor}
                              </Typography>
                              {row.coAssessor && (
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  {row.coAssessor}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size='small'
                              label={row.risk}
                              color={riskPalette[row.risk]}
                              variant='outlined'
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              color='primary'
                              checked={row.qaApproved}
                              disabled
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: 180 }}>
                            <Typography variant='body2'>
                              {row.learner}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: 140 }}>
                            <Typography variant='body2'>{row.employer}</Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Stack
                              direction='row'
                              spacing={1}
                              justifyContent='center'
                            >
                              <IconButton size='small' color='primary'>
                                <InsertDriveFileOutlinedIcon fontSize='small' />
                              </IconButton>
                              <IconButton size='small' color='primary'>
                                <FolderSharedOutlinedIcon fontSize='small' />
                              </IconButton>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ minWidth: 120 }}>
                            <Typography variant='body2' fontWeight={600}>
                              {row.unitsSelected}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: 220 }}>
                            <Stack spacing={1}>
                              {row.units.length ? (
                                row.units.map((unit) => (
                                  <Paper
                                    key={`${row.learner}-${unit.code}-${unit.dueDate}`}
                                    variant='outlined'
                                    sx={{
                                      p: 1,
                                      borderRadius: 1.5,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 0.5,
                                      backgroundColor: (theme) =>
                                        theme.palette.mode === 'light'
                                          ? theme.palette.grey[50]
                                          : theme.palette.background.paper,
                                    }}
                                  >
                                    <Stack
                                      direction='row'
                                      alignItems='center'
                                      justifyContent='space-between'
                                    >
                                      <Typography
                                        variant='caption'
                                        sx={{ fontWeight: 600 }}
                                      >
                                        Unit {unit.code}
                                      </Typography>
                                      {unit.dueDate && (
                                        <Typography
                                          variant='caption'
                                          color='text.secondary'
                                        >
                                          {unit.dueDate}
                                        </Typography>
                                      )}
                                    </Stack>
                                    {unit.assessmentMethod && (
                                      <Typography
                                        variant='caption'
                                        color='text.secondary'
                                      >
                                        {unit.assessmentMethod}
                                      </Typography>
                                    )}
                                  </Paper>
                                ))
                              ) : (
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  No units selected.
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell colSpan={8} align='center' sx={{ py: 6 }}>
                          <Typography variant='body2' color='text.secondary'>
                            No learners match the current filters.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Index

