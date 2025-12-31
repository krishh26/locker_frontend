import React, { memo } from 'react'
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import GapIndicator from './GapIndicator'
import EvidenceIndicator from './EvidenceIndicator'

/**
 * Type definitions for UnitsTable
 */
export type UnitsTableVariant = 'combined' | 'duty' | 'qualification'

export interface UnitsTableRow {
  id: string | number
  title: string
  learnerMap?: boolean
  trainerMap?: boolean
  signedOff?: boolean
  comment?: string
  unitId?: string | number
  unitTitle?: string
  courseId?: string | number
}

export interface UnitsTableProps {
  variant: UnitsTableVariant
  title: string
  rows: UnitsTableRow[]
  unitsWatch: any[]
  courseId: string | number
  isEditMode: boolean
  canEditLearnerFields: boolean
  canEditTrainerFields: boolean
  isSubmitted: boolean
  errors?: any
  // Handlers - matching actual useUnitHandlers signatures
  learnerMapHandler: (row: any) => void
  trainerMapHandler: (row: any) => void
  signedOffHandler: (row: any) => void
  commentHandler: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string | number) => void
  selectAllLearnerMapHandler?: (unitIndex: number, checked: boolean) => void
  selectAllSignedOffHandler?: (unitIndex: number, checked: boolean) => void
  selectAllSignedOffForCombinedHandler?: (combinedSubUnits: any[], checked: boolean) => void
  // Evidence count
  getEvidenceCount: (courseId: string | number, unitId: string | number, subunitId?: string | number) => number
  // Form methods
  setValue: (name: string, value: any) => void
  trigger: (name?: any) => Promise<any>
  // Unit-specific data (for duty/qualification variants)
  units?: any
  unitIndex?: number
  // Validation
  validationMessage?: string
  // For combined variant - the actual combinedSubUnits array
  combinedSubUnits?: any[]
}

/**
 * UnitsTable Component
 * 
 * Renders units/subunits table in three variants:
 * - 'combined': Combines all subUnits from multiple units (Standard - Knowledge/Behaviour/Skills)
 * - 'duty': Shows separate tables for each unit (Standard - Duty)
 * - 'qualification': Shows unit title first, then subUnits (Qualification courses)
 */
const UnitsTable: React.FC<UnitsTableProps> = ({
  variant,
  title,
  rows,
  unitsWatch,
  courseId,
  isEditMode,
  canEditLearnerFields,
  canEditTrainerFields,
  isSubmitted,
  errors,
  learnerMapHandler,
  trainerMapHandler,
  signedOffHandler,
  commentHandler,
  selectAllLearnerMapHandler,
  selectAllSignedOffHandler,
  selectAllSignedOffForCombinedHandler,
  getEvidenceCount,
  setValue,
  trigger,
  units,
  unitIndex,
  validationMessage,
  combinedSubUnits,
}) => {
  // Determine if rows have subUnits
  const hasSubUnit = variant !== 'combined' && units?.subUnit && units.subUnit.length > 0

  // Get current row values from unitsWatch for real-time updates
  const getCurrentRowValues = (row: UnitsTableRow) => {
    if (variant === 'combined') {
      // For combined variant, find the unit
      const unit = unitsWatch.find((u: any) => String(u.id) === String(row.unitId))
      const hasSubUnitInUnit = unit?.subUnit && unit.subUnit.length > 0

      if (!hasSubUnitInUnit) {
        const currentUnit = unitsWatch.find(
          (u: any) => String(u.id) === String(row.id || row.unitId)
        )
        return {
          learnerMap: currentUnit?.learnerMap ?? row.learnerMap ?? false,
          trainerMap: currentUnit?.trainerMap ?? row.trainerMap ?? false,
          signedOff: currentUnit?.signedOff ?? row.signedOff ?? false,
          comment: currentUnit?.comment ?? row.comment ?? '',
        }
      } else {
        const currentUnit = unitsWatch.find((u: any) => String(u.id) === String(row.unitId))
        const currentSubUnit = currentUnit?.subUnit?.find(
          (s: any) => String(s.id) === String(row.id)
        )
        return {
          learnerMap: currentSubUnit?.learnerMap ?? row.learnerMap ?? false,
          trainerMap: currentSubUnit?.trainerMap ?? row.trainerMap ?? false,
          signedOff: currentSubUnit?.signedOff ?? row.signedOff ?? false,
          comment: currentSubUnit?.comment ?? row.comment ?? '',
        }
      }
    } else {
      // For duty and qualification variants
      return {
        learnerMap: row.learnerMap ?? false,
        trainerMap: row.trainerMap ?? false,
        signedOff: row.signedOff ?? false,
        comment: row.comment ?? '',
      }
    }
  }

  // Calculate evidence count
  const getRowEvidenceCount = (row: UnitsTableRow) => {
    if (variant === 'combined') {
      const unit = unitsWatch.find((u: any) => String(u.id) === String(row.unitId))
      const hasSubUnitInUnit = unit?.subUnit && unit.subUnit.length > 0
      if (hasSubUnitInUnit) {
        return getEvidenceCount(courseId, row.unitId!, row.id)
      } else {
        return getEvidenceCount(courseId, row.id || row.unitId!)
      }
    } else if (variant === 'qualification') {
      return getEvidenceCount(courseId, units?.id, row.id)
    } else {
      // duty variant
      return getEvidenceCount(courseId, units?.id, hasSubUnit ? row.id : undefined)
    }
  }

  // Calculate select all states
  const allLearnerMapSelected = variant === 'combined'
    ? rows.every((r) => getCurrentRowValues(r).learnerMap)
    : hasSubUnit
    ? units?.subUnit?.every((s: any) => s.learnerMap ?? false) ?? false
    : units?.learnerMap ?? false

  const allSignedOffSelected = variant === 'combined'
    ? rows.every((r) => {
        const values = getCurrentRowValues(r)
        return (values.learnerMap && values.trainerMap && values.signedOff)
      })
    : hasSubUnit
    ? units?.subUnit?.every((s: any) => 
        (s.learnerMap ?? false) && (s.trainerMap ?? false) && (s.signedOff ?? false)
      ) ?? false
    : (units?.learnerMap ?? false) && (units?.trainerMap ?? false) && (units?.signedOff ?? false)

  const someSignedOffSelected = variant === 'combined'
    ? rows.some((r) => {
        const values = getCurrentRowValues(r)
        return (values.learnerMap && values.trainerMap && values.signedOff)
      })
    : hasSubUnit
    ? units?.subUnit?.some((s: any) => 
        (s.learnerMap ?? false) && (s.trainerMap ?? false) && (s.signedOff ?? false)
      ) ?? false
    : false

  return (
    <Box sx={{ mb: variant === 'qualification' ? 3 : variant === 'duty' ? 2 : 3 }}>
      {variant === 'qualification' && units?.title && (
        <Typography variant='h5' sx={{ mb: 1, fontWeight: 600 }}>
          {units.title}
        </Typography>
      )}
      
      <TableContainer>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>
                {variant === 'combined' ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allLearnerMapSelected}
                        onChange={(e) => {
                          // Handle combined variant select all
                          const updated = [...unitsWatch]
                          rows.forEach((row) => {
                            const unit = updated.find((u: any) => u.id === row.unitId)
                            if (unit) {
                              const hasSubUnitInUnit = unit.subUnit && unit.subUnit.length > 0
                              if (hasSubUnitInUnit) {
                                unit.subUnit.forEach((usub: any) => {
                                  if (usub.id === row.id) {
                                    usub.learnerMap = e.target.checked
                                  }
                                })
                              } else {
                                unit.learnerMap = e.target.checked
                              }
                            }
                          })
                          setValue('units', updated)
                          trigger('units')
                        }}
                        disabled={isEditMode || !canEditLearnerFields}
                      />
                    }
                    label='Learner Map'
                    sx={{ margin: 0 }}
                  />
                ) : (
                  <Checkbox
                    checked={allLearnerMapSelected}
                    onChange={(e) => {
                      if (selectAllLearnerMapHandler && unitIndex !== undefined) {
                        selectAllLearnerMapHandler(unitIndex, e.target.checked)
                      }
                    }}
                    disabled={isEditMode || !canEditLearnerFields}
                  />
                )}
              </TableCell>
              <TableCell>
                {hasSubUnit ? 'Sub unit name' : variant === 'combined' ? 'Sub unit name' : 'Unit name'}
              </TableCell>
              <TableCell>Trainer Comment</TableCell>
              <TableCell align='center'>Gap</TableCell>
              <TableCell align='center'>
                {canEditTrainerFields ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allSignedOffSelected}
                        indeterminate={someSignedOffSelected && !allSignedOffSelected}
                        onChange={(e) => {
                          if (variant === 'combined' && selectAllSignedOffForCombinedHandler && combinedSubUnits) {
                            selectAllSignedOffForCombinedHandler(combinedSubUnits, e.target.checked)
                          } else if (selectAllSignedOffHandler && unitIndex !== undefined) {
                            selectAllSignedOffHandler(unitIndex, e.target.checked)
                          }
                        }}
                        disabled={isEditMode}
                      />
                    }
                    label='Signed Off'
                    sx={{ margin: 0 }}
                  />
                ) : (
                  'Signed Off'
                )}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const currentValues = getCurrentRowValues(row)
              const rowKey = variant === 'combined' ? `${row.unitId}-${row.id}` : row.id

              return (
                <TableRow key={rowKey}>
                  <TableCell>
                    <Checkbox
                      checked={currentValues.learnerMap}
                      onChange={() => {
                        // Handler works for both combined and other variants
                        learnerMapHandler(row)
                      }}
                      disabled={isEditMode || !canEditLearnerFields}
                    />
                  </TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>
                    {!canEditTrainerFields ? (
                      <span>{currentValues.comment || 'No comment'}</span>
                    ) : (
                      <TextField
                        size='small'
                        value={currentValues.comment}
                        disabled={isEditMode}
                        onChange={(e) => {
                          // Handler takes event and id
                          commentHandler(e, row.id)
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell align='center' className='flex flex-col items-center justify-center'>
                    <GapIndicator
                      learnerMap={currentValues.learnerMap}
                      trainerMap={currentValues.trainerMap}
                      signedOff={currentValues.signedOff}
                      onClick={() => {
                        if (canEditTrainerFields && !isEditMode && currentValues.learnerMap) {
                          // Handler works for all variants
                          trainerMapHandler(row)
                        }
                      }}
                      disabled={!canEditTrainerFields || isEditMode || !currentValues.learnerMap}
                    />
                    <EvidenceIndicator evidenceCount={getRowEvidenceCount(row)} />
                  </TableCell>
                  <TableCell align='center'>
                    <Checkbox
                      checked={currentValues.signedOff}
                      disabled={
                        !canEditTrainerFields ||
                        isEditMode ||
                        !currentValues.learnerMap ||
                        !currentValues.trainerMap
                      }
                      onChange={() => {
                        // Handler works for all variants
                        signedOffHandler(row)
                      }}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Validation errors */}
      {isSubmitted && validationMessage && (
        <FormHelperText error>{validationMessage}</FormHelperText>
      )}
    </Box>
  )
}

// Memoize component to prevent unnecessary re-renders
// Only re-renders when props change (shallow comparison)
export default memo(UnitsTable)

