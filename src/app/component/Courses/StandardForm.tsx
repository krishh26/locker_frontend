import React from 'react'
import { TextField, Typography, Autocomplete, Box } from '@mui/material'
import Style from './style.module.css'

interface GatewayCourse {
  course_id: number
  course_name: string
  course_code: string
  active: string
}

interface StandardFormProps {
  courseData: any
  courseHandler: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  handleAutocompleteChange: (field: string, value: string | null) => void
  validationErrors: any
  edit: string
  courseType: string[]
  courseLevels: string[]
  gatewayCourses?: GatewayCourse[]
}

const StandardForm: React.FC<StandardFormProps> = ({
  courseData,
  courseHandler,
  handleAutocompleteChange,
  validationErrors,
  edit,
  courseType,
  courseLevels,
  gatewayCourses = [],
}) => {
  React.useEffect(() => {
    if (courseData.assigned_gateway_id) {
      const foundGateway = gatewayCourses.find(
        (gateway) =>
          gateway.course_id ===
          (typeof courseData.assigned_gateway_id === 'string'
            ? parseInt(courseData.assigned_gateway_id)
            : courseData.assigned_gateway_id)
      )
    }
  }, [courseData, gatewayCourses])
  return (
    <>
      {/* Course Name, Code, LAD Code */}
      <Box className='m-12 flex flex-col justify-between gap-12 sm:flex-row'>
        <div className='w-1/3'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Course Name<sup>*</sup>
          </Typography>
          <TextField
            name='course_name'
            size='small'
            placeholder='Enter Course Name'
            required
            fullWidth
            value={courseData.course_name}
            onChange={courseHandler}
            disabled={edit === 'view'}
            className={Style.input_feald}
            error={validationErrors.course_name}
            helperText={
              validationErrors.course_name ? 'Course name is required' : ''
            }
          />
        </div>
        <div className='w-1/3'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Course Code<sup>*</sup>
          </Typography>
          <TextField
            name='course_code'
            size='small'
            placeholder='Enter Course Code'
            required
            fullWidth
            value={courseData.course_code}
            onChange={courseHandler}
            disabled={edit === 'view'}
            className={Style.input_feald}
            error={validationErrors.course_code}
            helperText={
              validationErrors.course_code ? 'Course code is required' : ''
            }
          />
        </div>
        <div className='w-1/3'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Course Level<sup>*</sup>
          </Typography>
          <Autocomplete
            size='small'
            value={courseData?.level || null}
            onChange={(_, newValue) =>
              handleAutocompleteChange('level', newValue)
            }
            disabled={edit === 'view'}
            options={courseLevels}
            className={Style.last2_input_feald}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder='Select a Course Level...'
                error={validationErrors.level}
                helperText={
                  validationErrors.level ? 'Course level is required' : ''
                }
              />
            )}
          />
        </div>
      </Box>

      {/* Course Type, Level, Expiration Date */}
      <Box className='m-12 flex flex-col justify-between gap-12 sm:flex-row'>
        <div className='w-1/3'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Expiration Date
          </Typography>
          <TextField
            name='operational_start_date'
            size='small'
            type='date'
            fullWidth
            value={courseData.operational_start_date}
            onChange={courseHandler}
            disabled={edit === 'view'}
            className={Style.last2_input_feald}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </div>
        <div className='w-1/3'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Active
          </Typography>
          <Autocomplete
            size='small'
            value={courseData?.active || 'Yes'}
            onChange={(_, newValue) =>
              handleAutocompleteChange('active', newValue)
            }
            disabled={edit === 'view'}
            options={['Yes', 'No']}
            className={Style.last2_input_feald}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField {...params} placeholder='Active' />
            )}
          />
        </div>
        <div className='w-1/3'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Included in Off The Job Calculation
          </Typography>
          <Autocomplete
            size='small'
            value={courseData?.included_in_off_the_job || 'No'}
            onChange={(_, newValue) =>
              handleAutocompleteChange('included_in_off_the_job', newValue)
            }
            disabled={edit === 'view'}
            options={['Yes', 'No']}
            className={Style.last2_input_feald}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder='Included in Off The Job Calculation'
              />
            )}
          />
        </div>
      </Box>
      {/* Duration of Course */}
      <Box className='m-12 flex flex-col justify-between gap-12 sm:flex-row'>
        <div className='w-1/2'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Duration of Course<sup>*</sup>
          </Typography>
          <Autocomplete
            size='small'
            value={courseData?.duration_period || null}
            onChange={(_, newValue) =>
              handleAutocompleteChange('duration_period', newValue)
            }
            disabled={edit === 'view'}
            options={['Days', 'Weeks', 'Months', 'Years']}
            className={Style.last2_input_feald}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder='Select a Duration Period...'
                required
                error={validationErrors.duration_period}
                helperText={
                  validationErrors.duration_period
                    ? 'Duration Period is required'
                    : ''
                }
              />
            )}
          />
        </div>
        <div className='w-1/2'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            &nbsp;
          </Typography>
          <TextField
            name='duration_value'
            size='small'
            placeholder='Enter duration value...'
            fullWidth
            value={courseData.duration_value || ''}
            onChange={courseHandler}
            disabled={edit === 'view'}
            className={Style.last2_input_feald}
            type='number'
          />
        </div>
      </Box>

      {/* Two Page Standard Link */}
      <Box className='m-12 flex flex-col justify-between gap-4 sm:flex-row'>
        <div className='w-full pr-2'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Two Page Standard Link
          </Typography>
          <div className='flex justify-between gap-8'>
            <TextField
              name='two_page_standard_link'
              size='small'
              placeholder='Enter Two Page Standard Link'
              fullWidth
              value={courseData.two_page_standard_link || ''}
              onChange={courseHandler}
              disabled={edit === 'view'}
              className={Style.input_feald}
            />
            <button
              className='ml-2 px-14 py-4 bg-pink-500 text-white rounded-md'
              onClick={() =>
                window.open(courseData.two_page_standard_link, '_blank')
              }
              disabled={!courseData.two_page_standard_link || edit === 'view'}
            >
              →
            </button>
          </div>
        </div>
      </Box>

      <Box className='m-12 flex flex-col justify-between gap-4 sm:flex-row'>
        <div className='w-full pr-2'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Assessment Plan Link
          </Typography>
          <div className='flex gap-8'>
            <TextField
              name='assessment_plan_link'
              size='small'
              placeholder='Enter Assessment Plan Link'
              fullWidth
              value={courseData.assessment_plan_link || ''}
              onChange={courseHandler}
              disabled={edit === 'view'}
              className={Style.input_feald}
            />
            <button
              className='ml-2 px-14 py-4 bg-pink-500 text-white rounded-md'
              onClick={() =>
                window.open(courseData.assessment_plan_link, '_blank')
              }
              disabled={!courseData.assessment_plan_link || edit === 'view'}
            >
              →
            </button>
          </div>
        </div>
      </Box>

      <Box className='m-12 flex flex-col justify-between gap-4 sm:flex-row'>
        <div className='w-full'>
          <Typography
            sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}
            className={Style.name}
          >
            Gateway Assigned
          </Typography>
          <Autocomplete
            size='small'
            value={
              courseData?.assigned_gateway_id && gatewayCourses.length > 0
                ? gatewayCourses.find((gateway) => {
                    const gatewayId =
                      typeof courseData.assigned_gateway_id === 'string'
                        ? parseInt(courseData.assigned_gateway_id)
                        : courseData.assigned_gateway_id
                    return gateway.course_id === gatewayId
                  }) || null
                : null
            }
            onChange={(_, newValue) => {
              handleAutocompleteChange(
                'assigned_gateway_id',
                newValue ? newValue.course_id.toString() : null
              )
              if (newValue) {
                handleAutocompleteChange(
                  'assigned_gateway_name',
                  newValue.course_name
                )
              } else {
                handleAutocompleteChange('assigned_gateway_name', '')
              }
            }}
            disabled={edit === 'view'}
            options={gatewayCourses}
            getOptionLabel={(option) => {
              if (!option) return ''
              return `${option.course_name} (${option.course_code})`
            }}
            className={Style.input_feald}
            isOptionEqualToValue={(option, value) => {
              if (!option || !value) return false
              const optionId =
                typeof option.course_id === 'string'
                  ? parseInt(option.course_id)
                  : option.course_id
              const valueId =
                typeof value.course_id === 'string'
                  ? parseInt(value.course_id)
                  : value.course_id
              return optionId === valueId
            }}
            renderInput={(params) => {
              if (
                courseData?.assigned_gateway_id &&
                courseData?.assigned_gateway_name &&
                !gatewayCourses.find(
                  (g) =>
                    g.course_id === parseInt(courseData.assigned_gateway_id)
                )
              ) {
                return (
                  <TextField
                    {...params}
                    placeholder='Select a Gateway Course...'
                    helperText={`Selected Gateway: ${courseData.assigned_gateway_name}`}
                  />
                )
              }
              return (
                <TextField
                  {...params}
                  placeholder='Select a Gateway Course...'
                />
              )
            }}
          />
        </div>
      </Box>
    </>
  )
}

export default StandardForm
