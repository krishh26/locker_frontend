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
import { useForm } from 'react-hook-form'
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

interface QuestionItem {
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
  // Initialize questions from courseData or with empty array
  const [questions, setQuestions] = useState<QuestionItem[]>(
    courseData.questions || []
  )

  // Create a minimal React Hook Form instance for CourseTransferList
  const { control, setValue, watch } = useForm({
    defaultValues: {
      assigned_standards: courseData.assigned_standards || [],
    },
  })

  // Watch assigned_standards to sync with courseDispatch
  const assignedStandards = watch('assigned_standards')

  // State for all standard courses
  const [allStandardCourses, setAllStandardCourses] = useState<CourseItem[]>([])
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

        setAllStandardCourses(standardItems)
        
        // Initialize form with current assigned_standards
        if (courseData.assigned_standards) {
          const assignedIds = courseData.assigned_standards.map((s: any) => {
            if (typeof s === 'object' && s !== null) {
              const idNum = Number(s.id)
              return isNaN(idNum) ? s.id : idNum
            }
            const idNum = Number(s)
            return isNaN(idNum) ? s : idNum
          })
          setValue('assigned_standards', assignedIds)
        }
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
  }, [setValue])

  // Update courseData when assigned_standards changes in form
  useEffect(() => {
    if (!courseDispatch || !assignedStandards) return

    // Compare with current assigned_standards to avoid unnecessary updates
    const currentAssignedIds = courseData.assigned_standards
      ? courseData.assigned_standards.map((s: any) => {
          if (typeof s === 'object' && s !== null) {
            const idNum = Number(s.id)
            return isNaN(idNum) ? s.id : idNum
          }
          const idNum = Number(s)
          return isNaN(idNum) ? s : idNum
        })
      : []

    // Only update if the assigned standards have actually changed
    const currentSorted = [...currentAssignedIds].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    )
    const newSorted = [...assignedStandards].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    )

    if (JSON.stringify(currentSorted) !== JSON.stringify(newSorted)) {
      // Update the course data with only the IDs array
      courseDispatch({
        type: 'UPDATE_COURSE_FIELD',
        field: 'assigned_standards',
        value: assignedStandards,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedStandards, courseDispatch])

  // Function to add a new question item
  const addQuestionItem = () => {
    const newItem: QuestionItem = {
      id: `item_${Date.now()}`,
      question: '',
      evidenceRequired: false,
      isDropdown: false,
      dropdownOptions: '',
    }

    const updatedQuestions = [...questions, newItem]
    setQuestions(updatedQuestions)

    // Update the courseData with the new questions
    courseDispatch({
      type: 'UPDATE_COURSE_FIELD',
      field: 'questions',
      value: updatedQuestions,
    })
  }

  // Function to remove a question item
  const removeQuestionItem = (id: string) => {
    const updatedQuestions = questions.filter((item) => item.id !== id)
    setQuestions(updatedQuestions)

    // Update the courseData with the updated questions
    courseDispatch({
      type: 'UPDATE_COURSE_FIELD',
      field: 'questions',
      value: updatedQuestions,
    })
  }

  // Function to update a question item
  const updateQuestionItem = (
    id: string,
    field: keyof QuestionItem,
    value: any
  ) => {
    const updatedQuestions = questions.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    })

    setQuestions(updatedQuestions)

    // Update the courseData with the updated questions
    courseDispatch({
      type: 'UPDATE_COURSE_FIELD',
      field: 'questions',
      value: updatedQuestions,
    })
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
          Active Course (Yes or No)
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
              onClick={addQuestionItem}
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
              {questions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <TextField
                      fullWidth
                      size='small'
                      value={item.question}
                      onChange={(e) =>
                        updateQuestionItem(item.id, 'question', e.target.value)
                      }
                      disabled={edit === 'view'}
                    />
                  </TableCell>
                  <TableCell>
                    <Autocomplete
                      size='small'
                      value={item.evidenceRequired ? 'Yes' : 'No'}
                      onChange={(_, newValue) =>
                        updateQuestionItem(
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
                        updateQuestionItem(
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
                        updateQuestionItem(
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
                        onClick={() => removeQuestionItem(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {questions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={edit !== 'view' ? 5 : 4} align='center'>
                    No questions. Click the + button to add one.
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
            control={control}
            setValue={setValue}
            allStandardCourses={allStandardCourses}
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
