import { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectLearnerManagement } from 'app/store/learnerManagement'

export const useFundingBands = () => {
  const { learner } = useSelector(selectLearnerManagement)
  const [fundingBands, setFundingBands] = useState<any[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editedAmount, setEditedAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Sync API data to local state
  useEffect(() => {
    if (
      learner?.available_funding_bands &&
      learner?.available_funding_bands?.length > 0
    ) {
      setFundingBands(learner?.available_funding_bands)
    }
  }, [learner])

  const handleEditClick = (band: any) => {
    setEditingId(band.id)
    setEditedAmount(band.amount.toString())
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditedAmount('')
  }

  const handleSave = async (band: any) => {
    const newAmount = Number(editedAmount)

    // Optimistically update local state
    setFundingBands((prev) =>
      prev.map((b) => (b.id === band.id ? { ...b, amount: newAmount } : b))
    )

    setEditingId(null)
    setEditedAmount('')

    try {
      setIsUpdating(true)
      // TODO: Implement actual API call here
      // await updateFundingBand({
      //   id: band.id,
      //   course_id: band.course.course_id,
      //   band_name: band.band_name,
      //   amount: newAmount,
      // }).unwrap()
    } catch (err) {
      console.error('Error updating amount', err)
      // rollback if failed
      setFundingBands(learner?.available_funding_bands || [])
    } finally {
      setIsUpdating(false)
    }
  }

  // Total Funding (live updates)
  const totalFunding = useMemo(() => {
    return fundingBands.reduce((sum: number, band: any) => {
      if (editingId === band.id) {
        // while typing, use editedAmount
        return sum + Number(editedAmount || 0)
      }
      return sum + Number(band.amount || 0)
    }, 0)
  }, [fundingBands, editedAmount, editingId])

  return {
    fundingBands,
    editingId,
    editedAmount,
    isLoading,
    isUpdating,
    totalFunding,
    handleEditClick,
    handleCancel,
    handleSave,
  }
}
