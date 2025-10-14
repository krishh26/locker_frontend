import ArchiveIcon from '@mui/icons-material/Archive'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import ClearIcon from '@mui/icons-material/Clear'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import DescriptionIcon from '@mui/icons-material/Description'
import DownloadIcon from '@mui/icons-material/Download'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import SchoolIcon from '@mui/icons-material/School'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
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
  InputAdornment,
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
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material'
import { FC, useEffect, useState } from 'react'

import FuseLoading from '@fuse/core/FuseLoading'
import {
  useDeleteEvidenceMutation,
  useGetEvidenceListQuery,
} from 'app/store/api/evidence-api'
import { showMessage } from 'app/store/fuse/messageSlice'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  DangerButton,
  LoadingButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
import AlertDialog from 'src/app/component/Dialogs/AlertDialog'
import DataNotFound from 'src/app/component/Pages/dataNotFound'
import EvidenceUploadWithCreation from 'src/app/component/react-upload-files/EvidenceUploadWithCreation'
import { useLearnerUserId } from 'src/app/utils/userHelpers'
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
  course_id: {
    course_id: number
    course_name: string
    course_code: string
  }
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

const EvidenceLibrary: FC = () => {
  const theme = useTheme()
  const [isOpenFileUpload, setIsOpenFileUpload] = useState<boolean>(false)
  const [isOpenReupload, setIsOpenReupload] = useState<boolean>(false)
  const [isOpenDeleteBox, setIsOpenDeleteBox] = useState<boolean>(false)
  const [isOpenCourseSelection, setIsOpenCourseSelection] = useState<boolean>(false)
  const [isOpenFileSelection, setIsOpenFileSelection] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [evidenceData, setEvidenceData] = useState<EvidenceData[]>([])
  const [selectedRow, setSelectedRow] = useState<EvidenceData | null>(null)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [selectedCourses, setSelectedCourses] = useState<Set<number>>(new Set())
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState<boolean>(false)
  const [selectAllFiles, setSelectAllFiles] = useState<boolean>(false)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const isOpenAction = Boolean(anchorEl)

  const learnerUserId = useLearnerUserId()

  const { data, isLoading, isError, error, refetch } = useGetEvidenceListQuery(
    {
      user_id: learnerUserId,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      meta: true,
      search: searchQuery,
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
      if (data.meta_data) {
        setTotalItems(data.meta_data.items || 0)
        setTotalPages(data.meta_data.pages || 0)
      }
    }
  }, [data, isError, error, isLoading])

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

  // Helper function to get unique courses from evidence data
  const getUniqueCourses = () => {
    const courseMap = new Map()
    evidenceData.forEach(evidence => {
      if (evidence.course_id) {
        courseMap.set(evidence.course_id.course_id, {
          course_id: evidence.course_id.course_id,
          course_name: evidence.course_id.course_name,
          course_code: evidence.course_id.course_code,
          fileCount: 0
        })
      }
    })
    
    // Count files per course
    evidenceData.forEach(evidence => {
      if (evidence.course_id && evidence.file) {
        const course = courseMap.get(evidence.course_id.course_id)
        if (course) {
          course.fileCount++
        }
      }
    })
    
    return Array.from(courseMap.values())
  }

  // Helper function to get files from selected courses
  const getFilesFromSelectedCourses = () => {
    return evidenceData.filter(evidence => 
      evidence.file && 
      evidence.course_id && 
      selectedCourses.has(evidence.course_id.course_id)
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

  // Helper function to create ZIP file
  const createZipFile = async (files: { name: string; blob: Blob }[]): Promise<Blob> => {
    // Using JSZip library - you'll need to install it: npm install jszip
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    files.forEach((file, index) => {
      const originalName = file.name || `evidence_${index + 1}.pdf`
      const sanitizedName = sanitizeFileName(originalName)
      const finalName = sanitizedName || `evidence_${index + 1}.pdf`
      
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
    if (!evidenceData || evidenceData.length === 0) {
      dispatch(
        showMessage({
          message: 'No evidence files to download',
          variant: 'warning',
        })
      )
      return
    }

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
      // Filter evidence with selected files
      const evidenceWithFiles = evidenceData.filter(evidence => 
        evidence.file && 
        selectedFiles.has(evidence.assignment_id)
      )
      
      if (evidenceWithFiles.length === 0) {
        dispatch(
          showMessage({
            message: 'No files found for selected files',
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
        ? `Evidence_Files_${selectedCourseNames}_${timestamp}.zip`
        : `Evidence_Library_${timestamp}.zip`
      
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
          message: `Successfully downloaded ${files.length} selected evidence files`,
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

  const handlePageChange = (event: unknown, newPage: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: newPage }))
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: Number(event.target.value),
      pageIndex: 0,
    }))
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 })) // Reset to first page on search
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
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
            {isDownloading ? 'Downloading...' : 'Download Evidence Files'}
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

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by title"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main
                    }
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.paper, 1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
              },
              '&.Mui-focused': {
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
              },
            },
          }}
        />
        {searchQuery && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {isLoading ? 'Searching...' : `Found ${totalItems} result${totalItems !== 1 ? 's' : ''}`}
            </Typography>
            {!isLoading && totalItems > 0 && (
              <Chip 
                label={`Page ${pagination.pageIndex + 1} of ${totalPages}`}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontSize: '0.75rem', height: 22 }}
              />
            )}
          </Box>
        )}
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
                {searchQuery ? 'No Results Found' : 'No Evidence Found'}
              </Typography>
              <Typography 
                variant='body2' 
                color='text.secondary'
                sx={{ textAlign: 'center', maxWidth: 400 }}
              >
                {searchQuery 
                  ? `No evidence matches your search "${searchQuery}". Try adjusting your search terms or clear the search to see all evidence.`
                  : "You haven't uploaded any evidence yet. Click \"Add Evidence\" to get started with your portfolio."
                }
              </Typography>
              {searchQuery && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleClearSearch}
                  startIcon={<ClearIcon />}
                  sx={{
                    mt: 3,
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
                  Clear Search
                </Button>
              )}
            </Box>
          )}
        </TableContainer>
        
        {/* Pagination Controls */}
        {evidenceData && evidenceData.length > 0 && (
          <TablePagination
            component="div"
            count={totalItems}
            page={pagination.pageIndex}
            onPageChange={handlePageChange}
            rowsPerPage={pagination.pageSize}
            onRowsPerPageChange={handlePageSizeChange}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            sx={{
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: alpha(theme.palette.grey[50], 0.3),
              '& .MuiTablePagination-toolbar': {
                px: 3,
                py: 2,
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontWeight: 500,
                color: theme.palette.text.secondary,
              },
              '& .MuiTablePagination-select': {
                borderRadius: 1,
                px: 1,
                '&:focus': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              },
              '& .MuiTablePagination-actions': {
                '& .MuiIconButton-root': {
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }
                }
              }
            }}
            labelRowsPerPage="Items per page:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
            }
          />
        )}
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
              Choose which courses you want to download evidence files from
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
            {getFilesFromSelectedCourses().map((evidence, index) => (
              <ListItem key={evidence.assignment_id} disablePadding>
                <ListItemButton
                  onClick={() => handleFileSelection(evidence.assignment_id)}
                  sx={{
                    py: 2,
                    px: 3,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                    backgroundColor: selectedFiles.has(evidence.assignment_id) 
                      ? alpha(theme.palette.primary.main, 0.08) 
                      : 'transparent'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Checkbox
                      checked={selectedFiles.has(evidence.assignment_id)}
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
                        {evidence.title || `Evidence ${evidence.assignment_id}`}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {evidence.file?.name || 'No file name'}
                        </Typography>
                        <Chip
                          label={evidence.course_id?.course_name || 'Unknown Course'}
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem', height: 20 }}
                        />
                        <Chip
                          label={evidence.status || 'Unknown'}
                          size="small"
                          color={getStatusColor(evidence.status || '')}
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
  )
}

export default EvidenceLibrary
