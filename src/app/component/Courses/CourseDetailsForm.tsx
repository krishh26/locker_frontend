/**
 * CourseDetailsForm.tsx
 *
 * Course Details form component using React Hook Form
 * Handles form fields for all course types (Qualification, Standard, Gateway)
 */

import React from 'react'
import {
  Controller,
  Control,
  FieldErrors,
  UseFormSetValue,
} from 'react-hook-form'
import {
  Box,
  TextField,
  Typography,
  Autocomplete,
  Grid,
  IconButton,
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { CourseFormData, CourseCoreType } from 'app/store/courseBuilderSlice'
import {
  COURSE_TYPES,
  COURSE_LEVELS,
  AWARDING_BODY_OPTIONS,
  DURATION_PERIODS,
  YES_NO_OPTIONS,
  GatewayCourse,
} from './courseConstants'

interface CourseDetailsFormProps {
  control: Control<CourseFormData>
  errors: FieldErrors<CourseFormData>
  courseCoreType: CourseCoreType
  edit?: 'create' | 'edit' | 'view'
  gatewayCourses?: GatewayCourse[]
  setValue?: UseFormSetValue<CourseFormData>
}

const CourseDetailsForm: React.FC<CourseDetailsFormProps> = ({
  control,
  errors,
  courseCoreType,
  edit = 'create',
  gatewayCourses = [],
  setValue,
}) => {
  const isViewMode = edit === 'view'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Row 1: Course Name, Course Code, Course Level */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography
            variant='body2'
            sx={{ mb: 1, fontWeight: 500 }}
            component='label'
          >
            Course Name <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Controller
            name='course_name'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                size='small'
                placeholder='Enter Course Name'
                required
                disabled={isViewMode}
                error={!!errors.course_name}
                helperText={errors.course_name?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography
            variant='body2'
            sx={{ mb: 1, fontWeight: 500 }}
            component='label'
          >
            Course Code <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Controller
            name='course_code'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                size='small'
                placeholder='Enter Course Code'
                required
                disabled={isViewMode}
                error={!!errors.course_code}
                helperText={errors.course_code?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography
            variant='body2'
            sx={{ mb: 1, fontWeight: 500 }}
            component='label'
          >
            Course Level <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Controller
            name='level'
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={COURSE_LEVELS as readonly string[]}
                disabled={isViewMode}
                value={field.value || null}
                onChange={(_, newValue) => field.onChange(newValue || '')}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder='Select Course Level'
                    size='small'
                    error={!!errors.level}
                    helperText={errors.level?.message}
                  />
                )}
              />
            )}
          />
        </Grid>
      </Grid>

      {/* Row 2: Course Guidance */}
      {courseCoreType === 'Qualification' && (
        <Box>
          <Typography
            variant='body2'
            sx={{ mb: 1, fontWeight: 500 }}
            component='label'
          >
            Course Guidance <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Controller
            name='brand_guidelines'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={4}
                placeholder='Enter Course Guidance'
                required
                disabled={isViewMode}
                error={!!errors.brand_guidelines}
                helperText={errors.brand_guidelines?.message}
              />
            )}
          />
        </Box>
      )}

      {courseCoreType === 'Qualification' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography
              variant='body2'
              sx={{ mb: 1, fontWeight: 500 }}
              component='label'
            >
              Course Type <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Controller
              name='course_type'
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={COURSE_TYPES as readonly string[]}
                  disabled={isViewMode}
                  value={field.value || null}
                  onChange={(_, newValue) => field.onChange(newValue || '')}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder='Select Course Type'
                      size='small'
                      error={!!errors.course_type}
                      helperText={errors.course_type?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography
              variant='body2'
              sx={{ mb: 1, fontWeight: 500 }}
              component='label'
            >
              Operational Start Date
            </Typography>
            <Controller
              name='operational_start_date'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size='small'
                  type='date'
                  disabled={isViewMode}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={!!errors.operational_start_date}
                  helperText={errors.operational_start_date?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography
              variant='body2'
              sx={{ mb: 1, fontWeight: 500 }}
              component='label'
            >
              Sector
            </Typography>
            <Controller
              name='sector'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size='small'
                  placeholder='Enter Sector'
                  disabled={isViewMode}
                  error={!!errors.sector}
                  helperText={errors.sector?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      )}

      {/* Row 4: Qualification-specific fields or Standard/Gateway fields */}
      {courseCoreType === 'Qualification' ? (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography
                variant='body2'
                sx={{ mb: 1, fontWeight: 500 }}
                component='label'
              >
                Total Credits
              </Typography>
              <Controller
                name='total_credits'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    type='number'
                    placeholder='Enter Total Credits'
                    disabled={isViewMode}
                    error={!!errors.total_credits}
                    helperText={errors.total_credits?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography
                variant='body2'
                sx={{ mb: 1, fontWeight: 500 }}
                component='label'
              >
                Guided Learning Hours
              </Typography>
              <Controller
                name='guided_learning_hours'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    type='number'
                    placeholder='Enter Guided Learning Hours'
                    disabled={isViewMode}
                    error={!!errors.guided_learning_hours}
                    helperText={errors.guided_learning_hours?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography
                variant='body2'
                sx={{ mb: 1, fontWeight: 500 }}
                component='label'
              >
                Recommended Minimum Age
              </Typography>
              <Controller
                name='recommended_minimum_age'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    type='number'
                    placeholder='Enter Recommended Minimum Age'
                    disabled={isViewMode}
                    error={!!errors.recommended_minimum_age}
                    helperText={errors.recommended_minimum_age?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography
                variant='body2'
                sx={{ mb: 1, fontWeight: 500 }}
                component='label'
              >
                Overall Grading Type
              </Typography>
              <Controller
                name='overall_grading_type'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    placeholder='Enter Overall Grading Type'
                    disabled={isViewMode}
                    error={!!errors.overall_grading_type}
                    helperText={errors.overall_grading_type?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography
                variant='body2'
                sx={{ mb: 1, fontWeight: 500 }}
                component='label'
              >
                Awarding Body
              </Typography>
              <Controller
                name='awarding_body'
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={AWARDING_BODY_OPTIONS as readonly string[]}
                    disabled={isViewMode}
                    value={field.value || null}
                    onChange={(_, newValue) => field.onChange(newValue || '')}
                    isOptionEqualToValue={(option, value) => option === value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder='Select Awarding Body'
                        size='small'
                        error={!!errors.awarding_body}
                        helperText={errors.awarding_body?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>
        </>
      ) : courseCoreType === 'Standard' ? (
        <>
          {/* Standard-specific fields */}
          {/* Row 1: Expiration Date, Active, Included in Off The Job Calculation */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography
                variant='body2'
                sx={{ mb: 1, fontWeight: 500 }}
                component='label'
              >
                Expiration Date
              </Typography>
              <Controller
                name='operational_start_date'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    type='date'
                    disabled={isViewMode}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    error={!!errors.operational_start_date}
                    helperText={errors.operational_start_date?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography
                variant='body2'
                sx={{ mb: 1, fontWeight: 500 }}
                component='label'
              >
                Active
              </Typography>
              <Controller
                name='active'
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={YES_NO_OPTIONS as readonly string[]}
                    disabled={isViewMode}
                    value={field.value || 'Yes'}
                    onChange={(_, newValue) =>
                      field.onChange(newValue || 'Yes')
                    }
                    isOptionEqualToValue={(option, value) => option === value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder='Active'
                        size='small'
                        error={!!errors.active}
                        helperText={errors.active?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography
                variant='body2'
                sx={{ mb: 1, fontWeight: 500 }}
                component='label'
              >
                Included in Off The Job Calculation
              </Typography>
              <Controller
                name='included_in_off_the_job'
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={YES_NO_OPTIONS as readonly string[]}
                    disabled={isViewMode}
                    value={field.value || 'Yes'}
                    onChange={(_, newValue) =>
                      field.onChange(newValue || 'Yes')
                    }
                    isOptionEqualToValue={(option, value) => option === value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder='Included in Off The Job Calculation'
                        size='small'
                        error={!!errors.included_in_off_the_job}
                        helperText={errors.included_in_off_the_job?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Row 2: Duration of Course (Period and Value) */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography
                variant='body2'
                sx={{ mb: 1, fontWeight: 500 }}
                component='label'
              >
                Duration of Course <span style={{ color: 'red' }}>*</span>
              </Typography>
              <Controller
                name='duration_period'
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={DURATION_PERIODS as readonly string[]}
                    disabled={isViewMode}
                    value={field.value || null}
                    onChange={(_, newValue) => field.onChange(newValue || '')}
                    isOptionEqualToValue={(option, value) => option === value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder='Select a Duration Period...'
                        size='small'
                        required
                        error={!!errors.duration_period}
                        helperText={errors.duration_period?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography
                variant='body2'
                sx={{ mb: 1, fontWeight: 500 }}
                component='label'
              >
                &nbsp;
              </Typography>
              <Controller
                name='duration_value'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    type='number'
                    placeholder='Enter duration value...'
                    disabled={isViewMode}
                    error={!!errors.duration_value}
                    helperText={errors.duration_value?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Row 3: Two Page Standard Link */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant='body2'
                sx={{ mb: 1, fontWeight: 500 }}
                component='label'
              >
                Two Page Standard Link
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Controller
                  name='two_page_standard_link'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size='small'
                      placeholder='Enter Two Page Standard Link'
                      disabled={isViewMode}
                      error={!!errors.two_page_standard_link}
                      helperText={errors.two_page_standard_link?.message}
                    />
                  )}
                />
                <Controller
                  name='two_page_standard_link'
                  control={control}
                  render={({ field }) => (
                    <IconButton
                      sx={{
                        bgcolor: '#ec4899',
                        color: 'white',
                        '&:hover': { bgcolor: '#db2777' },
                        minWidth: '56px',
                        width: '56px',
                        height: '56px',
                      }}
                      disabled={!field.value || isViewMode}
                      onClick={() => {
                        if (field.value) {
                          window.open(field.value, '_blank')
                        }
                      }}
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  )}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Row 4: Assessment Plan Link */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant='body2'
                sx={{ mb: 1, fontWeight: 500 }}
                component='label'
              >
                Assessment Plan Link
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Controller
                  name='assessment_plan_link'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size='small'
                      placeholder='Enter Assessment Plan Link'
                      disabled={isViewMode}
                      error={!!errors.assessment_plan_link}
                      helperText={errors.assessment_plan_link?.message}
                    />
                  )}
                />
                <Controller
                  name='assessment_plan_link'
                  control={control}
                  render={({ field }) => (
                    <IconButton
                      sx={{
                        bgcolor: '#ec4899',
                        color: 'white',
                        '&:hover': { bgcolor: '#db2777' },
                        minWidth: '56px',
                        width: '56px',
                        height: '56px',
                      }}
                      disabled={!field.value || isViewMode}
                      onClick={() => {
                        if (field.value) {
                          window.open(field.value, '_blank')
                        }
                      }}
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  )}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Row 5: Gateway Assigned */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant='body2'
                sx={{ mb: 1, fontWeight: 500 }}
                component='label'
              >
                Gateway Assigned
              </Typography>
              <Controller
                name='assigned_gateway_id'
                control={control}
                render={({ field }) => {
                  const selectedGateway = gatewayCourses.find(
                    (gateway) =>
                      gateway.course_id ===
                      (typeof field.value === 'string'
                        ? parseInt(field.value)
                        : field.value)
                  )

                  return (
                    <Autocomplete
                      options={gatewayCourses}
                      disabled={isViewMode}
                      value={selectedGateway || null}
                      onChange={(_, newValue) => {
                        field.onChange(newValue ? newValue.course_id : null)
                        // Also update assigned_gateway_name
                        if (setValue) {
                          setValue(
                            'assigned_gateway_name',
                            newValue ? newValue.course_name : ''
                          )
                        }
                      }}
                      getOptionLabel={(option) => {
                        if (!option) return ''
                        return `${option.course_name} (${option.course_code})`
                      }}
                      isOptionEqualToValue={(option, value) => {
                        if (!option || !value) return false
                        return option.course_id === value.course_id
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder='Select a Gateway Course...'
                          size='small'
                          error={!!errors.assigned_gateway_id}
                          helperText={errors.assigned_gateway_id?.message}
                        />
                      )}
                    />
                  )
                }}
              />
            </Grid>
          </Grid>
        </>
      ) : (
        // Gateway-specific fields (if any)
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography
              variant='body2'
              sx={{ mb: 1, fontWeight: 500 }}
              component='label'
            >
              Guided Learning Hours
            </Typography>
            <Controller
              name='guided_learning_hours'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size='small'
                  type='number'
                  placeholder='Enter Guided Learning Hours'
                  disabled={isViewMode}
                  error={!!errors.guided_learning_hours}
                  helperText={errors.guided_learning_hours?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography
              variant='body2'
              sx={{ mb: 1, fontWeight: 500 }}
              component='label'
            >
              Recommended Minimum Age
            </Typography>
            <Controller
              name='recommended_minimum_age'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size='small'
                  type='number'
                  placeholder='Enter Recommended Minimum Age'
                  disabled={isViewMode}
                  error={!!errors.recommended_minimum_age}
                  helperText={errors.recommended_minimum_age?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography
              variant='body2'
              sx={{ mb: 1, fontWeight: 500 }}
              component='label'
            >
              Overall Grading Type
            </Typography>
            <Controller
              name='overall_grading_type'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size='small'
                  placeholder='Enter Overall Grading Type'
                  disabled={isViewMode}
                  error={!!errors.overall_grading_type}
                  helperText={errors.overall_grading_type?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default CourseDetailsForm
