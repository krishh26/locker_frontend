import React from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { assessmentMethods, sampleTypes } from '../constants'

interface FilterPanelProps {
  selectedMethods: string[]
  onToggleMethod: (code: string) => void
  onSelectAllMethods: () => void
  onDeselectAllMethods: () => void
  sampleType: string
  onSampleTypeChange: (value: string) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  onApplySamples: () => void
  isApplySamplesDisabled: boolean
  isApplySamplesLoading: boolean
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedMethods,
  onToggleMethod,
  onSelectAllMethods,
  onDeselectAllMethods,
  sampleType,
  onSampleTypeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onApplySamples,
  isApplySamplesDisabled,
  isApplySamplesLoading,
}) => {
  const [dateError, setDateError] = React.useState<string>('')
  const allSelected = selectedMethods.length === assessmentMethods.length
  const someSelected =
    selectedMethods.length > 0 && selectedMethods.length < assessmentMethods.length

  const handleDateChange = (value: string) => {
    onDateFromChange(value)
    if (!value.trim()) {
      setDateError('Planned Sample Date is required')
    } else {
      setDateError('')
    }
  }

  const handleApplySamplesClick = () => {
    if (!dateFrom.trim()) {
      setDateError('Planned Sample Date is required')
      return
    }
    setDateError('')
    onApplySamples()
  }

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        position: 'sticky',
        top: { xs: 0, md: 88 },
      }}
    >
      <Box>
        <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
          Assessment Methods
        </Typography>
        <Paper
          variant='outlined'
          sx={{ p: 2, maxHeight: 220, overflow: 'auto', borderRadius: 2 }}
        >
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={() => {
                    if (allSelected) {
                      onDeselectAllMethods()
                    } else {
                      onSelectAllMethods()
                    }
                  }}
                />
              }
              label='Select All'
              sx={{ mb: 1, fontWeight: 600 }}
            />
            <Divider sx={{ mb: 1 }} />
            {assessmentMethods.map((method) => (
              <FormControlLabel
                key={method.code}
                control={
                  <Checkbox
                    checked={selectedMethods.includes(method.code)}
                    onChange={() => onToggleMethod(method.code)}
                  />
                }
                label={`${method.code} - ${method.title}`}
                sx={{ alignItems: 'center' }}
              />
            ))}
          </FormGroup>
        </Paper>
      </Box>

      <Box>
        <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
          Assessment Processes
        </Typography>
        <Paper
          variant='outlined'
          sx={{
            p: 3,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            textAlign: 'center',
          }}
        >
          There are no assessment processes available to select.
        </Paper>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth size='small'>
            <InputLabel id='sample-type-label'>Sample Type</InputLabel>
            <Select
              labelId='sample-type-label'
              label='Sample Type'
              value={sampleType}
              onChange={(event) => onSampleTypeChange(event.target.value)}
            >
              <MenuItem value=''>Select a sample type</MenuItem>
              {sampleTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label='Planned Sample Date'
            type='date'
            value={dateFrom}
            onChange={(event) => handleDateChange(event.target.value)}
            size='small'
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!dateError}
            helperText={dateError}
          />
        </Grid>
      </Grid>

      <Stack spacing={2}>
        <Button
          variant='contained'
          size='large'
          sx={{ textTransform: 'none', fontWeight: 600 }}
          onClick={handleApplySamplesClick}
          disabled={isApplySamplesDisabled}
        >
          {isApplySamplesLoading ? 'Applying...' : 'Apply Samples'}
        </Button>
        <Button
          variant='outlined'
          size='large'
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Apply Random Samples
        </Button>
        <Button
          variant='outlined'
          size='large'
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderStyle: 'dashed',
          }}
        >
          Plan Management
        </Button>
      </Stack>
    </Card>
  )
}

