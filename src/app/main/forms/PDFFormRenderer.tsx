// components/PDFFormRenderer.tsx
import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    Radio,
    RadioGroup,
    Typography
} from '@mui/material'
import React from 'react'
import { SimpleFormField } from './DynamicFormPreview'

interface Props {
  formName: string
  description?: string
  fields: SimpleFormField[]
  data: Record<string, any>
}

const widthToGrid = (width?: string) => {
  switch (width) {
    case 'half':
      return 6
    case 'third':
      return 4
    default:
      return 12
  }
}

const PDFFormRenderer = React.forwardRef<HTMLDivElement, Props>(
  ({ formName, description, fields, data }, ref) => {
    return (
      <Box ref={ref} sx={{ padding: 4, fontFamily: 'Arial' }}>
        <Typography variant='h4' gutterBottom>
          {formName}
        </Typography>
        {description && (
          <Typography variant='body1' sx={{ mb: 3 }}>
            {description}
          </Typography>
        )}
        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid item xs={widthToGrid(field.width)} key={field.id}>
              {(() => {
                const value = data[field.id]

                switch (field.type) {
                  case 'text':
                  case 'email':
                  case 'number':
                    return (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          {field.label}
                        </Typography>
                        <Box
                          sx={{
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: 1,
                          }}
                        >
                          <Typography variant='body2'>
                            {value || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    )

                  case 'textarea':
                    return (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          {field.label}
                        </Typography>
                        <Box
                          sx={{
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: 1,
                            minHeight: 80,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {value || '-'}
                        </Box>
                      </Box>
                    )

                  case 'radio':
                    return (
                      <FormControl component='fieldset'>
                        <Typography
                          variant='subtitle2'
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          {field.label}
                        </Typography>
                        <RadioGroup value={value || ''}>
                          {field.options?.map((opt, i) => (
                            <FormControlLabel
                              key={i}
                              value={opt.value}
                              control={<Radio checked={value === opt.value} />}
                              label={opt.label}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    )

                  case 'select':
                    const selectedOption =
                      field.options?.find((o) => o.value === value)?.label ||
                      '-'
                    return (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          {field.label}
                        </Typography>
                        <Box
                          sx={{
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: 1,
                          }}
                        >
                          {selectedOption}
                        </Box>
                      </Box>
                    )

                  case 'checkbox':
                    const selectedValues = Array.isArray(value) ? value : []
                    return (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          {field.label}
                        </Typography>
                        <FormGroup>
                          {field.options?.map((opt, i) => (
                            <FormControlLabel
                              key={i}
                              control={
                                <Checkbox
                                  checked={selectedValues.includes(opt.value)}
                                />
                              }
                              label={opt.label}
                            />
                          ))}
                        </FormGroup>
                      </Box>
                    )

                  case 'signature':
                    if (value instanceof File) {
                      return (
                        <Box>
                          <Typography
                            variant='subtitle2'
                            sx={{ mb: 1, fontWeight: 600 }}
                          >
                            {field.label}
                          </Typography>
                          <Box
                            component='img'
                            src={URL.createObjectURL(value)}
                            sx={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                            }}
                          />
                        </Box>
                      )
                    }
                    return (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          {field.label}
                        </Typography>
                        <Box
                          sx={{
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: 2,
                            backgroundColor: '#f9f9f9',
                          }}
                        >
                          {value?.name || 'No file uploaded'}
                        </Box>
                      </Box>
                    )

                  case 'file':
                    return (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          {field.label}
                        </Typography>
                        <Box
                          sx={{
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: 1,
                          }}
                        >
                          {value?.name || 'No file uploaded'}
                        </Box>
                      </Box>
                    )

                  default:
                    return (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          {field.label}
                        </Typography>
                        <Box
                          sx={{
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: 1,
                          }}
                        >
                          {value || '-'}
                        </Box>
                      </Box>
                    )
                }
              })()}
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }
)

export default PDFFormRenderer
