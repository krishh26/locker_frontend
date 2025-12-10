
/**
 * CourseUnitsModulesStep.tsx
 *
 * Step 2 component for managing Units (Qualification) or Modules (Standard)
 * Clean, professional implementation using React Hook Form
 */

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import FileUploadIcon from '@mui/icons-material/FileUpload'
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
import ImportModuleDialog from './ImportModuleDialog'
import StandardTopicsForm from './StandardTopicsForm'
import { useCourseBuilderAPI } from './useCourseBuilderAPI'
import { useNotification } from './useNotification'

interface CourseUnitsModulesStepProps {
  courseId?: string
  courseCoreType: CourseCoreType
  edit?: 'create' | 'edit' | 'view'
  control: any
  setValue: any
}

interface LearningOutcome {
  id: string
  number: string
  description: string
  [key: string]: any
}

interface Unit {
  id?: string | number
  unit_ref?: string
  title: string
  mandatory: boolean
  level?: string | null
  glh?: number | null
  credit_value?: number | null
  moduleType?: string
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
}) => {
  const { NotificationComponent } = useNotification()
  const { loadCourse } = useCourseBuilderAPI()
  const isViewMode = edit === 'view'
  const [importDialogOpen, setImportDialogOpen] = useState(false)
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

  // Auto-update sort_order when units are added/removed
  useEffect(() => {
    if (units && units.length > 0 && setValue) {
      units.forEach((unit: any, index: number) => {
        const expectedSortOrder = String(index + 1)
        if (unit.sort_order !== expectedSortOrder) {
          setValue(`units.${index}.sort_order`, expectedSortOrder)
        }
      })
    }
  }, [units?.length, setValue, units])

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
      // Get current units count for auto-filling sort_order
      const currentUnitsCount = units?.length || 0
      const newModule: Unit = {
        id: Date.now(),
        title: '',
        unit_ref: '',
        mandatory: true,
        description: '',
        delivery_method: '',
        otj_hours: '0',
        delivery_lead: '',
        sort_order: String(currentUnitsCount + 1), // Auto-fill with next number
        active: true,
        subUnit: [],
      }
      append(newModule)
    } else {
      const newUnit: Unit = {
        id: Date.now(),
        title: '',
        mandatory: true,
        unit_ref: '',
        level: null,
        glh: null,
        credit_value: null,
        subUnit: [],
      }
      append(newUnit)
    }
  }

  const handleImportModules = (importedModules: any[]) => {
    importedModules.forEach((module) => {
      append(module)
    })
    setImportDialogOpen(false)
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FileUploadIcon />}
                onClick={() => setImportDialogOpen(true)}
              >
                Import Modules
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddUnit}
              >
                Add Module
              </Button>
            </Box>
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
                    Module Title <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    Module Reference <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Sort Order</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Delivery Method</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>OTJ Hours</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Delivery Lead</TableCell>
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
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`units.${index}.title`}
                            control={control}
                            render={({ field: formField, fieldState: { error } }) => (
                              <TextField
                                {...formField}
                                size="small"
                                placeholder="Module Title"
                                required
                                error={!!error}
                                helperText={error?.message}
                                disabled={isViewMode}
                                sx={{ minWidth: 150 }}
                                fullWidth
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`units.${index}.unit_ref`}
                            control={control}
                            render={({ field: formField, fieldState: { error } }) => (
                              <TextField
                                {...formField}
                                size="small"
                                placeholder="Module Ref"
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
                                sx={{ minWidth: 150 }}
                                fullWidth
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`units.${index}.active`}
                            control={control}
                            render={({ field: formField }) => (
                              <FormControl size="small" sx={{ minWidth: 100 }}>
                                <Select
                                  value={formField.value === true || formField.value === undefined ? 'true' : 'false'}
                                  onChange={(e) => formField.onChange(e.target.value === 'true')}
                                  disabled={isViewMode}
                                >
                                  <MenuItem value="true">Active</MenuItem>
                                  <MenuItem value="false">Inactive</MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`units.${index}.sort_order`}
                            control={control}
                            render={({ field: formField }) => (
                              <TextField
                                {...formField}
                                size="small"
                                type="number"
                                placeholder="Auto"
                                disabled={isViewMode}
                                sx={{ width: 80 }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`units.${index}.delivery_method`}
                            control={control}
                            render={({ field: formField }) => (
                              <TextField
                                {...formField}
                                size="small"
                                placeholder="Delivery Method"
                                disabled={isViewMode}
                                sx={{ minWidth: 150 }}
                                fullWidth
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`units.${index}.otj_hours`}
                            control={control}
                            render={({ field: formField }) => (
                              <TextField
                                {...formField}
                                size="small"
                                type="number"
                                placeholder="0"
                                disabled={isViewMode}
                                sx={{ width: 100 }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`units.${index}.delivery_lead`}
                            control={control}
                            render={({ field: formField }) => (
                              <TextField
                                {...formField}
                                size="small"
                                placeholder="Delivery Lead"
                                disabled={isViewMode}
                                sx={{ minWidth: 120 }}
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
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={isViewMode ? 9 : 10}
                        >
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2 }}>
                              <StandardTopicsForm
                                control={control}
                                moduleIndex={index}
                                assessmentCriteria={units[index]?.subUnit || []}
                                readOnly={isViewMode}
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
        {/* Import Module Dialog */}
        <ImportModuleDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          onImport={handleImportModules}
          currentCourseId={courseId}
          existingModules={units || []}
        />
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
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`units.${index}.unit_ref`}
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
