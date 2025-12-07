/**
 * ImportModuleDialog.tsx
 *
 * Dialog component for importing modules from other Standard courses
 * Updated to work with React Hook Form and new schema
 */

import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchCourseAPI,
  selectCourseManagement,
} from 'app/store/courseManagement'
import { v4 as uuidv4 } from 'uuid'

interface ImportModuleDialogProps {
  open: boolean
  onClose: () => void
  onImport: (modules: any[]) => void
  currentCourseId?: string | number
  existingModules?: any[]
}

interface Module {
  id?: string | number
  title: string
  unit_ref?: string
  description?: string
  active?: boolean
  delivery_method?: string
  otj_hours?: string
  delivery_lead?: string
  sort_order?: string
  subUnit?: any[]
  [key: string]: any
}

const ImportModuleDialog: React.FC<ImportModuleDialogProps> = ({
  open,
  onClose,
  onImport,
  currentCourseId,
  existingModules = [],
}) => {
  const dispatch: any = useDispatch()
  const { data, dataFetchLoading } = useSelector(selectCourseManagement)
  const [selectedModuleIds, setSelectedModuleIds] = useState<(string | number)[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [courseList, setCourseList] = useState<any[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [coreType, setCoreType] = useState<string>('Standard')

  const fetchCourse = (searchKeyword = '', page = 1) => {
    dispatch(fetchCourseAPI({ page, page_size: 1000 }, searchKeyword, '', coreType))
  }

  useEffect(() => {
    if (open) {
      fetchCourse()
    }
  }, [coreType, open])

  useEffect(() => {
    if (data && data.length > 0 && !dataFetchLoading) {
      const filteredCourses = data
        .map(({ course_id, course_name, units }) => ({
          course_id,
          course_name,
          modules: units || [],
        }))
        .filter((course) => {
          // Filter out current course and courses with no modules
          return course.course_id != currentCourseId && course.modules.length > 0
        })

      setCourseList(filteredCourses)
    }
  }, [data, dataFetchLoading, currentCourseId])

  const handleToggleModule = (id: string | number) => {
    setSelectedModuleIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleCopyModules = () => {
    const selectedModules = selectedModuleIds
      .map((id) => modules.find((m) => m.id == id))
      .filter((m) => m !== undefined) as Module[]

    // Get existing module IDs to avoid duplicates
    const existingModuleRefs = new Set(
      existingModules.map((m) => m.unit_ref || m.component_ref || '')
    )

    // Filter out modules that already exist (by unit_ref)
    const newModules = selectedModules.filter((module) => {
      const moduleRef = module.unit_ref || module.component_ref || ''
      return !existingModuleRefs.has(moduleRef)
    })

    // Map modules to new schema format
    const mappedModules = newModules.map((module, index) => {
      const currentLength = existingModules.length
      return {
        id: `module_${uuidv4()}`,
        title: module.title || '',
        unit_ref: module.unit_ref || module.component_ref || '',
        description: module.description || '',
        active: typeof module.active === 'boolean' ? module.active : module.active === 'Yes' || false,
        delivery_method: module.delivery_method || '',
        otj_hours: module.otj_hours || '0',
        delivery_lead: module.delivery_lead || '',
        sort_order: String(currentLength + index + 1),
        subUnit: module.subUnit || module.assessment_criteria || [],
      }
    })

    onImport(mappedModules)
    handleClose()
  }

  const handleCourseChange = (e: any) => {
    const courseId = e.target.value
    const course = courseList.find((c) => c.course_id === courseId)
    setSelectedCourse(courseId)
    setModules(course?.modules || [])
    setSelectedModuleIds([]) // Reset selection when course changes
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCoreType(event.target.value)
    setSelectedCourse('')
    setModules([])
    setSelectedModuleIds([])
  }

  const handleClose = () => {
    setSelectedCourse('')
    setModules([])
    setSelectedModuleIds([])
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Modules from Other Courses</DialogTitle>
      <DialogContent>
        {dataFetchLoading ? (
          <Box
            mt={4}
            mb={2}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress thickness={5} size={40} />
            <Box mt={2} color="text.secondary" fontSize="0.95rem">
              Loading courses...
            </Box>
          </Box>
        ) : (
          <>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Course Type</FormLabel>
              <RadioGroup row value={coreType} onChange={handleChange}>
                <FormControlLabel
                  value="Standard"
                  control={<Radio />}
                  label="Standard"
                />
                <FormControlLabel value="" control={<Radio />} label="All" />
              </RadioGroup>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Select Course</InputLabel>
              <Select
                value={selectedCourse}
                onChange={handleCourseChange}
                label="Select Course"
              >
                {courseList.map((course) => (
                  <MenuItem key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {courseList.length === 0 && !dataFetchLoading && (
              <Box mt={2} color="text.secondary">
                <Typography variant="body2">
                  No courses with modules found.
                </Typography>
              </Box>
            )}

            {selectedCourse && modules.length === 0 ? (
              <Box mt={2} color="text.secondary">
                <Typography variant="body2">
                  No modules found for this course.
                </Typography>
              </Box>
            ) : (
              selectedCourse && (
                <Box mt={2}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Select modules to import:
                  </Typography>
                  <List
                    sx={{
                      maxHeight: 300,
                      overflow: 'auto',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    {modules.map((module) => {
                      const moduleRef = module.unit_ref || module.component_ref || ''
                      const isDuplicate = existingModules.some(
                        (m) => (m.unit_ref || m.component_ref || '') === moduleRef
                      )
                      
                      return (
                        <ListItem key={module.id} divider>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedModuleIds.includes(module.id as string | number)}
                                onChange={() => handleToggleModule(module.id as string | number)}
                                disabled={isDuplicate}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  {module.title || 'Untitled Module'}
                                </Typography>
                                {moduleRef && (
                                  <Typography variant="caption" color="text.secondary">
                                    Ref: {moduleRef}
                                  </Typography>
                                )}
                                {isDuplicate && (
                                  <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                                    (Already exists)
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      )
                    })}
                  </List>
                </Box>
              )
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleCopyModules}
          variant="contained"
          disabled={selectedModuleIds.length === 0 || dataFetchLoading}
          color="primary"
        >
          Import Selected Modules
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ImportModuleDialog

