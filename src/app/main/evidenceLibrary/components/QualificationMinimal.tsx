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
  Chip,
  IconButton,
  TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export interface QualificationMinimalProps {
  unit: {
    id: string | number;
    code?: string;
    title: string;
    evidenceRequirements?: Array<{ code: string; name: string }>;
    assessmentMethods?: Array<{ code: string; name: string; count?: number }>;
    performanceCriteria?: Array<{
      id: string | number;
      code: string;
      description: string;
      gapStatus?: 'none' | 'minor' | 'major'; // 'none' = green, 'minor' = yellow, 'major' = red
      comment?: string;
      signedOff?: boolean;
      mapped?: boolean;
    }>;
  };
  onMapChange?: (pcId: string | number, mapped: boolean) => void;
  onCommentChange?: (pcId: string | number, comment: string) => void;
  onSignOffChange?: (pcId: string | number, signedOff: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  canEdit?: boolean;
}

const QualificationMinimal: React.FC<QualificationMinimalProps> = ({
  unit,
  onMapChange,
  onCommentChange,
  onSignOffChange,
  onSelectAll,
  canEdit = true,
}) => {
  const [expandedEvidence, setExpandedEvidence] = useState(false);

  const allMapped = unit.performanceCriteria?.every((pc) => pc.mapped) ?? false;
  const someMapped = unit.performanceCriteria?.some((pc) => pc.mapped) ?? false;

  const getGapColor = (status?: 'none' | 'minor' | 'major') => {
    switch (status) {
      case 'none':
        return '#4caf50'; // Green
      case 'minor':
        return '#ffc107'; // Yellow
      case 'major':
        return '#f44336'; // Red
      default:
        return '#e0e0e0'; // Grey (no status)
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
        {/* Unit Header with Code */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {unit.code && (
              <Typography component="span" variant="h6" sx={{ color: 'text.secondary', mr: 1, fontWeight: 600 }}>
                {unit.code} - 
              </Typography>
            )}
            {unit.title}
          </Typography>
        </Box>

        {/* Performance Criteria Section */}
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
              label="Select All PC's"
              sx={{ m: 0 }}
            />
          </Box>

          {/* Performance Criteria Table */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Performance Criteria</TableCell>
                  <TableCell align="center" sx={{ width: 80 }}>
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
                {unit.performanceCriteria?.map((pc) => (
                  <TableRow key={pc.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Checkbox
                          checked={pc.mapped ?? false}
                          onChange={(e) => {
                            if (onMapChange) {
                              onMapChange(pc.id, e.target.checked);
                            }
                          }}
                          disabled={!canEdit}
                          size="small"
                          sx={{ p: 0.5, mt: -0.5 }}
                        />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {pc.code && (
                            <Typography component="span" variant="body2" sx={{ fontWeight: 500, mr: 0.5 }}>
                              {pc.code}- 
                            </Typography>
                          )}
                          {pc.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 0.5,
                          bgcolor: getGapColor(pc.gapStatus),
                          mx: 'auto',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 0.5,
                          bgcolor: pc.comment ? 'primary.light' : 'grey.200',
                          mx: 'auto',
                          border: '1px solid',
                          borderColor: 'divider',
                          cursor: canEdit ? 'pointer' : 'default',
                        }}
                        onClick={() => {
                          if (canEdit && onCommentChange) {
                            const newComment = prompt('Enter comment:', pc.comment || '');
                            if (newComment !== null) {
                              onCommentChange(pc.id, newComment);
                            }
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={pc.signedOff ?? false}
                        onChange={(e) => {
                          if (onSignOffChange) {
                            onSignOffChange(pc.id, e.target.checked);
                          }
                        }}
                        disabled={!canEdit || !pc.mapped}
                        size="small"
                      />
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

export default QualificationMinimal;

