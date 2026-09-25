export const groupBy = <T>(array: T[], predicate: (item: T) => string) => {
  return array.reduce((acc, item) => {
    const key = predicate(item)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, T[]>)
}
