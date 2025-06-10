import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from '@mui/material'
import { useEffect, useState } from 'react'

import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'

import {
  fetchCourseAPI,
  selectCourseManagement,
  updateCourseAPI,
} from 'app/store/courseManagement'

const ImportModuleDialog = ({
  handleCloseModal,
  courseId,
  localModules = [],
}) => {
  const dispatch: any = useDispatch()
  const { data, dataFetchLoading, dataUpdatingLoadding } = useSelector(
    selectCourseManagement
  )
  const [selectedModuleIds, setSelectedModuleIds] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [courseList, setCourseList] = useState([])
  const [modules, setModules] = useState([])
  const [coreType, setCoreType] = useState('Standard')

  const fetchCourse = (a = '', page = 1) => {
    dispatch(fetchCourseAPI({ page, page_size: 1000 }, a, '', coreType))
  }

  useEffect(() => {
    fetchCourse()
  }, [coreType])

  useEffect(() => {
    if (data && data.length > 0 && !dataFetchLoading) {
      const courseList = data
        .map(({ course_id, course_name, units }) => ({
          course_id,
          course_name,
          modules: units,
        }))
        .filter((course) => course.course_id != courseId)

      setCourseList(courseList)
    }
  }, [data, dataFetchLoading])

  const handleToggleModule = (id) => {
    setSelectedModuleIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleCopyModules = async () => {
    const selectedM = selectedModuleIds.map((id) => {
      const module = modules.find((m) => m.id == id)
      return module
    })

    const selectedIds = new Set(
      selectedM.map((m) =>
        m?.id?.toString().startsWith('module_') ? m.id : `module_${m?.id}`
      )
    )

    const unitsModules = [
      ...selectedM,
      ...localModules.filter((m) => {
        const moduleId = m?.id?.toString().startsWith('module_')
          ? m.id
          : `module_${m?.id}`
        return !selectedIds.has(moduleId)
      }),
    ].map((m) => ({
      ...m,
      id: m?.id?.toString().startsWith('module_') ? m.id : `module_${m?.id}`,
    }))

    const payload = {
      units: unitsModules,
    }

    try {
      await dispatch(updateCourseAPI(courseId, payload))
      handleCloseModal()
    } catch (error) {
      console.error('Error copying modules:', error)
    }
  }

  const handleCourseChange = async (e) => {
    const courseId = e.target.value

    const course = courseList.find((c) => c.course_id === courseId)

    setSelectedCourse(courseId)

    setModules(course?.modules || [])
  }

  const handleChange = (event) => {
    setCoreType(event.target.value)
  }

  if (dataFetchLoading) {
    return (
      <Box
        mt={4}
        mb={2}
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
      >
        <CircularProgress thickness={5} size={40} />
        <Box mt={2} color='text.secondary' fontSize='0.95rem'>
          Loading course...
        </Box>
      </Box>
    )
  }

  return (
    <>
      <DialogTitle>Select Modules</DialogTitle>
      <DialogContent>
        <FormControl component='fieldset'>
           <FormLabel component="legend">Course Type</FormLabel>
          <RadioGroup row value={coreType} onChange={handleChange}>
            <FormControlLabel
              value='Standard'
              control={<Radio />}
              label='Standard'
              defaultChecked
            />
            <FormControlLabel value='' control={<Radio />} label='All' />
          </RadioGroup>
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <InputLabel>Select Course</InputLabel>
          <Select
            value={selectedCourse}
            onChange={handleCourseChange}
            label='Select Course'
          >
            {courseList.map((course) => (
              <MenuItem key={course.course_id} value={course.course_id}>
                {course.course_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedCourse && modules.length === 0 ? (
          <Box mt={2} color='text.secondary'>
            No modules found for this course.
          </Box>
        ) : (
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
        )}
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
          disabled={selectedModuleIds.length === 0 || dataUpdatingLoadding}
          className='rounded-md'
          color='primary'
        >
          {dataUpdatingLoadding ? (
            <span className='flex items-center gap-5'>
              <CircularProgress size={24} />
              Updating...
            </span>
          ) : (
            <>Copy Selected Modules</>
          )}
        </Button>
      </DialogActions>
    </>
  )
}

export default ImportModuleDialog
