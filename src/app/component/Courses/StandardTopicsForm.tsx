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
import { Controller, Control, useFieldArray, FieldErrors } from 'react-hook-form'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { v4 as uuidv4 } from 'uuid'

export interface StandardTopic {
  id: string
  title: string
  type: 'Behaviour' | 'Knowledge' | 'Skills'
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
      type: 'Behaviour',
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
                  Title <span style={{ color: 'red' }}>*</span>
                </TableCell>
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
                          <Select {...formField} disabled={readOnly}>
                            <MenuItem value="Behaviour">Behaviour</MenuItem>
                            <MenuItem value="Knowledge">Knowledge</MenuItem>
                            <MenuItem value="Skills">Skills</MenuItem>
                          </Select>
                        </FormControl>
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

