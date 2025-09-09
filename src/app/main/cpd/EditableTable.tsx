import { useState, useEffect, useRef } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Menu, MenuItem, Box, useTheme, Card, CardContent, 
  Typography, Chip, Fade, Skeleton, Tooltip, IconButton
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
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

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
      {/* Action Bar */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2,
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            {/* Title and Stats */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssessmentIcon sx={{ 
                fontSize: 28, 
                color: theme.palette.primary.main,
                opacity: 0.8
              }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Learning Activities
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={`${tableData.filter(row => defaultHeaders.some(h => row[h.id]?.trim())).length} Entries`}
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.success.light,
                      color: theme.palette.success.contrastText,
                      fontWeight: 600
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Export Button */}
            <Tooltip title="Export your CPD data">
              <SecondaryButton
                name="Export Data"
                className="py-8 px-24"
                startIcon={<FileDownloadIcon sx={{ fontSize: '18px' }} />}
                onClick={handleExportClick}
                sx={{ 
                  backgroundColor: theme.palette.primary.main, 
                  color: theme.palette.primary.contrastText, 
                  fontSize: "0.95rem", 
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    backgroundColor: theme.palette.primary.dark,
                    transform: 'translateY(-1px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              />
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Export Menu */}
      <Menu 
        anchorEl={anchorEl} 
        open={exportMenuOpen} 
        onClose={handleExportClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            mt: 1,
            minWidth: 200,
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <MenuItem 
          onClick={exportToCSV}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: theme.palette.primary.light + '20'
            }
          }}
        >
          <TableChartIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: '20px' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Export as CSV
          </Typography>
        </MenuItem>
        <MenuItem 
          onClick={exportToPDF}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: theme.palette.primary.light + '20'
            }
          }}
        >
          <PictureAsPdfIcon sx={{ mr: 2, color: theme.palette.error.main, fontSize: '20px' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Export as PDF
          </Typography>
        </MenuItem>
      </Menu>

      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2,
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[4]
          }
        }}
      >
        {loading ? (
          <CardContent sx={{ p: 3 }}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
          </CardContent>
        ) : (
          <TableContainer
            ref={tableRef}
            sx={{
              maxHeight: 'calc(100vh - 400px)',
              minHeight: '200px',
              overflowY: 'auto',
              overflowX: 'hidden',
              width: '100%',
              '&::-webkit-scrollbar': {
                width: '10px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: theme.palette.mode === 'light'
                  ? theme.palette.grey[100]
                  : theme.palette.background.default,
                borderRadius: '5px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.mode === 'light'
                  ? theme.palette.grey[400]
                  : theme.palette.grey[600],
                borderRadius: '5px',
                border: `2px solid ${theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.background.default}`,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light'
                    ? theme.palette.grey[500]
                    : theme.palette.grey[500],
                }
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
              <TableHead>
                <TableRow>
                  {defaultHeaders.map((header) => (
                    <TableCell
                      key={header.id}
                      sx={{
                        background: theme.palette.mode === 'light'
                          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                          : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                        fontWeight: 600,
                        padding: '16px 12px',
                        fontSize: '14px',
                        borderRight: `1px solid ${theme.palette.primary.contrastText}20`,
                        color: theme.palette.primary.contrastText,
                        lineHeight: '1.4',
                        '&:last-child': { borderRight: 'none' },
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        boxShadow: `0 4px 8px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.3)'}`,
                        textAlign: 'left',
                        verticalAlign: 'top'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {header.label}
                      </Typography>
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      background: theme.palette.mode === 'light'
                        ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                        : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      fontWeight: 600,
                      padding: '16px 12px',
                      fontSize: '14px',
                      color: theme.palette.primary.contrastText,
                      textAlign: 'center',
                      position: 'sticky',
                      top: 0,
                      zIndex: 10,
                      boxShadow: `0 4px 8px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.3)'}`,
                      verticalAlign: 'top'
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Actions
                    </Typography>
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
      </Card>

      {/* Add Row Button */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Tooltip title="Add a new learning activity">
              <SecondaryButton
                name="Add New Activity"
                className="py-8 px-24"
                startIcon={<AddIcon sx={{ fontSize: '18px' }} />}
                onClick={handleAddNewRow}
                sx={{
                  backgroundColor: theme.palette.success.main,
                  color: theme.palette.success.contrastText,
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.success.dark,
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[6]
                  }
                }}
              />
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

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

