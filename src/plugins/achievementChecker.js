import achievement from '@/plugins/achievement'
import { ensurePlayerData } from '@/plugins/playerStats'

const achievementMap = {
  cultivate: () => achievement.cultivate(),
  companion: () => achievement.companion(),
  battle: () => achievement.battle(),
  forge: () => achievement.forge()
}

let lastCheckTime = 0
const CHECK_THROTTLE_MS = 2000

export const checkAchievements = (player, type, data, options = {}) => {
  ensurePlayerData(player)
  const now = Date.now()
  if (!options.skipAward && now - lastCheckTime < CHECK_THROTTLE_MS) return []
  lastCheckTime = now
  const newAchievements = []
  const types = type ? [type] : Object.keys(achievementMap)
  types.forEach(itemType => {
    const list = achievementMap[itemType]?.() || []
    list.forEach(item => {
      const sourceData = resolveSourceData(player, item, data)
      if (!sourceData || !checkCondition(item.condition, sourceData)) return
      const wasCompleted = hasCompleted(player, itemType, item.id)
      if (!wasCompleted) {
        player.achievement[itemType].push({ id: item.id })
        if (!options.skipAward) player.props.cultivateDan += item.award || 0
      }
      if (applyAchievementBonus(player, itemType, item)) {
        if (!wasCompleted) newAchievements.push(item)
      } else if (!wasCompleted) {
        newAchievements.push(item)
      }
    })
  })
  return newAchievements
}

export const applyCompletedAchievementBonuses = player => {
  ensurePlayerData(player)
  // 先减去已记录的旧加成（老存档时为 0，安全）
  const oldTotal = player.achievementBonusTotal
  player.dodge = Math.max(0, (player.dodge || 0) - (oldTotal.dodge || 0))
  player.critical = Math.max(0, (player.critical || 0) - (oldTotal.critical || 0))
  // 清除已应用标记，重新计算
  player.achievementBonusApplied = []
  player.achievementBonusTotal = { dodge: 0, critical: 0 }
  const applied = []
  Object.entries(achievementMap).forEach(([type, getter]) => {
    getter().forEach(item => {
      if (hasCompleted(player, type, item.id) && applyAchievementBonus(player, type, item)) {
        applied.push(item)
      }
    })
  })
  return applied
}

export const getAchievementProgress = (player, item, data) => {
  ensurePlayerData(player)
  const sourceData = resolveSourceData(player, item, data)
  return Object.entries(item.condition || {}).map(([key, target]) => ({
    key,
    current: getValueByPath(sourceData, key),
    target
  }))
}

const resolveSourceData = (player, item, data) => {
  if (item.conditionSource === 'pet') return data || getBestPet(player, item.condition)
  if (item.conditionSource === 'stats') return player.stats
  return data || player
}

const getBestPet = (player, condition) => {
  const pets = [...(player.pets || [])]
  if (player.pet?.name) pets.push(player.pet)
  if (pets.length === 0) return undefined
  // 先尝试找完全满足条件的
  const perfect = pets.find(pet => checkCondition(condition, pet))
  if (perfect) return perfect
  // 没有完全满足的，按达标属性数量评分选最优
  const conditionEntries = Object.entries(condition || {})
  if (conditionEntries.length === 0) return pets[0]
  let bestPet = pets[0]
  let bestScore = 0
  for (const pet of pets) {
    let score = 0
    for (const [key, target] of conditionEntries) {
      const current = getValueByPath(pet, key)
      if (current !== undefined && current >= target) score++
    }
    if (score > bestScore) {
      bestScore = score
      bestPet = pet
    }
  }
  return bestPet
}

const hasCompleted = (player, type, id) => {
  const list = player.achievement[type] || []
  return list.some(item => item.id === id)
}

const achievementKey = (type, id) => `${type}:${id}`

const applyAchievementBonus = (player, type, item) => {
  const key = achievementKey(type, item.id)
  if (player.achievementBonusApplied.includes(key)) return false
  applyBonus(player, item.titleBonus || {})
  const bonus = item.titleBonus || {}
  if (bonus.dodge) player.achievementBonusTotal.dodge = (player.achievementBonusTotal.dodge || 0) + bonus.dodge
  if (bonus.critical) player.achievementBonusTotal.critical = (player.achievementBonusTotal.critical || 0) + bonus.critical
  player.achievementBonusApplied.push(key)
  return true
}

const applyBonus = (player, bonus) => {
  Object.entries(bonus).forEach(([key, value]) => {
    if (key === 'dodge') {
      player.dodge = Math.min(0.7, (player.dodge || 0) + value)
    } else if (key === 'critical') {
      player.critical = Math.min(0.7, (player.critical || 0) + value)
    }
  })
}

const checkCondition = (condition, data) => {
  for (const [key, value] of Object.entries(condition || {})) {
    const current = getValueByPath(data, key)
    if (current === undefined || current < value) return false
  }
  return true
}

const getValueByPath = (data, path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], data)
}
