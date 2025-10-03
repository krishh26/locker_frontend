import { useState, useEffect } from 'react'
import { useGetAcknowledgementsQuery } from 'src/app/store/api/acknowledgementApi'

export const useAcknowledgementPopup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)
  const { data: acknowledgements, isLoading } = useGetAcknowledgementsQuery({})

  // Get the latest acknowledgement
  const latestAcknowledgement = 
    acknowledgements && acknowledgements?.data?.length > 0 
      ? acknowledgements.data[0] 
      : null

  // Check if popup should be shown
  useEffect(() => {
    if (latestAcknowledgement && !isLoading) {
      const lastSeenId = localStorage.getItem('lastSeenAcknowledgementId')
      const lastSeenDate = localStorage.getItem('lastSeenAcknowledgementDate')
      
      // Check if this is a new acknowledgement
      const isNewAcknowledgement = lastSeenId !== latestAcknowledgement.id.toString()
      
      // Check if it's been more than 24 hours since last seen
      const isOldAcknowledgement = lastSeenDate && 
        (Date.now() - parseInt(lastSeenDate)) > 24 * 60 * 60 * 1000 // 24 hours
      
      // Show popup if it's new or old (more than 24 hours)
      if (isNewAcknowledgement || isOldAcknowledgement) {
        setShouldShow(true)
        setIsOpen(true)
      } else {
        setShouldShow(false)
        setIsOpen(false)
      }
    }
  }, [latestAcknowledgement, isLoading])

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleAccept = () => {
    if (latestAcknowledgement) {
      // Mark as seen
      localStorage.setItem('lastSeenAcknowledgementId', latestAcknowledgement.id.toString())
      localStorage.setItem('lastSeenAcknowledgementDate', Date.now().toString())
    }
    setIsOpen(false)
    setShouldShow(false)
  }

  return {
    isOpen,
    shouldShow,
    latestAcknowledgement,
    isLoading,
    handleClose,
    handleAccept,
  }
}
