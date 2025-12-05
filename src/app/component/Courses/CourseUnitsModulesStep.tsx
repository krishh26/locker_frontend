
/**
 * CourseUnitsModulesStep.tsx
 *
 * Step 2 component for managing Units (Qualification) or Modules (Standard)
 * Clean, professional implementation using React Hook Form
 */

import React, { useEffect } from 'react'
import {
  Box,
  Typography,
  Alert,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Grid,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { CourseCoreType } from 'app/store/courseBuilderSlice'
import { useNotification } from './useNotification'
import { useCourseBuilderAPI } from './useCourseBuilderAPI'
import AssessmentCriteriaForm from './AssessmentCriteriaForm'
import StandardTopicsForm from './StandardTopicsForm'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

interface CourseUnitsModulesStepProps {
  courseId?: string
  courseCoreType: CourseCoreType
  edit?: 'create' | 'edit' | 'view'
}

interface LearningOutcome {
  id: string
  number: string
  description: string
  assessment_criteria: any[]
  [key: string]: any
}

interface Unit {
  id?: string | number
  unit_ref?: string
  component_ref?: string
  title: string
  mandatory: string
  level?: string | null
  glh?: number | null
  credit_value?: number | null
  moduleType?: string
  subUnit?: any[]
  learning_outcomes?: LearningOutcome[]
  assessment_criteria?: any[]
  [key: string]: any
}

interface UnitsModulesFormData {
  units: Unit[]
}

const CourseUnitsModulesStep: React.FC<CourseUnitsModulesStepProps> = ({
  courseId,
  courseCoreType,
  edit = 'create',
}) => {
  const { showSuccess, showError, NotificationComponent } = useNotification()
  const { loadCourse } = useCourseBuilderAPI()
  const isViewMode = edit === 'view'

  const { control, handleSubmit, watch, reset } = useForm<UnitsModulesFormData>({
    defaultValues: {
      units: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'units',
  })

  const units = watch('units')

  // Load existing units/modules when courseId is available
  useEffect(() => {
    if (courseId) {
      loadCourse(courseId).then((result) => {
        if (result.success && result.data) {
          // TODO: Load units from API response
          // For now, initialize with empty array
          // Units would be in result.data.units if available
        //   const loadedUnits = []
        //   reset({ units: loadedUnits })
        }
      })
    }
  }, [courseId, loadCourse, reset])

  // Check if course is saved (has courseId)
  if (!courseId) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 3 }}>
          Please save your course details first before adding{' '}
          {courseCoreType === 'Standard' ? 'modules' : 'units'}.
        </Alert>
      </Box>
    )
  }

  // Gateway courses don't have units/modules
  if (courseCoreType === 'Gateway') {
    return (
      <Box>
        <Typography variant="body2" color="textSecondary">
          Gateway courses do not have units or modules.
        </Typography>
      </Box>
    )
  }

  const handleAddUnit = () => {
    if (courseCoreType === 'Standard') {
      const newModule: Unit = {
        id: Date.now(),
        title: '',
        component_ref: '',
        mandatory: 'true',
        moduleType: 'behaviour',
        description: '',
        delivery_method: '',
        otj_hours: '0',
        delivery_lead: '',
        sort_order: '0',
        active: 'true',
        subUnit: [],
        learning_outcomes: [],
        assessment_criteria: [],
      }
      append(newModule)
    } else {
      const newUnit: Unit = {
        id: Date.now(),
        title: '',
        mandatory: 'true',
        unit_ref: '',
        level: null,
        glh: null,
        credit_value: null,
        subUnit: [],
        learning_outcomes: [
          {
            id: `lo_${Date.now()}`,
            number: '1',
            description: 'Default Learning Outcome',
            assessment_criteria: [],
          },
        ],
        assessment_criteria: [],
      }
      append(newUnit)
    }
  }

  const handleSave = async (data: UnitsModulesFormData) => {
    try {
      // TODO: Implement API call to save units/modules
      // This will use updateCourseAPI with units array
      showSuccess(
        `${courseCoreType === 'Standard' ? 'Modules' : 'Units'} saved successfully!`
      )
    } catch (error) {
      showError('Failed to save. Please try again.')
    }
  }

  // Render based on course type
  if (courseCoreType === 'Standard') {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Modules
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Add and manage modules for your standard course
            </Typography>
          </Box>
          {!isViewMode && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddUnit}
            >
              Add Module
            </Button>
          )}
        </Box>

        {fields.length === 0 ? (
          <Alert severity="info">
            No modules added yet. Click "Add Module" to get started.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {fields.map((field, index) => (
              <Paper
                key={field.id}
                elevation={1}
                sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Module {index + 1}
                  </Typography>
                  {!isViewMode && (
                    <Button
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Module Title <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <Controller
                      name={`units.${index}.title`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          placeholder="Enter Module Title"
                          required
                          disabled={isViewMode}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Component Ref
                    </Typography>
                    <Controller
                      name={`units.${index}.component_ref`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          placeholder="Enter Component Ref"
                          disabled={isViewMode}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Description
                    </Typography>
                    <Controller
                      name={`units.${index}.description`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={3}
                          size="small"
                          placeholder="Enter module description"
                          disabled={isViewMode}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Module Type <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <Controller
                      name={`units.${index}.moduleType`}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <Select {...field} disabled={isViewMode}>
                            <MenuItem value="core">Core Module</MenuItem>
                            <MenuItem value="optional">Optional Module</MenuItem>
                            <MenuItem value="behaviour">Behaviour</MenuItem>
                            <MenuItem value="knowledge">Knowledge</MenuItem>
                            <MenuItem value="skill">Skill</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Mandatory
                    </Typography>
                    <Controller
                      name={`units.${index}.mandatory`}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <Select {...field} disabled={isViewMode}>
                            <MenuItem value="true">Mandatory</MenuItem>
                            <MenuItem value="false">Optional</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Active
                    </Typography>
                    <Controller
                      name={`units.${index}.active`}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <Select {...field} disabled={isViewMode}>
                            <MenuItem value="true">Active</MenuItem>
                            <MenuItem value="false">Inactive</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Delivery Method/Evidence Requirement
                    </Typography>
                    <Controller
                      name={`units.${index}.delivery_method`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          placeholder="Enter delivery method"
                          disabled={isViewMode}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      OTJ Hours
                    </Typography>
                    <Controller
                      name={`units.${index}.otj_hours`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="0"
                          disabled={isViewMode}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Sort Order
                    </Typography>
                    <Controller
                      name={`units.${index}.sort_order`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="0"
                          disabled={isViewMode}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Delivery Lead
                    </Typography>
                    <Controller
                      name={`units.${index}.delivery_lead`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          placeholder="Enter delivery lead"
                          disabled={isViewMode}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                {/* Assessment Criteria (Topics) Section */}
                <Accordion sx={{ mt: 2, backgroundColor: '#f5f5f5' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Assessment Criteria (Topics)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <StandardTopicsForm
                      control={control}
                      moduleIndex={index}
                      assessmentCriteria={units[index]?.assessment_criteria || []}
                      readOnly={isViewMode}
                    />
                  </AccordionDetails>
                </Accordion>
              </Paper>
            ))}
          </Box>
        )}

        <NotificationComponent />
      </Box>
    )
  }

  // Qualification - Units
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Units
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Add and manage units with outcomes and criteria for your qualification course
          </Typography>
        </Box>
        {!isViewMode && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUnit}
          >
            Add Unit
          </Button>
        )}
      </Box>

      {fields.length === 0 ? (
        <Alert severity="info">
          No units added yet. Click "Add Unit" to get started.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {fields.map((field, index) => (
            <Paper
              key={field.id}
              elevation={1}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Unit {index + 1}
                </Typography>
                {!isViewMode && (
                  <Button
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Unit Ref <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Controller
                    name={`units.${index}.unit_ref`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        placeholder="Enter Unit Ref"
                        required
                        disabled={isViewMode}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={8}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Unit Title <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Controller
                    name={`units.${index}.title`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        placeholder="Enter Unit Title"
                        required
                        disabled={isViewMode}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Level
                  </Typography>
                  <Controller
                    name={`units.${index}.level`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Enter Level"
                        disabled={isViewMode}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    GLH (Guided Learning Hours)
                  </Typography>
                  <Controller
                    name={`units.${index}.glh`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Enter GLH"
                        disabled={isViewMode}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Credit Value
                  </Typography>
                  <Controller
                    name={`units.${index}.credit_value`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Enter Credit Value"
                        disabled={isViewMode}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              {/* Assessment Criteria Section */}
              <Accordion sx={{ mt: 2, backgroundColor: '#f5f5f5' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Assessment Criteria
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <AssessmentCriteriaForm
                    control={control}
                    unitIndex={index}
                    learningOutcomes={units[index]?.learning_outcomes || []}
                    readOnly={isViewMode}
                  />
                </AccordionDetails>
              </Accordion>
            </Paper>
            ))}
          </Box>
        )}

        <NotificationComponent />
      </Box>
    )
  }

export default CourseUnitsModulesStep
