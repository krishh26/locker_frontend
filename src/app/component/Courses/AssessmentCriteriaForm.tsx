/**
 * AssessmentCriteriaForm.tsx
 *
 * Assessment Criteria form component using React Hook Form
 * Clean, professional implementation matching CourseDetailsForm pattern
 */

import React, { useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material'
import { Controller, Control, useFieldArray, FieldErrors, UseFormSetValue } from 'react-hook-form'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

export interface AssessmentCriterion {
  id: number
  code: string
  title: string
  description: string
  type: 'to-do' | 'to-know' | 'req'
  showOrder: number
  timesMet: number
}

export interface LearningOutcome {
  id: string
  number: string
  description: string
  assessment_criteria: AssessmentCriterion[]
}

interface AssessmentCriteriaFormProps {
  control: Control<any>
  unitIndex: number
  assessmentCriteria: AssessmentCriterion[]
  errors?: FieldErrors<any>
  readOnly?: boolean
  setValue?: UseFormSetValue<any>
}

const AssessmentCriteriaForm: React.FC<AssessmentCriteriaFormProps> = ({
  control,
  unitIndex,
  assessmentCriteria,
  errors,
  readOnly = false,
  setValue,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `units.${unitIndex}.subUnit`,
  })

  const handleAddCriterion = () => {
    const newCriterion: AssessmentCriterion = {
      id: Date.now(),
      code: '',
      title: '',
      description: '',
      type: 'to-do',
      showOrder: fields.length + 1,
      timesMet: 0,
    }
    append(newCriterion)
  }

  // Auto-update showOrder when criteria are added/removed
  useEffect(() => {
    if (fields.length > 0 && setValue) {
      fields.forEach((_, index) => {
        const expectedShowOrder = index + 1
        setValue(`units.${unitIndex}.subUnit.${index}.showOrder`, expectedShowOrder)
      })
    }
  }, [fields.length, setValue, unitIndex])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="body2" color="textSecondary">
            Manage assessment criteria for this unit
          </Typography>
        </Box>
        {!readOnly && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCriterion}
            size="small"
          >
            Add Criterion
          </Button>
        )}
      </Box>

      {fields.length === 0 ? (
        <Box
          sx={{
            p: 3,
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            No assessment criteria added yet.
          </Typography>
          {!readOnly && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddCriterion}
            >
              Add First Criterion
            </Button>
          )}
        </Box>
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
                  Criterion {index + 1}
                </Typography>
                {!readOnly && (
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => remove(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Type <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Controller
                    name={`units.${unitIndex}.subUnit.${index}.type`}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth size="small" error={!!error}>
                        <Select {...field} disabled={readOnly}>
                          <MenuItem value="to-do">To Do</MenuItem>
                          <MenuItem value="to-know">To Know</MenuItem>
                          <MenuItem value="req">Required</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Code
                  </Typography>
                  <Controller
                    name={`units.${unitIndex}.subUnit.${index}.code`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        placeholder="Enter code"
                        disabled={readOnly}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Show Order
                  </Typography>
                  <Controller
                    name={`units.${unitIndex}.subUnit.${index}.showOrder`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Auto"
                        value={field.value ?? index + 1}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Title <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Controller
                    name={`units.${unitIndex}.subUnit.${index}.title`}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        placeholder="Enter criterion title"
                        required
                        error={!!error}
                        helperText={error?.message}
                        disabled={readOnly}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Description
                  </Typography>
                  <Controller
                    name={`units.${unitIndex}.subUnit.${index}.description`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        placeholder="Enter criterion description"
                        disabled={readOnly}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default AssessmentCriteriaForm

