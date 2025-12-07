/**
 * GatewayQuestionsStep.tsx
 *
 * Step 2 component for managing Gateway Questions and Assigned Standards
 * Clean, professional implementation using React Hook Form
 */

import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material'
import { useFieldArray, Controller, useWatch, UseFormSetValue, FieldErrors, UseFormTrigger } from 'react-hook-form'
import { CourseCoreType } from 'app/store/courseBuilderSlice'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { v4 as uuidv4 } from 'uuid'
import CourseTransferList from './CourseTransferList'
import { fetchActiveStandardCourses } from '../../store/courseManagement'

interface GatewayQuestionsStepProps {
  courseId?: string
  courseCoreType: CourseCoreType
  edit?: 'create' | 'edit' | 'view'
  control: any
  setValue: UseFormSetValue<any>
  errors?: FieldErrors<any>
  trigger?: UseFormTrigger<any>
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

const GatewayQuestionsStep: React.FC<GatewayQuestionsStepProps> = ({
  courseId,
  courseCoreType,
  edit = 'create',
  control,
  setValue,
  errors,
  trigger,
}) => {
  const isViewMode = edit === 'view'

  // Questions management
  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'questions',
  })

  const questions = useWatch({
    control,
    name: 'questions',
    defaultValue: [],
  })

  // Assigned standards management - fetch all standard courses
  const [allStandardCourses, setAllStandardCourses] = useState<CourseItem[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  // Fetch active standard courses when component mounts
  useEffect(() => {
    let isMounted = true

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
      } catch (error) {
        console.error('Error fetching active standard courses:', error)
      } finally {
        if (isMounted) {
          setLoadingCourses(false)
        }
      }
    }

    fetchStandardCourses()

    return () => {
      isMounted = false
    }
  }, [])

  const handleAddQuestion = () => {
    const newQuestion: QuestionItem = {
      id: `question_${uuidv4()}`,
      question: '',
      evidenceRequired: false,
      isDropdown: true, // Default to true
      dropdownOptions: '',
    }
    appendQuestion(newQuestion)
  }

  const handleRemoveQuestion = (index: number) => {
    removeQuestion(index)
  }


  return (
    <Box>
      {/* Basic Course Details Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          Course Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Course Name <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Controller
              name="course_name"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  placeholder="Enter Course Name"
                  required
                  disabled={isViewMode}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Course Code <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Controller
              name="course_code"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  placeholder="Enter Course Code"
                  required
                  disabled={isViewMode}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Active Course (Yes or No)
            </Typography>
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  size="small"
                  options={['Yes', 'No']}
                  value={field.value === true || field.value === 'Yes' ? 'Yes' : 'No'}
                  onChange={(_, newValue) => {
                    field.onChange(newValue === 'Yes')
                  }}
                  disabled={isViewMode}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Please select" />
                  )}
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Questions Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Checklist Questions
          </Typography>
          {!isViewMode && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}
              size="small"
            >
              Add Question
            </Button>
          )}
        </Box>

        {/* Show validation error for questions array */}
        {errors?.questions && typeof errors.questions === 'object' && 'message' in errors.questions && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.questions.message as string}
          </Alert>
        )}

        {questionFields.length === 0 ? (
          <Box
            sx={{
              p: 3,
              border: '1px dashed',
              borderColor: errors?.questions ? 'error.main' : 'divider',
              borderRadius: 2,
              textAlign: 'center',
              backgroundColor: errors?.questions ? 'rgba(211, 47, 47, 0.04)' : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <Typography 
              variant="body2" 
              color={errors?.questions ? 'error' : 'textSecondary'} 
              sx={{ mb: 2 }}
            >
              {errors?.questions && typeof errors.questions === 'object' && 'message' in errors.questions
                ? (errors.questions.message as string)
                : 'No questions added yet.'}
            </Typography>
            {!isViewMode && (
              <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddQuestion}>
                Add First Question
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Question</TableCell>
                  <TableCell>Evidence Required?</TableCell>
                  <TableCell>Is Dropdown</TableCell>
                  <TableCell>Dropdown Options</TableCell>
                  {!isViewMode && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {questionFields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Controller
                        name={`questions.${index}.question`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            placeholder="Enter question"
                            disabled={isViewMode}
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`questions.${index}.evidenceRequired`}
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            size="small"
                            options={['Yes', 'No']}
                            value={field.value ? 'Yes' : 'No'}
                            onChange={(_, newValue) => {
                              field.onChange(newValue === 'Yes')
                            }}
                            disabled={isViewMode}
                            renderInput={(params) => <TextField {...params} />}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`questions.${index}.isDropdown`}
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth size="small">
                            <Select
                              value={field.value ? 'Yes' : 'No'}
                              onChange={(e) => {
                                const newValue = e.target.value === 'Yes'
                                field.onChange(newValue)
                                // Clear dropdownOptions if isDropdown becomes false
                                if (!newValue) {
                                  setValue(`questions.${index}.dropdownOptions`, '')
                                }
                                // Re-validate dropdownOptions field
                                if (trigger) {
                                  setTimeout(() => {
                                    trigger(`questions.${index}.dropdownOptions`)
                                  }, 0)
                                }
                              }}
                              disabled={isViewMode}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`questions.${index}.dropdownOptions`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            placeholder="Comma separated options"
                            disabled={!questions[index]?.isDropdown || isViewMode}
                            required={questions[index]?.isDropdown === true}
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </TableCell>
                    {!isViewMode && (
                      <TableCell>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleRemoveQuestion(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Assign Gateway to Standard Courses Section */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          Assign Gateway to Standard Courses
        </Typography>

        {/* Show validation error for assigned_standards */}
        {errors?.assigned_standards && typeof errors.assigned_standards === 'object' && 'message' in errors.assigned_standards && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.assigned_standards.message as string}
          </Alert>
        )}

        {loadingCourses ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="300px"
          >
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading standard courses...
            </Typography>
          </Box>
        ) : (
          <CourseTransferList
            control={control}
            setValue={setValue}
            allStandardCourses={allStandardCourses}
            disabled={isViewMode}
            leftTitle="Unassigned Standard (Active) Courses"
            rightTitle="Assigned Standard (Active) Courses"
            error={!!(errors?.assigned_standards && typeof errors.assigned_standards === 'object' && 'message' in errors.assigned_standards)}
          />
        )}
      </Paper>
    </Box>
  )
}

export default GatewayQuestionsStep

