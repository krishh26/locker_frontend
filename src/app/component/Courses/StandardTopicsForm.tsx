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
  title: string
  description: string
  type: 'Behaviour' | 'Knowledge' | 'Skills'
  showOrder: number
  code?: string
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
    name: `units.${moduleIndex}.subUnit`,
  })

  const handleAddTopic = () => {
    const newTopic: StandardTopic = {
      id: `topic_${uuidv4()}`,
      title: '',
      description: '',
      type: 'Behaviour',
      showOrder: fields.length + 1,
      code: '',
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
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Type <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Controller
                    name={`units.${moduleIndex}.subUnit.${index}.type`}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth size="small" error={!!error}>
                        <Select {...field} disabled={readOnly}>
                          <MenuItem value="Behaviour">Behaviour</MenuItem>
                          <MenuItem value="Knowledge">Knowledge</MenuItem>
                          <MenuItem value="Skills">Skills</MenuItem>
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
                    name={`units.${moduleIndex}.subUnit.${index}.code`}
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
                    name={`units.${moduleIndex}.subUnit.${index}.showOrder`}
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

                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Title <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Controller
                    name={`units.${moduleIndex}.subUnit.${index}.title`}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        placeholder="Enter topic title"
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
                    name={`units.${moduleIndex}.subUnit.${index}.description`}
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

