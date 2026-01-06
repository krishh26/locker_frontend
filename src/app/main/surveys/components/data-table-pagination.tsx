import React from 'react';
import { Box, Button, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Table } from '@tanstack/react-table';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  showSelectedRows?: boolean;
}

export function DataTablePagination<TData>({
  table,
  showSelectedRows = false,
}: DataTablePaginationProps<TData>) {
  const page = table.getState().pagination.pageIndex + 1;
  const pages = table.getPageCount();
  const currentPageSize = table.getState().pagination.pageSize;

  const handlePageSizeChange = (value: number) => {
    table.setPageSize(value);
  };

  const canPrevious = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

  if (pages <= 1) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        py: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">Show</Typography>
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={currentPageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {showSelectedRows && (
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2">
          Page <strong>{page}</strong> of <strong>{pages}</strong>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => table.previousPage()}
            disabled={!canPrevious}
            startIcon={<ChevronLeft size={16} />}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Previous
            </Box>
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => table.nextPage()}
            disabled={!canNext}
            endIcon={<ChevronRight size={16} />}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Next
            </Box>
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

