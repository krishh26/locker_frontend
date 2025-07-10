import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Typography } from '@mui/material';
import SortableFormField from './SortableFormField';
import { FormField } from './DragDropFormBuilder';

interface FormBuilderAreaProps {
  fields: FormField[];
  onFieldSelect: (field: FormField) => void;
  onFieldDelete: (fieldId: string) => void;
  selectedFieldId?: string;
}

const FormBuilderArea: React.FC<FormBuilderAreaProps> = ({
  fields,
  onFieldSelect,
  onFieldDelete,
  selectedFieldId,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-builder-area',
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: 400,
        p: 2,
        border: '2px dashed',
        borderColor: isOver ? 'primary.main' : 'grey.300',
        borderRadius: 2,
        backgroundColor: isOver ? 'primary.50' : 'transparent',
        transition: 'all 0.2s ease',
      }}
    >
      {fields.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 300,
            color: 'text.secondary',
          }}
        >
          <Typography variant="h6" gutterBottom>
            🎯 Drop form components here
          </Typography>
          <Typography variant="body2" textAlign="center">
            Drag components from the left panel to start building your form
          </Typography>
        </Box>
      ) : (
        <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {fields.map((field) => (
              <SortableFormField
                key={field.id}
                field={field}
                isSelected={field.id === selectedFieldId}
                onSelect={() => onFieldSelect(field)}
                onDelete={() => onFieldDelete(field.id)}
              />
            ))}
          </Box>
        </SortableContext>
      )}
    </Box>
  );
};

export default FormBuilderArea;
