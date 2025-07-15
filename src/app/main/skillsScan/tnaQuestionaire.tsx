import {
  Card,
  CardContent,
  Checkbox,
  FormControl,
  Grid,
  MenuItem,
  Radio,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { selectLearnerManagement } from 'app/store/learnerManagement'
import {
  selectSkillsScan,
  skillsScanAction,
  updateCourseUnitSkillAPI,
} from 'app/store/skillsScan'
import { slice as courseSlice } from 'app/store/learnerManagement'
import { SyntheticEvent, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { SecondaryButton } from 'src/app/component/Buttons'

const ratingOptions = [
  { value: 1, label: '😖 - Never' },
  { value: 2, label: '☹️ - Not sure' },
  { value: 3, label: '🙂 - Sometimes' },
  { value: 4, label: '😁 - Always' },
]

const TNAQuestionaire = (props) => {
  const { handleTabChange } = props
  const { singleData, selectedCourse } = useSelector(selectSkillsScan)
  const { courseData, learner } = useSelector(selectLearnerManagement)
  const [expanded, setExpanded] = useState<string | false>(() => {
    return selectedCourse?.progressByDate?.[0]?.date || false
  })

  const dispatch: any = useDispatch()

  const [sampleData, setSampleData] = useState(courseData?.units || [])
  const [highlightBlanks, setHighlightBlanks] = useState(false)

  const handleClick = (event, row) => {
    dispatch(skillsScanAction.setSingleData(row))
  }

  useEffect(() => {
    if (courseData && courseData?.units) {
      const firstRow = courseData.units[0]
      dispatch(skillsScanAction.setSingleData(firstRow))
    }
  }, [])

  const radioHandler = (id, value) => {
    const data = JSON.parse(JSON.stringify(singleData))
    const updatedSubUnit = data?.subUnit?.find((item) => item?.id === id)

    // Update current rating (legacy field)
    updatedSubUnit.rating = value

    // Update or add to progressByDate
    const progressDate = expanded // assuming `expanded` holds the current date string like "June-2025"
    if (!updatedSubUnit.progressByDate) {
      updatedSubUnit.progressByDate = []
    }

    const existingProgress = updatedSubUnit.progressByDate.find(
      (p) => p.date === progressDate
    )
    if (existingProgress) {
      existingProgress.rating = value
    } else {
      updatedSubUnit.progressByDate.push({
        date: progressDate,
        rating: value,
      })
    }

    // Update Redux singleData
    dispatch(skillsScanAction.setSingleData(data))

    // Update courseData in global state
    const updatedCourse = JSON.parse(JSON.stringify(courseData))
    const unitUpdate = updatedCourse.units.find(
      (item) => item.id === singleData.id
    )

    unitUpdate.subUnit = unitUpdate.subUnit.map((item) =>
      item.id === id ? updatedSubUnit : item
    )

    dispatch(courseSlice.setCourseData({ course: updatedCourse }))
    setSampleData(updatedCourse?.units)
  }
  const saveData = () => {
    dispatch(updateCourseUnitSkillAPI(courseData))
    const updatedCourseData = {
      ...selectedCourse,
      course: {
        ...courseData,
      },
    }
    dispatch(skillsScanAction.setSelectedCourse(updatedCourseData))
  }

  const handleHighlightBlanksChange = (event) => {
    setHighlightBlanks(event.target.checked)
  }

  const handleSelectChange = (rowId, reviewKey, value) => {
    const updatedData = JSON.parse(JSON.stringify(singleData))
    const subUnit = updatedData.subUnit.find((item) => item.id === rowId)

    if (subUnit) {
      subUnit.quarter_review = {
        ...(subUnit.quarter_review || {}),
        [reviewKey]: value,
      }
    }

    dispatch(skillsScanAction.setSingleData(updatedData))

    // Update courseData in global state
    const updatedCourse = JSON.parse(JSON.stringify(courseData))
    const unitUpdate = updatedCourse.units.find(
      (item) => item.id === singleData.id
    )

    unitUpdate.subUnit = unitUpdate.subUnit.map((item) =>
      item.id === rowId ? subUnit : item
    )
    console.log(
      '🚀 ~ handleSelectChange ~ unitUpdate.subUnit:',
      unitUpdate.subUnit
    )

    dispatch(courseSlice.setCourseData({ course: updatedCourse }))
    setSampleData(updatedCourse?.units)
  }

  return (
    <Grid>
      <Grid className='flex items-center pl-28'>
        <Checkbox
          checked={highlightBlanks}
          onChange={handleHighlightBlanksChange}
          name='highlightBlanks'
          color='primary'
        />
        <Typography>Highlight Blanks</Typography>
      </Grid>
      <Grid className='w-full flex'>
        <Grid className='w-1/4 p-20'>
          {sampleData?.map((row, index) => (
            <Card
              variant='outlined'
              className='rounded-0 hover:bg-grey-100 cursor-pointer'
              elevation={0}
              onClick={(e) => handleClick(e, row)}
            >
              <CardContent
                style={
                  singleData?.id === row.id ? { background: 'lightgray' } : {}
                }
              >
                <Typography className='text-12'>
                  {index + 1}. {row.title}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Grid>
        <Grid className='w-full h-fit my-20'>
          <Typography variant='h6' className='text-20 font-bold uppercase'>
            {singleData?.title}
          </Typography>
          <Grid className='w-full border-grey-600 border-2 h-fit'>
            <TableContainer sx={{ maxHeight: 'auto' }}>
              <Table
                sx={{ minWidth: 650, heigh: '100%' }}
                size='small'
                aria-label='simple table'
              >
                <TableHead className='bg-grey-300 '>
                  <TableRow>
                    <TableCell align='left'>
                      Skill To Be Demonstrated
                    </TableCell>
                    <TableCell align='center'>Induction</TableCell>
                    <TableCell align='center'>First Review</TableCell>
                    <TableCell align='center'>Second Review</TableCell>
                    <TableCell align='center'>Third Review</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {singleData?.subUnit?.map((row, index) => {
                    return (
                      <TableRow
                        key={row.id}
                        sx={{
                          '&:last-child td, &:last-child th': {
                            border: 0,
                          },
                        }}
                      >
                        <TableCell
                          align='left'
                          width='30%'
                          sx={{
                            borderBottom: '2px solid #F8F8F8',
                            minWidth: '200px',
                          }}
                        >
                          {row.subTitle}
                        </TableCell>
                        {['induction', 'first', 'second', 'third'].map(
                          (reviewKey) => (
                            <TableCell
                              key={reviewKey}
                              align='center'
                              sx={{
                                borderBottom: '2px solid #F8F8F8',
                                backgroundColor: highlightBlanks && !row.quarter_review?.[reviewKey]
                                  ? 'yellow'
                                  : 'inherit',
                              }}
                            >
                              <FormControl fullWidth size='small'>
                                <Select
                                  displayEmpty
                                  value={row.quarter_review?.[reviewKey] || ''}
                                  fullWidth
                                  size='small'
                                  onChange={(e) =>
                                    handleSelectChange(
                                      row.id,
                                      reviewKey,
                                      e.target.value
                                    )
                                  }
                                >
                                  <MenuItem value='' disabled>
                                    <em>Select a rating</em>
                                  </MenuItem>
                                  {ratingOptions.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Grid className='flex justify-end items-end my-20 mr-24 gap-10'>
              <Grid>
                <SecondaryButton
                  name='Previous Topic'
                  disabled={
                    sampleData?.findIndex(
                      (item) => item.id === singleData?.id
                    ) === 0 ||
                    sampleData?.findIndex(
                      (item) => item.id === singleData?.id
                    ) ===
                      sampleData?.length - 1
                  }
                  onClick={() => {
                    const currentIndex = sampleData?.findIndex(
                      (item) => item.id === singleData?.id
                    )
                    if (currentIndex === -1 || currentIndex === 0) {
                      return
                    }
                    const previousData = sampleData[currentIndex - 1]
                    dispatch(skillsScanAction.setSingleData(previousData))
                  }}
                />
              </Grid>
              <Grid>
                <SecondaryButton name='Save' onClick={saveData} />
              </Grid>
              <Grid>
                <SecondaryButton
                  name='Next Topic'
                  disabled={
                    sampleData?.findIndex(
                      (item) => item.id === singleData?.id
                    ) ===
                    sampleData?.length - 1
                  }
                  onClick={() => {
                    const currentIndex = sampleData?.findIndex(
                      (item) => item.id === singleData?.id
                    )
                    if (
                      currentIndex === -1 ||
                      currentIndex === sampleData.length - 1
                    )
                      return
                    const nextTopic = sampleData[currentIndex + 1]
                    dispatch(skillsScanAction.setSingleData(nextTopic))
                  }}
                />
              </Grid>
              <Grid>
                <SecondaryButton
                  name='Next'
                  onClick={() => handleTabChange('', 2)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default TNAQuestionaire
