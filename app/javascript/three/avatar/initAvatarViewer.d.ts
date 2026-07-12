export type AvatarPartStat = {
  level: string
  progress: number
  next_level: string | null
}

export type AvatarLevels = {
  upper_body: AvatarPartStat
  core: AvatarPartStat
  lower_body: AvatarPartStat
}

export function initAvatarViewer(): Promise<void>
export function destroyAvatarViewer(): void
