import React, { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Collapse,
  FormControl,
  FormControlLabel,
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import type { SamplePlanLearner } from 'app/store/api/sample-plan-api'
import { sanitizeText, formatDisplayDate, getRiskChipColor, getLearnerPlannedDate } from '../utils'
import { qaStatuses, assessmentMethods, getAssessmentMethodByCode, sampleTypes } from '../constants'
import axios from 'axios'
import jsonData from 'src/url.json'
import { useUserId } from 'src/app/utils/userHelpers'
import { useDispatch } from 'react-redux'
import { showMessage } from 'app/store/fuse/messageSlice'
import { downloadCSV, generateFilename } from 'src/utils/csvExport'
import { useNavigate } from 'react-router-dom'
import Tooltip from '@mui/material/Tooltip'

interface LearnersTableProps {
  courses: Array<{ id: string; name: string }>
  selectedCourse: string
  onCourseChange: (courseId: string) => void
  coursesLoading: boolean
  plans: Array<{ id: string; label: string }>
  selectedPlan: string
  onPlanChange: (planId: string) => void
  planPlaceholderText: string
  isPlanListLoading: boolean
  isPlansError: boolean
  selectedStatus: string
  onStatusChange: (status: string) => void
  onlyIncomplete: boolean
  onOnlyIncompleteChange: (value: boolean) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  searchText: string
  onSearchTextChange: (value: string) => void
  filterApplied: boolean
  isLearnersInFlight: boolean
  isLearnersError: boolean
  filterError: string
  planSummary?: { planId?: string; courseName?: string }
  visibleRows: SamplePlanLearner[]
  onApplyFilter: () => void
  onResetFilters: () => void
  onOpenUnitSelectionDialog: (learner: SamplePlanLearner, learnerIndex: number) => void
  getSelectedUnitsForLearner: (learner: SamplePlanLearner, learnerIndex: number) => Set<string>
  countSelectedUnits: (units?: any[]) => number
  hasPlannedDate?: boolean
  courseName?: string
  onOpenLearnerDetailsDialog: (learner: SamplePlanLearner, learnerIndex: number, detailId?: string | number, unitKey?: string) => void
  onUnitToggle: (learner: SamplePlanLearner, learnerIndex: number, unitKey: string) => void
}

export const LearnersTable: React.FC<LearnersTableProps> = ({
  courses,
  selectedCourse,
  onCourseChange,
  coursesLoading,
  plans,
  selectedPlan,
  onPlanChange,
  planPlaceholderText,
  isPlanListLoading,
  isPlansError,
  selectedStatus,
  onStatusChange,
  onlyIncomplete,
  onOnlyIncompleteChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  searchText,
  onSearchTextChange,
  filterApplied,
  isLearnersInFlight,
  isLearnersError,
  filterError,
  planSummary,
  visibleRows,
  onApplyFilter,
  onResetFilters,
  onOpenUnitSelectionDialog,
  getSelectedUnitsForLearner,
  countSelectedUnits,
  hasPlannedDate = false,
  courseName = '',
  onOpenLearnerDetailsDialog,
  onUnitToggle,
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const iqaId = useUserId()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingRow, setPendingRow] = useState<SamplePlanLearner | null>(null)
  const [exporting, setExporting] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const URL_BASE_LINK = (jsonData as any).API_LOCAL_URL

  const requestSignoff = async () => {
    if (!pendingRow || !selectedCourse || !iqaId) {
      setConfirmOpen(false)
      return
    }
    try {
      const learnerId =
        (pendingRow as any)?.learner_id ??
        (pendingRow as any)?.learnerId ??
        (pendingRow as any)?.id
      await axios.put(`${URL_BASE_LINK}/sample-plan/learner-signoff`, {
        learner_id: learnerId,
        course_id: selectedCourse,
        iqa_id: iqaId,
      })
      dispatch(
        showMessage({
          message: `Learner ${learnerId} signed off successfully.`,
          variant: 'success',
        })
      )
      setConfirmOpen(false)
      setPendingRow(null)
      // Refresh current list if possible
      onApplyFilter()
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.data?.message ||
        'Failed to update sign off status.'
      dispatch(showMessage({ message, variant: 'error' }))
      setConfirmOpen(false)
      setPendingRow(null)
    }
  }

  // Export learners data to CSV
  const handleExportToCSV = () => {
    if (!visibleRows.length) {
      dispatch(
        showMessage({
          message: 'No data available to export.',
          variant: 'warning',
        })
      )
      return
    }

    try {
      setExporting(true)

      // Define CSV headers
      const headers = [
        'Assessor Name',
        'Learner Name',
        'Learner ID',
        'Employer',
        'Risk Level',
        'Risk Percentage',
        'QA Approved',
        'Total Samples',
        'Selected Units',
        'Total Units',
        'Planned Date',
        'Course Name',
      ]

      // Convert data to CSV rows
      const csvRows = visibleRows.map((row) => {
        const units = Array.isArray(row.units) ? row.units : []
        const selectedUnitsSet = getSelectedUnitsForLearner(row, visibleRows.indexOf(row))
        const selectedUnits = selectedUnitsSet.size || countSelectedUnits(units)
        const totalUnits = units.length
        const plannedDate = getLearnerPlannedDate(row)

        return [
          sanitizeText(row.assessor_name),
          sanitizeText(row.learner_name),
          row.learner_id || row.learnerId || row.id || '-',
          sanitizeText((row as any).employer) || '-',
          sanitizeText(row.risk_level),
          (row as any).risk_percentage || '-',
          row.qa_approved ? 'Yes' : 'No',
          (row as any).total_samples || '0',
          selectedUnits.toString(),
          totalUnits.toString(),
          plannedDate ? formatDisplayDate(plannedDate) : '-',
          courseName || '-',
        ]
      })

      // Combine headers and rows
      const csvContent = [headers, ...csvRows]
        .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n')

      // Generate filename with date
      const filename = generateFilename('qa-sample-plan-learners')

      // Download CSV
      downloadCSV(csvContent, filename)

      dispatch(
        showMessage({
          message: 'Data exported successfully.',
          variant: 'success',
        })
      )
    } catch (error: any) {
      dispatch(
        showMessage({
          message: 'Failed to export data. Please try again.',
          variant: 'error',
        })
      )
    } finally {
      setExporting(false)
    }
  }

  // Handle view documents/evidence
  const handleViewDocuments = (learner: SamplePlanLearner) => {
    const learnerId = learner.learner_id || learner.learnerId || learner.id
    if (learnerId) {
      // Navigate to evidence library or documents page for this learner
      navigate(`/evidence-library?learner_id=${learnerId}`)
    } else {
      dispatch(
        showMessage({
          message: 'Unable to open documents. Learner ID not found.',
          variant: 'warning',
        })
      )
    }
  }

  // Handle view portfolio
  const handleViewPortfolio = (learner: SamplePlanLearner) => {
    const learnerId = learner.learner_id || learner.learnerId || learner.id
    if (learnerId) {
      // Navigate to learner portfolio page
      navigate(`/portfolio?learner_id=${learnerId}`)
    } else {
      dispatch(
        showMessage({
          message: 'Unable to open portfolio. Learner ID not found.',
          variant: 'warning',
        })
      )
    }
  }

  // Toggle row expansion
  const toggleRowExpansion = (index: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // Toggle all rows expansion
  const toggleAllRowsExpansion = () => {
    if (expandedRows.size === visibleRows.length && visibleRows.length > 0) {
      // All rows are expanded, collapse all
      setExpandedRows(new Set())
    } else {
      // Expand all rows
      const allIndices = new Set(visibleRows.map((_, index) => index))
      setExpandedRows(allIndices)
    }
  }

  // Get sample type label
  const getSampleTypeLabel = (sampleType: string) => {
    const type = sampleTypes.find((t) => t.value === sampleType)
    return type?.label || sampleType
  }

  // Get assessment method names that are true
  const getTrueAssessmentMethods = (assessmentMethodsObj: Record<string, boolean>) => {
    if (!assessmentMethodsObj || typeof assessmentMethodsObj !== 'object') {
      return []
    }
    return Object.entries(assessmentMethodsObj)
      .filter(([_, value]) => value === true)
      .map(([code]) => {
        const method = getAssessmentMethodByCode(code)
        return method ? `${method.code} - ${method.title}` : code
      })
  }

  return (
    <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={courses}
            getOptionLabel={(option) => option.name || ''}
            value={courses.find((course) => course.id === selectedCourse) || null}
            onChange={(_, newValue) => {
              onCourseChange(newValue?.id || '')
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
              renderValue={(value) => {
                if (!value) {
                  return planPlaceholderText
                }
                const matchedPlan = plans.find((plan) => plan.id === value)
                return matchedPlan?.label || value
              }}
              onChange={(event) => onPlanChange(event.target.value as string)}
              disabled={!selectedCourse || isPlanListLoading}
            >
              <MenuItem value='' disabled>
                {planPlaceholderText}
              </MenuItem>
              {plans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {isPlansError && selectedCourse && (
            <Typography variant='caption' color='error' sx={{ mt: 1, display: 'block' }}>
              Unable to load plans for the selected course. Please try again.
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size='small'>
            <InputLabel id='qa-status-label'>Select QA Status</InputLabel>
            <Select
              labelId='qa-status-label'
              label='Select QA Status'
              value={selectedStatus}
              onChange={(event) => onStatusChange(event.target.value)}
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
                onChange={(event) => onOnlyIncompleteChange(event.target.checked)}
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
            onChange={(event) => onDateFromChange(event.target.value)}
            size='small'
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <TextField
            label='Date To'
            type='date'
            value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)}
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
            disabled={!filterApplied || !visibleRows.length || isLearnersInFlight || exporting}
            onClick={handleExportToCSV}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button
            variant='outlined'
            startIcon={<FilterListOutlinedIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
            onClick={onApplyFilter}
            disabled={
              !selectedCourse ||
              !selectedPlan ||
              isPlanListLoading ||
              !plans.length ||
              isLearnersInFlight
            }
          >
            Filter
          </Button>
          <Button
            variant='outlined'
            startIcon={<RestartAltOutlinedIcon />}
            onClick={onResetFilters}
            sx={{ textTransform: 'none', fontWeight: 600 }}
            disabled={isLearnersInFlight}
          >
            Clear
          </Button>
        </Stack>
      </Stack>

      {filterError && (
        <Typography variant='body2' color='error' sx={{ mt: 1, fontWeight: 500 }}>
          {filterError}
        </Typography>
      )}

      {filterApplied && !filterError && planSummary && (
        <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
          Viewing plan{' '}
          <strong>{planSummary.planId ? `#${planSummary.planId}` : 'N/A'}</strong>
          {planSummary.courseName ? ` • ${planSummary.courseName}` : ''}
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
            <TextField select size='small' defaultValue={10} sx={{ width: 80 }}>
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

          <Stack direction='row' spacing={1} alignItems='center'>
            <Button
              variant='outlined'
              size='small'
              startIcon={
                expandedRows.size === visibleRows.length && visibleRows.length > 0 ? (
                  <UnfoldLessIcon />
                ) : (
                  <UnfoldMoreIcon />
                )
              }
              onClick={toggleAllRowsExpansion}
              disabled={!filterApplied || isLearnersInFlight || visibleRows.length === 0}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              {expandedRows.size === visibleRows.length && visibleRows.length > 0
                ? 'Collapse All'
                : 'Expand All'}
            </Button>
            <TextField
              size='small'
              placeholder='Search learners...'
              value={searchText}
              onChange={(event) => onSearchTextChange(event.target.value)}
              sx={{ width: { xs: '100%', sm: 260 } }}
              disabled={!filterApplied || isLearnersInFlight}
            />
          </Stack>
        </Box>

        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width={50}></TableCell>
                <TableCell>Assessor</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>QA Approved</TableCell>
                <TableCell>Learner</TableCell>
                <TableCell>Employer</TableCell>
                <TableCell align='center'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!filterApplied ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 6 }}>
                    <Typography variant='body2' color='text.secondary'>
                      Select a course and plan, then choose Filter to load learners.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : isLearnersInFlight ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 6 }}>
                    <Stack
                      direction='row'
                      spacing={1}
                      alignItems='center'
                      justifyContent='center'
                    >
                      <CircularProgress size={20} />
                      <Typography variant='body2' color='text.secondary'>
                        Loading learners...
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : isLearnersError ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 6 }}>
                    <Typography variant='body2' color='error'>
                      {filterError ||
                        'Something went wrong while fetching learners for this plan.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : visibleRows.length ? (
                visibleRows.map((row, index) => {
                  const units = Array.isArray(row.units) ? row.units : []
                  const selectedUnitsSet = getSelectedUnitsForLearner(row, index)
                  const selectedUnits =
                    selectedUnitsSet.size || countSelectedUnits(units)
                  const totalUnits = units.length
                  const isExpanded = expandedRows.has(index)

                  return (
                    <React.Fragment key={`${row.assessor_name ?? 'assessor'}-${row.learner_name ?? index}`}>
                      <TableRow
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          cursor: 'pointer',
                        }}
                        onClick={() => toggleRowExpansion(index)}
                      >
                        <TableCell>
                          <IconButton
                            size='small'
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleRowExpansion(index)
                            }}
                          >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ minWidth: 160 }}>
                          <Stack spacing={0.5}>
                            <Typography variant='body2' fontWeight={600}>
                              {sanitizeText(row.assessor_name)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size='small'
                            label={sanitizeText(row.risk_level)}
                            color={getRiskChipColor(row.risk_level)}
                            variant='outlined'
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            color='primary'
                            checked={Boolean(row.qa_approved)}
                            onChange={(e) => {
                              e.stopPropagation()
                              setPendingRow(row)
                              setConfirmOpen(true)
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          <Typography variant='body2'>
                            {sanitizeText(row.learner_name)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          <Typography variant='body2'>
                            {sanitizeText((row as any).employer)}
                          </Typography>
                        </TableCell>
                        <TableCell align='center' onClick={(e) => e.stopPropagation()}>
                          <Stack direction='row' spacing={1} justifyContent='center'>
                            <Tooltip title='View Documents / Evidence' arrow>
                              <IconButton
                                size='small'
                                color='primary'
                                onClick={() => handleViewDocuments(row)}
                              >
                                <InsertDriveFileOutlinedIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='View Portfolio' arrow>
                              <IconButton
                                size='small'
                                color='primary'
                                onClick={() => handleViewPortfolio(row)}
                              >
                                <FolderSharedOutlinedIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={7}
                        >
                          <Collapse in={isExpanded} timeout='auto' unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              {units.length > 0 ? (
                                (() => {
                                  // Show all units, not just those with sample_history
                                  const allUnits = units
                                  
                                  // Filter units that have sample_history for display
                                  const unitsWithHistory = allUnits.filter((unit: any) => 
                                    Array.isArray(unit?.sample_history) && unit.sample_history.length > 0
                                  )

                                  // Find the maximum number of sample_history entries across all units
                                  const maxHistoryCount = unitsWithHistory.length > 0
                                    ? Math.max(...unitsWithHistory.map((unit: any) => unit.sample_history.length))
                                    : 0

                                  return (
                                    <Table size='small' sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                      <TableHead>
                                        <TableRow>
                                          {allUnits.map((unit: any, unitIndex: number) => {
                                            const unitKey = unit.unit_code || unit.unit_name || ''
                                            const selectedUnitsSet = getSelectedUnitsForLearner(row, index)
                                            const isUnitSelected = unitKey ? selectedUnitsSet.has(unitKey) : false
                                            
                                            return (
                                              <TableCell
                                                key={`unit-header-${unit.unit_code || unitIndex}`}
                                                sx={{
                                                  backgroundColor: 'grey.100',
                                                  fontWeight: 600,
                                                  textAlign: 'left',
                                                  borderRight: 1,
                                                  borderColor: 'divider',
                                                  '&:last-child': {
                                                    borderRight: 0,
                                                  },
                                                }}
                                              >
                                                <Stack direction='row' spacing={1} alignItems='center'>
                                                  <Checkbox
                                                    size='small'
                                                    checked={isUnitSelected}
                                                    onChange={(e) => {
                                                      e.stopPropagation()
                                                      if (unitKey) {
                                                        onUnitToggle(row, index, unitKey)
                                                      }
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    sx={{ p: 0.5 }}
                                                    color='primary'
                                                  />
                                                  <Box sx={{ flex: 1 , display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Typography variant='body2' fontWeight={600}>
                                                      {sanitizeText(unit.unit_name) || `Unit ${unitIndex + 1}`}
                                                    </Typography>
                                                      <Chip
                                                        size='small'
                                                        label={unit.completed ? 'Completed' : 'Incomplete'}
                                                        color={unit.completed ? 'success' : 'error'}
                                                        sx={{
                                                          mt: 0.5,
                                                          height: 20,
                                                          fontSize: '0.7rem',
                                                          fontWeight: 600,
                                                        }}
                                                      />
                                                  </Box>
                                                </Stack>
                                              </TableCell>
                                            )
                                          })}
                                        </TableRow>
                                      </TableHead>
                                      {maxHistoryCount > 0 && (
                                        <TableBody>
                                          {Array.from({ length: maxHistoryCount }).map((_, rowIndex) => (
                                            <TableRow key={`history-row-${rowIndex}`}>
                                              {allUnits.map((unit: any, unitIndex: number) => {
                                                const hasSampleHistory = Array.isArray(unit?.sample_history) && unit.sample_history.length > 0
                                                const history = hasSampleHistory ? unit.sample_history[rowIndex] : null

                                                if (!history) {
                                                  return (
                                                    <TableCell
                                                      key={`unit-${unit.unit_code || unitIndex}-row-${rowIndex}`}
                                                      sx={{
                                                        borderRight: 1,
                                                        borderColor: 'divider',
                                                        '&:last-child': {
                                                          borderRight: 0,
                                                        },
                                                      }}
                                                    >
                                                      {/* Empty cell if no entry */}
                                                    </TableCell>
                                                  )
                                                }

                                                return (
                                                  <TableCell
                                                    key={`unit-${unit.unit_code || unitIndex}-row-${rowIndex}`}
                                                    sx={{
                                                      borderRight: 1,
                                                      borderColor: 'divider',
                                                      '&:last-child': {
                                                        borderRight: 0,
                                                      },
                                                    }}
                                                  >
                                                    <Box>
                                                      <Typography
                                                        variant='body2'
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          if (history.detail_id) {
                                                            const unitKey = unit.unit_code || unit.unit_name || ''
                                                            onOpenLearnerDetailsDialog(row, index, history.detail_id, unitKey)
                                                          }
                                                        }}
                                                        sx={{
                                                          cursor: history.detail_id ? 'pointer' : 'default',
                                                          color: history.detail_id ? 'primary.main' : 'inherit',
                                                          textDecoration: history.detail_id ? 'underline' : 'none',
                                                          fontWeight: 500,
                                                          '&:hover': history.detail_id
                                                            ? {
                                                                color: 'primary.dark',
                                                              }
                                                            : {},
                                                        }}
                                                      >
                                                        {formatDisplayDate(history.planned_date)}
                                                      </Typography>
                                                      {typeof unit.completed === 'boolean' && (
                                                        <Chip
                                                          size='small'
                                                          label={unit.completed ? 'Completed' : 'Incomplete'}
                                                          color={unit.completed ? 'success' : 'error'}
                                                          sx={{
                                                            mt: 0.5,
                                                            height: 20,
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600,
                                                          }}
                                                        />
                                                      )}
                                                    </Box>
                                                  </TableCell>
                                                )
                                              })}
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      )}
                                    </Table>
                                  )
                                })()
                              ) : (
                                <Typography variant='body2' color='text.secondary' sx={{ py: 2, px: 2 }}>
                                  No units available for this learner.
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 6 }}>
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
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Confirm Sign Off</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Are you sure you want to change the sign off status this Learner?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} variant='outlined' sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={requestSignoff} variant='contained' sx={{ textTransform: 'none' }}>
            Yes, Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

