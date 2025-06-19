import {
  Card,
  CardContent,
  Checkbox,
  Grid,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
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

const isPastMonth = (dateString: string) => {
  const [monthName, year] = dateString.split('-')
  const targetDate = new Date(`${monthName} 1, ${year}`)
  const now = new Date()

  // Consider it past if it's before the first day of the current month
  return targetDate < new Date(now.getFullYear(), now.getMonth(), 1)
}

const TNAQuestionaire = (props) => {
  const { handleTabChange } = props
  const { singleData, selectedCourse } = useSelector(selectSkillsScan)
  const { courseData, learner } = useSelector(selectLearnerManagement)
  const [expanded, setExpanded] = useState<string | false>(() => {
    return selectedCourse?.progressByDate?.[0]?.date || false
  })

  const handleChange =
    (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }

  const expandIcon = (value: string) =>
    expanded === value ? <RemoveIcon /> : <AddIcon />

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
  }, [courseData])

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
  }

  const handleHighlightBlanksChange = (event) => {
    setHighlightBlanks(event.target.checked)
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
        <Grid className='w-full border-grey-600 border-2 h-fit my-20'>
          <Card
            variant='outlined'
            className='rounded-0 bg-grey-200 border-b-grey-600 border-b-2 '
            elevation={0}
          >
            <CardContent>
              <Typography className='font-500 text-center'>
                {singleData.standardUnits}
              </Typography>
            </CardContent>
          </Card>

          {selectedCourse &&
            selectedCourse?.progressByDate?.map((date, index) => {
              const isDisabled = date.isDisabled

              return (
                <Accordion
                  key={index}
                  expanded={!isDisabled && expanded === date.date}
                  onChange={!isDisabled ? handleChange(date.date) : undefined}
                  sx={{
                    opacity: isDisabled ? 0.5 : 1,
                    backgroundColor: isDisabled ? '#f3f4f6' : 'white',
                    pointerEvents: isDisabled ? 'none' : 'auto',
                  }}
                >
                  <AccordionSummary
                    id={`controlled-panel-header-${index}`}
                    aria-controls={`controlled-panel-content-${index}`}
                    expandIcon={expandIcon(date.date)}
                  >
                    <Typography>{date.date}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer sx={{ maxHeight: 'auto' }}>
                      <Table
                        sx={{ minWidth: 650, heighFaddt: '100%' }}
                        size='small'
                        aria-label='simple table'
                      >
                        <TableHead className='bg-grey-300 '>
                          <TableRow>
                            <TableCell>Topic</TableCell>
                            <TableCell align='center'>
                              Skill To Be Demonstrated
                            </TableCell>
                            <TableCell align='center'>☹️ - Not sure</TableCell>
                            <TableCell align='center'>😖 - Never</TableCell>
                            <TableCell align='center'>🙂 - Sometimes</TableCell>
                            <TableCell align='center'>😁 - Always</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {singleData?.subUnit?.map((row, index) => {
                            const selectedMonth =
                              row?.progressByDate &&
                              row.progressByDate?.find(
                                (historyDate) => historyDate.date === date.date
                              )
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
                                  component='th'
                                  scope='row'
                                  sx={{
                                    borderBottom: '2px solid #F8F8F8',
                                  }}
                                >
                                  {index === 0 ? singleData?.title : null}
                                </TableCell>
                                <TableCell
                                  align='center'
                                  sx={{
                                    borderBottom: '2px solid #F8F8F8',
                                  }}
                                >
                                  {row.subTitle}
                                </TableCell>
                                <TableCell
                                  align='center'
                                  sx={{
                                    borderBottom: '2px solid #F8F8F8',
                                    backgroundColor:
                                      highlightBlanks &&
                                      selectedMonth.rating == null
                                        ? 'yellow'
                                        : 'inherit',
                                  }}
                                >
                                  <Radio
                                    checked={selectedMonth?.rating === 1}
                                    onClick={() => radioHandler(row.id, 1)}
                                    disabled={isPastMonth(date.date)}
                                  />
                                </TableCell>
                                <TableCell
                                  align='center'
                                  sx={{
                                    borderBottom: '2px solid #F8F8F8',
                                    backgroundColor:
                                      highlightBlanks &&
                                      selectedMonth.rating == null
                                        ? 'yellow'
                                        : 'inherit',
                                  }}
                                >
                                  <Radio
                                    checked={selectedMonth?.rating === 2}
                                    onClick={() => radioHandler(row.id, 2)}
                                    disabled={isPastMonth(date.date)}
                                  />
                                </TableCell>
                                <TableCell
                                  align='center'
                                  sx={{
                                    borderBottom: '2px solid #F8F8F8',
                                    backgroundColor:
                                      highlightBlanks &&
                                      selectedMonth.rating == null
                                        ? 'yellow'
                                        : 'inherit',
                                  }}
                                >
                                  <Radio
                                    checked={selectedMonth?.rating === 3}
                                    onClick={() => radioHandler(row.id, 3)}
                                    disabled={isPastMonth(date.date)}
                                  />
                                </TableCell>
                                <TableCell
                                  align='center'
                                  sx={{
                                    borderBottom: '2px solid #F8F8F8',
                                    backgroundColor:
                                      highlightBlanks &&
                                      selectedMonth.rating == null
                                        ? 'yellow'
                                        : 'inherit',
                                  }}
                                >
                                  <Radio
                                    checked={selectedMonth?.rating === 4}
                                    disabled={isPastMonth(date.date)}
                                    onClick={() => radioHandler(row.id, 4)}
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              )
            })}

          <Grid className='flex justify-end items-end my-20 mr-24 gap-10'>
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
  )
}

export default TNAQuestionaire
