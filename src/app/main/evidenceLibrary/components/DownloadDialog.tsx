import { FC } from 'react'
import {
  alpha,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme
} from '@mui/material'
import ArchiveIcon from '@mui/icons-material/Archive'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import DescriptionIcon from '@mui/icons-material/Description'
import DownloadIcon from '@mui/icons-material/Download'
import SchoolIcon from '@mui/icons-material/School'
import FuseLoading from '@fuse/core/FuseLoading'
import { EvidenceData, CourseOption, SelectionState } from '../types'
import { getStatusColor } from '../utils/evidenceHelpers'

interface DownloadDialogProps {
  open: boolean
  onClose: () => void
  learnerCourses: CourseOption[]
  selectedCourseForDownload: number | null
  onCourseSelect: (courseId: number) => void
  evidenceFiles: EvidenceData[]
  isLoadingEvidence: boolean
  selectionState: SelectionState
  onFileSelection: (fileId: number) => void
  onSelectAllFiles: () => void
  onDownload: () => void
  isDownloading: boolean
}

const DownloadDialog: FC<DownloadDialogProps> = ({
  open,
  onClose,
  learnerCourses,
  selectedCourseForDownload,
  onCourseSelect,
  evidenceFiles,
  isLoadingEvidence,
  selectionState,
  onFileSelection,
  onSelectAllFiles,
  onDownload,
  isDownloading
}) => {
  const theme = useTheme()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
            Download Evidence Files
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a course to view and download its evidence files
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', height: 500 }}>
          {/* Left Side - Course List */}
          <Box 
            sx={{ 
              width: 300, 
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Select Course
              </Typography>
            </Box>
            <List sx={{ p: 0, overflow: 'auto', flex: 1 }}>
              {learnerCourses
                .filter((course): course is CourseOption & { course_id: number } => 
                  course.course_id !== '' && typeof course.course_id === 'number'
                ) // Filter out "All" option and narrow type
                .map((course) => (
                <ListItem key={course.course_id} disablePadding>
                  <ListItemButton
                    onClick={() => onCourseSelect(course.course_id)}
                    selected={selectedCourseForDownload === course.course_id}
                    sx={{
                      py: 2,
                      px: 2,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        }
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {course.course_name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          Code: {course.course_code}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Right Side - Evidence Files */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {selectedCourseForDownload ? (
              <>
                <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectionState.selectAllFiles}
                        onChange={onSelectAllFiles}
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
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Select All Files
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </Box>
                <List sx={{ p: 0, overflow: 'auto', flex: 1 }}>
                  {isLoadingEvidence ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <FuseLoading />
                    </Box>
                  ) : evidenceFiles.length > 0 ? (
                    evidenceFiles.map((evidence) => (
                      <ListItem key={evidence.assignment_id} disablePadding>
                        <ListItemButton
                          onClick={() => onFileSelection(evidence.assignment_id)}
                          sx={{
                            py: 2,
                            px: 3,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            },
                            backgroundColor: selectionState.selectedFiles.has(evidence.assignment_id) 
                              ? alpha(theme.palette.primary.main, 0.08) 
                              : 'transparent'
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Checkbox
                              checked={selectionState.selectedFiles.has(evidence.assignment_id)}
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
                              <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                {evidence.title || `Evidence ${evidence.assignment_id}`}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {evidence.file?.name || 'No file name'}
                                </Typography>
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
                    ))
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No evidence files found for this course
                      </Typography>
                    </Box>
                  )}
                </List>
              </>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', p: 4 }}>
                  <SchoolIcon sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Select a Course
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose a course from the list to view its evidence files
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.grey[50], 0.5)
        }}
      >
        <Button
          onClick={onClose}
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
          onClick={onDownload}
          variant="contained"
          disabled={selectionState.selectedFiles.size === 0 || isDownloading}
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
          {isDownloading ? 'Downloading...' : `Download (${selectionState.selectedFiles.size} file${selectionState.selectedFiles.size !== 1 ? 's' : ''})`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DownloadDialog

