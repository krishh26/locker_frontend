import React from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
  Paper,
  Typography,
} from '@mui/material'
import { Controller, Control, FieldErrors } from 'react-hook-form'
import { FormValues, SignatureData } from '../lib/types'

interface SignatureTableProps {
  control: Control<FormValues>
  errors: FieldErrors<FormValues>
  disabled?: boolean
}

const signatureRoles = [
  { role: 'Trainer', label: 'Trainer' },
  { role: 'Learner', label: 'Learner' },
  { role: 'Employer', label: 'Employer' },
  { role: 'IQA', label: 'IQA' },
]

const SignatureTable: React.FC<SignatureTableProps> = ({
  control,
  errors,
  disabled = false,
}) => {
  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Signatures
      </Typography>
      <TableContainer component={Paper} elevation={1}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Signed in Agreement:</TableCell>
              <TableCell>Name:</TableCell>
              <TableCell>Signed:</TableCell>
              <TableCell>ES:</TableCell>
              <TableCell>Date:</TableCell>
              <TableCell>Signature req:</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {signatureRoles.map((item, index) => (
              <TableRow key={item.role}>
                <TableCell>
                  <Typography variant='body2'>{item.label}</Typography>
                </TableCell>
                <TableCell>
                  <Controller
                    name={`signatures.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size='small'
                        fullWidth
                        disabled={disabled}
                        placeholder='Enter name'
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name={`signatures.${index}.signed`}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        checked={field.value || false}
                        disabled={disabled}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name={`signatures.${index}.es`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size='small'
                        fullWidth
                        disabled={disabled}
                        placeholder='ES'
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name={`signatures.${index}.date`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type='date'
                        size='small'
                        fullWidth
                        disabled={disabled}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name={`signatures.${index}.signature_required`}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        checked={field.value || false}
                        disabled={disabled}
                      />
                    )}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {errors.signatures && (
        <Typography variant='caption' color='error' sx={{ mt: 1, display: 'block' }}>
          {errors.signatures.message}
        </Typography>
      )}
    </Box>
  )
}

export default SignatureTable
