import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Box, Typography, Grid, Button } from '@mui/material'
import SimpleFormFieldComponent from './SimpleFormField'
import { SimpleFormField as FormFieldType } from './SimpleFormBuilder'

interface FormAreaProps {
  fields: FormFieldType[]
  editingField: string | null
  onFieldEdit: (fieldId: string | null) => void
  onFieldUpdate: (fieldId: string, updates: Partial<FormFieldType>) => void
  onFieldDelete: (fieldId: string) => void
  onFieldDuplicate: (fieldId: string) => void
}

const FormArea: React.FC<FormAreaProps> = ({
  fields,
  editingField,
  onFieldEdit,
  onFieldUpdate,
  onFieldDelete,
  onFieldDuplicate,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-area',
  })

  // Group fields into rows for responsive layout
  const groupFieldsIntoRows = (fields: FormFieldType[]) => {
    const rows: FormFieldType[][] = []
    let currentRow: FormFieldType[] = []
    let currentRowWidth = 0

    fields.forEach((field) => {
      const fieldWidth = getFieldWidth(field.width || 'full')
      if (currentRowWidth + fieldWidth > 12 && currentRow.length > 0) {
        rows.push(currentRow)
        currentRow = [field]
        currentRowWidth = fieldWidth
      } else {
        currentRow.push(field)
        currentRowWidth += fieldWidth
      }
    })

    if (currentRow.length > 0) rows.push(currentRow)
    return rows
  }

  const getFieldWidth = (width: string): number => {
    switch (width) {
      case 'third':
        return 4
      case 'half':
        return 6
      case 'full':
      default:
        return 12
    }
  }

  const getGridSize = (width: string): number => {
    switch (width) {
      case 'third':
        return 4
      case 'half':
        return 6
      case 'full':
      default:
        return 12
    }
  }

  const rows = groupFieldsIntoRows(fields)

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        p: 3,
        border: '3px dashed',
        borderColor: isOver ? '#1976d2' : '#e0e0e0',
        borderRadius: 3,
        backgroundColor: isOver ? '#e3f2fd' : '#fafafa',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      {/* Drop placeholder overlay */}
      {isOver && fields.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 'auto',
            bottom: 20,
            left: 0,
            right: 0,
            height: 60,
            backgroundColor: 'rgba(40, 167, 69, 0.1)', // light green overlay
            border: '2px dashed #28a745', // green border
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            fontSize: 14,
            color: '#28a745', // green text
          }}
        >
          Release to drop here
        </Box>
      )}

      {fields.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100vh - 200px)',
            color: 'text.secondary',
          }}
        >
          <Typography variant='h4' gutterBottom sx={{ fontSize: '3rem' }}>
            🎯
          </Typography>
          <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
            Drop form components here
          </Typography>
          <Typography variant='body1' textAlign='center' sx={{ maxWidth: 400 }}>
            Drag any component from the left panel to start building your form.
            Components will automatically arrange themselves in a beautiful
            layout.
          </Typography>
        </Box>
      ) : (
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 , marginBottom  : '80px'}}>
            {rows.map((row, rowIndex) => (
              <Grid container spacing={2} key={rowIndex}>
                {row.map((field) => (
                  <Grid
                    item
                    xs={12}
                    md={getGridSize(field.width || 'full')}
                    key={field.id}
                  >
                    <SimpleFormFieldComponent
                      field={field}
                      isEditing={editingField === field.id}
                      onEdit={() => onFieldEdit(field.id)}
                      onStopEdit={() => onFieldEdit(null)}
                      onUpdate={(updates) => onFieldUpdate(field.id, updates)}
                      onDelete={() => onFieldDelete(field.id)}
                      onDuplicate={() => onFieldDuplicate(field.id)}
                    />
                  </Grid>
                ))}
              </Grid>
            ))}
          </Box>
        </SortableContext>
      )}

      {/* Action buttons */}
      {/* <Box
        sx={{
          mt: 4,
          display: 'flex',
          gap: 2,
          justifyContent: 'flex-end',
        }}
      >
        <Button type='button' variant='outlined' disabled>
          Clear Form
        </Button>
        <Box
          component='button'
          type='submit'
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            fontWeight: 500,
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#1976d2',
            color: '#fff',
            opacity: 0.6,
          }}
        >
          Submit
        </Box>
      </Box> */}
    </Box>
  )
}

export default FormArea
