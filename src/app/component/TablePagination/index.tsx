// MUI Imports
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'

const TablePaginationComponent = ({ table, count }) => {
  const { pageIndex, pageSize } = table.getState().pagination
  const filteredRowsLength = table.getFilteredRowModel().rows.length

  // Calculate the 'from' value (the first entry index on the current page)
  const from = filteredRowsLength === 0 ? 0 : pageIndex * pageSize + 1

  // Calculate the 'to' value (the last entry index on the current page)
  const to = !count ? 0 : count === 1 ? 1 : Math.min((pageIndex + 1) * pageSize, filteredRowsLength) + from - 1

  return (
    <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
      <Typography
        color='text.disabled'
        className='font-roboto'
      >{`Showing ${from} to ${to} of ${count ? count : 0} entries`}</Typography>
      <Pagination
        shape='rounded'
        color='primary'
        variant='outlined'
        count={Math.ceil(count / pageSize)}
        page={pageIndex + 1}
        onChange={(_, page) => {
          table.setPageIndex(page - 1)
        }}
        showFirstButton
        showLastButton
      />
    </div>
  )
}

export default TablePaginationComponent
