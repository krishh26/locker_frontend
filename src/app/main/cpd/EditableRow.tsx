import React, { useState, useEffect } from 'react';
import {
  TextField,
  IconButton,
  TableRow,
  TableCell,
  Box,
  Tooltip,
  CircularProgress,
  useTheme,
  Chip,
  Fade
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isValid } from 'date-fns';

interface EditableRowProps {
  row: any;
  headers: any[];
  onSave: (updatedRow: any) => Promise<boolean>;
  onDelete: () => void;
}

const EditableRow: React.FC<EditableRowProps> = ({
  row,
  headers,
  onSave,
  onDelete
}) => {
  const theme = useTheme();
  const [editedRow, setEditedRow] = useState({ ...row });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Reset edited row when the input row changes
  useEffect(() => {
    setEditedRow({ ...row });
    setIsDirty(false);
    setSaveError(false);
  }, [row]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const newValue = e.target.value;
    setEditedRow({
      ...editedRow,
      [field]: newValue
    });
    setIsDirty(true);
    setSaveError(false);
  };

  const handleDateChange = (date: Date | null, field: string) => {
    let formattedDate = '';

    if (date) {
      // Use date-fns to check if the date is valid
      if (isValid(date)) {
        try {
          // Format the date as YYYY-MM-DD
          formattedDate = format(date, 'yyyy-MM-dd');
        } catch (error) {
          console.error('Error formatting date:', error);
        }
      }
    }

    setEditedRow({
      ...editedRow,
      [field]: formattedDate
    });
    setIsDirty(true);
    setSaveError(false);
  };

  const handleSave = async () => {
    // Keep the current data visible during saving
    setIsSaving(true);

    try {
      // Pass the edited data to the parent component for saving
      const success = await onSave(editedRow);

      if (success) {
        // Only update UI state after successful save
        setIsDirty(false);
        setSaveError(false);
      } else {
        setSaveError(true);
      }
    } catch (error) {
      console.error("Error saving row:", error);
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Fade in timeout={300}>
      <TableRow
        hover
        sx={{
          '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.mode === 'light'
              ? theme.palette.grey[50]
              : theme.palette.background.default + '80'
          },
          '& td': { 
            borderRight: `1px solid ${theme.palette.divider}`,
            padding: '8px 12px',
            verticalAlign: 'top'
          },
          '& td:last-child': { borderRight: 'none' },
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'light'
              ? theme.palette.primary.light + '10'
              : theme.palette.primary.dark + '10',
            transform: 'scale(1.001)',
            boxShadow: theme.shadows[2]
          },
          // Add a subtle highlight when saving
          ...(isSaving && {
            backgroundColor: theme.palette.mode === 'light'
              ? theme.palette.primary.light + '20'
              : theme.palette.primary.dark + '20',
            transition: 'background-color 0.3s ease',
            '&::after': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: theme.palette.primary.main,
              borderRadius: '0 2px 2px 0'
            }
          })
        }}
      >
      {headers.map((header) => (
        <TableCell key={header.id}>
          {header.id === 'date' ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={editedRow[header.id] ? (() => {
                  try {
                    const dateStr = editedRow[header.id];
                    const date = new Date(dateStr);
                    if (isValid(date)) {
                      return date;
                    }
                    return null;
                  } catch (e) {
                    return null;
                  }
                })() : null}
                onChange={(date) => handleDateChange(date, header.id)}
                format="yyyy-MM-dd"
                disabled={isSaving}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    variant: "outlined",
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                        '& fieldset': {
                          borderColor: theme.palette.divider,
                          borderWidth: 1,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.light,
                          borderWidth: 2,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                        '&.Mui-disabled': {
                          backgroundColor: theme.palette.action.disabledBackground,
                        }
                      }
                    },
                    onError: (error) => {
                      if (error) {
                        setEditedRow({
                          ...editedRow,
                          [header.id]: ''
                        });
                      }
                    }
                  }
                }}
                onError={(reason) => {
                  if (reason) {
                    console.log("Date error:", reason);
                  }
                }}
              />
            </LocalizationProvider>
          ) : (
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={editedRow[header.id] || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, header.id)}
              multiline={header.multiline}
              rows={header.multiline ? 2 : 1}
              disabled={isSaving}
              placeholder={header.multiline ? `Enter ${header.label.toLowerCase()}...` : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  transition: 'all 0.2s ease',
                  '& fieldset': {
                    borderColor: theme.palette.divider,
                    borderWidth: 1,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.light,
                    borderWidth: 2,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                    boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
                  },
                  '&.Mui-disabled': {
                    backgroundColor: theme.palette.action.disabledBackground,
                  }
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.875rem',
                  lineHeight: 1.4,
                  '&::placeholder': {
                    opacity: 0.7,
                    color: theme.palette.text.secondary
                  }
                }
              }}
            />
          )}
        </TableCell>
      ))}
      <TableCell align="center">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap'
        }}>
          {/* Status Indicators */}
          {!isDirty && !saveError && !isSaving && (
            <Chip
              icon={<CheckCircleIcon />}
              label="Saved"
              size="small"
              sx={{
                backgroundColor: theme.palette.success.light,
                color: theme.palette.success.contrastText,
                fontSize: '0.75rem',
                height: 24
              }}
            />
          )}

          {/* Save Button */}
          {isDirty && !saveError && (
            <Tooltip title="Save changes">
              <IconButton
                color="primary"
                onClick={handleSave}
                size="small"
                disabled={isSaving}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {isSaving ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SaveIcon sx={{ fontSize: '18px' }}/>
                )}
              </IconButton>
            </Tooltip>
          )}

          {/* Error Retry Button */}
          {saveError && (
            <Tooltip title="Error saving. Click to retry">
              <IconButton
                onClick={handleSave}
                size="small"
                sx={{ 
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.error.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.error.dark,
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <RefreshIcon sx={{ fontSize: '18px' }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Delete Button */}
          <Tooltip title="Delete this activity">
            <IconButton
              sx={{ 
                backgroundColor: theme.palette.error.light,
                color: theme.palette.error.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.error.main,
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
              onClick={onDelete}
              size="small"
              disabled={isSaving}
            >
              <DeleteIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
    </Fade>
  );
};

export default EditableRow;
