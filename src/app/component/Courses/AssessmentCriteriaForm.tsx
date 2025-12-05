/**
 * AssessmentCriteriaForm.tsx
 *
 * Assessment Criteria form component using React Hook Form
 * Clean, professional implementation matching CourseDetailsForm pattern
 */

import React from 'react'
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
import { Controller, Control, useFieldArray, FieldErrors } from 'react-hook-form'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { v4 as uuidv4 } from 'uuid'

export interface AssessmentCriterion {
  id: string
  number: string
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
  learningOutcomes: LearningOutcome[]
  errors?: FieldErrors<any>
  readOnly?: boolean
}

const AssessmentCriteriaForm: React.FC<AssessmentCriteriaFormProps> = ({
  control,
  unitIndex,
  learningOutcomes,
  errors,
  readOnly = false,
}) => {
  // Use the first learning outcome or create a default one
  const learningOutcome = learningOutcomes?.[0] || {
    id: `lo_${uuidv4()}`,
    number: '1',
    description: 'Default Learning Outcome',
    assessment_criteria: [],
  }

  const { fields, append, remove } = useFieldArray({
    control,
    name: `units.${unitIndex}.learning_outcomes.0.assessment_criteria`,
  })

  const handleAddCriterion = () => {
    const newCriterion: AssessmentCriterion = {
      id: `ac_${uuidv4()}`,
      number: `${learningOutcome.number}.${fields.length + 1}`,
      title: '',
      description: '',
      type: 'to-do',
      showOrder: fields.length + 1,
      timesMet: 0,
    }
    append(newCriterion)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="body2" color="textSecondary">
            Manage assessment criteria for learning outcomes
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
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Type <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Controller
                    name={`units.${unitIndex}.learning_outcomes.0.assessment_criteria.${index}.type`}
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <Select {...field} disabled={readOnly}>
                          <MenuItem value="to-do">To Do</MenuItem>
                          <MenuItem value="to-know">To Know</MenuItem>
                          <MenuItem value="req">Required</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Number
                  </Typography>
                  <Controller
                    name={`units.${unitIndex}.learning_outcomes.0.assessment_criteria.${index}.number`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        placeholder="e.g., 1.1"
                        disabled={readOnly}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Show Order
                  </Typography>
                  <Controller
                    name={`units.${unitIndex}.learning_outcomes.0.assessment_criteria.${index}.showOrder`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Order"
                        disabled={readOnly}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Times Met
                  </Typography>
                  <Controller
                    name={`units.${unitIndex}.learning_outcomes.0.assessment_criteria.${index}.timesMet`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="0"
                        disabled={readOnly}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Title <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Controller
                    name={`units.${unitIndex}.learning_outcomes.0.assessment_criteria.${index}.title`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        placeholder="Enter criterion title"
                        required
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
                    name={`units.${unitIndex}.learning_outcomes.0.assessment_criteria.${index}.description`}
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

