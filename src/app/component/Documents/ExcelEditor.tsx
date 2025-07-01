import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Toolbar,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Add,
  Remove,
  Functions,
  FormatBold,
  FormatItalic,
  BorderAll,
  Palette,
  CloudUpload,
  Save,
  Delete
} from '@mui/icons-material';

interface ExcelRow {
  [key: string]: string;
}

interface ExcelEditorProps {
  sheetName: string;
  setSheetName: (name: string) => void;
  excelData: ExcelRow[];
  setExcelData: (data: ExcelRow[]) => void;
  onSaveUpload: () => void;
  loading: boolean;
  disabled: boolean;
}

const ExcelEditor: React.FC<ExcelEditorProps> = ({
  sheetName,
  setSheetName,
  excelData,
  setExcelData,
  onSaveUpload,
  loading,
  disabled
}) => {
  const [selectedCell, setSelectedCell] = useState<{row: number, col: string} | null>(null);

  // Get current columns from existing data
  const getCurrentColumns = () => {
    if (excelData.length === 0) return ['A', 'B', 'C'];
    return Object.keys(excelData[0]);
  };

  const addRow = () => {
    const currentColumns = getCurrentColumns();
    const newRow: ExcelRow = {};
    currentColumns.forEach(col => {
      newRow[col] = '';
    });
    setExcelData([...excelData, newRow]);
  };

  const addColumn = () => {
    const currentColumns = getCurrentColumns();
    const nextColIndex = currentColumns.length;
    if (nextColIndex < 26) { // Limit to A-Z
      const nextCol = String.fromCharCode(65 + nextColIndex);
      const newData = excelData.map(row => ({
        ...row,
        [nextCol]: ''
      }));
      setExcelData(newData);
    }
  };

  const deleteRow = (rowIndex: number) => {
    if (excelData.length > 1) {
      const newData = excelData.filter((_, index) => index !== rowIndex);
      setExcelData(newData);
    }
  };

  const updateCell = (rowIndex: number, column: string, value: string) => {
    const newData = [...excelData];
    newData[rowIndex][column] = value;
    setExcelData(newData);
  };

  const getCellAddress = (rowIndex: number, column: string) => {
    return `${column}${rowIndex + 1}`;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Excel-like Header */}
      <Paper elevation={1} sx={{ mb: 2, backgroundColor: '#f8f9fa' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Sheet Name"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                fontSize: '16px',
                fontWeight: 'bold'
              }
            }}
          />
        </Box>

        {/* Excel-like Toolbar */}
        <Toolbar sx={{ minHeight: '48px !important', backgroundColor: '#217346', color: 'white', gap: 1 }}>
          {/* File Operations */}
          <Tooltip title="Save">
            <IconButton size="small" sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              <Save fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />

          {/* Row/Column Operations */}
          <Tooltip title="Add Row">
            <IconButton 
              size="small" 
              onClick={addRow}
              sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Column">
            <IconButton 
              size="small" 
              onClick={addColumn}
              sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <BorderAll fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />

          {/* Excel Functions */}
          <Tooltip title="Functions">
            <IconButton size="small" sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              <Functions fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fill Color">
            <IconButton size="small" sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              <Palette fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box sx={{ flexGrow: 1 }} />

          {/* Cell Reference */}
          {selectedCell && (
            <Chip 
              label={getCellAddress(selectedCell.row, selectedCell.col)}
              size="small"
              sx={{ backgroundColor: 'white', color: '#217346' }}
            />
          )}
        </Toolbar>
      </Paper>

      {/* Formula Bar */}
      <Paper elevation={1} sx={{ mb: 2, p: 1, backgroundColor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ minWidth: 60, fontWeight: 'bold' }}>
            {selectedCell ? getCellAddress(selectedCell.row, selectedCell.col) : 'A1'}
          </Typography>
          <Functions fontSize="small" />
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Enter formula or value"
            value={selectedCell ? excelData[selectedCell.row]?.[selectedCell.col] || '' : ''}
            onChange={(e) => {
              if (selectedCell) {
                updateCell(selectedCell.row, selectedCell.col, e.target.value);
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white'
              }
            }}
          />
        </Box>
      </Paper>

      {/* Spreadsheet Area */}
      <Paper 
        elevation={2} 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#f5f5f5',
          overflow: 'hidden'
        }}
      >
        <TableContainer sx={{ flex: 1, backgroundColor: 'white' }}>
          <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                {/* Row number header */}
                <TableCell 
                  sx={{ 
                    width: 50, 
                    backgroundColor: '#f0f0f0', 
                    border: '1px solid #d0d0d0',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  #
                </TableCell>
                {/* Column headers */}
                {Object.keys(excelData[0] || {}).map((column) => (
                  <TableCell 
                    key={column}
                    sx={{ 
                      width: 120,
                      backgroundColor: '#f0f0f0', 
                      border: '1px solid #d0d0d0',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#217346'
                    }}
                  >
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {excelData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {/* Row number */}
                  <TableCell 
                    sx={{ 
                      backgroundColor: '#f0f0f0', 
                      border: '1px solid #d0d0d0',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#217346'
                    }}
                  >
                    {rowIndex + 1}
                    <IconButton
                      size="small"
                      onClick={() => deleteRow(rowIndex)}
                      disabled={excelData.length <= 1}
                      sx={{ ml: 1, color: 'error.main' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                  {/* Data cells */}
                  {Object.keys(row).map((column) => (
                    <TableCell 
                      key={column}
                      sx={{ 
                        border: '1px solid #d0d0d0',
                        p: 0,
                        backgroundColor: selectedCell?.row === rowIndex && selectedCell?.col === column 
                          ? '#e3f2fd' : 'white'
                      }}
                    >
                      <TextField
                        fullWidth
                        variant="standard"
                        value={row[column]}
                        onChange={(e) => updateCell(rowIndex, column, e.target.value)}
                        onFocus={() => setSelectedCell({ row: rowIndex, col: column })}
                        InputProps={{
                          disableUnderline: true,
                          sx: {
                            fontSize: '14px',
                            p: 1,
                            '& input': {
                              textAlign: 'left'
                            }
                          }
                        }}
                        sx={{
                          '& .MuiInputBase-root': {
                            minHeight: 32
                          }
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Sheet Tabs */}
      <Box sx={{ 
        mt: 1, 
        p: 1, 
        backgroundColor: '#f8f9fa', 
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Chip 
          label={sheetName || 'Sheet1'}
          size="small"
          sx={{ 
            backgroundColor: 'white', 
            border: '1px solid #217346',
            color: '#217346',
            fontWeight: 'bold'
          }}
        />
        <IconButton size="small" onClick={addRow}>
          <Add fontSize="small" />
        </IconButton>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={() => {
            console.log('Excel upload button clicked', {
              sheetName,
              excelData: excelData.length + ' rows',
              loading,
              disabled
            });
            onSaveUpload();
          }}
          disabled={loading || disabled || !sheetName.trim()}
          sx={{
            backgroundColor: '#217346',
            '&:hover': {
              backgroundColor: '#1e6b3e'
            }
          }}
        >
          {loading ? 'Creating & Uploading...' : 'Create & Upload as Evidence'}
        </Button>
      </Box>

      {/* Status Bar */}
      <Box sx={{ 
        mt: 1, 
        p: 1, 
        backgroundColor: '#f8f9fa', 
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="caption" color="textSecondary">
          Rows: {excelData.length} | Columns: {Object.keys(excelData[0] || {}).length}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Ready | Excel Evidence Sheet
        </Typography>
      </Box>
    </Box>
  );
};

export default ExcelEditor;
