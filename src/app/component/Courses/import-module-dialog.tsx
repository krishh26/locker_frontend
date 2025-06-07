import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
} from '@mui/material'
import { useState } from 'react'

export const modules = [
  {
    id: 'mod-001',
    title: 'Leading people',
    type: 'Core Module',
    mandatory: false,
    otjHours: 0,
    sortOrder: 1,
    active: true,
  },
  {
    id: 'mod-002',
    title: 'Managing people',
    type: 'Core Module',
    mandatory: true,
    otjHours: 2,
    sortOrder: 2,
    active: true,
  },
  {
    id: 'mod-003',
    title: 'Building relationships',
    type: 'Core Module',
    mandatory: false,
    otjHours: 1,
    sortOrder: 3,
    active: true,
  },
  {
    id: 'mod-004',
    title: 'Communication skills',
    type: 'Optional Module',
    mandatory: false,
    otjHours: 1,
    sortOrder: 4,
    active: false,
  },
  {
    id: 'mod-005',
    title: 'Time management',
    type: 'Optional Module',
    mandatory: true,
    otjHours: 2,
    sortOrder: 5,
    active: true,
  },
]

const ImportModuleDialog = ({handleCloseModal}) => {
  const [selectedModuleIds, setSelectedModuleIds] = useState([])

  const handleToggleModule = (id) => {
    setSelectedModuleIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleCopyModules = async () => {
    console.log(
      '🚀 ~ handleCopyModules ~ selectedModuleIds:',
      selectedModuleIds
    )
    handleCloseModal()
  }

  return (
    <>
      <DialogTitle>Select Modules</DialogTitle>
      <DialogContent>
        <List>
          {modules.map((module) => (
            <ListItem key={module.id} divider>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedModuleIds.includes(module.id)}
                    onChange={() => handleToggleModule(module.id)}
                  />
                }
                label={module.title}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleCloseModal}
          className='rounded-md'
          color='secondary'
          variant='outlined'
        >
          Cancel
        </Button>
        <Button
          onClick={handleCopyModules}
          variant='contained'
          disabled={selectedModuleIds.length === 0}
          className='rounded-md'
          color='primary'
        >
          Copy Selected Modules
        </Button>
      </DialogActions>
    </>
  )
}

export default ImportModuleDialog
