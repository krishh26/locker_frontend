/**
 * StandardTopicsForm.tsx
 *
 * Standard Topics (Assessment Criteria) form component using React Hook Form
 * Clean, professional implementation for Standard course modules
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
  IconButton,
} from '@mui/material'
import { Controller, Control, useFieldArray, FieldErrors } from 'react-hook-form'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { v4 as uuidv4 } from 'uuid'

export interface StandardTopic {
  id: string
  number: string
  title: string
  description: string
  type: 'to-do' | 'to-know' | 'req'
  criterionCategory: 'knowledge' | 'skill' | 'behavior'
  showOrder: number
  timesMet: number
  referenceNumber?: string
}

interface StandardTopicsFormProps {
  control: Control<any>
  moduleIndex: number
  assessmentCriteria: StandardTopic[]
  errors?: FieldErrors<any>
  readOnly?: boolean
}

const StandardTopicsForm: React.FC<StandardTopicsFormProps> = ({
  control,
  moduleIndex,
  assessmentCriteria = [],
  errors,
  readOnly = false,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `units.${moduleIndex}.assessment_criteria`,
  })

  const handleAddTopic = () => {
    const newTopic: StandardTopic = {
      id: `topic_${uuidv4()}`,
      number: `${fields.length + 1}`,
      title: '',
      description: '',
      type: 'to-do',
      criterionCategory: 'knowledge',
      showOrder: fields.length + 1,
      timesMet: 0,
      referenceNumber: '',
    }
    append(newTopic)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="body2" color="textSecondary">
            Manage assessment criteria (topics) for this module
          </Typography>
        </Box>
        {!readOnly && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTopic}
            size="small"
          >
            Add Topic
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
            No topics added yet.
          </Typography>
          {!readOnly && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddTopic}
            >
              Add First Topic
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
                  Topic {index + 1}
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
                    name={`units.${moduleIndex}.assessment_criteria.${index}.type`}
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
                    Category <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Controller
                    name={`units.${moduleIndex}.assessment_criteria.${index}.criterionCategory`}
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <Select {...field} disabled={readOnly}>
                          <MenuItem value="knowledge">Knowledge</MenuItem>
                          <MenuItem value="skill">Skill</MenuItem>
                          <MenuItem value="behavior">Behavior</MenuItem>
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
                    name={`units.${moduleIndex}.assessment_criteria.${index}.number`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        placeholder="e.g., 1"
                        disabled={readOnly}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Reference Number
                  </Typography>
                  <Controller
                    name={`units.${moduleIndex}.assessment_criteria.${index}.referenceNumber`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        placeholder="Reference"
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
                    name={`units.${moduleIndex}.assessment_criteria.${index}.showOrder`}
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
                    name={`units.${moduleIndex}.assessment_criteria.${index}.timesMet`}
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
                    name={`units.${moduleIndex}.assessment_criteria.${index}.title`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        placeholder="Enter topic title"
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
                    name={`units.${moduleIndex}.assessment_criteria.${index}.description`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        placeholder="Enter topic description"
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

export default StandardTopicsForm

