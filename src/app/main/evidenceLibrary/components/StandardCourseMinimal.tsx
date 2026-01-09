import React from 'react'
import {
  Box,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
} from '@mui/material'
import GapIndicator from './GapIndicator'
import EvidenceIndicator from './EvidenceIndicator'

export interface StandardCourseMinimalProps {
  title: string
  rows: Array<{
    id: string | number
    title: string
    unitId?: string | number
    courseId?: string | number
    learnerMap?: boolean
    trainerMap?: boolean
    signedOff?: boolean
    comment?: string
  }>
  unitsWatch: any[]
  courseId: string | number
  canEditLearnerFields: boolean
  canEditTrainerFields: boolean
  // Handlers - matching actual useUnitHandlers signatures
  learnerMapHandler: (row: any) => void
  trainerMapHandler: (row: any) => void
  signedOffHandler: (row: any) => void
  commentHandler: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string | number) => void
  selectAllSignedOffForCombinedHandler?: (combinedSubUnits: any[], checked: boolean) => void
  // Evidence count
  getEvidenceCount: (courseId: string | number, unitId: string | number, subunitId?: string | number) => number
  // Form methods
  setValue: (name: string, value: any) => void
  trigger: (name?: any) => Promise<any>
  // For combined variant - the actual combinedSubUnits array
  combinedSubUnits?: any[]
}

const StandardCourseMinimal: React.FC<StandardCourseMinimalProps> = ({
  title,
  rows = [],
  unitsWatch,
  courseId,
  canEditLearnerFields,
  canEditTrainerFields,
  learnerMapHandler,
  trainerMapHandler,
  signedOffHandler,
  commentHandler,
  selectAllSignedOffForCombinedHandler,
  getEvidenceCount,
  setValue,
  trigger,
  combinedSubUnits,
}) => {
  // Get current row values from unitsWatch for real-time updates (same as UnitsTable)
  const getCurrentRowValues = (row: any) => {
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
  }

  // Calculate evidence count (same as UnitsTable)
  const getRowEvidenceCount = (row: any) => {
    const unit = unitsWatch.find((u: any) => String(u.id) === String(row.unitId))
    const hasSubUnitInUnit = unit?.subUnit && unit.subUnit.length > 0
    if (hasSubUnitInUnit) {
      return getEvidenceCount(courseId, row.unitId!, row.id)
    } else {
      return getEvidenceCount(courseId, row.id || row.unitId!)
    }
  }

  // Calculate select all states (same as UnitsTable)
  const allLearnerMapSelected = rows.every((r) => getCurrentRowValues(r).learnerMap)

  const allSignedOffSelected = rows.every((r) => {
    const values = getCurrentRowValues(r)
    return (values.learnerMap && values.trainerMap && values.signedOff)
  })

  const someSignedOffSelected = rows.some((r) => {
    const values = getCurrentRowValues(r)
    return (values.learnerMap && values.trainerMap && values.signedOff)
  })

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allLearnerMapSelected}
                      onChange={(e) => {
                        // Handle combined variant select all (same as UnitsTable)
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
                      disabled={!canEditLearnerFields}
                    />
                  }
                  label="Learner Map"
                  sx={{ margin: 0 }}
                />
              </TableCell>
              <TableCell>{title}</TableCell>
              <TableCell>Trainer Comment</TableCell>
              <TableCell align="center">Gap</TableCell>
              <TableCell align="center">
                {canEditTrainerFields ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allSignedOffSelected}
                        indeterminate={someSignedOffSelected && !allSignedOffSelected}
                        onChange={(e) => {
                          if (selectAllSignedOffForCombinedHandler && combinedSubUnits) {
                            selectAllSignedOffForCombinedHandler(combinedSubUnits, e.target.checked)
                          }
                        }}
                      />
                    }
                    label="Signed Off"
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
              const rowKey = `${row.unitId}-${row.id}`

              return (
                <TableRow key={rowKey}>
                  <TableCell>
                    <Checkbox
                      checked={currentValues.learnerMap}
                      onChange={() => {
                        learnerMapHandler(row)
                      }}
                      disabled={!canEditLearnerFields}
                    />
                  </TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>
                    {!canEditTrainerFields ? (
                      <span>{currentValues.comment || 'No comment'}</span>
                    ) : (
                      <TextField
                        size="small"
                        value={currentValues.comment}
                        onChange={(e) => {
                          commentHandler(e, row.id)
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center" className="flex flex-col items-center justify-center">
                    <GapIndicator
                      learnerMap={currentValues.learnerMap}
                      trainerMap={currentValues.trainerMap}
                      signedOff={currentValues.signedOff}
                      onClick={() => {
                        if (canEditTrainerFields && currentValues.learnerMap) {
                          trainerMapHandler(row)
                        }
                      }}
                      disabled={!canEditTrainerFields || !currentValues.learnerMap}
                    />
                    <EvidenceIndicator evidenceCount={getRowEvidenceCount(row)} />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={currentValues.signedOff}
                      disabled={
                        !canEditTrainerFields ||
                        !currentValues.learnerMap ||
                        !currentValues.trainerMap
                      }
                      onChange={() => {
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
    </Box>
  )
}

export default StandardCourseMinimal

