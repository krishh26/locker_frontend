import React from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
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
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import type { SamplePlanLearner } from 'app/store/api/sample-plan-api'
import { sanitizeText, formatDisplayDate, getRiskChipColor } from '../utils'
import { qaStatuses } from '../constants'

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
  onOpenLearnerDetailsDialog: (learner: SamplePlanLearner, learnerIndex: number) => void
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
}) => {
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
            disabled={!filterApplied || !visibleRows.length || isLearnersInFlight}
          >
            Export
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

          <TextField
            size='small'
            placeholder='Search learners...'
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            sx={{ width: { xs: '100%', sm: 260 } }}
            disabled={!filterApplied || isLearnersInFlight}
          />
        </Box>

        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Assessor</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>QA Approved</TableCell>
                <TableCell>Learner</TableCell>
                <TableCell>Employer</TableCell>
                <TableCell align='center'>Actions</TableCell>
                <TableCell>Units</TableCell>
                {hasPlannedDate && <TableCell> {sanitizeText(courseName)}</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {!filterApplied ? (
                <TableRow>
                  <TableCell colSpan={hasPlannedDate ? 8 : 7} align='center' sx={{ py: 6 }}>
                    <Typography variant='body2' color='text.secondary'>
                      Select a course and plan, then choose Filter to load learners.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : isLearnersInFlight ? (
                <TableRow>
                  <TableCell colSpan={hasPlannedDate ? 8 : 7} align='center' sx={{ py: 6 }}>
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
                  <TableCell colSpan={hasPlannedDate ? 8 : 7} align='center' sx={{ py: 6 }}>
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

                  return (
                    <TableRow
                      key={`${row.assessor_name ?? 'assessor'}-${row.learner_name ?? index}`}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
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
                          disabled
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <Typography variant='body2'>
                          {sanitizeText(row.learner_name)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <Typography variant='body2'>
                          -
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Stack direction='row' spacing={1} justifyContent='center'>
                          <IconButton size='small' color='primary'>
                            <InsertDriveFileOutlinedIcon fontSize='small' />
                          </IconButton>
                          <IconButton size='small' color='primary'>
                            <FolderSharedOutlinedIcon fontSize='small' />
                          </IconButton>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <Typography
                          variant='body2'
                          onClick={() => onOpenUnitSelectionDialog(row, index)}
                          sx={{
                            cursor: 'pointer',
                            color: 'primary.main',
                            textDecoration: 'underline',
                            '&:hover': {
                              color: 'primary.dark',
                            },
                          }}
                        >
                          {selectedUnits}/{totalUnits} units
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: hasPlannedDate ? 160 : 140 }} className='cursor-pointer' onClick={() => onOpenLearnerDetailsDialog(row, index)}>
                        <Typography variant='body2'>
                          {formatDisplayDate(row.planned_date)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={hasPlannedDate ? 8 : 7} align='center' sx={{ py: 6 }}>
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
  )
}

