import React, { useState, useCallback, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import AddIcon from '@mui/icons-material/Add'
import { v4 as uuidv4 } from 'uuid'
import ComponentItem from './ComponentItem'
import FormArea from './FormArea'

// Simple form field interface
export interface SimpleFormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  width?: 'full' | 'half' | 'third'
}

// Simple component palette
const SIMPLE_COMPONENTS = [
  { type: 'text', label: '📝 Text Input', icon: '📝' },
  { type: 'email', label: '📧 Email', icon: '📧' },
  { type: 'phone', label: '📞 Phone', icon: '📞' },
  { type: 'number', label: '🔢 Number', icon: '🔢' },
  { type: 'textarea', label: '📄 Long Text', icon: '📄' },
  { type: 'select', label: '📋 Dropdown', icon: '📋' },
  { type: 'radio', label: '🔘 Multiple Choice', icon: '🔘' },
  { type: 'checkbox', label: '☑️ Checkboxes', icon: '☑️' },
  { type: 'date', label: '📅 Date', icon: '📅' },
  { type: 'file', label: '📎 File Upload', icon: '📎' },
]

interface SimpleFormBuilderProps {
  initialFields?: SimpleFormField[]
  onChange?: (fields: SimpleFormField[]) => void
  onSave?: (fields: SimpleFormField[]) => void
}

const SimpleFormBuilder: React.FC<SimpleFormBuilderProps> = ({
  initialFields = [],
  onChange,
  onSave,
}) => {
  const [formFields, setFormFields] = useState<SimpleFormField[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)

  useEffect(() => {
    setFormFields(initialFields)
  }, [initialFields])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (!over) {
        setActiveId(null)
        return
      }

      // Check if dragging from component palette
      const componentType = SIMPLE_COMPONENTS.find(
        (comp) => comp.type === active.id
      )
      if (componentType && over.id === 'form-area') {
        // Add new field with smart defaults
        const newField: SimpleFormField = {
          id: uuidv4(),
          type: componentType.type,
          label: getDefaultLabel(componentType.type),
          placeholder: getDefaultPlaceholder(componentType.type),
          required: false,
          width: 'full',
          ...(needsOptions(componentType.type) && {
            options: [
              { label: 'Option 1', value: 'option_1' },
              { label: 'Option 2', value: 'option_2' },
              { label: 'Option 3', value: 'option_3' },
            ],
          }),
        }

        const updatedFields = [...formFields, newField]
        setFormFields(updatedFields)
        onChange?.(updatedFields)
        setEditingField(newField.id)
      } else if (
        active.id !== over.id &&
        formFields.find((f) => f.id === active.id)
      ) {
        // Reorder existing fields
        const oldIndex = formFields.findIndex((f) => f.id === active.id)
        const newIndex = formFields.findIndex((f) => f.id === over.id)

        const updatedFields = arrayMove(formFields, oldIndex, newIndex)
        setFormFields(updatedFields)
        onChange?.(updatedFields)
      }

      setActiveId(null)
    },
    [formFields, onChange]
  )

  const getDefaultLabel = (type: string): string => {
    const labels = {
      text: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      number: 'Age',
      textarea: 'Comments',
      select: 'Select Option',
      radio: 'Choose One',
      checkbox: 'Select All That Apply',
      date: 'Date',
      file: 'Upload File',
    }
    return labels[type] || 'Field Label'
  }

  const getDefaultPlaceholder = (type: string): string => {
    const placeholders = {
      text: 'Enter your full name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      number: 'Enter a number',
      textarea: 'Type your message here...',
      date: 'Select date',
      file: 'Choose file to upload',
    }
    return placeholders[type] || 'Enter value'
  }

  const needsOptions = (type: string): boolean => {
    return ['select', 'radio', 'checkbox'].includes(type)
  }

  const updateField = useCallback(
    (fieldId: string, updates: Partial<SimpleFormField>) => {
      const updatedFields = formFields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
      setFormFields(updatedFields)
      onChange?.(updatedFields)
    },
    [formFields, onChange]
  )

  const deleteField = useCallback(
    (fieldId: string) => {
      const updatedFields = formFields.filter((field) => field.id !== fieldId)
      setFormFields(updatedFields)
      onChange?.(updatedFields)
      setEditingField(null)
    },
    [formFields, onChange]
  )

  const duplicateField = useCallback(
    (fieldId: string) => {
      const fieldToDuplicate = formFields.find((f) => f.id === fieldId)
      if (fieldToDuplicate) {
        const newField = {
          ...fieldToDuplicate,
          id: uuidv4(),
          label: `${fieldToDuplicate.label} (Copy)`,
        }
        const fieldIndex = formFields.findIndex((f) => f.id === fieldId)
        const updatedFields = [
          ...formFields.slice(0, fieldIndex + 1),
          newField,
          ...formFields.slice(fieldIndex + 1),
        ]
        setFormFields(updatedFields)
        onChange?.(updatedFields)
      }
    },
    [formFields, onChange]
  )

  const handleSave = useCallback(() => {
    onSave?.(formFields)
  }, [formFields, onSave])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{ height: '100vh', display: 'flex', backgroundColor: '#f5f5f5' }}
      >
        {/* Component Palette */}
        <Paper
          elevation={2}
          sx={{
            width: 280,
            p: 2,
            m: 2,
            borderRadius: 3,
            backgroundColor: 'white',
            height: 'fit-content',
          }}
        >
          <Typography
            variant='h6'
            gutterBottom
            sx={{ fontWeight: 600, color: '#1976d2' }}
          >
            📦 Form Components
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Drag components to build your form
          </Typography>

          <Grid container spacing={1}>
            {SIMPLE_COMPONENTS.map((component) => (
              <Grid item xs={12} key={component.type}>
                <ComponentItem component={component} />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Form Builder Area */}
        <Box sx={{ flex: 1, p: 2 }}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: 'white',
              minHeight: '80vh',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  variant='h5'
                  sx={{ fontWeight: 600, color: '#1976d2' }}
                >
                  🎨 Form Builder
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Drag components here to create your form
                </Typography>
              </Box>

            </Box>

            <FormArea
              fields={formFields}
              editingField={editingField}
              onFieldEdit={setEditingField}
              onFieldUpdate={updateField}
              onFieldDelete={deleteField}
              onFieldDuplicate={duplicateField}
            />
          </Paper>
        </Box>
      </Box>

      <DragOverlay>
        {activeId ? (
          <Box
            sx={{
              p: 2,
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: 2,
              opacity: 0.9,
              boxShadow: 3,
            }}
          >
            {SIMPLE_COMPONENTS.find((c) => c.type === activeId)?.label ||
              'Field'}
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default SimpleFormBuilder
