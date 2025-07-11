import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  Button,
  ButtonGroup,
  Tooltip,
  Divider,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { SimpleFormField as FormFieldType } from './SimpleFormBuilder';

interface SimpleFormFieldProps {
  field: FormFieldType;
  isEditing: boolean;
  onEdit: () => void;
  onStopEdit: () => void;
  onUpdate: (updates: Partial<FormFieldType>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const SimpleFormField: React.FC<SimpleFormFieldProps> = ({
  field,
  isEditing,
  onEdit,
  onStopEdit,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const [localField, setLocalField] = useState(field);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    onUpdate(localField);
    onStopEdit();
  };

  const handleCancel = () => {
    setLocalField(field);
    onStopEdit();
  };

  const addOption = () => {
    const currentOptions = localField.options || [];
    setLocalField({
      ...localField,
      options: [...currentOptions, `Option ${currentOptions.length + 1}`]
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(localField.options || [])];
    newOptions[index] = value;
    setLocalField({ ...localField, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = (localField.options || []).filter((_, i) => i !== index);
    setLocalField({ ...localField, options: newOptions });
  };

  const renderFieldPreview = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            type={field.type === 'email' ? 'email' : 'text'}
            fullWidth
            size="small"
            disabled
            required={field.required}
          />
        );
      
      case 'number':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            type="number"
            fullWidth
            size="small"
            disabled
            required={field.required}
          />
        );
      
      case 'textarea':
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            fullWidth
            multiline
            rows={3}
            size="small"
            disabled
            required={field.required}
          />
        );
      
      case 'select':
        return (
          <FormControl fullWidth size="small" disabled required={field.required}>
            <InputLabel>{field.label}</InputLabel>
            <Select label={field.label}>
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'radio':
        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <RadioGroup>
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio size="small" disabled />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </Box>
        );
      
      case 'checkbox':
        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <FormGroup>
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={<Checkbox size="small" disabled />}
                  label={option}
                />
              ))}
            </FormGroup>
          </Box>
        );
      
      case 'date':
        return (
          <TextField
            label={field.label}
            type="date"
            fullWidth
            size="small"
            disabled
            required={field.required}
            InputLabelProps={{ shrink: true }}
          />
        );
      
      case 'file':
        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <TextField
              type="file"
              fullWidth
              size="small"
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );
      
      default:
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            fullWidth
            size="small"
            disabled
          />
        );
    }
  };

  const renderEditForm = () => (
    <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        ✏️ Edit Field
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Field Label"
          value={localField.label}
          onChange={(e) => setLocalField({ ...localField, label: e.target.value })}
          size="small"
          fullWidth
        />

        {['text', 'email', 'phone', 'number', 'textarea'].includes(field.type) && (
          <TextField
            label="Placeholder"
            value={localField.placeholder || ''}
            onChange={(e) => setLocalField({ ...localField, placeholder: e.target.value })}
            size="small"
            fullWidth
          />
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={localField.required || false}
              onChange={(e) => setLocalField({ ...localField, required: e.target.checked })}
            />
          }
          label="Required field"
        />

        <FormControl size="small" fullWidth>
          <InputLabel>Field Width</InputLabel>
          <Select
            value={localField.width || 'full'}
            onChange={(e) => setLocalField({ ...localField, width: e.target.value as any })}
            label="Field Width"
          >
            <MenuItem value="full">Full Width</MenuItem>
            <MenuItem value="half">Half Width</MenuItem>
            <MenuItem value="third">One Third</MenuItem>
          </Select>
        </FormControl>

        {['select', 'radio', 'checkbox'].includes(field.type) && (
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Options
            </Typography>
            {(localField.options || []).map((option, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  size="small"
                  fullWidth
                />
                <IconButton size="small" onClick={() => removeOption(index)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addOption}
              size="small"
              variant="outlined"
            >
              Add Option
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            startIcon={<CloseIcon />}
            onClick={handleCancel}
            size="small"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            startIcon={<CheckIcon />}
            onClick={handleSave}
            size="small"
            variant="contained"
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={isDragging ? 6 : isEditing ? 3 : 1}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: '2px solid',
        borderColor: isEditing ? '#1976d2' : 'transparent',
        backgroundColor: isDragging ? '#f5f5f5' : 'white',
        opacity: isDragging ? 0.7 : 1,
        transition: 'all 0.2s ease',
        borderRadius: 2,
        '&:hover': {
          borderColor: isEditing ? '#1976d2' : '#e0e0e0',
          boxShadow: 3,
        },
      }}
      onClick={!isEditing ? onEdit : undefined}
    >
      {/* Field Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            {...attributes}
            {...listeners}
            sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
          >
            <DragIndicatorIcon fontSize="small" />
          </IconButton>
          <Chip label={field.type} size="small" color="primary" variant="outlined" />
          {field.required && <Chip label="Required" size="small" color="error" variant="outlined" />}
          <Chip label={field.width || 'full'} size="small" variant="outlined" />
        </Box>
        
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={onEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicate">
            <IconButton size="small" onClick={onDuplicate}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={onDelete} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </Box>

      {/* Field Content */}
      {isEditing ? renderEditForm() : (
        <Box sx={{ pointerEvents: 'none' }}>
          {renderFieldPreview()}
        </Box>
      )}
    </Paper>
  );
};

export default SimpleFormField;
