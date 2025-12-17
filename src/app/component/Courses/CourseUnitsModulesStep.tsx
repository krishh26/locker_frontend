
/**
 * CourseUnitsModulesStep.tsx
 *
 * Step 2 component for managing Units (Qualification) or Modules (Standard)
 * Clean, professional implementation using React Hook Form
 */

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  Alert,
  Box,
  Button,
  Collapse,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import { CourseCoreType } from 'app/store/courseBuilderSlice'
import React, { useEffect, useState } from 'react'
import { Controller, useFieldArray, useWatch } from 'react-hook-form'
import AssessmentCriteriaForm from './AssessmentCriteriaForm'
import StandardTopicsForm from './StandardTopicsForm'
import { useCourseBuilderAPI } from './useCourseBuilderAPI'
import { useNotification } from './useNotification'

interface CourseUnitsModulesStepProps {
  courseId?: string
  courseCoreType: CourseCoreType
  edit?: 'create' | 'edit' | 'view'
  control: any
  setValue: any
  errors?: any
}

interface LearningOutcome {
  id: string
  number: string
  description: string
  [key: string]: any
}

interface Unit {
  id?: string | number
  code?: string
  title: string
  mandatory?: boolean
  level?: string | null
  glh?: number | null
  credit_value?: number | null
  moduleType?: string
  type?: string
  subUnit?: any[]
  [key: string]: any
}

interface UnitsModulesFormData {
  units: Unit[]
}

const CourseUnitsModulesStep: React.FC<CourseUnitsModulesStepProps> = ({
  courseId,
  courseCoreType,
  edit = 'create',
  control,
  setValue,
  errors,
}) => {
  const { NotificationComponent } = useNotification()
  const { loadCourse } = useCourseBuilderAPI()
  const isViewMode = edit === 'view'
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'units',
  })

  const units = useWatch({
    control,
    name: 'units',
    defaultValue: [],
  })

  // Helper function to generate next code based on type
  const getNextCode = (type: string, currentIndex?: number): string => {
    if (!units || units.length === 0) {
      const prefix = type === 'Knowledge' ? 'K' : type === 'Behaviour' ? 'B' : type === 'Skills' ? 'S' : 'D'
      return `${prefix}1`
    }

    const prefix = type === 'Knowledge' ? 'K' : type === 'Behaviour' ? 'B' : type === 'Skills' ? 'S' : 'D'
    const existingCodes = units
      .map((unit: any, idx: number) => {
        // Skip current unit if currentIndex is provided
        if (currentIndex !== undefined && idx === currentIndex) return null
        if (unit.type === type && unit.code) {
          const match = unit.code.match(new RegExp(`^${prefix}(\\d+)$`))
          return match ? parseInt(match[1], 10) : 0
        }
        return null
      })
      .filter((num: any) => num !== null && num > 0)

    const maxNumber = existingCodes.length > 0 ? Math.max(...existingCodes) : 0
    return `${prefix}${maxNumber + 1}`
  }

  // Close expanded rows when type changes from Duty to something else
  // Also auto-add Assessment Criteria when type is Duty and subUnit is empty
  // This logic is only for Standard type courses
  useEffect(() => {
    if (courseCoreType === 'Standard' && units && units.length > 0 && setValue && !isViewMode) {
      units.forEach((unit: any, index: number) => {
        // Auto-add Assessment Criteria for Duty type units that don't have any
        if (unit.type === 'Duty' && (!unit.subUnit || unit.subUnit.length === 0)) {
          const newAssessmentCriteria = {
            id: Date.now(),
            title: '',
            type: 'Knowledge',
            code: 'K1',
          }
          setValue(`units.${index}.subUnit`, [newAssessmentCriteria])
        }
      })
      
      // Close expanded rows when type changes from Duty to something else
      setExpandedRows((prevExpanded) => {
        const newExpanded = new Set(prevExpanded)
        let changed = false
        units.forEach((unit: any, index: number) => {
          if (unit.type !== 'Duty' && prevExpanded.has(index)) {
            newExpanded.delete(index)
            changed = true
          }
        })
        return changed ? newExpanded : prevExpanded
      })
    }
  }, [courseCoreType, units, setValue, isViewMode])

  // Load existing units/modules when courseId is available
  useEffect(() => {
    if (courseId && setValue) {
      loadCourse(courseId).then((result) => {
        if (result.success && result.data) {
          const units = (result.data as any).units
          if (units && Array.isArray(units)) {
            setValue('units', units)
          }
        }
      })
    }
  }, [courseId, loadCourse, setValue])

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
      const type = 'Knowledge'
      const newModule: Unit = {
        id: Date.now(),
        title: '',
        code: getNextCode(type),
        type: type,
        description: '',
        subUnit: [],
      }
      append(newModule)
    } else {
      const newUnit: Unit = {
        id: Date.now(),
        title: '',
        mandatory: true,
        code: '',
        level: null,
        glh: null,
        credit_value: null,
        subUnit: [],
      }
      append(newUnit)
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
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ width: 50 }}></TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    Type <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    Code <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    Title <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  {!isViewMode && (
                    <TableCell sx={{ fontWeight: 600, width: 100 }} align="center">
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => {
                  const isExpanded = expandedRows.has(index)
                  const unitType = units[index]?.type
                  const showAssessmentCriteria = unitType === 'Duty'
                  return (
                    <React.Fragment key={field.id}>
                      <TableRow hover>
                        <TableCell>
                          {showAssessmentCriteria && (
                            <IconButton
                              size="small"
                              onClick={() => {
                                const newExpanded = new Set(expandedRows)
                                if (isExpanded) {
                                  newExpanded.delete(index)
                                } else {
                                  newExpanded.add(index)
                                }
                                setExpandedRows(newExpanded)
                              }}
                            >
                              {isExpanded ? (
                                <KeyboardArrowUpIcon />
                              ) : (
                                <KeyboardArrowDownIcon />
                              )}
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`units.${index}.type`}
                            control={control}
                            render={({ field: formField, fieldState: { error } }) => (
                              <FormControl size="small" sx={{ minWidth: 150 }} error={!!error}>
                                <Select
                                  {...formField}
                                  disabled={isViewMode}
                                  onChange={(e) => {
                                    const newType = e.target.value
                                    const previousType = formField.value
                                    formField.onChange(newType)
                                    // Auto-populate code when type changes
                                    if (setValue && !isViewMode) {
                                      const newCode = getNextCode(newType, index)
                                      setValue(`units.${index}.code`, newCode)
                                      
                                      // Auto-add Assessment Criteria when type changes to Duty
                                      if (newType === 'Duty' && previousType !== 'Duty') {
                                        const currentSubUnit = units[index]?.subUnit || []
                                        // Only add if subUnit is empty
                                        if (currentSubUnit.length === 0) {
                                          const newAssessmentCriteria = {
                                            id: Date.now(),
                                            title: '',
                                            type: 'Knowledge',
                                            code: 'K1',
                                          }
                                          setValue(`units.${index}.subUnit`, [newAssessmentCriteria])
                                        }
                                      }
                                    }
                                  }}
                                >
                                  <MenuItem value="Knowledge">Knowledge</MenuItem>
                                  <MenuItem value="Behaviour">Behaviour</MenuItem>
                                  <MenuItem value="Skills">Skills</MenuItem>
                                  <MenuItem value="Duty">Duty</MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`units.${index}.code`}
                            control={control}
                            render={({ field: formField, fieldState: { error } }) => (
                              <TextField
                                {...formField}
                                size="small"
                                placeholder="Code"
                                required
                                error={!!error}
                                helperText={error?.message}
                                disabled={isViewMode}
                                sx={{ minWidth: 120 }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`units.${index}.title`}
                            control={control}
                            render={({ field: formField, fieldState: { error } }) => (
                              <TextField
                                {...formField}
                                size="small"
                                placeholder="Title"
                                required
                                error={!!error}
                                helperText={error?.message}
                                disabled={isViewMode}
                                sx={{ minWidth: 200 }}
                                fullWidth
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`units.${index}.description`}
                            control={control}
                            render={({ field: formField }) => (
                              <TextField
                                {...formField}
                                size="small"
                                multiline
                                rows={2}
                                placeholder="Description"
                                disabled={isViewMode}
                                sx={{ minWidth: 200 }}
                                fullWidth
                              />
                            )}
                          />
                        </TableCell>
                        {!isViewMode && (
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => remove(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                      {showAssessmentCriteria && (
                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={isViewMode ? 5 : 6}
                          >
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box sx={{ margin: 2 }}>
                                {errors?.units?.[index]?.subUnit?.message && (
                                  <Alert severity="error" sx={{ mb: 2 }}>
                                    {errors.units[index]?.subUnit?.message}
                                  </Alert>
                                )}
                                <StandardTopicsForm
                                  control={control}
                                  moduleIndex={index}
                                  assessmentCriteria={units[index]?.subUnit || []}
                                  readOnly={isViewMode}
                                  setValue={setValue}
                                />
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                      {unitType === 'Duty' && errors?.units?.[index]?.subUnit?.message && !isExpanded && (
                        <TableRow>
                          <TableCell
                            colSpan={isViewMode ? 5 : 6}
                            sx={{ border: 'none', py: 0 }}
                          >
                            <Alert severity="error" sx={{ mt: 1 }}>
                              {errors.units[index]?.subUnit?.message}
                            </Alert>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
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
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ width: 50 }}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  Unit Ref <span style={{ color: 'red' }}>*</span>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  Unit Title <span style={{ color: 'red' }}>*</span>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Level</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>GLH</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Credit Value</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Mandatory</TableCell>
                {!isViewMode && (
                  <TableCell sx={{ fontWeight: 600, width: 100 }} align="center">
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => {
                const isExpanded = expandedRows.has(index)
                return (
                  <React.Fragment key={field.id}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setExpandedRows((prevExpanded) => {
                              const newExpanded = new Set(prevExpanded)
                              if (newExpanded.has(index)) {
                                newExpanded.delete(index)
                              } else {
                                newExpanded.add(index)
                              }
                              return newExpanded
                            })
                          }}
                        >
                          {isExpanded ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`units.${index}.code`}
                          control={control}
                          render={({ field: formField, fieldState: { error } }) => (
                            <TextField
                              {...formField}
                              size="small"
                              placeholder="Unit Ref"
                              required
                              error={!!error}
                              helperText={error?.message}
                              disabled={isViewMode}
                              sx={{ minWidth: 120 }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`units.${index}.title`}
                          control={control}
                          render={({ field: formField, fieldState: { error } }) => (
                            <TextField
                              {...formField}
                              size="small"
                              placeholder="Unit Title"
                              required
                              error={!!error}
                              helperText={error?.message}
                              disabled={isViewMode}
                              sx={{ minWidth: 200 }}
                              fullWidth
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`units.${index}.level`}
                          control={control}
                          render={({ field: formField }) => (
                            <TextField
                              {...formField}
                              size="small"
                              type="number"
                              placeholder="Level"
                              disabled={isViewMode}
                              sx={{ width: 100 }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`units.${index}.glh`}
                          control={control}
                          render={({ field: formField }) => (
                            <TextField
                              {...formField}
                              size="small"
                              type="number"
                              placeholder="GLH"
                              disabled={isViewMode}
                              sx={{ width: 100 }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`units.${index}.credit_value`}
                          control={control}
                          render={({ field: formField }) => (
                            <TextField
                              {...formField}
                              size="small"
                              type="number"
                              placeholder="Credit"
                              disabled={isViewMode}
                              sx={{ width: 100 }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`units.${index}.mandatory`}
                          control={control}
                          render={({ field: formField }) => (
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={formField.value === true || formField.value === undefined ? 'true' : 'false'}
                                onChange={(e) => formField.onChange(e.target.value === 'true')}
                                disabled={isViewMode}
                              >
                                <MenuItem value="true">Mandatory</MenuItem>
                                <MenuItem value="false">Optional</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </TableCell>
                      {!isViewMode && (
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => remove(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={isViewMode ? 7 : 8}
                      >
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            <AssessmentCriteriaForm
                              control={control}
                              unitIndex={index}
                              assessmentCriteria={units[index]?.subUnit || []}
                              readOnly={isViewMode}
                              setValue={setValue}
                            />
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

        <NotificationComponent />

        
      </Box>
    )
  }

export default CourseUnitsModulesStep
