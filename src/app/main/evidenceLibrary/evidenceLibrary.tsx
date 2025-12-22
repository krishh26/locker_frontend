import { useDebounce } from '@fuse/hooks'
import ArchiveIcon from '@mui/icons-material/Archive'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import ClearIcon from '@mui/icons-material/Clear'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DownloadIcon from '@mui/icons-material/Download'
import SchoolIcon from '@mui/icons-material/School'
import SearchIcon from '@mui/icons-material/Search'
import {
  alpha,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import IconButton from '@mui/material/IconButton'
import {
  useDeleteEvidenceMutation,
  useGetEvidenceListQuery,
} from 'app/store/api/evidence-api'
import { selectCourseManagement } from 'app/store/courseManagement'
import { showMessage } from 'app/store/fuse/messageSlice'
import { selectLearnerManagement } from 'app/store/learnerManagement'
import { FC, useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  DangerButton,
  LoadingButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
import AlertDialog from 'src/app/component/Dialogs/AlertDialog'
import EvidenceUploadWithCreation from 'src/app/component/react-upload-files/EvidenceUploadWithCreation'
import { useLearnerUserId } from 'src/app/utils/userHelpers'
import ActionMenu from './components/ActionMenu'
import DownloadDialog from './components/DownloadDialog'
import EvidenceTable from './components/EvidenceTable'
import ReuploadEvidenceLibrary from './reupload-evidenceLibrary'
import {
  CourseOption,
  DataState,
  DialogState,
  EvidenceData,
  UIState
} from './types'
import { selectionReducer } from './utils/selectionReducer'


const EvidenceLibrary: FC = () => {
  const theme = useTheme()
  
  // Grouped dialog state
  const [dialogs, setDialogs] = useState<DialogState>({
    fileUpload: false,
    reupload: false,
    deleteBox: false,
    courseSelection: false,
    fileSelection: false,
  })

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<CourseOption | null>(null)
  const [hasUserClearedFilter, setHasUserClearedFilter] = useState(false)
  const [selectedCourseForDownload, setSelectedCourseForDownload] = useState<number | null>(null)

  // Grouped data state
  const [dataState, setDataState] = useState<DataState>({
    evidenceData: [],
    totalItems: 0,
    totalPages: 0,
  })

  // Grouped UI state
  const [uiState, setUIState] = useState<UIState>({
    selectedRow: null,
    anchorEl: null,
    isDownloading: false,
  })

  // Selection state with reducer
  const [selectionState, dispatchSelection] = useReducer(selectionReducer, {
    selectedCourses: new Set<number>(),
    selectedFiles: new Set<number>(),
    selectAll: false,
    selectAllFiles: false,
  })

  // Pagination state (already grouped, keeping as is)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Dialog helper functions
  const openDialog = useCallback((dialog: keyof DialogState) => {
    setDialogs(prev => ({ ...prev, [dialog]: true }))
  }, [])

  const closeDialog = useCallback((dialog: keyof DialogState) => {
    setDialogs(prev => ({ ...prev, [dialog]: false }))
  }, [])

  const closeAllDialogs = useCallback(() => {
    setDialogs({
      fileUpload: false,
      reupload: false,
      deleteBox: false,
      courseSelection: false,
      fileSelection: false,
    })
  }, [])

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const isOpenAction = Boolean(uiState.anchorEl)

  const learnerUserId = useLearnerUserId()


  const { singleData } = useSelector(selectCourseManagement)
  const { learner } = useSelector(selectLearnerManagement)
  // Helper functions (moved before column definitions)
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }, [])

  const getStatusColor = useCallback((status: string) => {
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
  }, [])

  const displayValue = useCallback((value: string | null | undefined) => {
    if (value === null || value === undefined || value === 'null' || value === '' || value.trim() === '') {
      return '-'
    }
    return value
  }, [])

  const truncateText = useCallback((text: string | null, maxLength: number = 50) => {
    if (!text || text === 'null' || text.trim() === '') return '-'
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }, [])

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setUIState(prev => ({ ...prev, anchorEl: event.currentTarget }))
  }, [])

  const openMenu = useCallback((e: React.MouseEvent<HTMLElement>, evidence: EvidenceData) => {
    handleClick(e)
    setUIState(prev => ({ ...prev, selectedRow: evidence }))
  }, [handleClick])

  // Column definitions and table setup moved to EvidenceTable component

  // Debounce search query to avoid excessive API calls
  const debouncedUpdateSearch = useDebounce((value: string) => {
    setDebouncedSearchQuery(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 })) // Reset to first page on search
  }, 300)

  const { data, isLoading, isError, error, refetch } = useGetEvidenceListQuery(
    {
      user_id: learnerUserId,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      meta: true,
      search: debouncedSearchQuery,
      course_id: selectedCourseFilter?.course_id,
    },
    {
      skip: !selectedCourseFilter?.course_id,
      refetchOnMountOrArgChange: true,
    }
  )

  const [deleteEvidence, { isLoading: isDeleteLoading }] =
    useDeleteEvidenceMutation()

  useEffect(() => {
    if (isError && error) {
      console.error('Error fetching evidence list:', error)
      dispatch(
        showMessage({
          message: 'Failed to load evidence. Please refresh the page.',
          variant: 'error',
        })
      )
      return
    }

    if (data) {
      setDataState({
        evidenceData: data.data,
        totalItems: data.meta_data?.items || 0,
        totalPages: data.meta_data?.pages || 0,
      })
    }
  }, [data, isError, error, isLoading, dispatch])

  // Store unique courses from evidence data for filter dropdown
  // We'll build this from the current data, and it will grow as user navigates
  const [availableCourses, setAvailableCourses] = useState<Map<number, { course_id: number; course_name: string; course_code: string }>>(new Map())

  // Update available courses when data changes
  useEffect(() => {
    if (data?.data) {
      setAvailableCourses(prev => {
        const newMap = new Map(prev)
        let hasChanges = false
        
        data.data.forEach(evidence => {
          if (evidence.course_id && !newMap.has(evidence.course_id.course_id)) {
            newMap.set(evidence.course_id.course_id, {
              course_id: evidence.course_id.course_id,
              course_name: evidence.course_id.course_name,
              course_code: evidence.course_id.course_code,
            })
            hasChanges = true
          }
        })
        
        // Only return new Map if we actually added courses (prevents unnecessary re-renders)
        return hasChanges ? newMap : prev
      })
    }
  }, [data?.data]) // Only depend on data.data, not the entire data object

  // Memoized function to transform learner.course array to Autocomplete options format
  const learnerCourses = useMemo(() => {
    if (!learner?.course || !Array.isArray(learner.course)) {
      return []
    }
    
    return learner.course
      .map((courseItem: any) => {
        // Handle nested course structure
        const course = courseItem.course || courseItem
        if (course && course.course_id) {
          return {
            course_id: course.course_id,
            course_name: course.course_name || '',
            course_code: course.course_code || '',
            units: course.units || courseItem.units || [],
          }
        }
        return null
      })
      .filter((course: any) => course !== null)
      .sort((a, b) => a.course_name.localeCompare(b.course_name))
  }, [learner?.course])

  // Memoized function to get unique courses for filter (sorted) - kept for backward compatibility
  const getUniqueCourses = useMemo(() => {
    return Array.from(availableCourses.values()).sort((a, b) => 
      a.course_name.localeCompare(b.course_name)
    )
  }, [availableCourses])

  // Memoized function to get unique courses for download dialog (from current page data)
  const getUniqueCoursesForDownload = useMemo(() => {
    const courseMap = new Map()
    dataState.evidenceData.forEach(evidence => {
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
    dataState.evidenceData.forEach(evidence => {
      if (evidence.course_id && evidence.file) {
        const course = courseMap.get(evidence.course_id.course_id)
        if (course) {
          course.fileCount++
        }
      }
    })
    
    return Array.from(courseMap.values())
  }, [dataState.evidenceData])

  // Memoized function to get files from selected courses
  // Fetch evidence for selected course in download dialog
  const { data: selectedCourseEvidenceData, isLoading: isLoadingCourseEvidence } = useGetEvidenceListQuery(
    {
      user_id: learnerUserId,
      page: 1,
      limit: 1000, // Get all evidence for the course
      meta: false,
      search: '',
      course_id: selectedCourseForDownload || '',
    },
    {
      skip: !selectedCourseForDownload || !dialogs.fileSelection,
      refetchOnMountOrArgChange: true,
    }
  )

  const getFilesFromSelectedCourses = useMemo(() => {
    // If a course is selected in download dialog, use that course's evidence
    if (selectedCourseForDownload && selectedCourseEvidenceData?.data) {
      return selectedCourseEvidenceData.data.filter((evidence: EvidenceData) => 
        evidence.file && evidence.course_id?.course_id === selectedCourseForDownload
      )
    }
    // Otherwise, use the old logic for multiple course selection
    return dataState.evidenceData.filter(evidence => 
      evidence.file && 
      evidence.course_id && 
      selectionState.selectedCourses.has(evidence.course_id.course_id)
    )
  }, [dataState.evidenceData, selectionState.selectedCourses, selectedCourseForDownload, selectedCourseEvidenceData])

  // Handle course selection
  const handleCourseSelection = useCallback((courseId: number) => {
    dispatchSelection({ type: 'TOGGLE_COURSE', courseId })
  }, [])

      // Handle select all courses
  const handleSelectAll = useCallback(() => {
    if (selectionState.selectAll) {
      dispatchSelection({ type: 'DESELECT_ALL_COURSES' })
    } else {
      const allCourseIds = getUniqueCoursesForDownload.map(course => course.course_id)
      dispatchSelection({ type: 'SELECT_ALL_COURSES', courseIds: allCourseIds })
    }
  }, [selectionState.selectAll, getUniqueCoursesForDownload])

  // Sync selectAll state with actual selection
  useEffect(() => {
    if (getUniqueCoursesForDownload.length > 0) {
      const courseIds = getUniqueCoursesForDownload.map(course => course.course_id)
      const allSelected = courseIds.length > 0 && 
        courseIds.every(id => selectionState.selectedCourses.has(id))
      
      // Only dispatch if state actually needs to change
      if (allSelected !== selectionState.selectAll) {
        dispatchSelection({
          type: 'SYNC_SELECT_ALL_COURSES',
          courseIds,
          selectedCourses: selectionState.selectedCourses,
        })
      }
    } else {
      if (selectionState.selectAll) {
        dispatchSelection({ type: 'DESELECT_ALL_COURSES' })
      }
    }
  }, [selectionState.selectedCourses, selectionState.selectAll, getUniqueCoursesForDownload])

  // Handle file selection
  const handleFileSelection = useCallback((assignmentId: number) => {
    dispatchSelection({ type: 'TOGGLE_FILE', fileId: assignmentId })
  }, [])

  // Handle select all files
  const handleSelectAllFiles = useCallback(() => {
    if (selectionState.selectAllFiles) {
      dispatchSelection({ type: 'DESELECT_ALL_FILES' })
    } else {
      const allFileIds = getFilesFromSelectedCourses.map(file => file.assignment_id)
      dispatchSelection({ type: 'SELECT_ALL_FILES', fileIds: allFileIds })
    }
  }, [selectionState.selectAllFiles, getFilesFromSelectedCourses])

  // Sync selectAllFiles state with actual selection
  useEffect(() => {
    if (getFilesFromSelectedCourses.length > 0) {
      const fileIds = getFilesFromSelectedCourses.map(file => file.assignment_id)
      const allSelected = fileIds.length > 0 && 
        fileIds.every(id => selectionState.selectedFiles.has(id))
      
      // Only dispatch if state actually needs to change
      if (allSelected !== selectionState.selectAllFiles) {
        dispatchSelection({
          type: 'SYNC_SELECT_ALL_FILES',
          fileIds,
          selectedFiles: selectionState.selectedFiles,
        })
      }
    } else {
      if (selectionState.selectAllFiles) {
        dispatchSelection({ type: 'DESELECT_ALL_FILES' })
      }
    }
  }, [selectionState.selectedFiles, selectionState.selectAllFiles, getFilesFromSelectedCourses])

  // Reset course selection when dialog opens
  const handleOpenCourseSelection = useCallback(() => {
    dispatchSelection({ type: 'RESET_COURSES' })
    dispatchSelection({ type: 'RESET_FILES' })
    setSelectedCourseForDownload(null)
    openDialog('fileSelection')
  }, [openDialog])

  // Handle proceeding to file selection
  const handleProceedToFileSelection = useCallback(() => {
    if (selectionState.selectedCourses.size === 0) {
      dispatch(
        showMessage({
          message: 'Please select at least one course to proceed',
          variant: 'warning',
        })
      )
      return
    }

    // Get all files from selected courses and select them by default
    const allFileIds = getFilesFromSelectedCourses.map(file => file.assignment_id)
    dispatchSelection({ type: 'SELECT_ALL_FILES', fileIds: allFileIds })
    
    closeDialog('courseSelection')
    openDialog('fileSelection')
  }, [selectionState.selectedCourses.size, getFilesFromSelectedCourses, dispatch, closeDialog, openDialog])

  // Reset file selection when dialog opens
  const handleOpenFileSelection = useCallback(() => {
    const allFileIds = getFilesFromSelectedCourses.map(file => file.assignment_id)
    dispatchSelection({ type: 'SELECT_ALL_FILES', fileIds: allFileIds })
    openDialog('fileSelection')
  }, [getFilesFromSelectedCourses, openDialog])

  // Note: getSignedUrl removed as it's currently unused.
  // If needed in the future, implement a backend endpoint that provides signed URLs for S3 files.

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
  const handleDownloadAll = useCallback(() => {
    if (!dataState.evidenceData || dataState.evidenceData.length === 0) {
      dispatch(
        showMessage({
          message: 'No evidence files to download',
          variant: 'warning',
        })
      )
      return
    }

    const evidenceWithFiles = dataState.evidenceData.filter(evidence => evidence.file)
    
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
  }, [dataState.evidenceData, dispatch, handleOpenCourseSelection])

  // Download selected files as ZIP
  const handleDownloadSelectedFiles = useCallback(async () => {
    if (selectionState.selectedFiles.size === 0) {
      dispatch(
        showMessage({
          message: 'Please select at least one file to download',
          variant: 'warning',
        })
      )
      return
    }

    setUIState(prev => ({ ...prev, isDownloading: true }))
    closeDialog('fileSelection')
    
    try {
      // Filter evidence with selected files
      const evidenceWithFiles = dataState.evidenceData.filter(evidence => 
        evidence.file && 
        selectionState.selectedFiles.has(evidence.assignment_id)
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
      const selectedCourseNames = getUniqueCoursesForDownload
        .filter(course => selectionState.selectedCourses.has(course.course_id))
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
      setUIState(prev => ({ ...prev, isDownloading: false }))
    }
  }, [selectionState.selectedFiles, selectionState.selectedCourses, dataState.evidenceData, dispatch, getUniqueCourses, closeDialog])

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

  const handleClose = useCallback(() => {
    closeDialog('fileUpload')
    setUIState(prev => ({ ...prev, anchorEl: null }))
  }, [closeDialog])

  const handleReuploadClose = useCallback(() => {
    closeDialog('reupload')
  }, [closeDialog])

  const handleNavigate = useCallback(() => {
    if (uiState.selectedRow) {
      navigate(`/evidenceLibrary/${uiState.selectedRow.assignment_id}`, {
        state: {
          isEdit: true,
        },
      })
    }
  }, [uiState.selectedRow, navigate])

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
    const value = event.target.value
    setSearchQuery(value)
    debouncedUpdateSearch(value)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setDebouncedSearchQuery('')
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleCourseFilterChange = useCallback((event: any, newValue: { course_id: number; course_name: string; course_code: string; units?: any[] } | null) => {
    setSelectedCourseFilter(newValue)
    // Track if user manually cleared the filter
    if (newValue === null) {
      setHasUserClearedFilter(true)
    }
    setPagination((prev) => ({ ...prev, pageIndex: 0 })) // Reset to first page on filter change
  }, [])

  // Set default selected course from singleData when available (only once, not after user clears it)
  useEffect(() => {
    if (
      singleData?.course?.course_id && 
      !selectedCourseFilter && 
      !hasUserClearedFilter && 
      learnerCourses.length > 0
    ) {
      const defaultCourse = learnerCourses.find(
        (course) => course.course_id === singleData.course.course_id
      )
      if (defaultCourse) {
        // Include units from singleData if available
        const courseWithUnits = {
          ...defaultCourse,
          units: singleData.course.units || defaultCourse.units || [],
        }
        setSelectedCourseFilter(courseWithUnits)
      }
    }
  }, [singleData?.course?.course_id, singleData?.course?.units, learnerCourses, selectedCourseFilter, hasUserClearedFilter])

  const handleDelete = useCallback(async () => {
    if (!uiState.selectedRow) return
    
    try {
      await deleteEvidence({ id: uiState.selectedRow.assignment_id }).unwrap()
      closeDialog('deleteBox')
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
  }, [uiState.selectedRow, deleteEvidence, closeDialog, refetch, dispatch])

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
            disabled={uiState.isDownloading || !dataState.evidenceData || dataState.evidenceData.length === 0}
            startIcon={uiState.isDownloading ? <ArchiveIcon /> : <DownloadIcon />}
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
            {uiState.isDownloading ? 'Downloading...' : 'Download Evidence Files'}
          </Button>
          <Button
            variant='contained'
            color='primary'
            size='large'
            onClick={() => openDialog('fileUpload')}
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

      {/* Search Bar and Course Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          sx={{
            flex: 1,
            minWidth: 250,
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
        />
        <Autocomplete
          sx={{ flex: 1, minWidth: 250 }}
          options={learnerCourses}
          getOptionLabel={(option) => option.course_name || ''}
          value={selectedCourseFilter}
          onChange={handleCourseFilterChange}
          disableClearable
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Filter by course"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <SchoolIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
                endAdornment: params.InputProps.endAdornment,
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
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.course_id}>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {option.course_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Code: {option.course_code}
                </Typography>
              </Box>
            </Box>
          )}
          noOptionsText="No courses found"
          isOptionEqualToValue={(option, value) => option.course_id === value.course_id}
        />
        {searchQuery && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {isLoading ? 'Searching...' : `Found ${dataState.totalItems} result${dataState.totalItems !== 1 ? 's' : ''}`}
            </Typography>
            {!isLoading && dataState.totalItems > 0 && (
              <Chip 
                label={`Page ${pagination.pageIndex + 1} of ${dataState.totalPages}`}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontSize: '0.75rem', height: 22 }}
              />
            )}
          </Box>
        )}
      </Box>

      <EvidenceTable
        data={dataState.evidenceData}
        isLoading={isLoading}
        searchQuery={debouncedSearchQuery}
        onClearSearch={handleClearSearch}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        totalItems={dataState.totalItems}
        totalPages={dataState.totalPages}
        selectedCourseFilter={selectedCourseFilter}
        onOpenMenu={openMenu}
      />
      <ActionMenu
        anchorEl={uiState.anchorEl}
        open={isOpenAction}
        onClose={handleClose}
        selectedRow={uiState.selectedRow}
        onReupload={() => openDialog('reupload')}
        onView={handleNavigate}
        onDownload={() => handleSingleFileDownload(uiState.selectedRow!)}
        onDelete={() => openDialog('deleteBox')}
      />
      <AlertDialog
        open={dialogs.deleteBox}
        close={() => closeDialog('deleteBox')}
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
            onClick={() => closeDialog('deleteBox')}
            name='Cancel'
          />
        }
      />
      <Dialog
        open={dialogs.fileUpload}
        onClose={() => closeDialog('fileUpload')}
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
        <EvidenceUploadWithCreation 
          handleClose={handleClose} 
          selectedCourseFilter={selectedCourseFilter}
        />
      </Dialog>
      <Dialog
        open={dialogs.reupload}
        onClose={() => closeDialog('reupload')}
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
          id={uiState.selectedRow?.assignment_id}
        />
      </Dialog>

      {/* Course Selection Dialog */}
      <Dialog
        open={dialogs.courseSelection}
        onClose={() => closeDialog('courseSelection')}
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
                  checked={selectionState.selectAll}
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
            {getUniqueCoursesForDownload.map((course, index) => (
              <ListItem key={course.course_id} disablePadding>
                <ListItemButton
                  onClick={() => handleCourseSelection(course.course_id)}
                  sx={{
                    py: 2,
                    px: 3,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                    backgroundColor: selectionState.selectedCourses.has(course.course_id) 
                      ? alpha(theme.palette.primary.main, 0.08) 
                      : 'transparent'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Checkbox
                      checked={selectionState.selectedCourses.has(course.course_id)}
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
            onClick={() => closeDialog('courseSelection')}
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
            disabled={selectionState.selectedCourses.size === 0}
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
            Next ({selectionState.selectedCourses.size} course{selectionState.selectedCourses.size !== 1 ? 's' : ''})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Download Dialog */}
      <DownloadDialog
        open={dialogs.fileSelection}
        onClose={() => {
          closeDialog('fileSelection')
          setSelectedCourseForDownload(null)
          dispatchSelection({ type: 'RESET_FILES' })
        }}
        learnerCourses={learnerCourses}
        selectedCourseForDownload={selectedCourseForDownload}
        onCourseSelect={(courseId) => {
          setSelectedCourseForDownload(courseId)
          dispatchSelection({ type: 'RESET_FILES' })
        }}
        evidenceFiles={getFilesFromSelectedCourses}
        isLoadingEvidence={isLoadingCourseEvidence}
        selectionState={selectionState}
        onFileSelection={handleFileSelection}
        onSelectAllFiles={handleSelectAllFiles}
        onDownload={handleDownloadSelectedFiles}
        isDownloading={uiState.isDownloading}
      />
    </Container>
  )
}

export default EvidenceLibrary
