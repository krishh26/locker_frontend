import { FC, useEffect, useMemo, useState } from 'react'
import {
  Typography,
  Paper,
  Container,
  Button,
  Dialog,
  TablePagination,
  Card,
  TableRow,
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  Avatar,
  AvatarGroup,
  IconButton,
} from '@mui/material'
import {
  createColumnHelper,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { useSelector } from 'react-redux'

import ReactUploadFile from 'src/app/component/react-upload-files'
import { fuzzyFilter } from 'src/utils/string'
import TablePaginationComponent from 'src/app/component/TablePagination'
import ReactTable from 'src/app/component/react-table'
import { useGetEvidenceListQuery } from 'app/store/api/evidence-api'
import { selectUser } from 'app/store/userSlice'
import FuseLoading from "@fuse/core/FuseLoading";
import { Link } from 'react-router-dom'
import DataNotFound from 'src/app/component/Pages/dataNotFound';

interface SurveyData {
  survey_number: string
  // add other fields here
}

interface Column {
  id:
  | "title"
  | "description"
  | "trainer_feedback"
  | "learner_comments"
  | "file"
  | "action"
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: "title", label: "Title", minWidth: 10 },
  { id: "description", label: "Description", minWidth: 10 },
  { id: "trainer_feedback", label: "Trainer Feedback", minWidth: 10 },
  { id: "learner_comments", label: "Learner Comments", minWidth: 10 },
  { id: "file", label: "Files", minWidth: 10 },
  { id: "action", label: "Action", minWidth: 10 },
];

const columnHelper = createColumnHelper<SurveyData>()

const EvidenceLibrary: FC = () => {
  const [isOpenFileUpload, setIsOpenFileUpload] = useState<boolean>(false)
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [evidenceData,setEvidenceData]  = useState([])

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const user = sessionStorage.getItem('learnerToken')
    ? { data: JSON.parse(sessionStorage.getItem('learnerToken'))?.user }
    : useSelector(selectUser)

  const { data, isLoading, isError, error } = useGetEvidenceListQuery(
    {
      user_id: user.data.user_id,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  )

  useEffect(() => {
    const existingErrorId = 'existingErrorId'

    if (isError && error) {
      console.error('Error', error)

      return
    }

    if(data){
      setEvidenceData(data.data)
    }

  }, [data, isError, error, isLoading])

  // const columns = useMemo(
  //   () => [
  //     columnHelper.accessor('survey_number', {
  //       header: 'Survey Number',
  //       cell: ({ row }) => (
  //         <div className='flex items-center gap-2'>
  //           <Typography className='capitalize font-roboto' color='text.primary'>
  //             {row.original.survey_number}
  //           </Typography>
  //         </div>
  //       ),
  //     }),
  //     // columnHelper.accessor('participation_rate', {
  //     //   header: 'Participation rate',
  //     //   cell: ({ row }) => (
  //     //     <div className='flex items-center gap-2'>
  //     //       <Typography className='capitalize font-roboto' color='text.primary'>
  //     //         {row.original.participation_rate}
  //     //       </Typography>
  //     //     </div>
  //     //   ),
  //     // }),
  //     // columnHelper.accessor('status', {
  //     //   header: 'Status',
  //     //   cell: ({ row }) => (
  //     //     <Typography className='capitalize font-roboto' color='text.primary'>
  //     //       {row.original.status}
  //     //     </Typography>
  //     //   ),
  //     // }),
  //     // columnHelper.accessor('closing_date', {
  //     //   header: 'Closing date',
  //     //   cell: ({ row }) => (
  //     //     <div className='flex items-center gap-2'>
  //     //       <Typography className='capitalize font-roboto' color='text.primary'>
  //     //         {format(new Date(row.original.closing_date), DATE_FORMAT)}
  //     //       </Typography>
  //     //       <AppReactDatepicker
  //     //         id='basic-input'
  //     //         dateFormat={DATE_FORMAT}
  //     //         placeholderText='Click to select a date'
  //     //         className='font-roboto'
  //     //         customInput={
  //     //           <IconButton
  //     //             aria-label='capture screenshot'
  //     //             color='secondary'
  //     //             size='small'
  //     //           >
  //     //             <i className='tabler-calendar-event' />
  //     //           </IconButton>
  //     //         }
  //     //       />
  //     //     </div>
  //     //   ),
  //     // }),
  //     // columnHelper.accessor('action', {
  //     //   header: 'Actions',
  //     //   cell: () => (
  //     //     <div className='flex items-center gap-2'>
  //     //       <Button
  //     //         variant='contained'
  //     //         color='info'
  //     //         size='small'
  //     //         className='font-roboto'
  //     //       >
  //     //         Distribution
  //     //       </Button>
  //     //       <Button
  //     //         variant='contained'
  //     //         color='primary'
  //     //         size='small'
  //     //         className='font-roboto'
  //     //       >
  //     //         Edit
  //     //       </Button>
  //     //       <Button
  //     //         variant='contained'
  //     //         color='error'
  //     //         size='small'
  //     //         onClick={() => setIsOpenDeleteBox(true)}
  //     //         className='font-roboto'
  //     //       >
  //     //         Delete
  //     //       </Button>
  //     //     </div>
  //     //   ),
  //     //   enableSorting: false,
  //     // }),
  //     // columnHelper.accessor('raffle_status', {
  //     //   header: 'Status',
  //     //   cell: ({ row }) => (
  //     //     <div className='flex items-center gap-3'>
  //     //       <LightTooltip
  //     //         title='Download the list of raffle participants'
  //     //         arrow
  //     //         className='font-roboto'
  //     //       >
  //     //         <IconButton
  //     //           aria-label='capture screenshot'
  //     //           color='secondary'
  //     //           size='small'
  //     //         >
  //     //           <i className='tabler-download text-[22px] text-textSecondary' />
  //     //         </IconButton>
  //     //       </LightTooltip>
  //     //     </div>
  //     //   ),
  //     // }),
  //   ],
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   []
  // )

  // const table = useReactTable({
  //   data: [],
  //   columns,
  //   manualPagination: true,
  //   manualFiltering: true,
  //   pageCount: data?.data?.totalPages || -1,
  //   filterFns: {
  //     fuzzy: fuzzyFilter,
  //   },
  //   state: {
  //     rowSelection,
  //     globalFilter,
  //     pagination,
  //   },
  //   initialState: {
  //     pagination: {
  //       pageSize: 10,
  //     },
  //   },
  //   enableRowSelection: true, //enable row selection for all rows
  //   // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
  //   globalFilterFn: fuzzyFilter,
  //   onPaginationChange: setPagination,
  //   onRowSelectionChange: setRowSelection,
  //   getCoreRowModel: getCoreRowModel(),
  //   onGlobalFilterChange: setGlobalFilter,
  //   getFilteredRowModel: getFilteredRowModel(),
  //   getSortedRowModel: getSortedRowModel(),
  //   getPaginationRowModel: getPaginationRowModel(),
  //   getFacetedRowModel: getFacetedRowModel(),
  //   getFacetedUniqueValues: getFacetedUniqueValues(),
  //   getFacetedMinMaxValues: getFacetedMinMaxValues(),
  // })

  const handleClose = () => {
    setIsOpenFileUpload(false)
  }

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, pageIndex: newPage }))
  }

  const handlePageSizeChange = (event) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: Number(event.target.value),
      pageIndex: 0,
    }))
  }

  return (
    <Container sx={{ mt: 8 }}>
      <div className='flex items-center justify-between mb-4'>
        <Typography variant='h4' component='h1' gutterBottom>
          Evidence Library
        </Typography>
        <Button
          variant='contained'
          className='rounded-md'
          color='primary'
          sx={{ mb: 2 }}
          onClick={() => setIsOpenFileUpload(true)}
          startIcon={<i className='material-icons'>upload</i>}
        >
          Add Evidence
        </Button>
      </div>

      <Dialog
        open={isOpenFileUpload}
        onClose={() => setIsOpenFileUpload(false)}
        sx={{
          '.MuiDialog-paper': {
            borderRadius: '4px',
            padding: '1rem',
          },
        }}
      >
        <ReactUploadFile handleClose={handleClose} />
      </Dialog>
      {/* <Card className='mt-5'>
        <ReactTable table={table} />
      </Card>
      <TablePagination
        component={() => (
          <TablePaginationComponent
            table={table}
            count={data?.data?.total || 0}
          />
        )}
        count={data?.data?.total || 0}
        rowsPerPage={pagination.pageSize}
        page={pagination.pageIndex}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handlePageSizeChange}
      /> */}
      <TableContainer sx={{ maxHeight: 550, paddingBottom: '2rem' }}>
        {isLoading ? (
          <FuseLoading />
        ) : evidenceData?.length > 0 ? (
          <Table
            stickyHeader
            sx={{ minWidth: 650, height: '100%' }}
            size='small'
            aria-label='simple table'
          >
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{
                      minWidth: column.minWidth,
                      backgroundColor: '#F8F8F8',
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {evidenceData.map((row) => (
                <TableRow hover role='checkbox' tabIndex={-1}>
                  {columns.map((column) => {
                    const value = row[column.id]
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format && typeof value === 'number' ? (
                          column.format(value)
                        ) : column.id === 'action' ? (
                          <IconButton
                            size='small'
                            sx={{ color: '#5B718F', marginRight: '4px' }}
                            // onClick={(e) => openMenu(e, row)}
                          >
                            <MoreHorizIcon fontSize='small' />
                          </IconButton>
                        ) : column.id === 'file' ? (
                          <div style={{ display: 'flex' }}>
                            <AvatarGroup
                              max={4}
                              className='items-center'
                              sx={{
                                '.MuiAvatar-root': {
                                  backgroundColor: '#6d81a3',
                                  width: '3.4rem',
                                  height: '3.4rem',
                                  fontSize: 'medium',
                                  border: '1px solid #FFFFFF',
                                },
                              }}
                            >
                              {/* {data?.map((file, index) => ( */}
                              <Link
                                to={value.url}
                                target='_blank'
                                rel='noopener'
                                style={{
                                  border: '0px',
                                  backgroundColor: 'unset',
                                }}
                              >
                                <Avatar>
                                  <FileCopyIcon className='text-white text-xl' />
                                </Avatar>
                              </Link>
                              {/* ))} */}
                            </AvatarGroup>
                          </div>
                        ) : (
                          value
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div>
            <div
              className='flex flex-col justify-center items-center gap-10 '
              style={{ height: '94%' }}
            >
              <DataNotFound width='25%' />
              <Typography variant='h5'>No data found</Typography>
              <Typography variant='body2' className='text-center'>
                It is a long established fact that a reader will be <br />
                distracted by the readable content.
              </Typography>
            </div>
          </div>
        )}
      </TableContainer>
    </Container>
  )
}

export default EvidenceLibrary
