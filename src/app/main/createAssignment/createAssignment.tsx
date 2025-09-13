import React, { useEffect, useState } from "react";
import { DangerButton, LoadingButton, SecondaryButton, SecondaryButtonOutlined } from "src/app/component/Buttons";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import Style from "./style.module.css";
import { useSelector } from "react-redux";
import {
  Avatar,
  AvatarGroup,
  Card,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Container,
  Button,
  Box,
  Tooltip,
  Link as MuiLink,
  useTheme,
  alpha,
  Chip,
} from "@mui/material";
import { useDispatch } from "react-redux";
import FuseLoading from "@fuse/core/FuseLoading";
import { Link, useNavigate } from "react-router-dom";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import ArchiveIcon from '@mui/icons-material/Archive';
import AlertDialog from "src/app/component/Dialogs/AlertDialog";
import UploadedEvidenceFile from "src/app/component/Cards/uploadedEvidenceFile";
import { deleteAssignmentHandler, getAssignmentAPI, selectAssignment, slice } from "app/store/assignment";
import { selectUser } from "app/store/userSlice";
import Uploading from "src/app/component/Cards/uploading";
import UploadWorkDialog from "src/app/component/Cards/uploadWorkDialog";
import { UserRole } from "src/enum";
import { selectGlobalUser } from "app/store/globalUser";
import { showMessage } from "app/store/fuse/messageSlice";


interface AssignmentData {
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
  | "title"
  | "description"
  | "status"
  | "file"
  | "trainer_feedback"
  | "learner_comments"
  | "created_at"
  | "action"
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: "title", label: "Title", minWidth: 200 },
  { id: "description", label: "Description", minWidth: 250 },
  { id: "status", label: "Status", minWidth: 120 },
  { id: "file", label: "Files", minWidth: 100 },
  { id: "trainer_feedback", label: "Trainer Feedback", minWidth: 200 },
  { id: "learner_comments", label: "Learner Comments", minWidth: 200 },
  { id: "created_at", label: "Created Date", minWidth: 150 },
  { id: "action", label: "Actions", minWidth: 100 },
];


const CreateAssignment = (props) => {
  const theme = useTheme()
  const { data, dataFetchLoading, dataUpdatingLoadding, singleData } = useSelector(selectAssignment);

  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;
  const { currentUser } = useSelector(selectGlobalUser);

  const dispatch: any = useDispatch();

  const [deleteId, setDeleteId] = useState("");
  const [open, setOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openFile, setOpenFile] = useState(false);
  const [openMenuDialog, setOpenMenuDialog] = useState<any>({});
  const [edit, setEdit] = useState("Save");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const oopen = Boolean(anchorEl);


  const [formData, setFormData] = useState({
    title: "",
    description: "",
    trainer_feedback: "",
    // uploaded_external_feedback: "",
    learner_comments: "",
    points_of_improvement: "",
    assessment_method: [],
    session: "",
    grade: "",
    declaration: false,
  });

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

  // Helper function to download file
  const downloadFile = async (url: string, filename: string): Promise<Blob> => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`)
      }
      return await response.blob()
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  }

  // Helper function to create ZIP file
  const createZipFile = async (files: { name: string; blob: Blob }[]): Promise<Blob> => {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    files.forEach((file, index) => {
      const fileName = file.name || `assignment_${index + 1}.pdf`
      zip.file(fileName, file.blob)
    })

    return await zip.generateAsync({ type: 'blob' })
  }

  // Download all assignment files as ZIP
  const handleDownloadAll = async () => {
    if (!data || data.length === 0) {
      dispatch(
        showMessage({
          message: 'No assignment files to download',
          variant: 'warning',
        })
      )
      return
    }

    setIsDownloading(true)
    
    try {
      // Filter assignments with files
      const assignmentsWithFiles = data.filter(assignment => assignment.file)
      
      if (assignmentsWithFiles.length === 0) {
        dispatch(
          showMessage({
            message: 'No files found to download',
            variant: 'warning',
          })
        )
        return
      }

      // Download all files
      const downloadPromises = assignmentsWithFiles.map(async (assignment) => {
        const fileName = assignment.file?.name || `assignment_${assignment.assignment_id}.pdf`
        const blob = await downloadFile(assignment.file!.url, fileName)
        return {
          name: fileName,
          blob: blob
        }
      })

      const files = await Promise.all(downloadPromises)
      
      // Create ZIP file
      const zipBlob = await createZipFile(files)
      
      // Download ZIP file
      const url = window.URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `assignments_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      dispatch(
        showMessage({
          message: `Successfully downloaded ${files.length} assignment files`,
          variant: 'success',
        })
      )
    } catch (error) {
      console.error('Error downloading files:', error)
      dispatch(
        showMessage({
          message: 'Failed to download assignment files. Please try again.',
          variant: 'error',
        })
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  useEffect(() => {
    dispatch(getAssignmentAPI(user?.user_id));
  }, [dispatch]);


  const handleOpen = () => {
    setOpen(true);
  };

  const handleOpenFile = () => {
    setOpenFile(true);
  };

  const handleOpenForm = () => {
    setOpenForm(true);
  };

  const handleClose = () => {
    setEdit("save");
    setAnchorEl(null);
    setOpen(false);
    setOpenForm(false);
    setOpenFile(false);
  };

  // const searchByKeywordUser = (e) => {
  //   if (e.key === "Enter") {
  //     searchAPIHandler();
  //   }
  // };

  // const filterHandler = (e, value) => {
  //   setFilterValue(value);
  //   dispatch(fetchUserAPI({ page: 1, page_size: 25 }, searchKeyword, value));
  // };

  // const searchAPIHandler = () => {
  //   dispatch(
  //     fetchUserAPI({ page: 1, page_size: 25 }, searchKeyword, filterValue)
  //   );
  // };

  const deleteIcon = (name) => {
    setDeleteId(name.assignment_id);
  };

  const openMenu = (e, id) => {
    handleClick(e);
    dispatch(slice.setSingleData(id));
    setOpenMenuDialog(id);
  };

  const handleEdit = () => {
    setFormData(singleData);
  };

  const deleteConfromation = async () => {
    await dispatch(deleteAssignmentHandler(deleteId));
    setDeleteId("");
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  let allActivities = data?.flatMap(item => item?.activities ? item.activities : []);
  const paginatedData = allActivities.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.ceil(allActivities?.length / rowsPerPage);

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
          Assignments
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant='outlined'
            color='secondary'
            size='large'
            onClick={handleDownloadAll}
            disabled={isDownloading || !data || data.length === 0}
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
          {(currentUser.role === UserRole.Learner) && (
            <Button
              variant='contained'
              color='primary'
              size='large'
              onClick={handleOpen}
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
              Upload Files
            </Button>
          )}
        </Box>
      </Box>
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
          {dataFetchLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <FuseLoading />
            </Box>
          ) : data?.length ? (
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
              aria-label='assignments table'
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
                        backgroundColor: alpha(theme.palette.primary.light, 1),
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
                {data.map((row, index) => (
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
                      const value = row[column.id as keyof AssignmentData]
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
                No Assignments Found
              </Typography>
              <Typography 
                variant='body2' 
                color='text.secondary'
                sx={{ textAlign: 'center', maxWidth: 400 }}
              >
                You haven't created any assignments yet. Click "Upload Files" to get started.
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Card>
        <AlertDialog
          open={Boolean(deleteId)}
          close={() => deleteIcon("")}
          title="Delete Assignment?"
          content="Deleting this assignment will also remove all associated data and relationships. Proceed with deletion?"
          className="-224 "
          actionButton={
            dataUpdatingLoadding ? (
              <LoadingButton />
            ) : (
              <DangerButton onClick={deleteConfromation} name="Delete Assignment" />
            )
          }
          cancelButton={
            <SecondaryButtonOutlined
              className="px-24"
              onClick={() => deleteIcon("")}
              name="Cancel"
            />
          }
        />
        <Menu
          id='assignment-actions-menu'
          anchorEl={anchorEl}
          open={oopen}
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
              handleClose();
              handleOpenFile();
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
              handleClose();
              handleOpenForm();
              handleEdit();
              setEdit("view")
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
              handleClose();
              handleOpenForm();
              handleEdit();
              setEdit("edit")
            }}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.warning.main, 0.08)
              }
            }}
          >
            <EditIcon sx={{ mr: 1.5, fontSize: 20 }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              deleteIcon(openMenuDialog);
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
        <Dialog
          open={open}
          onClose={handleClose}
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
          <UploadWorkDialog dialogFn={{ handleClose }} />
        </Dialog>
        <Dialog
          open={openFile}
          onClose={handleClose}
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
          <Uploading dialogFn={{ handleClose }} />
        </Dialog>
        <Dialog
          fullScreen
          open={openForm}
          onClose={handleClose}
          sx={{
            '.MuiDialog-paper': {
              borderRadius: 3,
              padding: 0,
              boxShadow: theme.shadows[24],
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            },
          }}
        >
          <UploadedEvidenceFile
            edit={edit}
            setFormData={setFormData}
            formData={formData}
            handleChange={handleChange}
            handleCheckboxChange={handleCheckboxChange}
            dialogFn={{ handleClose }}
          />
        </Dialog>
    </Container>
  );
}

export default CreateAssignment