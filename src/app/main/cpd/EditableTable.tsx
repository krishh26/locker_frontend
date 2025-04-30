import React, { useState, useEffect, useRef } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Menu, MenuItem, Box, useTheme
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import EditableRow from './EditableRow';
import { useSelector } from 'react-redux';
import { selectCpdLearner } from 'app/store/cpdLearner';
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AlertDialog from 'src/app/component/Dialogs/AlertDialog';
import { selectLearnerManagement } from 'app/store/learnerManagement';
import { selectUser } from 'app/store/userSlice';

const defaultHeaders = [
  { id: 'activity', label: 'What training, learning or development activity have you done?', multiline: true },
  { id: 'date', label: 'Date you did this', multiline: false },
  { id: 'method', label: 'How did you undertake this development activity?', multiline: true },
  { id: 'learning', label: 'What did you learn from this?', multiline: true },
  { id: 'impact', label: 'How has this learning made a difference to your work and improved the way you work?', multiline: true }
];

const createEmptyRow = (userId) => ({
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
    const user = JSON.parse(sessionStorage.getItem("learnerToken") || "null")?.user 
      || useSelector(selectUser)?.data || {};
    const { learner } = useSelector(selectLearnerManagement);
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

  const handleSaveRow = async (rowId, updatedRow) => {
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

  const handleDeleteRow = (rowId) => {
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

  const handleExportClick = (e) => setAnchorEl(e.currentTarget);
  const handleExportClose = () => setAnchorEl(null);

  const exportToCSV = () => {
    handleExportClose();
    const rows = tableData.filter(row => defaultHeaders.some(h => row[h.id]?.trim()));
    if (!rows.length) return alert('No data to export!');
    const csv = [
      ['Continuing Professional Development (CPD) – Learning log'],
      [],
      ['Name:', user.displayName || ''],
      ['Job title:', learner.job_title || ''],
      ['Employer:', learner.employer_name || ''],
      [],
      defaultHeaders.map(h => h.label),
      ...rows.map(row => defaultHeaders.map(h => row[h.id] || '')),
      ...Array(Math.max(0, 5 - rows.length)).fill(['', '', '', '', ''])
    ].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cpd_entries.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    handleExportClose();
    const rows = tableData.filter(row => defaultHeaders.some(h => row[h.id]));
    if (!rows.length) return alert('No data to export.');

    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:20px;background:white;z-index:9999;border-radius:5px;box-shadow:0 0 10px rgba(0,0,0,0.2)';
    loadingDiv.textContent = 'Generating PDF...';
    document.body.appendChild(loadingDiv);

    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'position:absolute;left:-9999px;top:-9999px';
    document.body.appendChild(tempDiv);

    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;font-size:10px';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    defaultHeaders.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h.label;
      th.style.cssText = `padding:8px;background:${theme.palette.primary.main};color:${theme.palette.primary.contrastText};border:1px solid #ddd;text-align:left`;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.style.backgroundColor = idx % 2 === 0 ? '#f9f9f9' : 'white';
      defaultHeaders.forEach(h => {
        const td = document.createElement('td');
        td.textContent = row[h.id] || '';
        td.style.cssText = 'padding:8px;border:1px solid #ddd';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tempDiv.appendChild(table);

    html2canvas(table, { scale: 2, useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = 190;
      const height = (canvas.height * width) / canvas.width;

      pdf.setFontSize(16);
      pdf.text('CPD Entries', 105, 15, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
      pdf.addImage(imgData, 'PNG', 10, 30, width, height);
      pdf.save('cpd_entries.pdf');

      document.body.removeChild(tempDiv);
      document.body.removeChild(loadingDiv);
    }).catch(err => {
      console.error('PDF export error:', err);
      document.body.removeChild(loadingDiv);
    });
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

