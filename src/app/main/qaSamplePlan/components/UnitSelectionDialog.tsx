import React from 'react'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import type { SelectedLearnerForUnits } from '../types'
import { sanitizeText } from '../utils'

interface UnitSelectionDialogProps {
  open: boolean
  onClose: () => void
  selectedLearnerForUnits: SelectedLearnerForUnits | null
  selectedUnitsMap: Record<string, Set<string>>
  onUnitToggle: (unitKey: string) => void
  onSave: () => void
}

export const UnitSelectionDialog: React.FC<UnitSelectionDialogProps> = ({
  open,
  onClose,
  selectedLearnerForUnits,
  selectedUnitsMap,
  onUnitToggle,
  onSave,
}) => {
  if (!selectedLearnerForUnits) return null

  const learnerKey = `${selectedLearnerForUnits.learner.learner_name ?? ''}-${selectedLearnerForUnits.learnerIndex}`
  const selectedUnits = selectedUnitsMap[learnerKey] || new Set<string>()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
          >
            <Typography variant='h6' fontWeight={600}>
              Select Units
            </Typography>
            <IconButton
              size='small'
              onClick={onClose}
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <Paper
            variant='outlined'
            sx={{
              p: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.grey[50]
                  : theme.palette.background.default,
            }}
          >
            <Stack spacing={1}>
              <Typography variant='subtitle2' fontWeight={600}>
                Learner: {sanitizeText(selectedLearnerForUnits.learner.learner_name)}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Assessor: {sanitizeText(selectedLearnerForUnits.learner.assessor_name)}
              </Typography>
            </Stack>
          </Paper>

          <Box
            sx={{
              maxHeight: '50vh',
              overflowY: 'auto',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: 2,
            }}
          >
            <Stack spacing={2}>
              {Array.isArray(selectedLearnerForUnits.learner.units) &&
              selectedLearnerForUnits.learner.units.length > 0 ? (
                selectedLearnerForUnits.learner.units.map((unit, unitIndex) => {
                  const unitKey = unit.unit_code || unit.unit_name || ''
                  const isSelected = unitKey ? selectedUnits.has(unitKey) : false

                  return (
                    <Paper
                      key={`unit-${unitKey || unitIndex}`}
                      variant='outlined'
                      sx={{
                        p: 2,
                        transition: 'all 0.2s ease-in-out',
                        backgroundColor: (theme) =>
                          isSelected
                            ? theme.palette.mode === 'light'
                              ? 'rgba(46, 125, 50, 0.08)'
                              : 'rgba(76, 175, 80, 0.16)'
                            : theme.palette.mode === 'light'
                            ? theme.palette.background.paper
                            : theme.palette.background.default,
                        borderColor: (theme) =>
                          isSelected
                            ? theme.palette.success.main
                            : theme.palette.divider,
                        '&:hover': {
                          borderColor: (theme) => theme.palette.primary.main,
                          boxShadow: (theme) => theme.shadows[2],
                        },
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isSelected}
                            onChange={() => onUnitToggle(unitKey)}
                            color='primary'
                          />
                        }
                        label={
                          <Stack spacing={0.5}>
                            <Typography variant='body2' fontWeight={600}>
                              {sanitizeText(unit.unit_name || 'Unit')}
                            </Typography>
                            {unit.unit_code && (
                              <Typography variant='caption' color='text.secondary'>
                                Code: {sanitizeText(unit.unit_code)}
                              </Typography>
                            )}
                          </Stack>
                        }
                        sx={{ alignItems: 'flex-start', m: 0 }}
                      />
                    </Paper>
                  )
                })
              ) : (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  align='center'
                  sx={{ py: 4 }}
                >
                  No units available for this learner.
                </Typography>
              )}
            </Stack>
          </Box>

          <Stack direction='row' spacing={2} justifyContent='flex-end'>
            <Button
              variant='outlined'
              onClick={onClose}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button variant='contained' onClick={onSave} sx={{ textTransform: 'none' }}>
              Save Selection
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  )
}

