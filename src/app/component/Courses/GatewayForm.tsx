import React, { useState, useEffect } from 'react'
import {
  TextField,
  Typography,
  Autocomplete,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
} from '@mui/material'
import Style from './style.module.css'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CourseTransferList from './CourseTransferList'
import { fetchActiveStandardCourses } from '../../store/courseManagement'

interface GatewayFormProps {
  courseData: any
  courseHandler: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  handleAutocompleteChange: (field: string, value: string | null) => void
  validationErrors: any
  edit: string
  courseDispatch?: any
}

interface ChecklistItem {
  id: string
  question: string
  evidenceRequired: boolean
  isDropdown: boolean
  dropdownOptions: string
}

interface CourseItem {
  id: string
  name: string
}

const GatewayForm: React.FC<GatewayFormProps> = ({
  courseData,
  courseHandler,
  handleAutocompleteChange,
  validationErrors,
  edit,
  courseDispatch,
}) => {
  // Initialize checklist from courseData or with empty array
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    courseData.checklist || []
  )

  // State for available and assigned courses
  const [availableCourses, setAvailableCourses] = useState<CourseItem[]>([])
  const [assignedCourses, setAssignedCourses] = useState<CourseItem[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  // Fetch active standard courses when component mounts
  useEffect(() => {
    let isMounted = true // Flag to prevent state updates after unmount

    const fetchStandardCourses = async () => {
      if (!isMounted) return

      setLoadingCourses(true)
      try {
        const standards = await fetchActiveStandardCourses()

        if (!isMounted) return

        // Convert to CourseItem format
        const standardItems = standards.map((course) => ({
          id: course.course_id.toString(),
          name: `${course.course_name} (${course.course_code})`,
        }))

        // If we have assigned_standards in courseData, separate them
        const assignedIds =
          courseData.assigned_standards?.map((s) => s.id.toString()) || []

        const assigned = standardItems.filter((item) =>
          assignedIds.includes(item.id)
        )
        const available = standardItems.filter(
          (item) => !assignedIds.includes(item.id)
        )

        setAssignedCourses(assigned)
        setAvailableCourses(available)
      } catch (error) {
        console.error('Error fetching active standard courses:', error)
      } finally {
        if (isMounted) {
          setLoadingCourses(false)
        }
      }
    }

    // Only fetch courses once when the component mounts
    fetchStandardCourses()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update courseData when assigned courses change
  useEffect(() => {
    // Skip the initial render to prevent circular updates
    const assignedStandards = assignedCourses.map((course) => ({
      id: course.id,
      name: course.name,
    }))

    // Compare with current assigned_standards to avoid unnecessary updates
    const currentAssignedIds =
      courseData.assigned_standards?.map((s) => s.id) || []
    const newAssignedIds = assignedStandards.map((s) => s.id)

    // Only update if the assigned standards have actually changed
    if (
      JSON.stringify(currentAssignedIds.sort()) !==
      JSON.stringify(newAssignedIds.sort())
    ) {
      // Update the course data directly with the assigned standards
      courseDispatch({
        type: 'UPDATE_COURSE_FIELD',
        field: 'assigned_standards',
        value: assignedStandards,
      })
    }
    // Include courseData.assigned_standards in the dependency array to properly compare changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedCourses, courseDispatch])

  // Function to add a new checklist item
  const addChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: `item_${Date.now()}`,
      question: '',
      evidenceRequired: false,
      isDropdown: false,
      dropdownOptions: '',
    }

    const updatedChecklist = [...checklist, newItem]
    setChecklist(updatedChecklist)

    // Update the courseData with the new checklist
    courseDispatch({
      type: 'UPDATE_COURSE_FIELD',
      field: 'checklist',
      value: updatedChecklist,
    })
  }

  // Function to remove a checklist item
  const removeChecklistItem = (id: string) => {
    const updatedChecklist = checklist.filter((item) => item.id !== id)
    setChecklist(updatedChecklist)

    // Update the courseData with the updated checklist
    courseDispatch({
      type: 'UPDATE_COURSE_FIELD',
      field: 'checklist',
      value: updatedChecklist,
    })
  }

  // Function to update a checklist item
  const updateChecklistItem = (
    id: string,
    field: keyof ChecklistItem,
    value: any
  ) => {
    const updatedChecklist = checklist.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    })

    setChecklist(updatedChecklist)

    // Update the courseData with the updated checklist
    courseDispatch({
      type: 'UPDATE_COURSE_FIELD',
      field: 'checklist',
      value: updatedChecklist,
    })
  }

  // Handler for when courses are assigned in the transfer list
  const handleCoursesAssigned = (
    assigned: CourseItem[],
    remaining: CourseItem[]
  ) => {
    setAssignedCourses(assigned)
    setAvailableCourses(remaining)

    // The useEffect will handle updating courseData.assigned_standards
  }

  return (
    <>
      {/* Course Name, Code, LAD Code */}
      <Box className='m-12 flex flex-col justify-between gap-12 sm:flex-row'>
        <div className='w-1/3'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Course Name<sup>*</sup>
          </Typography>
          <TextField
            name='course_name'
            size='small'
            placeholder='Enter Course Name'
            required
            fullWidth
            value={courseData.course_name}
            onChange={courseHandler}
            disabled={edit === 'view'}
            className={Style.input_feald}
            error={validationErrors.course_name}
            helperText={
              validationErrors.course_name ? 'Course name is required' : ''
            }
          />
        </div>
        <div className='w-1/3'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Course Code<sup>*</sup>
          </Typography>
          <TextField
            name='course_code'
            size='small'
            placeholder='Enter Course Code'
            required
            fullWidth
            value={courseData.course_code}
            onChange={courseHandler}
            disabled={edit === 'view'}
            className={Style.input_feald}
            error={validationErrors.course_code}
            helperText={
              validationErrors.course_code ? 'Course code is required' : ''
            }
          />
        </div>
        <div className='w-1/3'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Yes or No
          </Typography>
          <Autocomplete
            size='small'
            value={courseData?.active || 'Yes'}
            onChange={(_, newValue) =>
              handleAutocompleteChange('active', newValue)
            }
            disabled={edit === 'view'}
            options={['Yes', 'No']}
            className={Style.last2_input_feald}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField {...params} placeholder='Please select' />
            )}
          />
        </div>
      </Box>

      {/* Checklist */}
      <Box className='m-12 p-6 border border-gray-300'>
        <div className='flex justify-between items-center mb-4'>
          <Typography variant='h6' className='font-bold'>
            Checklist
          </Typography>
          {edit !== 'view' && (
            <IconButton
              color='primary'
              onClick={addChecklistItem}
              className='bg-blue-100 hover:bg-blue-200'
            >
              <AddIcon />
            </IconButton>
          )}
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Question</TableCell>
                <TableCell>Evidence Required?</TableCell>
                <TableCell>Is Dropdown</TableCell>
                <TableCell>Dropdown Options</TableCell>
                {edit !== 'view' && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {checklist.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <TextField
                      fullWidth
                      size='small'
                      value={item.question}
                      onChange={(e) =>
                        updateChecklistItem(item.id, 'question', e.target.value)
                      }
                      disabled={edit === 'view'}
                    />
                  </TableCell>
                  <TableCell>
                    <Autocomplete
                      size='small'
                      value={item.evidenceRequired ? 'Yes' : 'No'}
                      onChange={(_, newValue) =>
                        updateChecklistItem(
                          item.id,
                          'evidenceRequired',
                          newValue === 'Yes'
                        )
                      }
                      disabled={edit === 'view'}
                      options={['Yes', 'No']}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </TableCell>
                  <TableCell>
                    <Autocomplete
                      size='small'
                      value={item.isDropdown ? 'Yes' : 'No'}
                      onChange={(_, newValue) =>
                        updateChecklistItem(
                          item.id,
                          'isDropdown',
                          newValue === 'Yes'
                        )
                      }
                      disabled={edit === 'view'}
                      options={['Yes', 'No']}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size='small'
                      value={item.dropdownOptions}
                      onChange={(e) =>
                        updateChecklistItem(
                          item.id,
                          'dropdownOptions',
                          e.target.value
                        )
                      }
                      disabled={!item.isDropdown || edit === 'view'}
                      placeholder='Comma separated options'
                    />
                  </TableCell>
                  {edit !== 'view' && (
                    <TableCell>
                      <IconButton
                        color='error'
                        onClick={() => removeChecklistItem(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {checklist.length === 0 && (
                <TableRow>
                  <TableCell colSpan={edit !== 'view' ? 5 : 4} align='center'>
                    No checklist items. Click the + button to add one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Assign Gateway to Standard Courses */}
      <Box className='m-12 p-6 border border-gray-300'>
        <Typography variant='h6' className='font-bold mb-4'>
          Assign Gateway to Standard Courses
        </Typography>

        {loadingCourses ? (
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            height='300px'
          >
            <CircularProgress />
            <Typography variant='body1' sx={{ ml: 2 }}>
              Loading standard courses...
            </Typography>
          </Box>
        ) : (
          <CourseTransferList
            availableCourses={availableCourses}
            assignedCourses={assignedCourses}
            onCoursesAssigned={handleCoursesAssigned}
            disabled={edit === 'view'}
            leftTitle='Unassigned Standard (Active) Courses'
            rightTitle='Assigned Standard (Active) Courses'
          />
        )}
      </Box>
    </>
  )
}

export default GatewayForm
