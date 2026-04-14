export type ModuleItem = {
  id: number
  title: string
  desc: string
  progress: number
  timeMin: number
  icon: string
  category: 'new' | 'inProgress'
}

export type UserStats = {
  name: string
  streak: number
  xp: number
  level: number
  totalXp: number
}
