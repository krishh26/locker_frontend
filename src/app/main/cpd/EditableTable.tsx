import { useState, useEffect, useRef } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Menu, MenuItem, Box, useTheme
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import EditableRow from './EditableRow';
import { useSelector, useDispatch } from 'react-redux';
import { selectCpdLearner, exportCpdLearnerPdfAPI, exportCpdLearnerCsvAPI } from 'app/store/cpdLearner';
import FuseLoading from '@fuse/core/FuseLoading';
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined
} from 'src/app/component/Buttons';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import AddIcon from '@mui/icons-material/Add';
import AlertDialog from 'src/app/component/Dialogs/AlertDialog';

const defaultHeaders = [
  { id: 'activity', label: 'What training, learning or development activity have you done?', multiline: true },
  { id: 'date', label: 'Date you did this', multiline: false },
  { id: 'method', label: 'How did you undertake this development activity?', multiline: true },
  { id: 'learning', label: 'What did you learn from this?', multiline: true },
  { id: 'impact', label: 'How has this learning made a difference to your work and improved the way you work?', multiline: true }
];

const createEmptyRow = (userId: string) => ({
  id: uuidv4(),
  user_id: userId,
  activity: '',
  date: '',
  method: '',
  learning: '',
  impact: ''
});

const EditableTable = ({ data, onAddRow, onUpdateRow, onDeleteRow, loading }) => {
  const theme = useTheme();
  const dispatch = useDispatch<any>();
  const { dataUpdatingLoading } = useSelector(selectCpdLearner);
  const [tableData, setTableData] = useState([]);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const exportMenuOpen = Boolean(anchorEl);
  const tableRef = useRef(null);


  useEffect(() => {
    const userId = data[0]?.user_id || 'temp';
    const paddedData = [...data];
    while (paddedData.length < 5) paddedData.push(createEmptyRow(userId));
    setTableData(paddedData);
  }, [data]);

  const handleSaveRow = async (rowId: string, updatedRow: any) => {
    const currentRow = tableData.find(row => row.id === rowId);
    const isNew = currentRow && Object.values(currentRow).every(val => !val || val === rowId || val === currentRow.user_id);

    if (Object.values(updatedRow).some(val => val)) {
      const success = isNew ? await onAddRow(updatedRow) : await onUpdateRow(rowId, updatedRow);
      if (success) {
        setTableData(prev => prev.map(row => row.id === rowId ? { ...row, ...updatedRow } : row));
      }
      return success;
    }
    return true;
  };

  const handleDeleteRow = (rowId: string) => {
    if (isDeleting || dataUpdatingLoading) return;
    const row = tableData.find(r => r.id === rowId);
    const isEmpty = defaultHeaders.every(h => !row[h.id]);
    if (isEmpty) setTableData(prev => prev.filter(r => r.id !== rowId));
    else setDeleteRowId(rowId);
  };

  const confirmDelete = async () => {
    if (!deleteRowId) return;
    setIsDeleting(true);
    await onDeleteRow(deleteRowId);
    setIsDeleting(false);
    setDeleteRowId(null);
  };

  const handleAddNewRow = () => {
    const userId = data[0]?.user_id || 'temp';
    setTableData(prev => [...prev, createEmptyRow(userId)]);
  };

  const handleExportClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleExportClose = () => setAnchorEl(null);

  const exportToCSV = () => {
    handleExportClose();
    const rows = tableData.filter(row => defaultHeaders.some(h => row[h.id]?.trim()));
    if (!rows.length) return alert('No data to export!');

    // Call the API to export CSV
    dispatch(exportCpdLearnerCsvAPI());
  };

  const exportToPDF = () => {
    handleExportClose();
    const rows = tableData.filter(row => defaultHeaders.some(h => row[h.id]));
    if (!rows.length) return alert('No data to export.');

    // Call the API to export PDF
    dispatch(exportCpdLearnerPdfAPI());
  };

  return (
    <>
      {/* Export Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5, width: '100%' }}>
        <SecondaryButton
          name="Export"
          className="py-8 px-24 mb-6"
          startIcon={<FileDownloadIcon sx={{ fontSize: '16px' }} />}
          onClick={handleExportClick}
          sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontSize: "1rem", fontWeight: "bold", '&:hover': { backgroundColor: theme.palette.primary.dark } }}
        />
        <Menu anchorEl={anchorEl} open={exportMenuOpen} onClose={handleExportClose}>
          <MenuItem onClick={exportToCSV}><TableChartIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: '16px' }} />Export as CSV</MenuItem>
          <MenuItem onClick={exportToPDF}><PictureAsPdfIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: '16px' }} />Export as PDF</MenuItem>
        </Menu>
      </Box>

      <Paper
        elevation={0}
        sx={{
          mb: 1.5,
          boxShadow: theme.shadows[2],
          borderRadius: '8px',
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}
      >
        {loading ? (
          <FuseLoading />
        ) : (
          <TableContainer
            ref={tableRef}
            sx={{
              maxHeight: 'calc(100vh - 385px)',
              minHeight: '180px',
              overflowY: 'auto',
              width: '100%',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: theme.palette.mode === 'light'
                  ? theme.palette.grey[100]
                  : theme.palette.background.default,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.mode === 'light'
                  ? theme.palette.grey[400]
                  : theme.palette.grey[700],
                borderRadius: '4px',
              },
            }}
          >
            <Table sx={{ width: '100%', tableLayout: 'fixed', margin: 0 }} size="small" stickyHeader>
              <colgroup>
                <col style={{ width: '25%' }} /> {/* activity */}
                <col style={{ width: '10%' }} /> {/* date */}
                <col style={{ width: '15%' }} /> {/* method */}
                <col style={{ width: '20%' }} /> {/* learning */}
                <col style={{ width: '20%' }} /> {/* impact */}
                <col style={{ width: '10%' }} /> {/* action */}
              </colgroup>
              <TableHead sx={{ backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.primary.dark }}>
                <TableRow>
                  {defaultHeaders.map((header) => (
                    <TableCell
                      key={header.id}
                      sx={{
                        backgroundColor: theme.palette.mode === 'light'
                          ? theme.palette.primary.light
                          : theme.palette.primary.dark,
                        fontWeight: 'bold',
                        padding: '10px 4px',
                        fontSize: '14px',
                        borderRight: `1px solid ${theme.palette.divider}`,
                        color: theme.palette.primary.contrastText,
                        lineHeight: '1.4',
                        '&:last-child': { borderRight: 'none' },
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        boxShadow: '0 3px 5px -1px rgba(0,0,0,0.2)'
                      }}
                    >
                      {header.label}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      backgroundColor: theme.palette.mode === 'light'
                        ? theme.palette.primary.light
                        : theme.palette.primary.dark,
                      fontWeight: 'bold',
                      padding: '10px 4px',
                      fontSize: '14px',
                      color: theme.palette.primary.contrastText,
                      textAlign: 'center',
                      position: 'sticky',
                      top: 0,
                      zIndex: 10,
                      boxShadow: '0 3px 5px -1px rgba(0,0,0,0.2)'
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {tableData.map(row => (
                  <EditableRow key={row.id} row={row} headers={defaultHeaders} onSave={updated => handleSaveRow(row.id, updated)} onDelete={() => handleDeleteRow(row.id)} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add Row Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5, width: '100%' }}>
        <SecondaryButton
          name="Add Row"
          className="py-8 px-24"
          startIcon={<AddIcon sx={{ fontSize: '16px' }} />}
          onClick={handleAddNewRow}
          sx={{
            backgroundColor: theme.palette.success.main,
            color: theme.palette.primary.contrastText,
            fontSize: "1rem",
            fontWeight: "bold",
            '&:hover': {
              backgroundColor: theme.palette.success.dark
            }
          }}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deleteRowId)}
        // If deletion is in progress, pass an empty function to prevent closing
        close={isDeleting || dataUpdatingLoading ? () => {} : () => setDeleteRowId(null)}
        title="Delete CPD Entry?"
        content={isDeleting || dataUpdatingLoading
          ? "Deleting CPD entry... Please wait."
          : "Are you sure you want to delete this CPD entry? This action cannot be undone."}
        className="-224"
        actionButton={
          isDeleting || dataUpdatingLoading ? (
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
            onClick={isDeleting || dataUpdatingLoading ? () => {} : () => setDeleteRowId(null)}
            name="Cancel"
            disabled={isDeleting || dataUpdatingLoading}
          />
        }
      />
    </>
  );
};

export default EditableTable;

