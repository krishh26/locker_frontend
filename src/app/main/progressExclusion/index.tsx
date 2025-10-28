import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  Typography,
  Autocomplete,
  TextField,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import Breadcrumb from 'src/app/component/Breadcrumbs'
import { LoadingButton } from 'src/app/component/Buttons'
import FuseLoading from '@fuse/core/FuseLoading'
import {
  fetchCourseAPI,
  selectCourseManagement,
} from 'app/store/courseManagement'
import {
  fetchProgressExclusionAPI,
  updateProgressExclusionAPI,
  selectProgressExclusion,
} from 'app/store/progressExclusion'
import { showMessage } from 'app/store/fuse/messageSlice'

// Training status list
const trainingStatuses = [
  'In Training',
  'IQA Approved',
  'Completed',
  'Certificated',
  'Training Suspended',
  'Transferred',
  'Early Leaver',
  'Exempt',
  'Awaiting Induction',
]

const ProgressExclusion = () => {
  const dispatch: any = useDispatch()

  // State
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [excludedStatuses, setExcludedStatuses] = useState<Set<string>>(
    new Set()
  )
  const [submitting, setSubmitting] = useState(false)

  // Redux selectors
  const courseManagement = useSelector(selectCourseManagement)
  const courses = courseManagement?.data || []
  const coursesLoading = courseManagement?.dataFetchLoading || false
  
  const progressExclusion = useSelector(selectProgressExclusion)
  const exclusionData = progressExclusion?.data
  const exclusionLoading = progressExclusion?.dataFetchLoading || false

  // Fetch courses on mount
  useEffect(() => {
    dispatch(fetchCourseAPI({ page: 1, page_size: 500 }))
  }, [dispatch])

  // Fetch exclusion settings when course is selected
  useEffect(() => {
    if (selectedCourse?.course_id) {
      dispatch(fetchProgressExclusionAPI(selectedCourse.course_id))
    }
  }, [selectedCourse, dispatch])

  // Update excluded statuses when exclusion data changes
  useEffect(() => {
    if (exclusionData && exclusionData.excluded_statuses) {
      setExcludedStatuses(new Set(exclusionData.excluded_statuses))
    } else {
      // Default excluded statuses if no data exists
      setExcludedStatuses(
        new Set(['Completed', 'Certificated', 'Transferred', 'Early Leaver'])
      )
    }
  }, [exclusionData])

  // Handle checkbox change
  const handleCheckboxChange = (status: string) => {
    setExcludedStatuses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(status)) {
        newSet.delete(status)
      } else {
        newSet.add(status)
      }
      return newSet
    })
  }

  // Handle submit
  const handleSubmit = async () => {
    if (!selectedCourse) {
      dispatch(
        showMessage({
          message: 'Please select a course',
          variant: 'warning',
        })
      )
      return
    }

    setSubmitting(true)

    const data = {
      course_id: selectedCourse.course_id,
      excluded_statuses: Array.from(excludedStatuses),
    }

    const result = await dispatch(updateProgressExclusionAPI(data))

    setSubmitting(false)

    if (result) {
      dispatch(
        showMessage({
          message: 'Progress exclusion settings updated successfully',
          variant: 'success',
        })
      )
    }
  }

  const breadcrumbs = [
    { label: 'Admin', path: '/admin' },
    { label: 'Exclude From Overall Progress', path: '' },
  ]

  if (coursesLoading && !courses.length) {
    return <FuseLoading />
  }

  return (
    <Box className='w-full p-24'>
      <Card className='mt-20 p-24'>
        <Typography variant='h5' className='mb-24 font-semibold'>
          Exclude From Overall Progress
        </Typography>

        <Alert severity='info' className='mb-24'>
          Select a course and choose which training statuses should be excluded
          from overall progress tracking.
        </Alert>

        {/* Course Selection */}
        <Box className='mb-32'>
          <Typography className='mb-12 font-medium'>
            Select Course <span className='text-red-500'>*</span>
          </Typography>
          <Autocomplete
            disableClearable
            fullWidth
            size='small'
            options={courses || []}
            value={selectedCourse}
            getOptionLabel={(option: any) =>
              option.course_name
                ? `${option.course_name} (${option.course_code || 'N/A'})`
                : ''
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder='Select a course'
                variant='outlined'
              />
            )}
            onChange={(e, value: any) => setSelectedCourse(value)}
            PaperComponent={({ children }) => (
              <Paper style={{ borderRadius: '4px' }}>{children}</Paper>
            )}
          />
        </Box>

        {/* Status List Table */}
        {selectedCourse && (
          <>
            {exclusionLoading ? (
              <FuseLoading />
            ) : (
              <>
                <TableContainer component={Paper} className='shadow-sm'>
                  <Table>
                    <TableHead>
                      <TableRow className='bg-gray-100'>
                        <TableCell className='font-semibold'>
                          Status Changed To
                        </TableCell>
                        <TableCell className='font-semibold text-center'>
                          Exclude From Progress
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {trainingStatuses.map((status, index) => (
                        <TableRow
                          key={status}
                          className={
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }
                        >
                          <TableCell>{status}</TableCell>
                          <TableCell className='text-center'>
                            <Checkbox
                              checked={excludedStatuses.has(status)}
                              onChange={() => handleCheckboxChange(status)}
                              color='primary'
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Submit Button */}
                <Box className='mt-24'>
                  <LoadingButton
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={submitting}
                    variant='contained'
                    color='success'
                  >
                    Submit
                  </LoadingButton>
                </Box>
              </>
            )}
          </>
        )}
      </Card>
    </Box>
  )
}

export default ProgressExclusion

