import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
  Chip,
} from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { FormField } from './DragDropFormBuilder'

interface SortableFormFieldProps {
  field: FormField
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

const SortableFormField: React.FC<SortableFormFieldProps> = ({
  field,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const renderFieldPreview = () => {
    switch (field.type) {
      case 'textfield':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            fullWidth
            size='small'
            disabled
            required={field.required}
          />
        )

      case 'textarea':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            fullWidth
            multiline
            rows={3}
            size='small'
            disabled
            required={field.required}
          />
        )

      case 'select':
        return (
          <FormControl
            fullWidth
            size='small'
            disabled
            required={field.required}
          >
            <InputLabel>{field.label}</InputLabel>
            <Select label={field.label}>
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )

      case 'radio':
        return (
          <Box>
            <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
              {field.label}{' '}
              {field.required && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <RadioGroup>
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio size='small' disabled />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </Box>
        )

      case 'checkbox':
        return (
          <Box>
            <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
              {field.label}{' '}
              {field.required && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <FormGroup>
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={<Checkbox size='small' disabled />}
                  label={option}
                />
              ))}
            </FormGroup>
          </Box>
        )

      case 'number':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            type='number'
            fullWidth
            size='small'
            disabled
            required={field.required}
          />
        )

      case 'email':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            type='email'
            fullWidth
            size='small'
            disabled
            required={field.required}
          />
        )

      case 'date':
        return (
          <TextField
            label={field.label}
            type='date'
            fullWidth
            size='small'
            disabled
            required={field.required}
            InputLabelProps={{ shrink: true }}
          />
        )

      case 'file':
        return (
          <Box>
            <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
              {field.label}{' '}
              {field.required && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <TextField
              type='file'
              fullWidth
              size='small'
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        )

      case 'signature':
        return (
          <Box>
            <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
              {field.label}{' '}
              {field.required && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <Box
              sx={{
                border: '1px solid #ccc',
                borderRadius: 1,
                height: 150,
                backgroundColor: '#f9f9f9',
              }}
            >
              <Typography
                variant='caption'
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  color: 'text.disabled',
                }}
              >
                Signature Pad (disabled preview)
              </Typography>
            </Box>
          </Box>
        )

      default:
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            fullWidth
            size='small'
            disabled
          />
        )
    }
  }

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={isDragging ? 4 : isSelected ? 2 : 1}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: '2px solid',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        backgroundColor: isDragging ? 'grey.50' : 'white',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: isSelected ? 'primary.main' : 'grey.300',
          boxShadow: 2,
        },
      }}
      onClick={onSelect}
    >
      {/* Field Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size='small'
            {...attributes}
            {...listeners}
            sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
          >
            <DragIndicatorIcon fontSize='small' />
          </IconButton>
          <Chip
            label={field.type}
            size='small'
            color='primary'
            variant='outlined'
          />
          {field.required && (
            <Chip
              label='Required'
              size='small'
              color='error'
              variant='outlined'
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size='small' onClick={onSelect}>
            <EditIcon fontSize='small' />
          </IconButton>
          <IconButton
            size='small'
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Box>
      </Box>

      {/* Field Preview */}
      <Box sx={{ pointerEvents: 'none' }}>{renderFieldPreview()}</Box>
    </Paper>
  )
}

export default SortableFormField
