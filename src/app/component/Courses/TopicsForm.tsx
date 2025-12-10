/**
 * TopicsForm.tsx
 *
 * Topics form component for Qualification courses
 * Used within SubUnits (Assessment Criteria) - Unit => SubUnit => Topic
 */

import React, { useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  Controller,
  Control,
  useFieldArray,
  UseFormSetValue,
} from 'react-hook-form'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

export interface Topic {
  id: number
  title: string
  type?: string
  showOrder?: number
  code?: string
}

interface TopicsFormProps {
  control: Control<any>
  unitIndex: number
  subUnitIndex: number
  topics: Topic[]
  readOnly?: boolean
  setValue?: UseFormSetValue<any>
}

const TopicsForm: React.FC<TopicsFormProps> = ({
  control,
  unitIndex,
  subUnitIndex,
  topics = [],
  readOnly = false,
  setValue,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `units.${unitIndex}.subUnit.${subUnitIndex}.topics`,
  })

  const handleAddTopic = () => {
    const newTopic: Topic = {
      id: Date.now(),
      title: '',
      type: 'Knowledge',
      showOrder: fields.length + 1,
      code: '',
    }
    append(newTopic)
  }

  // Auto-update showOrder when topics are added/removed
  useEffect(() => {
    if (fields.length > 0 && setValue) {
      fields.forEach((_, index) => {
        const expectedShowOrder = index + 1
        setValue(
          `units.${unitIndex}.subUnit.${subUnitIndex}.topics.${index}.showOrder`,
          expectedShowOrder
        )
      })
    }
  }, [fields.length, setValue, unitIndex, subUnitIndex])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'justify-between', mb: 2 }}>
        <Typography
          variant='body2'
          gutterBottom
          sx={{ fontWeight: 600, mb: 2, flex: 1 }}
        >
          Assessment Criteria {topics.length > 0 && `(${topics.length})`}
        </Typography>
        {!readOnly && (
          <Button
            variant='outlined'
            startIcon={<AddIcon />}
            onClick={handleAddTopic}
            size='small'
          >
            Add Assessment Criteria
          </Button>
        )}
      </Box>

      {fields.length > 0 && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Show Order</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  Title <span style={{ color: 'red' }}>*</span>
                </TableCell>
                {!readOnly && (
                  <TableCell
                    sx={{ fontWeight: 600, width: 100 }}
                    align='center'
                  >
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
                      name={`units.${unitIndex}.subUnit.${subUnitIndex}.topics.${index}.code`}
                      control={control}
                      render={({ field: formField }) => (
                        <TextField
                          {...formField}
                          size='small'
                          placeholder='Code'
                          disabled={readOnly}
                          sx={{ minWidth: 100 }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`units.${unitIndex}.subUnit.${subUnitIndex}.topics.${index}.showOrder`}
                      control={control}
                      render={({ field: formField }) => (
                        <TextField
                          {...formField}
                          size='small'
                          type='number'
                          placeholder='Auto'
                          value={formField.value ?? index + 1}
                          disabled={readOnly}
                          sx={{ width: 80 }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`units.${unitIndex}.subUnit.${subUnitIndex}.topics.${index}.title`}
                      control={control}
                      render={({ field: formField, fieldState: { error } }) => (
                        <TextField
                          {...formField}
                          size='small'
                          placeholder='Topic title'
                          required
                          error={!!error}
                          helperText={error?.message}
                          disabled={readOnly}
                          sx={{ minWidth: 200 }}
                          fullWidth
                        />
                      )}
                    />
                  </TableCell>
                  {!readOnly && (
                    <TableCell align='center'>
                      <IconButton
                        color='error'
                        size='small'
                        onClick={() => remove(index)}
                      >
                        <DeleteIcon fontSize='small' />
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

export default TopicsForm
