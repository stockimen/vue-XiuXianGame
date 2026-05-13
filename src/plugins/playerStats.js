export const equipmentQualityKeys = ['info', 'success', 'primary', 'purple', 'warning', 'danger', 'pink']

export const createDefaultStats = () => ({
  bossDefeated: 0,
  deathCount: 0,
  playerReincarnation: 0,
  playerLevel: 0,
  petReincarnation: 0,
  petLevel: 0,
  wifeReincarnation: 0,
  wifeLevel: 0,
  wifeCount: 0,
  equipmentDecomposed: 0,
  wifeMarried: 0,
  thunderStruck: 0,
  enhanceSuccess: 0,
  enhanceFail: 0,
  enhanceLevelTotal: 0,
  highestTowerFloor: 0,
  mapSteps: 0,
  exploreKills: 0,
  age: 0,
  equipmentQualityGained: equipmentQualityKeys.reduce((result, key) => {
    result[key] = 0
    return result
  }, {})
})

const numberValue = (value, fallback = 0) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

export const ensureWifeData = wife => {
  if (!wife || !wife.name) return wife
  wife.level = Math.max(1, numberValue(wife.level, 1))
  wife.reincarnation = numberValue(wife.reincarnation, 0)
  wife.dodge = numberValue(wife.dodge, 0)
  wife.attack = numberValue(wife.attack, 0)
  wife.health = numberValue(wife.health, 0)
  wife.defense = numberValue(wife.defense, 0)
  wife.critical = numberValue(wife.critical, 0)
  if (!wife.initial) {
    const level = Math.max(1, wife.level)
    const base = 1.10 + (wife.reincarnation || 0) * 0.01
    const factor = Math.max(1, Math.pow(base, level))
    wife.initial = {
      dodge: wife.dodge,
      attack: Math.max(1, Math.floor(wife.attack / factor)),
      health: Math.max(1, Math.floor(wife.health / factor)),
      defense: Math.max(1, Math.floor(wife.defense / factor)),
      critical: wife.critical
    }
  }
  ;['dodge', 'attack', 'health', 'defense', 'critical'].forEach(key => {
    wife.initial[key] = numberValue(wife.initial[key], 0)
  })
  return wife
}

export const ensurePlayerData = player => {
  if (!player) return player
  player.props = player.props || {}
  ;['money', 'flying', 'qingyuan', 'rootBone', 'currency', 'cultivateDan', 'strengtheningStone'].forEach(key => {
    player.props[key] = numberValue(player.props[key], 0)
  })
  player.achievement = player.achievement || {}
  ;['pet', 'monster', 'equipment', 'boss', 'reincarnation', 'wife', 'cultivate', 'companion', 'battle', 'forge'].forEach(key => {
    if (!Array.isArray(player.achievement[key])) player.achievement[key] = []
  })
  if (!Array.isArray(player.achievementBonusApplied)) player.achievementBonusApplied = []
  if (!player.achievementBonusTotal || typeof player.achievementBonusTotal !== 'object') {
    player.achievementBonusTotal = { dodge: 0, critical: 0 }
  }
  player.achievementBonusTotal.dodge = numberValue(player.achievementBonusTotal.dodge, 0)
  player.achievementBonusTotal.critical = numberValue(player.achievementBonusTotal.critical, 0)
  const defaultStats = createDefaultStats()
  player.stats = { ...defaultStats, ...(player.stats || {}) }
  player.stats.equipmentQualityGained = {
    ...defaultStats.equipmentQualityGained,
    ...(player.stats.equipmentQualityGained || {})
  }
  equipmentQualityKeys.forEach(key => {
    player.stats.equipmentQualityGained[key] = numberValue(player.stats.equipmentQualityGained[key], 0)
  })
  Object.keys(defaultStats).forEach(key => {
    if (key !== 'equipmentQualityGained') player.stats[key] = numberValue(player.stats[key], 0)
  })
  player.stats.playerReincarnation = Math.max(player.stats.playerReincarnation, numberValue(player.reincarnation, 0))
  player.stats.playerLevel = Math.max(player.stats.playerLevel, numberValue(player.level, 1))
  player.stats.petLevel = Math.max(player.stats.petLevel, numberValue(player.pet?.level, 0))
  player.stats.wifeLevel = Math.max(
    player.stats.wifeLevel,
    ...(player.wifes || []).map(w => numberValue(w.level, 0))
  )
  player.stats.wifeCount = Math.max(player.stats.wifeCount, (player.wifes || []).length)
  player.stats.highestTowerFloor = Math.max(player.stats.highestTowerFloor, numberValue(player.highestTowerFloor, 1))
  player.stats.age = Math.max(player.stats.age, numberValue(player.age, 1))
  player.stats.equipmentQualityGained.pink = Math.max(
    player.stats.equipmentQualityGained.pink,
    numberValue(player.pinkEquipCount, 0)
  )
  player.bossOverdraftCooldownEnd = numberValue(player.bossOverdraftCooldownEnd, 0)
  if (!Array.isArray(player.rewardedTowerFloors)) player.rewardedTowerFloors = []
  if (!Array.isArray(player.wifes)) player.wifes = []
  if (!Array.isArray(player.pets)) player.pets = []
  if (!Array.isArray(player.inventory)) player.inventory = []
  if (!Array.isArray(player.sellingEquipmentData)) player.sellingEquipmentData = []
  ensureWifeData(player.wife)
  player.wifes.forEach(ensureWifeData)
  return player
}

export const recordStat = (player, key, amount = 1) => {
  ensurePlayerData(player)
  if (player.stats[key] === undefined) player.stats[key] = 0
  if (key === 'playerReincarnation') {
    player.stats.playerReincarnation = Math.max(player.stats.playerReincarnation, player.reincarnation || 0)
    return
  }
  player.stats[key] += amount
}

export const setStatMax = (player, key, value) => {
  ensurePlayerData(player)
  if (player.stats[key] === undefined) player.stats[key] = 0
  player.stats[key] = Math.max(player.stats[key], numberValue(value, 0))
}

export const recordEquipmentGain = (player, item) => {
  ensurePlayerData(player)
  const quality = item?.quality
  if (equipmentQualityKeys.includes(quality)) player.stats.equipmentQualityGained[quality]++
}

export const recordEquipmentDecompose = (player, count = 1) => {
  recordStat(player, 'equipmentDecomposed', count)
}
