import React from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Box,
  Grid,
} from '@mui/material'
import { useDraggable } from '@dnd-kit/core'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { PresetField, roleIcons, RolePresets } from './presetData'

interface DraggablePresetProps {
  preset: PresetField
}

const DraggablePresetField: React.FC<DraggablePresetProps> = ({ preset }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `preset-${preset.type}`,
      data: {
        type: 'preset',
        field: preset.field,
      },
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <Paper
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
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
        <Typography variant='body2' fontWeight={500}>
          {preset.label}
        </Typography>
      </Box>
    </Paper>
  )
}

const PresetItem: React.FC<{ presets: RolePresets }> = ({ presets }) => {
  return (
    <Box>
      {Object.entries(presets).map(([role, fields]) => (
        <Accordion key={role}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component='span'>{roleIcons[role]}</Typography>
              <Typography
                variant='subtitle1'
                fontWeight={600}
                textTransform='capitalize'
              >
                {role}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {fields.map((preset) => (
                <Grid item xs={12} key={preset.type}>
                  <DraggablePresetField preset={preset} />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

export default PresetItem
