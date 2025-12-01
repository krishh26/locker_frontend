import React, { useState, useCallback, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Switch,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Chip,
  Alert,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { styled } from '@mui/material/styles'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import AddIcon from '@mui/icons-material/Add'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  useGetSessionTypesQuery,
  useCreateSessionTypeMutation,
  useUpdateSessionTypeMutation,
  useToggleSessionTypeMutation,
  useReorderSessionTypeMutation,
  useDeleteSessionTypeMutation,
  type SessionType,
  type CreateSessionTypePayload,
  type UpdateSessionTypePayload,
} from 'app/store/api/session-type-api'
import { useDispatch } from 'react-redux'
import { showMessage } from 'app/store/fuse/messageSlice'

// Styled Components
const ThemedPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
}))

const ThemedTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
}))

const ThemedTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '& .MuiTableCell-head': {
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
  },
}))

const ThemedTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
}))

const SortableRow = styled(TableRow)<{ isDragging?: boolean }>(
  ({ theme, isDragging }) => ({
    cursor: isDragging ? 'grabbing' : 'grab',
    backgroundColor: isDragging
      ? theme.palette.action.selected
      : theme.palette.background.paper,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  })
)

const DragHandle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'grab',
  color: theme.palette.text.secondary,
  '&:active': {
    cursor: 'grabbing',
  },
}))

// Validation schema
const schema = yup.object().shape({
  name: yup
    .string()
    .required('Session Type name is required')
    .min(1, 'Name cannot be empty'),
  isOffTheJob: yup.boolean(),
  isActive: yup.boolean(),
})

type FormData = {
  name: string
  isOffTheJob: boolean
  isActive: boolean
}

// Sortable Row Component
interface SortableRowProps {
  sessionType: SessionType
  onEdit: (sessionType: SessionType) => void
  onDelete: (id: number) => void
  onToggleActive: (id: number, isActive: boolean) => void
}

const SortableTableRow: React.FC<SortableRowProps> = ({
  sessionType,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sessionType.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <SortableRow
      ref={setNodeRef}
      style={style}
      isDragging={isDragging}
      {...attributes}
    >
      <ThemedTableCell>
        <DragHandle {...listeners}>
          <DragIndicatorIcon />
        </DragHandle>
      </ThemedTableCell>
      <ThemedTableCell>{sessionType.order}</ThemedTableCell>
      <ThemedTableCell>
        <Typography variant='body2' fontWeight={500}>
          {sessionType.name}
        </Typography>
      </ThemedTableCell>
      <ThemedTableCell align='center'>
        <Chip
          label={sessionType.isOffTheJob ? 'Yes' : 'No'}
          color={sessionType.isOffTheJob ? 'primary' : 'default'}
          size='small'
        />
      </ThemedTableCell>
      <ThemedTableCell align='center'>
        <Switch
          checked={sessionType.isActive}
          onChange={(e) => onToggleActive(sessionType.id, e.target.checked)}
          color='primary'
        />
      </ThemedTableCell>
      <ThemedTableCell align='center'>
        <Box display='flex' gap={1} justifyContent='center'>
          <Tooltip title='Edit Session Type'>
            <IconButton
              size='small'
              onClick={() => onEdit(sessionType)}
              color='primary'
            >
              <EditIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Delete Session Type'>
            <IconButton
              size='small'
              onClick={() => onDelete(sessionType.id)}
              color='error'
            >
              <DeleteIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Box>
      </ThemedTableCell>
    </SortableRow>
  )
}

const SessionTypePage: React.FC = () => {
  const theme = useTheme()
  const dispatch = useDispatch<any>()

  // State
  const [openDialog, setOpenDialog] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionTypeToDelete, setSessionTypeToDelete] = useState<number | null>(
    null
  )
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([])

  // API hooks
  const {
    data: sessionTypesData,
    isLoading,
    refetch,
  } = useGetSessionTypesQuery()

  const [createSessionType, { isLoading: isCreating }] =
    useCreateSessionTypeMutation()
  const [updateSessionType, { isLoading: isUpdating }] =
    useUpdateSessionTypeMutation()
  const [toggleSessionType] = useToggleSessionTypeMutation()
  const [reorderSessionType] = useReorderSessionTypeMutation()
  const [deleteSessionType, { isLoading: isDeleting }] =
    useDeleteSessionTypeMutation()

  // Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      isOffTheJob: false,
      isActive: true,
    },
  })

  // Update local state when data changes
  useEffect(() => {
    if (sessionTypesData?.data) {
      const sorted = [...sessionTypesData.data].sort(
        (a, b) => a.order - b.order
      )
      setSessionTypes(sorted)
    }
  }, [sessionTypesData])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handlers
  const handleOpenAddDialog = () => {
    setIsEditMode(false)
    setEditingId(null)
    reset({
      name: '',
      isOffTheJob: false,
      isActive: true,
    })
    setOpenDialog(true)
  }

  const handleOpenEditDialog = (sessionType: SessionType) => {
    setIsEditMode(true)
    setEditingId(sessionType.id)
    reset({
      name: sessionType.name,
      isOffTheJob: sessionType.isOffTheJob,
      isActive: sessionType.isActive,
    })
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setIsEditMode(false)
    setEditingId(null)
    reset({
      name: '',
      isOffTheJob: false,
      isActive: true,
    })
  }

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode && editingId) {
        const payload: UpdateSessionTypePayload = {
          name: data.name,
          is_off_the_job: data.isOffTheJob,
          active: data.isActive,
        }
        await updateSessionType({ id: editingId, payload }).unwrap()
        dispatch(
          showMessage({
            message: 'Session Type updated successfully',
            variant: 'success',
          })
        )
      } else {
        const payload: CreateSessionTypePayload = {
          name: data.name,
          is_off_the_job: data.isOffTheJob,
          active: data.isActive,
        }
        await createSessionType(payload).unwrap()
        dispatch(
          showMessage({
            message: 'Session Type created successfully',
            variant: 'success',
          })
        )
      }
      handleCloseDialog()
      refetch()
    } catch (error: any) {
      dispatch(
        showMessage({
          message: error?.data?.message || 'Failed to save Session Type',
          variant: 'error',
        })
      )
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await toggleSessionType({ id, isActive }).unwrap()
      dispatch(
        showMessage({
          message: `Session Type ${
            isActive ? 'activated' : 'deactivated'
          } successfully`,
          variant: 'success',
        })
      )
      refetch()
    } catch (error: any) {
      dispatch(
        showMessage({
          message: error?.data?.message || 'Failed to update status',
          variant: 'error',
        })
      )
    }
  }

  const handleDeleteClick = (id: number) => {
    setSessionTypeToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (sessionTypeToDelete) {
      try {
        await deleteSessionType(sessionTypeToDelete).unwrap()
        dispatch(
          showMessage({
            message: 'Session Type deleted successfully',
            variant: 'success',
          })
        )
        setDeleteDialogOpen(false)
        setSessionTypeToDelete(null)
        refetch()
      } catch (error: any) {
        dispatch(
          showMessage({
            message: error?.data?.message || 'Failed to delete Session Type',
            variant: 'error',
          })
        )
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sessionTypes.findIndex((st) => st.id === active.id)
    const newIndex = sessionTypes.findIndex((st) => st.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Optimistically update UI
    const newOrder = arrayMove(sessionTypes, oldIndex, newIndex)
    setSessionTypes(newOrder)

    // Determine direction and call API
    const direction = newIndex < oldIndex ? 'UP' : 'DOWN'
    const itemId = active.id as number

    try {
      await reorderSessionType({ id: itemId, direction }).unwrap()
      dispatch(
        showMessage({
          message: 'Order updated successfully',
          variant: 'success',
        })
      )
      refetch()
    } catch (error: any) {
      // Revert on error
      setSessionTypes(sessionTypes)
      dispatch(
        showMessage({
          message: error?.data?.message || 'Failed to update order',
          variant: 'error',
        })
      )
    }
  }

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box className='w-full p-28'>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Box>
          <Typography
            variant='h4'
            component='h1'
            className='font-bold text-gray-800 mb-2'
          >
            Session Types
          </Typography>
          <Typography variant='body2' className='text-gray-600'>
            Manage session types with ordering, active status, and off-the-job
            settings
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{ borderRadius: 2 }}
        >
          Add Session Type
        </Button>
      </Box>

      <ThemedTableContainer as={ThemedPaper}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <ThemedTableHead>
              <TableRow>
                <ThemedTableCell width={50}></ThemedTableCell>
                <ThemedTableCell width={80}>Order</ThemedTableCell>
                <ThemedTableCell>Name</ThemedTableCell>
                <ThemedTableCell align='center'>Off the Job</ThemedTableCell>
                <ThemedTableCell align='center'>Active</ThemedTableCell>
                <ThemedTableCell align='center'>Actions</ThemedTableCell>
              </TableRow>
            </ThemedTableHead>
            <TableBody>
              <SortableContext
                items={sessionTypes.map((st) => st.id)}
                strategy={verticalListSortingStrategy}
              >
                {sessionTypes.map((sessionType) => (
                  <SortableTableRow
                    key={sessionType.id}
                    sessionType={sessionType}
                    onEdit={handleOpenEditDialog}
                    onDelete={handleDeleteClick}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </ThemedTableContainer>

      {sessionTypes.length === 0 && !isLoading && (
        <Box mt={3} textAlign='center'>
          <Alert severity='info'>
            No session types found. Create one to get started.
          </Alert>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          {isEditMode ? 'Edit Session Type' : 'Add Session Type'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box display='flex' flexDirection='column' gap={3} mt={1}>
              <Controller
                name='name'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Session Type Name'
                    fullWidth
                    variant='outlined'
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    required
                  />
                )}
              />

              <Controller
                name='isOffTheJob'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        color='primary'
                      />
                    }
                    label='Off the Job'
                  />
                )}
              />

              <Controller
                name='isActive'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        {...field}
                        checked={field.value}
                        color='primary'
                      />
                    }
                    label='Active'
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} variant='outlined'>
              Cancel
            </Button>
            <Button
              type='submit'
              variant='contained'
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? (
                <CircularProgress size={20} />
              ) : isEditMode ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this session type? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} variant='outlined'>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant='contained'
            color='error'
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SessionTypePage
