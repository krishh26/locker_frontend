import React from 'react';
import { type Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
} from '@mui/material';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  manualPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showSelectedRows?: boolean;
}

function DataTablePagination<TData>({
  table,
  manualPagination = false,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showSelectedRows = false,
}: DataTablePaginationProps<TData>) {
  const page = manualPagination
    ? currentPage ?? 1
    : table.getState().pagination.pageIndex + 1;
  const pages = manualPagination ? totalPages ?? 0 : table.getPageCount();
  const items = manualPagination
    ? totalItems ?? 0
    : table.getFilteredRowModel().rows.length;
  const currentPageSize = manualPagination
    ? pageSize ?? 10
    : table.getState().pagination.pageSize;

  const handlePrevious = () => {
    if (manualPagination && onPageChange) {
      onPageChange(Math.max(1, page - 1));
    } else {
      table.previousPage();
    }
  };

  const handleNext = () => {
    if (manualPagination && onPageChange) {
      onPageChange(Math.min(pages, page + 1));
    } else {
      table.nextPage();
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newPageSize = Number(event.target.value);
    if (manualPagination && onPageSizeChange) {
      onPageSizeChange(newPageSize);
    } else {
      table.setPageSize(newPageSize);
    }
  };

  const canPrevious = manualPagination ? page > 1 : table.getCanPreviousPage();
  const canNext = manualPagination ? page < pages : table.getCanNextPage();

  if (manualPagination) {
    if (totalPages === undefined || totalPages === null) {
      if (totalItems === 0 || totalItems === undefined) {
        return null;
      }
    }
    if (totalPages === 0) {
      return null;
    }
  } else {
    if (pages <= 1) {
      return null;
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        py: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">Show</Typography>
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select value={currentPageSize} onChange={handlePageSizeChange as any}>
            {[10, 20, 30, 40, 50].map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {showSelectedRows && !manualPagination && (
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </Typography>
      )}

      {manualPagination && (
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          Showing {(page - 1) * currentPageSize + 1} to{' '}
          {Math.min(page * currentPageSize, items)} of {items} item(s).
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Page</Typography>
          <Typography variant="body2" fontWeight="bold">
            {page} of {pages}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={handlePrevious} disabled={!canPrevious}>
            <ChevronLeft size={20} />
          </IconButton>
          <IconButton size="small" onClick={handleNext} disabled={!canNext}>
            <ChevronRight size={20} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default DataTablePagination;
