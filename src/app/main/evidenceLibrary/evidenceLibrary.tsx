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
  Menu,
  MenuItem,
  Chip,
  Box,
  Tooltip,
  Link as MuiLink,
  useTheme,
  alpha,
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
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import DescriptionIcon from '@mui/icons-material/Description'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DownloadIcon from '@mui/icons-material/Download'
import ArchiveIcon from '@mui/icons-material/Archive'
import { useSelector } from 'react-redux'

import ReactUploadFile from 'src/app/component/react-upload-files'
import EvidenceUploadWithCreation from 'src/app/component/react-upload-files/EvidenceUploadWithCreation'
import { fuzzyFilter } from 'src/utils/string'
import TablePaginationComponent from 'src/app/component/TablePagination'
import ReactTable from 'src/app/component/react-table'
import {
  useDeleteEvidenceMutation,
  useGetEvidenceListQuery,
} from 'app/store/api/evidence-api'
import { selectUser } from 'app/store/userSlice'
import FuseLoading from '@fuse/core/FuseLoading'
import { Link, useNavigate } from 'react-router-dom'
import DataNotFound from 'src/app/component/Pages/dataNotFound'
import {
  DangerButton,
  LoadingButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
import AlertDialog from 'src/app/component/Dialogs/AlertDialog'
import { useDispatch } from 'react-redux'
import { showMessage } from 'app/store/fuse/messageSlice'
import ReuploadEvidenceLibrary from './reupload-evidenceLibrary'

interface EvidenceData {
  assignment_id: number
  file: {
    name: string
    key: string
    url: string
  } | null
  declaration: string | null
  title: string | null
  description: string | null
  trainer_feedback: string | null
  external_feedback: string | null
  learner_comments: string | null
  points_for_improvement: string | null
  assessment_method: string | null
  session: string | null
  grade: string | null
  units: string | null
  status: string
  evidence_time_log: boolean
  created_at: string
  updated_at: string
}

interface Column {
  id:
    | 'title'
    | 'description'
    | 'trainer_feedback'
    | 'learner_comments'
    | 'file'
    | 'status'
    | 'created_at'
    | 'action'
  label: string
  minWidth?: number
  align?: 'right'
  format?: (value: number) => string
}

const columns: readonly Column[] = [
  { id: 'title', label: 'Title', minWidth: 200 },
  { id: 'description', label: 'Description', minWidth: 250 },
  { id: 'status', label: 'Status', minWidth: 120 },
  { id: 'file', label: 'Files', minWidth: 100 },
  { id: 'trainer_feedback', label: 'Trainer Feedback', minWidth: 200 },
  { id: 'learner_comments', label: 'Learner Comments', minWidth: 200 },
  { id: 'created_at', label: 'Created Date', minWidth: 150 },
  { id: 'action', label: 'Actions', minWidth: 100 },
]

const columnHelper = createColumnHelper<EvidenceData>()

const EvidenceLibrary: FC = () => {
  const theme = useTheme()
  const [isOpenFileUpload, setIsOpenFileUpload] = useState<boolean>(false)
  const [isOpenReupload, setIsOpenReupload] = useState<boolean>(false)
  const [isOpenDeleteBox, setIsOpenDeleteBox] = useState<boolean>(false)
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [evidenceData, setEvidenceData] = useState<EvidenceData[]>([])
  const [selectedRow, setSelectedRow] = useState<EvidenceData | null>(null)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const isOpenAction = Boolean(anchorEl)

  const user = sessionStorage.getItem('learnerToken')
    ? { data: JSON.parse(sessionStorage.getItem('learnerToken'))?.user }
    : useSelector(selectUser)

  const { data, isLoading, isError, error, refetch } = useGetEvidenceListQuery(
    {
      user_id: user.data.user_id,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  )

  const [deleteEvidence, { isLoading: isDeleteLoading }] =
    useDeleteEvidenceMutation()

  useEffect(() => {
    const existingErrorId = 'existingErrorId'

    if (isError && error) {
      console.error('Error', error)

      return
    }

    if (data) {
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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const openMenu = (e: React.MouseEvent<HTMLElement>, evidence: EvidenceData) => {
    handleClick(e)
    setSelectedRow(evidence)
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not started':
        return 'default'
      case 'in progress':
        return 'warning'
      case 'completed':
        return 'success'
      case 'submitted':
        return 'info'
      default:
        return 'default'
    }
  }

  // Helper function to display value or dash
  const displayValue = (value: string | null | undefined) => {
    if (value === null || value === undefined || value === 'null' || value === '' || value.trim() === '') {
      return '-'
    }
    return value
  }

  // Helper function to truncate text
  const truncateText = (text: string | null, maxLength: number = 50) => {
    if (!text || text === 'null' || text.trim() === '') return '-'
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  // Helper function to get signed URL from backend
  const getSignedUrl = async (fileKey: string): Promise<string> => {
    try {
      const response = await fetch(`/api/signed-url?fileKey=${encodeURIComponent(fileKey)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.signedUrl
    } catch (error) {
      console.error('Error getting signed URL:', error)
      throw error
    }
  }

  // Helper function to download file with CORS handling
  const downloadFile = async (url: string, filename: string): Promise<Blob> => {
    try {
      // Method 1: Try direct fetch first (for files with proper CORS headers)
      try {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit'
        })
        if (response.ok) {
          return await response.blob()
        }
      } catch (corsError) {
        console.warn('Direct fetch failed due to CORS, trying alternative methods:', corsError)
      }

      // Method 2: Use a proxy endpoint (recommended)
      // You'll need to create a backend endpoint that proxies the S3 request
      const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to download file via proxy: ${response.statusText}`)
      }
      
      return await response.blob()
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  }

  // Alternative method: Download file by opening in new tab (for direct S3 URLs)
  const downloadFileDirect = (url: string, filename: string) => {
    try {
      // Create a temporary link element
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      
      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading file directly:', error)
      // Fallback: open in new tab
      window.open(url, '_blank')
    }
  }

  // Helper function to create ZIP file
  const createZipFile = async (files: { name: string; blob: Blob }[]): Promise<Blob> => {
    // Using JSZip library - you'll need to install it: npm install jszip
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    files.forEach((file, index) => {
      const fileName = file.name || `evidence_${index + 1}.pdf`
      zip.file(fileName, file.blob)
    })

    return await zip.generateAsync({ type: 'blob' })
  }

  // Download all evidence files as ZIP
  const handleDownloadAll = async () => {
    if (!evidenceData || evidenceData.length === 0) {
      dispatch(
        showMessage({
          message: 'No evidence files to download',
          variant: 'warning',
        })
      )
      return
    }

    setIsDownloading(true)
    
    try {
      // Filter evidence with files
      const evidenceWithFiles = evidenceData.filter(evidence => evidence.file)
      
      if (evidenceWithFiles.length === 0) {
        dispatch(
          showMessage({
            message: 'No files found to download',
            variant: 'warning',
          })
        )
        return
      }

      // Download all files with error handling
      const downloadPromises = evidenceWithFiles.map(async (evidence) => {
        const fileName = evidence.file?.name || `evidence_${evidence.assignment_id}.pdf`
        try {
          const blob = await downloadFile(evidence.file!.url, fileName)
          return {
            name: fileName,
            blob: blob,
            success: true
          }
        } catch (error) {
          console.warn(`Failed to download ${fileName}, will try direct download:`, error)
          // Fallback to direct download
          downloadFileDirect(evidence.file!.url, fileName)
          return {
            name: fileName,
            blob: null,
            success: false,
            url: evidence.file!.url
          }
        }
      })

      const results = await Promise.all(downloadPromises)
      
      // Filter successful downloads for ZIP creation
      const successfulFiles = results.filter(result => result.success && result.blob)
      const failedFiles = results.filter(result => !result.success)
      
      // Show warning for failed downloads
      if (failedFiles.length > 0) {
        dispatch(
          showMessage({
            message: `${failedFiles.length} files opened in new tabs due to CORS restrictions`,
            variant: 'warning',
          })
        )
      }
      
      // Only create ZIP if we have successful downloads
      if (successfulFiles.length === 0) {
        dispatch(
          showMessage({
            message: 'All files opened in new tabs. ZIP download not available due to CORS restrictions.',
            variant: 'info',
          })
        )
        return
      }
      
      const files = successfulFiles.map(result => ({
        name: result.name,
        blob: result.blob!
      }))
      
      // Create ZIP file
      const zipBlob = await createZipFile(files)
      
      // Download ZIP file
      const url = window.URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `evidence_library_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      dispatch(
        showMessage({
          message: `Successfully downloaded ${files.length} evidence files`,
          variant: 'success',
        })
      )
    } catch (error) {
      console.error('Error downloading files:', error)
      dispatch(
        showMessage({
          message: 'Failed to download evidence files. Please try again.',
          variant: 'error',
        })
      )
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle single file download
  const handleSingleFileDownload = async (evidence: any) => {
    if (!evidence.file?.url) {
      dispatch(
        showMessage({
          message: 'No file available for download',
          variant: 'warning',
        })
      )
      return
    }

    const fileName = evidence.file.name || `evidence_${evidence.assignment_id}.pdf`
    
    try {
      // Try to download via proxy first
      const blob = await downloadFile(evidence.file.url, fileName)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      dispatch(
        showMessage({
          message: `Successfully downloaded ${fileName}`,
          variant: 'success',
        })
      )
    } catch (error) {
      console.warn('Proxy download failed, trying direct download:', error)
      // Fallback to direct download
      downloadFileDirect(evidence.file.url, fileName)
      
      dispatch(
        showMessage({
          message: `File opened in new tab due to CORS restrictions`,
          variant: 'info',
        })
      )
    }
  }

  const handleClose = () => {
    setIsOpenFileUpload(false)
    setAnchorEl(null)
  }

  const handleReuploadClose = () => {
    setIsOpenReupload(false)
  }

  const handleNavigate = () => {
    if (selectedRow) {
      navigate(`/evidenceLibrary/${selectedRow.assignment_id}`, {
        state: {
          isEdit: true,
        },
      })
    }
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

  const handleDelete = async () => {
    if (!selectedRow) return
    
    try {
      await deleteEvidence({ id: selectedRow.assignment_id }).unwrap()
      setIsOpenDeleteBox(false)
      refetch()
      dispatch(
        showMessage({
          message: 'Evidence deleted successfully',
          variant: 'success',
        })
      )
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Failed to delete evidence. Please try again.',
          variant: 'error',
        })
      )
    }
  }

  return (
    <Container sx={{ mt: 8, pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography 
          variant='h4' 
          component='h1' 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 0
          }}
        >
          Evidence Library
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant='outlined'
            color='secondary'
            size='large'
            onClick={handleDownloadAll}
            disabled={isDownloading || !evidenceData || evidenceData.length === 0}
            startIcon={isDownloading ? <ArchiveIcon /> : <DownloadIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                backgroundColor: alpha(theme.palette.secondary.main, 0.04),
              },
              '&:disabled': {
                borderColor: alpha(theme.palette.action.disabled, 0.3),
                color: alpha(theme.palette.action.disabled, 0.5),
              }
            }}
          >
            {isDownloading ? 'Downloading...' : 'Download All'}
          </Button>
          <Button
            variant='contained'
            color='primary'
            size='large'
            onClick={() => setIsOpenFileUpload(true)}
            startIcon={<CloudUploadIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4],
              }
            }}
          >
            Add Evidence
          </Button>
        </Box>
      </Box>

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
      <Card 
        sx={{ 
          boxShadow: theme.shadows[1],
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <TableContainer 
          sx={{ 
            maxHeight: 600,
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: alpha(theme.palette.grey[300], 0.1),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.grey[400], 0.5),
              borderRadius: '4px',
              '&:hover': {
                background: alpha(theme.palette.grey[400], 0.7),
              },
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <FuseLoading />
            </Box>
          ) : evidenceData?.length > 0 ? (
            <Table
              stickyHeader
              sx={{ 
                minWidth: 1200,
                '& .MuiTableCell-head': {
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
                '& .MuiTableCell-body': {
                  backgroundColor: 'transparent',
                }
              }}
              size='medium'
              aria-label='evidence library table'
            >
              <TableHead>
                <TableRow 
                  sx={{ 
                    backgroundColor: alpha(theme.palette.primary.light, 1),
                    position: 'sticky',
                    top: 0,
                    zIndex: 2
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      sx={{
                        minWidth: column.minWidth,
                        width: column.minWidth,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        py: 2,
                        position: 'sticky',
                        top: 0,
                        zIndex: 2
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {evidenceData.map((row, index) => (
                  <TableRow 
                    key={row.assignment_id || index}
                    hover 
                    sx={{ 
                      '&:nth-of-type(odd)': {
                        backgroundColor: alpha(theme.palette.action.hover, 0.02),
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }
                    }}
                  >
                    {columns.map((column) => {
                      const value = row[column.id as keyof EvidenceData]
                      return (
                        <TableCell 
                          key={column.id} 
                          align={column.align}
                          sx={{ 
                            py: 2,
                            minWidth: column.minWidth,
                            width: column.minWidth,
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            backgroundColor: 'transparent'
                          }}
                        >
                          {column.id === 'action' ? (
                            <Tooltip title="More actions">
                              <IconButton
                                size='small'
                                onClick={(e) => openMenu(e, row)}
                                sx={{ 
                                  color: theme.palette.text.secondary,
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main
                                  }
                                }}
                              >
                                <MoreHorizIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          ) : column.id === 'file' ? (
                            row.file ? (
                              <Tooltip title={row.file.name}>
                                <MuiLink
                                  href={row.file.url}
                                  target='_blank'
                                  rel='noopener'
                                  sx={{ textDecoration: 'none' }}
                                >
                                  <Avatar
                                    sx={{
                                      backgroundColor: theme.palette.primary.main,
                                      width: 40,
                                      height: 40,
                                      '&:hover': {
                                        backgroundColor: theme.palette.primary.dark,
                                        transform: 'scale(1.05)',
                                        transition: 'all 0.2s ease-in-out'
                                      }
                                    }}
                                  >
                                    <DescriptionIcon sx={{ color: 'white' }} />
                                  </Avatar>
                                </MuiLink>
                              </Tooltip>
                            ) : (
                              <Typography variant='body2' color='text.secondary'>
                                -
                              </Typography>
                            )
                          ) : column.id === 'status' ? (
                            <Chip
                              label={String(value || 'Unknown')}
                              color={getStatusColor(String(value || ''))}
                              size='small'
                              variant='outlined'
                              sx={{ fontWeight: 500 }}
                            />
                          ) : column.id === 'created_at' ? (
                            <Typography variant='body2' color='text.secondary'>
                              {value ? formatDate(String(value)) : '-'}
                            </Typography>
                          ) : column.id === 'title' || column.id === 'description' ? (
                            <Tooltip title={String(value || '')}>
                              <Typography 
                                variant='body2' 
                                sx={{ 
                                  maxWidth: 200,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {truncateText(String(value), 30)}
                              </Typography>
                            </Tooltip>
                          ) : (
                            <Typography variant='body2' color='text.secondary'>
                              {displayValue(String(value))}
                            </Typography>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 4
              }}
            >
              <DataNotFound width='25%' />
              <Typography variant='h5' sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
                No Evidence Found
              </Typography>
              <Typography 
                variant='body2' 
                color='text.secondary'
                sx={{ textAlign: 'center', maxWidth: 400 }}
              >
                You haven't uploaded any evidence yet. Click "Add Evidence" to get started with your portfolio.
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Card>
      <Menu
        id='evidence-actions-menu'
        anchorEl={anchorEl}
        open={isOpenAction}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[8],
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            minWidth: 160
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            handleClose()
            setIsOpenReupload(true)
          }}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08)
            }
          }}
        >
          <CloudUploadIcon sx={{ mr: 1.5, fontSize: 20 }} />
          Reupload
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose()
            handleNavigate()
          }}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: alpha(theme.palette.info.main, 0.08)
            }
          }}
        >
          <VisibilityIcon sx={{ mr: 1.5, fontSize: 20 }} />
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose()
            setIsOpenDeleteBox(true)
          }}
          sx={{
            py: 1.5,
            px: 2,
            color: theme.palette.error.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.08)
            }
          }}
        >
          <DeleteIcon sx={{ mr: 1.5, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>
      <AlertDialog
        open={Boolean(isOpenDeleteBox)}
        close={() => setIsOpenDeleteBox(false)}
        title='Delete Evidence?'
        content='Deleting this evidence will also remove all associated data and relationships. Proceed with deletion?'
        actionButton={
          isDeleteLoading ? (
            <LoadingButton />
          ) : (
            <DangerButton onClick={handleDelete} name='Delete Evidence' />
          )
        }
        cancelButton={
          <SecondaryButtonOutlined
            className='px-24'
            onClick={() => setIsOpenDeleteBox(false)}
            name='Cancel'
          />
        }
      />
      <Dialog
        open={isOpenFileUpload}
        onClose={() => setIsOpenFileUpload(false)}
        maxWidth="xl"
        fullWidth
        sx={{
          '.MuiDialog-paper': {
            borderRadius: 3,
            padding: 0,
            height: '90vh',
            maxHeight: '90vh',
            boxShadow: theme.shadows[24],
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          },
        }}
      >
        <EvidenceUploadWithCreation handleClose={handleClose} />
      </Dialog>
      <Dialog
        open={isOpenReupload}
        onClose={() => setIsOpenReupload(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '.MuiDialog-paper': {
            borderRadius: 3,
            padding: 0,
            boxShadow: theme.shadows[24],
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          },
        }}
      >
        <ReuploadEvidenceLibrary
          handleClose={handleReuploadClose}
          id={selectedRow?.assignment_id}
        />
      </Dialog>
    </Container>
  )
}

export default EvidenceLibrary
