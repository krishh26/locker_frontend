import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  Download,
  Search,
  FileText,
  FileDown,
  ExternalLink,
  MoreVertical,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllSurveys, deleteSurvey, type Survey } from 'app/store/surveySlice';
import SurveyForm from './survey-form';
import DataTablePagination from './data-table-pagination';

type SurveyWithStats = Survey & {
  totalQuestions: number;
  totalResponses: number;
};

const SurveysDataTable = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const surveys = useSelector(selectAllSurveys);
  const allQuestions = useSelector((state: any) => state.survey?.questions || {});
  const allResponses = useSelector((state: any) => state.response?.responses || {});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [columnVisibilityAnchor, setColumnVisibilityAnchor] = useState<null | HTMLElement>(null);
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Calculate stats for each survey
  const surveysWithStats: SurveyWithStats[] = useMemo(() => {
    return surveys.map((survey) => {
      const questions = allQuestions[survey.id] || [];
      const responses = allResponses[survey.id] || [];
      return {
        ...survey,
        totalQuestions: questions.length,
        totalResponses: responses.length,
      };
    });
  }, [surveys, allQuestions, allResponses]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'Published':
        return 'success';
      case 'Draft':
        return 'warning';
      case 'Archived':
        return 'default';
      default:
        return 'default';
    }
  }, []);

  const exactFilter = useCallback(
    (row: Row<SurveyWithStats>, columnId: string, value: string) => {
      return row.getValue(columnId) === value;
    },
    []
  );

  const handleDelete = useCallback((id: string) => {
    setSurveyToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (surveyToDelete) {
      dispatch(deleteSurvey(surveyToDelete) as any);
      setDeleteDialogOpen(false);
      setSurveyToDelete(null);
    }
  }, [surveyToDelete, dispatch]);

  const handleEdit = useCallback((survey: Survey) => {
    setEditingSurvey(survey);
    setFormOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingSurvey(null);
    setFormOpen(true);
  }, []);

  const handleView = useCallback(
    (surveyId: string) => {
      navigate(`/surveys/${surveyId}/builder`);
    },
    [navigate]
  );

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, surveyId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedSurveyId(surveyId);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedSurveyId(null);
  }, []);

  const columns: ColumnDef<SurveyWithStats>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() ? true : false)
            }
            indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
            inputProps={{ 'aria-label': 'select all surveys' }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(e.target.checked)}
            inputProps={{ 'aria-label': 'select row' }}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const survey = row.original;
          return (
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {survey.name}
              </Typography>
              {survey.description && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {survey.description}
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return <Chip label={status} color={getStatusColor(status) as any} size="small" />;
        },
        filterFn: exactFilter,
      },
      {
        accessorKey: 'totalQuestions',
        header: 'Questions',
        cell: ({ row }) => {
          const count = row.getValue('totalQuestions') as number;
          return <Typography variant="body2">{count}</Typography>;
        },
      },
      {
        accessorKey: 'totalResponses',
        header: 'Responses',
        cell: ({ row }) => {
          const count = row.getValue('totalResponses') as number;
          return <Typography variant="body2">{count}</Typography>;
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => {
          const date = row.getValue('createdAt') as string;
          return (
            <Typography variant="body2" fontSize="0.875rem">
              {format(new Date(date), 'MMM d, yyyy')}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => {
          const date = row.getValue('updatedAt') as string;
          return (
            <Typography variant="body2" fontSize="0.875rem">
              {format(new Date(date), 'MMM d, yyyy')}
            </Typography>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const survey = row.original;
          return (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={() => handleView(survey.id)}>
                <Eye size={16} />
              </IconButton>
              <IconButton size="small" onClick={() => handleEdit(survey)}>
                <Pencil size={16} />
              </IconButton>
              <IconButton size="small" onClick={(e) => handleMenuOpen(e, survey.id)}>
                <MoreVertical size={16} />
              </IconButton>
            </Box>
          );
        },
      },
    ],
    [getStatusColor, handleView, handleEdit, handleDelete, exactFilter, handleMenuOpen]
  );

  const table = useReactTable({
    data: surveysWithStats,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const statusFilter = (table.getColumn('status')?.getFilterValue() as string) || '';

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Search and Actions Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <TextField
            placeholder="Search surveys..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(String(e.target.value))}
            size="small"
            sx={{ maxWidth: { xs: '100%', sm: 400 }, flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Download size={18} />}
              onClick={(e) => setExportAnchor(e.currentTarget)}
            >
              Export
            </Button>
            <SurveyForm open={formOpen} onOpenChange={setFormOpen} survey={editingSurvey} />
            <Button variant="contained" onClick={handleAdd}>
              Create Survey
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) =>
                table.getColumn('status')?.setFilterValue(e.target.value === 'all' ? '' : e.target.value)
              }
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Published">Published</MenuItem>
              <MenuItem value="Archived">Archived</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            endIcon={<ChevronDown size={18} />}
            onClick={(e) => setColumnVisibilityAnchor(e.currentTarget)}
          >
            Columns
          </Button>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} selected={row.getIsSelected()}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No surveys found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <DataTablePagination table={table} showSelectedRows={true} />
      </Box>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            if (selectedSurveyId) {
              navigate(`/surveys/${selectedSurveyId}/responses`);
            }
            handleMenuClose();
          }}
        >
          <FileText size={16} style={{ marginRight: 8 }} />
          View Responses
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedSurveyId) {
              window.open(`/forms/survey/${selectedSurveyId}`, '_blank');
            }
            handleMenuClose();
          }}
        >
          <ExternalLink size={16} style={{ marginRight: 8 }} />
          Open Public Form
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <FileDown size={16} style={{ marginRight: 8 }} />
          Export CSV
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <FileDown size={16} style={{ marginRight: 8 }} />
          Export PDF
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            if (selectedSurveyId) {
              handleDelete(selectedSurveyId);
            }
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete Survey
        </MenuItem>
      </Menu>

      {/* Column Visibility Menu */}
      <Menu
        anchorEl={columnVisibilityAnchor}
        open={Boolean(columnVisibilityAnchor)}
        onClose={() => setColumnVisibilityAnchor(null)}
      >
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <MenuItem key={column.id} dense>
              <FormControlLabel
                control={
                  <Switch
                    checked={column.getIsVisible()}
                    onChange={(e) => column.toggleVisibility(e.target.checked)}
                    size="small"
                  />
                }
                label={column.id.charAt(0).toUpperCase() + column.id.slice(1)}
              />
            </MenuItem>
          ))}
      </Menu>

      {/* Export Menu */}
      <Menu
        anchorEl={exportAnchor}
        open={Boolean(exportAnchor)}
        onClose={() => setExportAnchor(null)}
      >
        <MenuItem onClick={() => setExportAnchor(null)}>
          <FileDown size={16} style={{ marginRight: 8 }} />
          Export CSV
        </MenuItem>
        <MenuItem onClick={() => setExportAnchor(null)}>
          <FileDown size={16} style={{ marginRight: 8 }} />
          Export PDF
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. This will permanently delete the survey and all its
            questions and responses.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SurveysDataTable;

