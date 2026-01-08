import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export interface StandardCourseMinimalProps {
  title: string;
  knowledgeItems?: Array<{
    id: string | number;
    code: string;
    description: string;
    gapStatus?: 'none' | 'minor' | 'major'; // 'none' = green bars, 'minor' = yellow, 'major' = red
    comment?: string;
    signedOff?: boolean;
    mapped?: boolean;
  }>;
  onMapChange?: (itemId: string | number, mapped: boolean) => void;
  onCommentChange?: (itemId: string | number, comment: string) => void;
  onSignOffChange?: (itemId: string | number, signedOff: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  canEdit?: boolean;
}

const StandardCourseMinimal: React.FC<StandardCourseMinimalProps> = ({
  title,
  knowledgeItems = [],
  onMapChange,
  onCommentChange,
  onSignOffChange,
  onSelectAll,
  canEdit = true,
}) => {
  const allMapped = knowledgeItems.every((item) => item.mapped) && knowledgeItems.length > 0;
  const someMapped = knowledgeItems.some((item) => item.mapped);

  const getGapIndicator = (status?: 'none' | 'minor' | 'major') => {
    switch (status) {
      case 'none':
        // Green horizontal bar with segments (like in the image)
        return (
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {[1, 2, 3, 4].map((segment) => (
              <Box
                key={segment}
                sx={{
                  width: 8,
                  height: 16,
                  bgcolor: '#4caf50', // Green
                  borderRadius: 0.5,
                }}
              />
            ))}
          </Box>
        );
      case 'minor':
        // Yellow square
        return (
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: 0.5,
              bgcolor: '#ffc107', // Yellow
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
        );
      case 'major':
        // Red square
        return (
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: 0.5,
              bgcolor: '#f44336', // Red
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
        );
      default:
        // Grey square (no status)
        return (
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: 0.5,
              bgcolor: '#e0e0e0', // Grey
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
        );
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAll) {
      onSelectAll(event.target.checked);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper' }}>
        {/* Title */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
        </Box>

        {/* Knowledge Items Table */}
        <Box>
          {/* Select All Checkbox */}
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allMapped}
                  indeterminate={someMapped && !allMapped}
                  onChange={handleSelectAll}
                  disabled={!canEdit}
                />
              }
              label="Select All"
              sx={{ m: 0 }}
            />
          </Box>

          {/* Knowledge Items Table */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 80 }}>Map</TableCell>
                  <TableCell>Knowledge</TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>
                    Gaps
                  </TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>
                    Comment
                  </TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>
                    Sign Off
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {knowledgeItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Checkbox
                        checked={item.mapped ?? false}
                        onChange={(e) => {
                          if (onMapChange) {
                            onMapChange(item.id, e.target.checked);
                          }
                        }}
                        disabled={!canEdit}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.code && (
                          <Typography component="span" variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
                            {item.code} - 
                          </Typography>
                        )}
                        {item.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {getGapIndicator(item.gapStatus)}
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 0.5,
                          bgcolor: item.comment ? 'primary.light' : 'grey.200',
                          mx: 'auto',
                          border: '1px solid',
                          borderColor: 'divider',
                          cursor: canEdit ? 'pointer' : 'default',
                        }}
                        onClick={() => {
                          if (canEdit && onCommentChange) {
                            const newComment = prompt('Enter comment:', item.comment || '');
                            if (newComment !== null) {
                              onCommentChange(item.id, newComment);
                            }
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Checkbox
                          checked={item.signedOff ?? false}
                          onChange={(e) => {
                            if (onSignOffChange) {
                              onSignOffChange(item.id, e.target.checked);
                            }
                          }}
                          disabled={!canEdit || !item.mapped}
                          size="small"
                        />
                        {item.signedOff && (
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: 0.5,
                              bgcolor: '#4caf50',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: 'bold',
                              }}
                            >
                              ✓
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default StandardCourseMinimal;

