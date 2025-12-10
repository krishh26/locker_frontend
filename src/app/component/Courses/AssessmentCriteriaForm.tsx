/**
 * AssessmentCriteriaForm.tsx
 *
 * Assessment Criteria form component using React Hook Form
 * Clean, professional implementation matching CourseDetailsForm pattern
 */

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
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
import React, { useEffect, useState } from 'react'
import {
  Control,
  Controller,
  FieldErrors,
  useFieldArray,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form'
import TopicsForm from './TopicsForm'

export interface AssessmentCriterion {
  id: number
  code: string
  title: string
  type: 'to-do' | 'to-know' | 'req'
  showOrder: number
  timesMet: number
  topics?: Array<{
    id: string
    title: string
    type?: string
    showOrder?: number
    code?: string
  }>
}

export interface LearningOutcome {
  id: string
  number: string
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

  // Watch subUnits to access topics
  const subUnits = useWatch({
    control,
    name: `units.${unitIndex}.subUnit`,
    defaultValue: [],
  })

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const handleAddCriterion = () => {
    const newCriterion: AssessmentCriterion = {
      id: Date.now(),
      code: '',
      title: '',
      type: 'to-do',
      showOrder: fields.length + 1,
      timesMet: 0,
      topics: [], // Initialize topics array
    }
    append(newCriterion)
  }

  // Auto-update showOrder when criteria are added/removed
  useEffect(() => {
    if (fields.length > 0 && setValue) {
      fields.forEach((_, index) => {
        const expectedShowOrder = index + 1
        setValue(
          `units.${unitIndex}.subUnit.${index}.showOrder`,
          expectedShowOrder
        )
      })
    }
  }, [fields.length, setValue, unitIndex])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'justify-between', mb: 3 }}>
        <Typography
          variant='body2'
          gutterBottom
          sx={{ fontWeight: 600, mb: 2, flex: 1 }}
        >
          {' '}
          Learning Outcome{' '}
          {assessmentCriteria.length > 0 && `(${assessmentCriteria.length})`}
        </Typography>
        {!readOnly && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleAddCriterion}
            size='small'
          >
            Add Learning Outcome
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
                <TableCell sx={{ width: 50 }}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  Type <span style={{ color: 'red' }}>*</span>
                </TableCell>
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
              {fields.map((field, index) => {
                const isExpanded = expandedRows.has(index)
                return (
                  <React.Fragment key={field.id}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size='small'
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
                          name={`units.${unitIndex}.subUnit.${index}.type`}
                          control={control}
                          render={({
                            field: formField,
                            fieldState: { error },
                          }) => (
                            <FormControl
                              size='small'
                              sx={{ minWidth: 120 }}
                              error={!!error}
                            >
                              <Select {...formField} disabled={readOnly}>
                                <MenuItem value='to-do'>To Do</MenuItem>
                                <MenuItem value='to-know'>To Know</MenuItem>
                                <MenuItem value='req'>Required</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`units.${unitIndex}.subUnit.${index}.code`}
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
                          name={`units.${unitIndex}.subUnit.${index}.showOrder`}
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
                          name={`units.${unitIndex}.subUnit.${index}.title`}
                          control={control}
                          render={({
                            field: formField,
                            fieldState: { error },
                          }) => (
                            <TextField
                              {...formField}
                              size='small'
                              placeholder='Criterion title'
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
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={readOnly ? 5 : 6}
                      >
                        <Collapse in={isExpanded} timeout='auto' unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            <TopicsForm
                              control={control}
                              unitIndex={unitIndex}
                              subUnitIndex={index}
                              topics={subUnits?.[index]?.topics || []}
                              readOnly={readOnly}
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
    </Box>
  )
}

export default AssessmentCriteriaForm
