/**
 * In-memory predictions store
 * In production, this should be moved to a database table
 */

let predictionsStore: any[] = []

export function storePredictions(userId: string, predictions: any[]) {
  // Add user ID and unique IDs
  const withIds = predictions.map(p => ({
    ...p,
    id: `pred_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    userId,
    createdAt: new Date().toISOString(),
  }))

  // Remove old predictions for this user
  predictionsStore = predictionsStore.filter(p => p.userId !== userId)
  
  // Add new predictions
  predictionsStore.push(...withIds)

  // Keep only last 100 predictions total
  if (predictionsStore.length > 100) {
    predictionsStore = predictionsStore.slice(-100)
  }

  return withIds
}

export function getPredictions(userId: string, status?: string, limit?: number) {
  let filtered = predictionsStore.filter(p => p.userId === userId)
  
  if (status) {
    filtered = filtered.filter(p => p.status === status)
  }
  
  if (limit) {
    filtered = filtered.slice(0, limit)
  }
  
  return filtered
}

export function updatePrediction(userId: string, predictionId: string, updates: any) {
  const index = predictionsStore.findIndex(
    p => p.id === predictionId && p.userId === userId
  )
  
  if (index !== -1) {
    predictionsStore[index] = { ...predictionsStore[index], ...updates }
    return predictionsStore[index]
  }
  
  return null
}

export function getAllPredictions(userId: string) {
  return predictionsStore.filter(p => p.userId === userId)
}
