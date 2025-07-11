import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Box, Typography, Paper } from '@mui/material';

interface ComponentItemProps {
  component: {
    type: string;
    label: string;
    icon: string;
  };
}

const ComponentItem: React.FC<ComponentItemProps> = ({ component }) => {
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
      elevation={isDragging ? 6 : 2}
      sx={{
        p: 2,
        cursor: 'grab',
        userSelect: 'none',
        backgroundColor: isDragging ? '#1976d2' : 'white',
        color: isDragging ? 'white' : 'text.primary',
        border: '2px solid',
        borderColor: isDragging ? '#1976d2' : 'transparent',
        borderRadius: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#e3f2fd',
          borderColor: '#1976d2',
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="h6" component="span" sx={{ fontSize: '1.2rem' }}>
          {component.icon}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
          {component.label.replace(/^[^\s]+ /, '')} {/* Remove emoji from label */}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ComponentItem;
