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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { Controller, Control, useFieldArray, FieldErrors, useWatch, UseFormSetValue } from 'react-hook-form'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { v4 as uuidv4 } from 'uuid'

export interface StandardTopic {
  id: number
  title: string
  type: 'Behaviour' | 'Knowledge' | 'Skills'
  code?: string
  description?: string
}

interface StandardTopicsFormProps {
  control: Control<any>
  moduleIndex: number
  assessmentCriteria: StandardTopic[]
  errors?: FieldErrors<any>
  readOnly?: boolean
  setValue?: UseFormSetValue<any>
}

const StandardTopicsForm: React.FC<StandardTopicsFormProps> = ({
  control,
  moduleIndex,
  assessmentCriteria = [],
  errors,
  readOnly = false,
  setValue,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `units.${moduleIndex}.subUnit`,
  })

  const subUnits = useWatch({
    control,
    name: `units.${moduleIndex}.subUnit`,
    defaultValue: [],
  })

  // Helper function to generate next code based on type
  const getNextSubUnitCode = (type: string, currentIndex?: number): string => {
    if (!subUnits || subUnits.length === 0) {
      const prefix = type === 'Knowledge' ? 'K' : type === 'Behaviour' ? 'B' : 'S'
      return `${prefix}1`
    }

    const prefix = type === 'Knowledge' ? 'K' : type === 'Behaviour' ? 'B' : 'S'
    const existingCodes = subUnits
      .map((subUnit: any, idx: number) => {
        // Skip current subUnit if currentIndex is provided
        if (currentIndex !== undefined && idx === currentIndex) return null
        if (subUnit.type === type && subUnit.code) {
          const match = subUnit.code.match(new RegExp(`^${prefix}(\\d+)$`))
          return match ? parseInt(match[1], 10) : 0
        }
        return null
      })
      .filter((num: any) => num !== null && num > 0)

    const maxNumber = existingCodes.length > 0 ? Math.max(...existingCodes) : 0
    return `${prefix}${maxNumber + 1}`
  }

  const handleAddTopic = () => {
    const type = 'Knowledge'
    const newTopic: StandardTopic = {
      id: Date.now(),
      title: '',
      type: type,
      code: getNextSubUnitCode(type),
    }
    append(newTopic)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography
          variant="body2"
          gutterBottom
          sx={{ fontWeight: 600, mb: 2, flex: 1 }}
        >
          Assessment Criteria {assessmentCriteria.length > 0 && `(${assessmentCriteria.length})`}
        </Typography>
        {!readOnly && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddTopic}
            size="small"
          >
            Add Assessment Criteria
          </Button>
        )}
      </Box>

      {fields.length > 0 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
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
                {!readOnly && (
                  <TableCell sx={{ fontWeight: 600, width: 100 }} align="center">
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id} hover>
                  <TableCell>
                    <Controller
                      name={`units.${moduleIndex}.subUnit.${index}.type`}
                      control={control}
                      render={({ field: formField, fieldState: { error } }) => (
                        <FormControl size="small" sx={{ minWidth: 150 }} error={!!error}>
                          <Select
                            {...formField}
                            disabled={readOnly}
                            onChange={(e) => {
                              const newType = e.target.value
                              formField.onChange(newType)
                              // Auto-populate code when type changes
                              if (setValue && !readOnly) {
                                const newCode = getNextSubUnitCode(newType, index)
                                setValue(`units.${moduleIndex}.subUnit.${index}.code`, newCode)
                              }
                            }}
                          >
                            <MenuItem value="Knowledge">Knowledge</MenuItem>
                            <MenuItem value="Behaviour">Behaviour</MenuItem>
                            <MenuItem value="Skills">Skills</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`units.${moduleIndex}.subUnit.${index}.code`}
                      control={control}
                      render={({ field: formField, fieldState: { error } }) => (
                        <TextField
                          {...formField}
                          size="small"
                          placeholder="Code"
                          required
                          error={!!error}
                          helperText={error?.message}
                          disabled={readOnly}
                          sx={{ minWidth: 100 }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`units.${moduleIndex}.subUnit.${index}.title`}
                      control={control}
                      render={({ field: formField, fieldState: { error } }) => (
                        <TextField
                          {...formField}
                          size="small"
                          placeholder="Topic title"
                          required
                          error={!!error}
                          helperText={error?.message}
                          disabled={readOnly}
                          sx={{ minWidth: 300 }}
                          fullWidth
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`units.${moduleIndex}.subUnit.${index}.description`}
                      control={control}
                      render={({ field: formField }) => (
                        <TextField
                          {...formField}
                          size="small"
                          multiline
                          rows={2}
                          placeholder="Description"
                          disabled={readOnly}
                          sx={{ minWidth: 200 }}
                          fullWidth
                        />
                      )}
                    />
                  </TableCell>
                  {!readOnly && (
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => remove(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default StandardTopicsForm

