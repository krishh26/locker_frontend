import { FC } from 'react'
import {
  alpha,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { EvidenceData } from '../types'

interface ActionMenuProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  selectedRow: EvidenceData | null
  onReupload: () => void
  onView: () => void
  onDownload: () => void
  onDelete: () => void
}

const ActionMenu: FC<ActionMenuProps> = ({
  anchorEl,
  open,
  onClose,
  selectedRow,
  onReupload,
  onView,
  onDownload,
  onDelete
}) => {
  const theme = useTheme()

  return (
    <Menu
      id='evidence-actions-menu'
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
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
          onClose()
          onReupload()
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
          onClose()
          onView()
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
      {selectedRow?.file && (
        <MenuItem
          onClick={() => {
            onClose()
            onDownload()
          }}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: alpha(theme.palette.success.main, 0.08)
            }
          }}
        >
          <DownloadIcon sx={{ mr: 1.5, fontSize: 20 }} />
          Download
        </MenuItem>
      )}
      <MenuItem
        onClick={() => {
          onClose()
          onDelete()
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
  )
}

export default ActionMenu

