import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem,
  Box
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import EditableRow from './EditableRow';
import { useSelector } from 'react-redux';
import { selectCpdPlanning, CpdEntry } from 'app/store/cpdPlanning';
import FuseLoading from '@fuse/core/FuseLoading';
import AlertDialog from 'src/app/component/Dialogs/AlertDialog';
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
// Import jsPDF dynamically to avoid issues
const { jsPDF } = require('jspdf');

interface EditableTableProps {
  data: CpdEntry[];
  onAddRow: (newRow: any) => Promise<boolean>;
  onUpdateRow: (rowId: string, updatedRow: any) => Promise<boolean>;
  onDeleteRow: (rowId: string) => Promise<boolean>;
  loading: boolean;
}

const defaultHeaders = [
  {
    id: 'activity',
    label: 'What training, learning or development activity have you done?',
    multiline: true
  },
  {
    id: 'date',
    label: 'Date you did this',
    multiline: false
  },
  {
    id: 'method',
    label: 'How did you undertake this development activity?',
    multiline: true,
    // helperText: 'e.g. short course, training, e-learning, shadowing, reading, new duties or activities etc'
  },
  {
    id: 'learning',
    label: 'What did you learn from this?',
    multiline: true
  },
  {
    id: 'impact',
    label: 'How has this learning made a difference to your work and improved the way you work?',
    multiline: true,
    // helperText: 'e.g. statutory/mandatory trained, customer satisfaction, improving business, meeting your own personal learning needs etc'
  }
];

// Create an empty row template
const createEmptyRow = (userId: string) => ({
  id: uuidv4(),
  user_id: userId,
  activity: '',
  date: '',
  method: '',
  learning: '',
  impact: ''
});

const EditableTable: React.FC<EditableTableProps> = ({
  data,
  onAddRow,
  onUpdateRow,
  onDeleteRow,
  loading
}) => {
  const [headers] = useState(defaultHeaders);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const { dataUpdatingLoadding } = useSelector(selectCpdPlanning);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const exportMenuOpen = Boolean(anchorEl);

  // Combine existing data with empty rows if needed
  const [tableData, setTableData] = useState<CpdEntry[]>([]);

  // Initialize with 5 empty rows or use existing data
  useEffect(() => {
    if (data.length === 0) {
      // Create 5 empty rows with unique IDs
      const userId = 'temp'; // This will be replaced when saving
      const emptyRows = Array(2).fill(null).map(() => createEmptyRow(userId));
      setTableData(emptyRows);
    } else {
      // If we have data but less than 5 rows, add empty rows to make it 5
      if (data.length < 5) {
        const userId = data[0]?.user_id || 'temp';
        const additionalRows = Array(5 - data.length).fill(null).map(() => createEmptyRow(userId));
        setTableData([...data, ...additionalRows]);
      } else {
        setTableData(data);
      }
    }
  }, [data]);

  const handleSaveRow = async (rowId: string, updatedRow: any): Promise<boolean> => {
    // Update the local state immediately for a smooth UI experience
    setTableData(prevData =>
      prevData.map(row => row.id === rowId ? { ...row, ...updatedRow } : row)
    );

    try {
      // Check if this is a new row (has no real data yet)
      const isNewRow = tableData.find(row => row.id === rowId &&
        !row.activity && !row.date && !row.method && !row.learning && !row.impact);

      if (isNewRow) {
        // Only save if at least one field has data
        if (updatedRow.activity || updatedRow.date || updatedRow.method ||
            updatedRow.learning || updatedRow.impact) {
          const result = await Promise.resolve(onAddRow(updatedRow));
          return result;
        }
      } else {
        // Only call API if there's actual data to save
        if (updatedRow.activity || updatedRow.date || updatedRow.method ||
            updatedRow.learning || updatedRow.impact) {
          const result = await Promise.resolve(onUpdateRow(rowId, updatedRow));
          return result;
        }
      }
      return true; // Return true if no API call was needed
    } catch (error) {
      console.error("Error saving row:", error);
      return false;
    }
  };

  const handleDeleteRow = (rowId: string) => {
    // Check if this is an empty row (has no real data)
    const rowToDelete = tableData.find(row => row.id === rowId);
    if (rowToDelete &&
        !rowToDelete.activity &&
        !rowToDelete.date &&
        !rowToDelete.method &&
        !rowToDelete.learning &&
        !rowToDelete.impact) {
      // Just remove it from the local state without API call
      setTableData(tableData.filter(row => row.id !== rowId));
    } else {
      // Confirm deletion for rows with data
      setDeleteRowId(rowId);
    }
  };

  const confirmDelete = () => {
    if (deleteRowId) {
      onDeleteRow(deleteRowId);
      setDeleteRowId(null);
    }
  };

  const handleAddNewRow = () => {
    const userId = data.length > 0 ? data[0].user_id : 'temp';
    const newEmptyRow = createEmptyRow(userId);
    setTableData([...tableData, newEmptyRow]);
  };

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const exportToCSV = () => {
    handleExportClose();

    // Filter out empty rows
    const dataToExport = tableData.filter(row =>
      row.activity || row.date || row.method || row.learning || row.impact
    );

    if (dataToExport.length === 0) {
      return;
    }

    try {
      // Create CSV content with proper escaping for Excel compatibility
      const headerLabels = headers.map(header => `"${header.label.replace(/"/g, '""')}"`);
      const headerRow = headerLabels.join(',');

      const dataRows = dataToExport.map(row => {
        const rowData = headers.map(header => {
          // Properly escape cell data for CSV
          const cellData = String(row[header.id] || '');
          // Wrap in quotes and escape any existing quotes
          return `"${cellData.replace(/"/g, '""')}"`;
        });
        return rowData.join(',');
      });

      const csvContent = [headerRow, ...dataRows].join('\r\n'); // Use CRLF for better Excel compatibility

      // Create a blob with BOM for Excel compatibility
      const BOM = '\uFEFF'; // UTF-8 BOM
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'cpd_entries.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export as CSV. Please try again later.');
    }
  };

  const exportToPDF = () => {
    handleExportClose();

    // Filter out empty rows
    const dataToExport = tableData.filter(row =>
      row.activity || row.date || row.method || row.learning || row.impact
    );

    if (dataToExport.length === 0) {
      return;
    }

    try {
      // Create PDF document - landscape for better fit
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add title
      doc.setFontSize(16);
      doc.text('CPD Entries', 14, 15);

      // Prepare table data
      const tableColumn = headers.map(header => {
        // Shorten header labels for better fit in PDF
        const label = header.label;
        return label.length > 40 ? label.substring(0, 40) + '...' : label;
      });

      const tableRows = dataToExport.map(row =>
        headers.map(header => {
          const value = row[header.id] || '';
          // Truncate long text for better display
          return value.length > 60 ? value.substring(0, 60) + '...' : value;
        })
      );

      // Add table to document
      const autoTable = require('jspdf-autotable').default;
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid',
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 50 }, // activity
          1: { cellWidth: 25 }, // date
          2: { cellWidth: 50 }, // method
          3: { cellWidth: 50 }, // learning
          4: { cellWidth: 50 }  // impact
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        }
      });

      // Save the PDF
      doc.save('cpd_entries.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again later.');
    }
  };

  return (
    <>
      {/* Export Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <SecondaryButton
          name="Export"
          className="py-6 px-24 mb-10"
          startIcon={<FileDownloadIcon sx={{ mx: -0.5 }} />}
          onClick={handleExportClick}
        />
        <Menu
          anchorEl={anchorEl}
          open={exportMenuOpen}
          onClose={handleExportClose}
        >
          <MenuItem onClick={exportToCSV}>
            <TableChartIcon sx={{ mr: 1, color: '#5B718F' }} />
            Export as CSV
          </MenuItem>
          <MenuItem onClick={exportToPDF}>
            <PictureAsPdfIcon sx={{ mr: 1, color: '#5B718F' }} />
            Export as PDF
          </MenuItem>
        </Menu>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          minHeight: 200,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          mb: 2,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <FuseLoading />
        ) : (
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      backgroundColor: "#F8F8F8",
                      fontWeight: 'bold',
                      padding: '12px 8px',
                      borderRight: '1px solid #e0e0e0',
                      '&:last-child': { borderRight: 'none' }
                    }}
                  >
                    {header.label}
                  </TableCell>
                ))}
                <TableCell
                  sx={{
                    backgroundColor: "#F8F8F8",
                    fontWeight: 'bold',
                    width: '100px',
                    padding: '12px 8px',
                    textAlign: 'center'
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index) => (
                <EditableRow
                  key={row.id}
                  row={row}
                  headers={headers}
                  onSave={(updatedRow) => handleSaveRow(row.id, updatedRow)}
                  onDelete={() => handleDeleteRow(row.id)}
                  onAddRow={handleAddNewRow}
                  isLastRow={index === tableData.length - 1}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deleteRowId)}
        close={() => setDeleteRowId(null)}
        title="Delete CPD Entry?"
        content="Are you sure you want to delete this CPD entry? This action cannot be undone."
        className="-224"
        actionButton={
          dataUpdatingLoadding ? (
            <LoadingButton />
          ) : (
            <DangerButton
              onClick={confirmDelete}
              name="Delete Entry"
            />
          )
        }
        cancelButton={
          <SecondaryButtonOutlined
            className="px-24"
            onClick={() => setDeleteRowId(null)}
            name="Cancel"
          />
        }
      />
    </>
  );
};

export default EditableTable;
