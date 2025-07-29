import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove
} from '@dnd-kit/sortable'
import {
  Box,
  Divider,
  Grid,
  Paper,
  Typography
} from '@mui/material'
import React, { useCallback, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ComponentPaletteItem from './ComponentPaletteItem'
import FieldPropertiesPanel from './FieldPropertiesPanel'
import FormBuilderArea from './FormBuilderArea'

// Form field types
export interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  validation?: any
  properties?: any
  presetField?: string
}

// Component palette items
const FORM_COMPONENTS = [
  {
    type: 'textfield',
    label: 'Text Input',
    icon: '📝',
    defaultProps: {
      label: 'Text Field',
      placeholder: 'Enter text...',
      required: false,
    },
  },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: '📄',
    defaultProps: {
      label: 'Text Area',
      placeholder: 'Enter long text...',
      required: false,
    },
  },
  {
    type: 'select',
    label: 'Dropdown',
    icon: '📋',
    defaultProps: {
      label: 'Select Option',
      options: ['Option 1', 'Option 2', 'Option 3'],
      required: false,
    },
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    icon: '🔘',
    defaultProps: {
      label: 'Choose One',
      options: ['Option 1', 'Option 2', 'Option 3'],
      required: false,
    },
  },
  {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: '☑️',
    defaultProps: {
      label: 'Select Multiple',
      options: ['Option 1', 'Option 2', 'Option 3'],
      required: false,
    },
  },
  {
    type: 'number',
    label: 'Number',
    icon: '🔢',
    defaultProps: {
      label: 'Number Field',
      placeholder: 'Enter number...',
      required: false,
    },
  },
  {
    type: 'email',
    label: 'Email',
    icon: '📧',
    defaultProps: {
      label: 'Email Address',
      placeholder: 'Enter email...',
      required: false,
    },
  },
  {
    type: 'date',
    label: 'Date',
    icon: '📅',
    defaultProps: {
      label: 'Date',
      required: false,
    },
  },
  {
    type: 'file',
    label: 'File Upload',
    icon: '📎',
    defaultProps: {
      label: 'Upload File',
      required: false,
    },
  }
]

interface DragDropFormBuilderProps {
  initialFields?: FormField[]
  onChange?: (fields: FormField[]) => void
  onSave?: (fields: FormField[]) => void
}

const DragDropFormBuilder: React.FC<DragDropFormBuilderProps> = ({
  initialFields = [],
  onChange,
  onSave,
}) => {
  const [formFields, setFormFields] = useState<FormField[]>(initialFields)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedField, setSelectedField] = useState<FormField | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
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
      const componentType = FORM_COMPONENTS.find(
        (comp) => comp.type === active.id
      )
      if (componentType && over.id === 'form-builder-area') {
        // Add new field
        const newField: FormField = {
          id: uuidv4(),
          type: componentType.type,
          ...componentType.defaultProps,
        }

        const updatedFields = [...formFields, newField]
        setFormFields(updatedFields)
        onChange?.(updatedFields)
        setSelectedField(newField)
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

  const updateField = useCallback(
    (fieldId: string, updates: Partial<FormField>) => {
      const updatedFields = formFields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
      setFormFields(updatedFields)
      onChange?.(updatedFields)

      // Update selected field if it's the one being edited
      if (selectedField?.id === fieldId) {
        setSelectedField({ ...selectedField, ...updates })
      }
    },
    [formFields, selectedField, onChange]
  )

  const deleteField = useCallback(
    (fieldId: string) => {
      const updatedFields = formFields.filter((field) => field.id !== fieldId)
      setFormFields(updatedFields)
      onChange?.(updatedFields)

      if (selectedField?.id === fieldId) {
        setSelectedField(null)
      }
    },
    [formFields, selectedField, onChange]
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
      <Box sx={{ height: '100vh', display: 'flex' }}>
        {/* Component Palette */}
        <Paper
          elevation={2}
          sx={{
            width: 280,
            p: 2,
            borderRadius: 2,
            mr: 2,
            backgroundColor: '#f8f9fa',
          }}
        >
          <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
            Form Components
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={1}>
            {FORM_COMPONENTS.map((component) => (
              <Grid item xs={12} key={component.type}>
                <ComponentPaletteItem component={component} />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Form Builder Area */}
        <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
          <Paper
            elevation={1}
            sx={{
              flex: 1,
              p: 3,
              borderRadius: 2,
              backgroundColor: '#ffffff',
              border: '2px dashed #e0e0e0',
              minHeight: 600,
            }}
          >
            <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
              Form Builder
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              Drag components from the left panel to build your form
            </Typography>

            <FormBuilderArea
              fields={formFields}
              onFieldSelect={setSelectedField}
              onFieldDelete={deleteField}
              selectedFieldId={selectedField?.id}
            />
          </Paper>

          {/* Properties Panel */}
          {selectedField && (
            <Paper
              elevation={2}
              sx={{
                width: 320,
                p: 2,
                borderRadius: 2,
                backgroundColor: '#f8f9fa',
              }}
            >
              <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                Field Properties
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FieldPropertiesPanel
                field={selectedField}
                onUpdate={(updates) => updateField(selectedField.id, updates)}
              />
            </Paper>
          )}
        </Box>
      </Box>

      <DragOverlay>
        {activeId ? (
          <Box
            sx={{
              p: 2,
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: 1,
              opacity: 0.8,
            }}
          >
            {FORM_COMPONENTS.find((c) => c.type === activeId)?.label || 'Field'}
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default DragDropFormBuilder
