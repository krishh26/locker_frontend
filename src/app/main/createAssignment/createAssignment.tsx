import FuseLoading from "@fuse/core/FuseLoading";
import ArchiveIcon from '@mui/icons-material/Archive';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";
import { deleteAssignmentHandler, getAssignmentAPI, selectAssignment, slice } from "app/store/assignment";
import { showMessage } from "app/store/fuse/messageSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DangerButton, LoadingButton, SecondaryButtonOutlined } from "src/app/component/Buttons";
import UploadedEvidenceFile from "src/app/component/Cards/uploadedEvidenceFile";
import Uploading from "src/app/component/Cards/uploading";
import UploadWorkDialog from "src/app/component/Cards/uploadWorkDialog";
import AlertDialog from "src/app/component/Dialogs/AlertDialog";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import { useCurrentUser } from "src/app/utils/userHelpers";


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
  course_id: {
    course_id: number
    course_name: string
    course_code: string
  }
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

  const user = useCurrentUser();

  const dispatch: any = useDispatch();

  const [deleteId, setDeleteId] = useState("");
  const [open, setOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openFile, setOpenFile] = useState(false);
  const [openMenuDialog, setOpenMenuDialog] = useState<any>({});
  const [edit, setEdit] = useState("Save");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isOpenCourseSelection, setIsOpenCourseSelection] = useState<boolean>(false);
  const [isOpenFileSelection, setIsOpenFileSelection] = useState<boolean>(false);
  const [selectedCourses, setSelectedCourses] = useState<Set<number>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectAllFiles, setSelectAllFiles] = useState<boolean>(false);

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

  // Helper function to get unique courses from assignment data
  const getUniqueCourses = () => {
    const courseMap = new Map()
    data.forEach(assignment => {
      if (assignment.course_id) {
        courseMap.set(assignment.course_id.course_id, {
          course_id: assignment.course_id.course_id,
          course_name: assignment.course_id.course_name,
          course_code: assignment.course_id.course_code,
          fileCount: 0
        })
      }
    })
    
    // Count files per course
    data.forEach(assignment => {
      if (assignment.course_id && assignment.file) {
        const course = courseMap.get(assignment.course_id.course_id)
        if (course) {
          course.fileCount++
        }
      }
    })
    
    return Array.from(courseMap.values())
  }

  // Helper function to get files from selected courses
  const getFilesFromSelectedCourses = () => {
    return data.filter(assignment => 
      assignment.file && 
      assignment.course_id && 
      selectedCourses.has(assignment.course_id.course_id)
    )
  }

  // Handle course selection
  const handleCourseSelection = (courseId: number) => {
    const newSelectedCourses = new Set(selectedCourses)
    if (newSelectedCourses.has(courseId)) {
      newSelectedCourses.delete(courseId)
    } else {
      newSelectedCourses.add(courseId)
    }
    setSelectedCourses(newSelectedCourses)
  }

  // Handle select all courses
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCourses(new Set())
      setSelectAll(false)
    } else {
      const allCourseIds = getUniqueCourses().map(course => course.course_id)
      setSelectedCourses(new Set(allCourseIds))
      setSelectAll(true)
    }
  }

  // Handle file selection
  const handleFileSelection = (assignmentId: number) => {
    const newSelectedFiles = new Set(selectedFiles)
    if (newSelectedFiles.has(assignmentId)) {
      newSelectedFiles.delete(assignmentId)
    } else {
      newSelectedFiles.add(assignmentId)
    }
    setSelectedFiles(newSelectedFiles)
  }

  // Handle select all files
  const handleSelectAllFiles = () => {
    if (selectAllFiles) {
      setSelectedFiles(new Set())
      setSelectAllFiles(false)
    } else {
      const allFileIds = getFilesFromSelectedCourses().map(file => file.assignment_id)
      setSelectedFiles(new Set(allFileIds))
      setSelectAllFiles(true)
    }
  }

  // Reset course selection when dialog opens
  const handleOpenCourseSelection = () => {
    setSelectedCourses(new Set())
    setSelectAll(false)
    setIsOpenCourseSelection(true)
  }

  // Handle proceeding to file selection
  const handleProceedToFileSelection = () => {
    if (selectedCourses.size === 0) {
      dispatch(
        showMessage({
          message: 'Please select at least one course to proceed',
          variant: 'warning',
        })
      )
      return
    }

    // Get all files from selected courses and select them by default
    const filesFromSelectedCourses = getFilesFromSelectedCourses()
    const allFileIds = filesFromSelectedCourses.map(file => file.assignment_id)
    setSelectedFiles(new Set(allFileIds))
    setSelectAllFiles(true)
    
    setIsOpenCourseSelection(false)
    setIsOpenFileSelection(true)
  }

  // Reset file selection when dialog opens
  const handleOpenFileSelection = () => {
    const filesFromSelectedCourses = getFilesFromSelectedCourses()
    const allFileIds = filesFromSelectedCourses.map(file => file.assignment_id)
    setSelectedFiles(new Set(allFileIds))
    setSelectAllFiles(true)
    setIsOpenFileSelection(true)
  }

  // Helper function to get MIME type from file extension
  const getMimeTypeFromExtension = (extension: string | undefined): string => {
    if (!extension) return 'application/octet-stream'
    
    const mimeTypes: { [key: string]: string } = {
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'rtf': 'application/rtf',
      
      // Spreadsheets
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'csv': 'text/csv',
      
      // Presentations
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'tiff': 'image/tiff',
      
      // Audio
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'm4a': 'audio/mp4',
      
      // Video
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv',
      'webm': 'video/webm',
      
      // Archives
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
      
      // Code
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'xml': 'application/xml',
      
      // Other
      'exe': 'application/x-msdownload',
      'dmg': 'application/x-apple-diskimage',
      'iso': 'application/x-iso9660-image'
    }
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
  }

  // Helper function to sanitize filename
  const sanitizeFileName = (filename: string): string => {
    // Remove or replace problematic characters
    return filename
      .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters with underscore
      .replace(/\s+/g, '_') // Replace spaces with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
      .substring(0, 200) // Limit length to prevent issues
  }

  // Helper function to download file
  // Helper function to download file with CORS handling
  const downloadFile = async (url: string, filename: string): Promise<Blob> => {
    try {
      console.log(`Attempting to download file: ${filename} from URL: ${url}`)
      
      // Method 1: Try direct fetch first (for files with proper CORS headers)
      try {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': '*/*',
          }
        })
        
        if (response.ok) {
          const blob = await response.blob()
          console.log(`Direct fetch successful. Blob type: ${blob.type}, size: ${blob.size}`)
          
          // Validate that we got a proper file blob
          if (blob.size === 0) {
            throw new Error('Downloaded file is empty')
          }
          
          // Detect and set proper MIME type based on file extension
          const extension = filename.split('.').pop()?.toLowerCase()
          let mimeType = blob.type
          
          // If blob type is empty or generic, set based on extension
          if (!mimeType || mimeType === 'application/octet-stream' || mimeType === 'text/html') {
            mimeType = getMimeTypeFromExtension(extension)
          }
          
          const properBlob = new Blob([blob], { type: mimeType })
          return properBlob
        } else {
          console.warn(`Direct fetch failed with status: ${response.status}`)
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
          'Accept': '*/*',
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to download file via proxy: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      console.log(`Proxy download successful. Blob type: ${blob.type}, size: ${blob.size}`)
      
      // Detect and set proper MIME type based on file extension
      const extension = filename.split('.').pop()?.toLowerCase()
      let mimeType = blob.type
      
      // If blob type is empty or generic, set based on extension
      if (!mimeType || mimeType === 'application/octet-stream' || mimeType === 'text/html') {
        mimeType = getMimeTypeFromExtension(extension)
      }
      
      const properBlob = new Blob([blob], { type: mimeType })
      return properBlob
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
      const originalName = file.name || `assignment_${index + 1}.pdf`
      const sanitizedName = sanitizeFileName(originalName)
      const finalName = sanitizedName || `assignment_${index + 1}.pdf`
      
      console.log(`Adding file to ZIP: ${finalName}, Blob type: ${file.blob.type}, size: ${file.blob.size}`)
      
      // Ensure the file has a proper extension
      if (!finalName.includes('.')) {
        const extension = originalName.split('.').pop() || 'pdf'
        const fileNameWithExt = `${finalName}.${extension}`
        
        // Create a new blob with proper MIME type
        const mimeType = getMimeTypeFromExtension(extension)
        const properBlob = new Blob([file.blob], { type: mimeType })
        
        zip.file(fileNameWithExt, properBlob)
      } else {
        // Create a new blob with proper MIME type based on extension
        const extension = finalName.split('.').pop()?.toLowerCase()
        const mimeType = getMimeTypeFromExtension(extension)
        
        const properBlob = new Blob([file.blob], { type: mimeType })
        zip.file(finalName, properBlob)
      }
    })

    return await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6 // Balanced compression
      }
    })
  }

  // Open course selection dialog for download all
  const handleDownloadAll = () => {
    if (!data || data.length === 0) {
      dispatch(
        showMessage({
          message: 'No assignment files to download',
          variant: 'warning',
        })
      )
      return
    }

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

    handleOpenCourseSelection()
  }

  // Download selected files as ZIP
  const handleDownloadSelectedFiles = async () => {
    if (selectedFiles.size === 0) {
      dispatch(
        showMessage({
          message: 'Please select at least one file to download',
          variant: 'warning',
        })
      )
      return
    }

    setIsDownloading(true)
    setIsOpenFileSelection(false)
    
    try {
      // Filter assignments with selected files
      const assignmentsWithFiles = data.filter(assignment => 
        assignment.file && 
        selectedFiles.has(assignment.assignment_id)
      )
      
      if (assignmentsWithFiles.length === 0) {
        dispatch(
          showMessage({
            message: 'No files found for selected files',
            variant: 'warning',
          })
        )
        return
      }

      // Download all files with error handling
      const downloadPromises = assignmentsWithFiles.map(async (assignment) => {
        const fileName = assignment.file?.name || `assignment_${assignment.assignment_id}.pdf`
        try {
          const blob = await downloadFile(assignment.file!.url, fileName)
          
          // Validate the blob
          if (!blob || blob.size === 0) {
            throw new Error('Downloaded file is empty or invalid')
          }
          
          // Check if the file content matches the expected type
          const arrayBuffer = await blob.arrayBuffer()
          const uint8Array = new Uint8Array(arrayBuffer)
          const extension = fileName.split('.').pop()?.toLowerCase()
          
          // Validate file signatures for common types
          let isValidFile = true
          if (extension === 'pdf') {
            // PDF files start with %PDF
            const isPDF = uint8Array.length >= 4 && 
                         uint8Array[0] === 0x25 && // %
                         uint8Array[1] === 0x50 && // P
                         uint8Array[2] === 0x44 && // D
                         uint8Array[3] === 0x46    // F
            if (!isPDF) {
              console.warn(`File ${fileName} appears to not be a valid PDF`)
              isValidFile = false
            }
          } else if (extension === 'jpg' || extension === 'jpeg') {
            // JPEG files start with FF D8
            const isJPEG = uint8Array.length >= 2 && 
                          uint8Array[0] === 0xFF && 
                          uint8Array[1] === 0xD8
            if (!isJPEG) {
              console.warn(`File ${fileName} appears to not be a valid JPEG`)
              isValidFile = false
            }
          } else if (extension === 'png') {
            // PNG files start with 89 50 4E 47
            const isPNG = uint8Array.length >= 4 && 
                         uint8Array[0] === 0x89 && 
                         uint8Array[1] === 0x50 && 
                         uint8Array[2] === 0x4E && 
                         uint8Array[3] === 0x47
            if (!isPNG) {
              console.warn(`File ${fileName} appears to not be a valid PNG`)
              isValidFile = false
            }
          }
          
          if (!isValidFile) {
            console.warn(`File ${fileName} may not be a valid ${extension} file, but will still be included`)
          }
          
          return {
            name: fileName,
            blob: blob,
            success: true
          }
        } catch (error) {
          console.warn(`Failed to download ${fileName}, will try direct download:`, error)
          // Fallback to direct download
          downloadFileDirect(assignment.file!.url, fileName)
          return {
            name: fileName,
            blob: null,
            success: false,
            url: assignment.file!.url
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

      // If we have both successful and failed files, show a warning
      if (failedFiles.length > 0 && successfulFiles.length > 0) {
        dispatch(
          showMessage({
            message: `Downloaded ${successfulFiles.length} files as ZIP. ${failedFiles.length} files opened in new tabs due to CORS restrictions.`,
            variant: 'warning',
          })
        )
      }
      
      const files = successfulFiles.map(result => ({
        name: result.name,
        blob: result.blob!
      }))
      
      // Create ZIP file
      const zipBlob = await createZipFile(files)
      
      // Validate ZIP file
      if (!zipBlob || zipBlob.size === 0) {
        throw new Error('Failed to create ZIP file')
      }
      
      console.log(`Created ZIP file with size: ${zipBlob.size} bytes`)
      console.log(`Files in ZIP: ${files.map(f => f.name).join(', ')}`)
      
      // Test ZIP file by trying to read it
      try {
        const testZip = new (await import('jszip')).default()
        await testZip.loadAsync(zipBlob)
        console.log('ZIP file validation successful')
      } catch (zipError) {
        console.error('ZIP file validation failed:', zipError)
        throw new Error('Created ZIP file is corrupted')
      }
      
      // Download ZIP file
      const url = window.URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      
      // Create a more descriptive filename
      const timestamp = new Date().toISOString().split('T')[0]
      const selectedCourseNames = getUniqueCourses()
        .filter(course => selectedCourses.has(course.course_id))
        .map(course => course.course_name.replace(/\s+/g, '_'))
        .join('_')
      
      const zipFileName = selectedCourseNames 
        ? `Assignment_Files_${selectedCourseNames}_${timestamp}.zip`
        : `Assignment_Library_${timestamp}.zip`
      
      link.download = sanitizeFileName(zipFileName)
      
      // Add some additional attributes for better compatibility
      link.setAttribute('download', sanitizeFileName(zipFileName))
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)

      dispatch(
        showMessage({
          message: `Successfully downloaded ${files.length} selected assignment files`,
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
            {isDownloading ? 'Downloading...' : 'Download Assignment Files'}
          </Button>
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

        {/* Course Selection Dialog */}
        <Dialog
          open={isOpenCourseSelection}
          onClose={() => setIsOpenCourseSelection(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            '.MuiDialog-paper': {
              borderRadius: 3,
              boxShadow: theme.shadows[24],
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              py: 3,
              px: 3,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.02)
            }}
          >
            <SchoolIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Select Courses to Download
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose which courses you want to download assignment files from
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckBoxIcon />}
                    sx={{
                      color: theme.palette.primary.main,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Select All Courses
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Box>

            <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
              {getUniqueCourses().map((course, index) => (
                <ListItem key={course.course_id} disablePadding>
                  <ListItemButton
                    onClick={() => handleCourseSelection(course.course_id)}
                    sx={{
                      py: 2,
                      px: 3,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                      backgroundColor: selectedCourses.has(course.course_id) 
                        ? alpha(theme.palette.primary.main, 0.08) 
                        : 'transparent'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        checked={selectedCourses.has(course.course_id)}
                        icon={<CheckBoxOutlineBlankIcon />}
                        checkedIcon={<CheckBoxIcon />}
                        sx={{
                          color: theme.palette.primary.main,
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          },
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {course.course_name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Code: {course.course_code}
                          </Typography>
                          <Chip
                            label={`${course.fileCount} file${course.fileCount !== 1 ? 's' : ''}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem', height: 20 }}
                          />
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </DialogContent>

          <DialogActions
            sx={{
              p: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: alpha(theme.palette.grey[50], 0.5)
            }}
          >
            <Button
              onClick={() => setIsOpenCourseSelection(false)}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceedToFileSelection}
              variant="contained"
              disabled={selectedCourses.size === 0}
              startIcon={<DownloadIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4],
                },
                '&:disabled': {
                  backgroundColor: alpha(theme.palette.action.disabled, 0.3),
                  color: alpha(theme.palette.action.disabled, 0.5),
                }
              }}
            >
              Next ({selectedCourses.size} course{selectedCourses.size !== 1 ? 's' : ''})
            </Button>
          </DialogActions>
        </Dialog>

        {/* File Selection Dialog */}
        <Dialog
          open={isOpenFileSelection}
          onClose={() => setIsOpenFileSelection(false)}
          maxWidth="md"
          fullWidth
          sx={{
            '.MuiDialog-paper': {
              borderRadius: 3,
              boxShadow: theme.shadows[24],
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              py: 3,
              px: 3,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.02)
            }}
          >
            <DescriptionIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Select Files to Download
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose which files you want to download from the selected courses
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAllFiles}
                    onChange={handleSelectAllFiles}
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckBoxIcon />}
                    sx={{
                      color: theme.palette.primary.main,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Select All Files
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Box>

            <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
              {getFilesFromSelectedCourses().map((assignment, index) => (
                <ListItem key={assignment.assignment_id} disablePadding>
                  <ListItemButton
                    onClick={() => handleFileSelection(assignment.assignment_id)}
                    sx={{
                      py: 2,
                      px: 3,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                      backgroundColor: selectedFiles.has(assignment.assignment_id) 
                        ? alpha(theme.palette.primary.main, 0.08) 
                        : 'transparent'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        checked={selectedFiles.has(assignment.assignment_id)}
                        icon={<CheckBoxOutlineBlankIcon />}
                        checkedIcon={<CheckBoxIcon />}
                        sx={{
                          color: theme.palette.primary.main,
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          },
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {assignment.title || `Assignment ${assignment.assignment_id}`}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {assignment.file?.name || 'No file name'}
                          </Typography>
                          <Chip
                            label={assignment.course_id?.course_name || 'Unknown Course'}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem', height: 20 }}
                          />
                          <Chip
                            label={assignment.status || 'Unknown'}
                            size="small"
                            color={getStatusColor(assignment.status || '')}
                            variant="outlined"
                            sx={{ fontSize: '0.75rem', height: 20 }}
                          />
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </DialogContent>

          <DialogActions
            sx={{
              p: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: alpha(theme.palette.grey[50], 0.5)
            }}
          >
            <Button
              onClick={() => {
                setIsOpenFileSelection(false)
                setIsOpenCourseSelection(true)
              }}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              Back
            </Button>
            <Button
              onClick={() => setIsOpenFileSelection(false)}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownloadSelectedFiles}
              variant="contained"
              disabled={selectedFiles.size === 0 || isDownloading}
              startIcon={isDownloading ? <ArchiveIcon /> : <DownloadIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4],
                },
                '&:disabled': {
                  backgroundColor: alpha(theme.palette.action.disabled, 0.3),
                  color: alpha(theme.palette.action.disabled, 0.5),
                }
              }}
            >
              {isDownloading ? 'Downloading...' : `Download (${selectedFiles.size} file${selectedFiles.size !== 1 ? 's' : ''})`}
            </Button>
          </DialogActions>
        </Dialog>
    </Container>
  );
}

export default CreateAssignment