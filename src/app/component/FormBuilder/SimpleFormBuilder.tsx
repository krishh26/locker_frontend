import React, { useCallback, useEffect, useState } from 'react'
import {
  closestCenter,
  rectIntersection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Box, Divider, Grid, IconButton, Paper, Typography } from '@mui/material'
import { UserRole } from 'src/enum'
import { v4 as uuidv4 } from 'uuid'
import ComponentItem from './ComponentItem'
import FormArea from './FormArea'
import PresetItem from './PresetItem'
import { PRESET_FIELDS } from './presetData'

export interface SimpleFormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  width?: 'full' | 'half' | 'third'
  signatureRole?: string
}

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
  { type: 'signature', label: 'Signature', icon: '✍️' },
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
  const [activeTab, setActiveTab] = useState<'components' | 'presets'>('components')

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

      const componentType = SIMPLE_COMPONENTS.find(comp => comp.type === active.id)
      const isPresetDrag = active.data?.current?.type === 'preset'
      const presetField = active.data?.current?.field

      if ((componentType || isPresetDrag) && over.id === 'form-area') {
        const newField: SimpleFormField = isPresetDrag
          ? { ...presetField, id: uuidv4() }
          : {
              id: uuidv4(),
              type: componentType!.type,
              label: getDefaultLabel(componentType!.type),
              placeholder: getDefaultPlaceholder(componentType!.type),
              required: false,
              width: 'full',
              ...(needsOptions(componentType!.type) && {
                options: [
                  { label: 'Option 1', value: 'option_1' },
                  { label: 'Option 2', value: 'option_2' },
                  { label: 'Option 3', value: 'option_3' },
                ],
              }),
              ...(componentType!.type === 'signature' && {
                signatureRole: UserRole.Learner,
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

  const needsOptions = (type: string): boolean =>
    ['select', 'radio', 'checkbox'].includes(type)

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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      measuring={{
        droppable: { strategy: MeasuringStrategy.Always }, 
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{ height: '100vh', display: 'flex', backgroundColor: '#f5f5f5' }}>
        {/* Palette */}
        <Paper
          elevation={2}
          sx={{
            width: 280,
            p: 2,
            m: 2,
            borderRadius: 3,
            backgroundColor: 'white',
            height: 'fit-content',
            position: 'relative',
          }}
        >
          {/* Toggle */}
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <IconButton
              size='small'
              onClick={() => setActiveTab('components')}
              disabled={activeTab === 'components'}
            >
              <ChevronLeftIcon />
            </IconButton>
            <Typography
              variant='h6'
              sx={{ fontWeight: 600, color: '#1976d2', flexGrow: 1, textAlign: 'center' }}
            >
              {activeTab === 'components' ? '📦 Form Components' : '✨ Presets'}
            </Typography>
            <IconButton
              size='small'
              onClick={() => setActiveTab('presets')}
              disabled={activeTab === 'presets'}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>

          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ mb: 2, textAlign: 'center' }}
          >
            {activeTab === 'components'
              ? 'Drag components to build your form'
              : 'Choose from saved presets'}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={1}>
            {activeTab === 'components'
              ? SIMPLE_COMPONENTS.map((item) => (
                  <Grid item xs={12} key={item.type}>
                    <ComponentItem component={item} />
                  </Grid>
                ))
              : <PresetItem presets={PRESET_FIELDS} />}
          </Grid>
        </Paper>

        {/* Form Area */}
        <Box sx={{ flex: 1, p: 2 }}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3, backgroundColor: 'white', minHeight: '80vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 600, color: '#1976d2' }}>
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
          <Box sx={{
            p: 2,
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: 2,
            opacity: 0.9,
            boxShadow: 3,
          }}>
            {SIMPLE_COMPONENTS.find((c) => c.type === activeId)?.label || 'Field'}
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default SimpleFormBuilder
