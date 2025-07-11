import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Box, Typography, Paper } from '@mui/material';

interface ComponentPaletteItemProps {
  component: {
    type: string;
    label: string;
    icon: string;
  };
}

const ComponentPaletteItem: React.FC<ComponentPaletteItemProps> = ({ component }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: component.type,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      elevation={isDragging ? 4 : 1}
      sx={{
        p: 2,
        cursor: 'grab',
        userSelect: 'none',
        backgroundColor: isDragging ? 'primary.light' : 'white',
        color: isDragging ? 'white' : 'text.primary',
        border: '1px solid',
        borderColor: isDragging ? 'primary.main' : 'grey.300',
        borderRadius: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'primary.light',
          color: 'white',
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="h6" component="span">
          {component.icon}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {component.label}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ComponentPaletteItem;
