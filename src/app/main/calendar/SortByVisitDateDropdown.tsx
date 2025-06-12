import { useState } from 'react'
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

interface Props {
  onChange: (value: 'asc' | 'desc') => void
}

export default function SortByVisitDateDropdown({ onChange }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selected, setSelected] = useState<'asc' | 'desc' | null>(null)

  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSelect = (value: 'asc' | 'desc') => {
    setSelected(value)
    onChange(value)
    handleClose()
  }

  return (
    <div>
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
        sx={{
          width: '190px',
          height: '40px',
          justifyContent: 'space-between',
          textTransform: 'none',
        }}
      >
        {selected === 'asc'
          ? 'Oldest First'
          : selected === 'desc'
          ? 'Latest First'
          : 'Sort by Visit Date'}
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleSelect('desc')}>
          <ListItemIcon>
            <ArrowDownwardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Latest First" />
        </MenuItem>
        <MenuItem onClick={() => handleSelect('asc')}>
          <ListItemIcon>
            <ArrowUpwardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Oldest First" />
        </MenuItem>
      </Menu>
    </div>
  )
}
