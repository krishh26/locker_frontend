import React, { useState, useEffect } from 'react';
import {
  TextField,
  IconButton,
  TableRow,
  TableCell,
  Box,
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
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
    <TableRow
      hover
      sx={{
        '&:nth-of-type(odd)': {
          backgroundColor: theme.palette.mode === 'light'
            ? theme.palette.grey[50]
            : theme.palette.background.default + '80' // 80% opacity
        },
        '& td': { borderRight: `1px solid ${theme.palette.divider}` },
        '& td:last-child': { borderRight: 'none' },
        // Add a subtle highlight when saving
        ...(isSaving && {
          backgroundColor: theme.palette.mode === 'light'
            ? theme.palette.primary.light + '20' // 20% opacity
            : theme.palette.primary.dark + '20',
          transition: 'background-color 0.3s ease'
        })
      }}
    >
      {headers.map((header) => (
        <TableCell key={header.id} sx={{ padding: '4px' }}>
          {header.id === 'date' ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={editedRow[header.id] ? (() => {
                  try {
                    // Parse the date string and validate it
                    const dateStr = editedRow[header.id];
                    const date = new Date(dateStr);

                    // Check if the date is valid
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
                    // Add error handling for invalid dates
                    onError: (error) => {
                      if (error) {
                        // Clear the invalid date value
                        setEditedRow({
                          ...editedRow,
                          [header.id]: ''
                        });
                      }
                    }
                  }
                }}
                // Prevent manual input parsing errors
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
              rows={header.multiline ? 1 : 1}
              disabled={isSaving}
              // placeholder={header.label}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.divider,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.mode === 'light'
                      ? theme.palette.grey[400]
                      : theme.palette.grey[600],
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          )}
        </TableCell>
      ))}
      <TableCell align="center" sx={{ padding: '4px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          {isDirty && !saveError && (
            <Tooltip title="Save changes">
              <IconButton
                color="primary"
                onClick={handleSave}
                size="small"
                disabled={isSaving}
              >
                {isSaving ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SaveIcon sx={{ fontSize: '20px' }}/>
                )}
              </IconButton>
            </Tooltip>
          )}

          {saveError && (
            <Tooltip title="Error saving. Click to retry">
              <IconButton
                onClick={handleSave}
                size="small"
                sx={{ color: theme.palette.warning.main }}
              >
                <RefreshIcon sx={{ fontSize: '20px' }} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Delete row">
            <IconButton
              sx={{ color: theme.palette.error.main }}
              onClick={onDelete}
              size="small"
              disabled={isSaving}
            >
              <DeleteIcon sx={{ fontSize: '20px' }} />
            </IconButton>
          </Tooltip>


        </Box>
      </TableCell>
    </TableRow>
  );
};

export default EditableRow;
