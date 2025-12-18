// Helper functions for Evidence Library

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const getStatusColor = (status: string): 'default' | 'warning' | 'success' | 'info' => {
  switch (status.toLowerCase()) {
    case 'not started':
      return 'default'
    case 'in progress':
      return 'warning'
    case 'completed':
      return 'success'
    case 'submitted':
      return 'info'
    default:
      return 'default'
  }
}

export const displayValue = (value: string | null | undefined): string => {
  if (value === null || value === undefined || value === 'null' || value === '' || value.trim() === '') {
    return '-'
  }
  return value
}

export const truncateText = (text: string | null, maxLength: number = 50): string => {
  if (!text || text === 'null' || text.trim() === '') return '-'
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

export const getUnitMappingStatus = (
  evidence: { units: any[] | null },
  unitId: string | number
): { learnerMap: boolean; trainerMap: boolean; signedOff: boolean } => {
  const defaultStatus = { learnerMap: false, trainerMap: false, signedOff: false }
  
  if (!evidence.units || !Array.isArray(evidence.units)) return defaultStatus
  
  // Check if any unit in evidence matches the unitId
  for (const unit of evidence.units) {
    // Check unit-level mapping
    if (unit.id === unitId) {
      return {
        learnerMap: unit.learnerMap === true,
        trainerMap: unit.trainerMap === true,
        signedOff: unit.signedOff === true
      }
    }
    // Check subUnit-level mapping
    if (unit.subUnit && Array.isArray(unit.subUnit)) {
      for (const subUnit of unit.subUnit) {
        if (subUnit.id === unitId) {
          return {
            learnerMap: subUnit.learnerMap === true,
            trainerMap: subUnit.trainerMap === true,
            signedOff: subUnit.signedOff === true
          }
        }
      }
    }
  }
  
  return defaultStatus
}

