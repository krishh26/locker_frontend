import React, { useState, useEffect } from 'react';
import {
  TextField,
  IconButton,
  TableRow,
  TableCell,
  Box,
  Tooltip,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface EditableRowProps {
  row: any;
  headers: any[];
  onSave: (updatedRow: any) => Promise<boolean>;
  onDelete: () => void;
  onAddRow: () => void;
  isLastRow: boolean;
}

const EditableRow: React.FC<EditableRowProps> = ({
  row,
  headers,
  onSave,
  onDelete,
  onAddRow,
  isLastRow
}) => {
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
    const formattedDate = date ? date.toISOString().split('T')[0] : '';
    setEditedRow({
      ...editedRow,
      [field]: formattedDate
    });
    setIsDirty(true);
    setSaveError(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSave(editedRow);
      if (success) {
        setIsDirty(false);
        setSaveError(false);
      } else {
        setSaveError(true);
      }
    } catch (error) {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TableRow
      hover
      sx={{
        '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
        '& td': { borderRight: '1px solid #e0e0e0' },
        '& td:last-child': { borderRight: 'none' }
      }}
    >
      {headers.map((header) => (
        <TableCell key={header.id} sx={{ padding: '8px' }}>
          {header.id === 'date' ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={editedRow[header.id] ? new Date(editedRow[header.id]) : null}
                onChange={(date) => handleDateChange(date, header.id)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    variant: "outlined"
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
              // placeholder={header.label}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#bdbdbd',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
              }}
            />
          )}
        </TableCell>
      ))}
      <TableCell align="center" sx={{ width: '120px', padding: '8px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          {isDirty && !saveError && (
            <Tooltip title="Save changes">
              <IconButton
                color="primary"
                onClick={handleSave}
                size="small"
                disabled={isSaving}
              >
                {isSaving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SaveIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}

          {saveError && (
            <Tooltip title="Error saving. Click to retry">
              <IconButton
                onClick={handleSave}
                size="small"
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Delete row">
            <IconButton
              sx={{ color: '#f44336' }}
              onClick={onDelete}
              size="small"
              disabled={isSaving}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {isLastRow && (
            <Tooltip title="Add new row">
              <IconButton
                color="primary"
                onClick={onAddRow}
                size="small"
                disabled={isSaving}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default EditableRow;
