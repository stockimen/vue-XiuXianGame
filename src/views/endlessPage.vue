<template>
  <div class="endless-tower">
    <div class="battle-info">
      <div class="player-info">
        <tag class="name" type="primary" @click="openInfo('player')">
          {{ player.name }}
        </tag>
        <el-progress
          :percentage="playerProgress"
          :status="playerStatus"
          :format="playerHealth"
          :stroke-width="20"
          text-inside
        />
      </div>
      <div class="vs">VS</div>
      <div class="monster-info" v-if="monster">
        <tag class="name" type="danger" @click="openInfo('monster')">{{ monster.name }}</tag>
        <el-progress
          :percentage="monsterProgress"
          :status="monsterStatus"
          :format="monsterhealth"
          :stroke-width="20"
          text-inside
        />
      </div>
    </div>
    <div class="actions">
      <el-button v-for="(item, index) in buttonData" :key="index" @click="item.click" :disabled="item.disabled">
        {{ item.text }}
      </el-button>
    </div>
    <div class="sweep-info">
      <div v-if="isSweepCoolingDown" style="text-align: center; margin-bottom: 10px;">
        <el-countdown title="扫荡冷却" :value="player.sweepCooldownEnd" />
      </div>
      <el-row>
        <el-col :span="6" v-for="(item, index) in sweepData" :key="index">
          <div class="el-statistic">
            <div class="el-statistic__head" v-text="item.name" />
            <div class="el-statistic__content">
              <span class="el-statistic__number" v-text="item.suffix" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <el-scrollbar class="battle-log" height="300px" ref="scrollbar" always>
      <p v-for="(log, index) in battleLogs" :key="index" v-html="log" />
    </el-scrollbar>
  </div>
</template>

<script setup>
  // 标签组件
  import tag from '@/components/tag.vue'
  // boss
  import boss from '@/plugins/boss'
  // 装备
  import equip from '@/plugins/equip'
  // 怪物
  import monsters from '@/plugins/monster'
  import combatSystem from '@/plugins/combat'
  import { ElMessageBox } from 'element-plus'
  import { checkAchievements } from '@/plugins/achievementChecker'
  import { recordEquipmentGain, recordStat, setStatMax } from '@/plugins/playerStats'
  import { useRouter } from 'vue-router'
  import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
  import { useMainStore } from '@/plugins/store'
  import { smoothScrollToBottom, formatNumberToChineseUnit, genre, levels, gameNotifys } from '@/plugins/game'

  const router = useRouter()
  const store = useMainStore()
  // 玩家数据
  const player = ref(store.player)
  // 怪物数据
  const monster = ref(null)
  const observer = ref(null)
  // 战斗日志
  const battleLogs = ref([])
  // 当前层数
  const currentFloor = ref(1)
  // 扫荡结果（显示最近一次）
  const sweepResults = ref({
    expGain: 0,
    moneyGain: 0,
    equipmentGained: 0
  })
  // 玩家气血状态
  const playerStatus = ref('success')
  // 怪物气血状态
  const monsterStatus = ref('success')
  // 是否自动战斗
  const isAutoFighting = ref(false)
  // 自动战斗时间间隔
  const autoFightInterval = ref(null)
  const scrollbar = ref(null)
  // 扫荡冷却计时
  const now = ref(Date.now())
  let tickTimer = null

  // 扫荡冷却状态
  const isSweepCoolingDown = computed(() => now.value < (player.value.sweepCooldownEnd || 0))
  // 扫荡相关信息
  const sweepData = computed(() => {
    const sweepHours = 1 + (player.value.reincarnation || 0)
    return [
      { name: '扫荡时长', suffix: `${sweepHours}小时` },
      { name: '获得修为', suffix: `${formatNumberToChineseUnit(sweepResults.value.expGain)}点` },
      { name: '获得灵石', suffix: `${formatNumberToChineseUnit(sweepResults.value.moneyGain)}块` },
      { name: '获得装备', suffix: `${formatNumberToChineseUnit(sweepResults.value.equipmentGained)}件` }
    ]
  })

  // 按钮
  const buttonData = computed(() => {
    return [
      {
        text: isAutoFighting.value ? '停止对战' : '自动对战',
        click: () => toggleAutoFight(),
        disabled: player.value.health <= 0
      },
      {
        text: '进行对战',
        click: () => fight(),
        disabled: isAutoFighting.value || !monster.value || player.value.health <= 0
      },
      {
        text: isSweepCoolingDown.value ? '扫荡冷却中' : '开始扫荡',
        click: () => executeSweep(),
        disabled: isSweepCoolingDown.value || isAutoFighting.value || player.value.health <= 0
      },
      { text: '撤退回家', click: () => retreat(), disabled: false }
    ]
  })

  // 玩家血量进度条
  const playerProgress = computed(() => {
    return (player.value.health / player.value.maxHealth) * 100
  })

  // 怪物血量进度条
  const monsterProgress = computed(() => {
    return (monster.value.health / monster.value.maxHealth) * 100
  })

  // 监听battleLogs变化
  watch(
    () => battleLogs.value,
    () => setupObserver(),
    {
      deep: true
    }
  )

  // 监听玩家血量变化
  watch(
    () => player.value.health,
    () => {
      const { health, maxHealth } = player.value
      playerStatus.value = getStatus(health, maxHealth)
    }
  )

  // 监听怪物血量变化
  watch(
    () => monster.value?.health,
    () => {
      if (monster.value) {
        const { health, maxHealth } = monster.value
        monsterStatus.value = getStatus(health, maxHealth)
      }
    }
  )

  // 玩家气血
  const playerHealth = () => {
    const { health, maxHealth } = player.value
    return `${Math.max(0, health)} / ${Math.max(0, maxHealth)}`
  }

  // 怪物气血
  const monsterhealth = () => {
    const { health, maxHealth } = monster.value
    return `${Math.max(0, health)} / ${Math.max(0, maxHealth)}`
  }

  // 动态修改血量状态
  const getStatus = (health, maxHealth) => {
    const num = (health / maxHealth) * 100
    return num >= 70 ? 'success' : num >= 30 ? 'warning' : 'exception'
  }

  // 生成当前层的怪物
  const generateMonster = () => {
    // 根据当前层数计算怪物等级
    const level = currentFloor.value * 2
    const health = monsters.monster_Health(level)
    monster.value = {
      // 名称
      name: monsters.monster_Names(level),
      // 等级
      level,
      // 闪避率
      dodge: monsters.monster_Criticalhitrate(level),
      // 攻击
      attack: monsters.monster_Attack(level),
      // 气血
      health: health,
      // 防御
      defense: monsters.monster_Defense(level),
      // 最大气血
      maxHealth: health,
      // 暴击率
      critical: monsters.monster_Criticalhitrate(level)
    }
    // 日志
    battleLogs.value.push(`你遇到了本层的守护者: ${monster.value.name}`)
  }
  // 打开双方信息弹窗
  const openInfo = type => {
    const isPlayer = type == 'player'
    const info = isPlayer ? player.value : monster.value
    ElMessageBox.confirm('', isPlayer ? player.value.name : info.name, {
      center: true,
      message: `<div class="monsterinfo">
      <div class="monsterinfo-box">
      <p>气血: ${formatNumberToChineseUnit(info.health)}</p>
      <p>攻击: ${formatNumberToChineseUnit(info.attack)}</p>
      <p>防御: ${formatNumberToChineseUnit(info.defense)}</p>
      <p>闪避率: ${info.dodge > 0 ? (info.dodge * 100 > 100 ? 100 : (info.dodge * 100).toFixed(2)) : 0}%</p>
      <p>暴击率: ${info.critical > 0 ? (info.critical * 100 > 100 ? 100 : (info.critical * 100).toFixed(2)) : 0}%</p>
      </div>
    </div>`,
      showCancelButton: false,
      confirmButtonText: '知道了',
      dangerouslyUseHTMLString: true
    }).catch(() => {})
  }

  // 进行战斗
  const fight = () => {
    // 被击败
    if (player.value.health <= 0) {
      handlePlayerDefeat()
      return
    }
    // 重新生成新怪物
    if (!monster.value || monster.value.health <= 0) {
      generateMonster()
      return
    }
    // 玩家攻击怪物
    const playerAttackResult = combatSystem.executeCombatRound(player.value, monster.value)
    generateCombatLog(player.value.name, monster.value.name, playerAttackResult)
    // 检查怪物是否被击败
    if (monster.value.health <= 0) {
      handleMonsterDefeat()
      return
    }
    // 怪物攻击玩家
    const monsterAttackResult = combatSystem.executeCombatRound(monster.value, player.value)
    generateCombatLog(monster.value.name, player.value.name, monsterAttackResult)
    // 玩家是否被击败
    if (player.value.health <= 0) {
      handlePlayerDefeat()
    }
  }

  const generateCombatLog = (attackerName, defenderName, result) => {
    if (!result.isHit) {
      battleLogs.value.push(`${attackerName}的攻击被${defenderName}闪避了。`)
    } else {
      let logMessage = `${attackerName}对${defenderName}造成了${result.damage}点伤害`
      if (result.isCritical) logMessage += '（暴击！）'
      logMessage += `，${defenderName}剩余${result.remainingHealth}气血。`
      battleLogs.value.push(logMessage)
    }
  }

  // 处理怪物被击败的情况
  const handleMonsterDefeat = () => {
    // 修为
    const expGain = Math.floor(monster.value.level * 100)
    // 灵石
    const moneyGain = Math.floor(monster.value.level * 2)
    // 增加修为
    player.value.cultivation += expGain
    // 增加灵石
    player.value.props.money += moneyGain
    // 日志
    battleLogs.value.push(`你击败了 ${monster.value.name}！`)
    battleLogs.value.push(`获得了 ${expGain}点修为和 ${moneyGain}灵石`)
    // 随机获得装备
    getRandomEquipment()
    // 增加层数
    currentFloor.value++
    // 检查是否是10的倍数层，且之前没有获得过该层的奖励
    if (currentFloor.value % 5 === 0 && !player.value.rewardedTowerFloors.includes(currentFloor.value)) {
      player.value.props.cultivateDan += 500
      player.value.rewardedTowerFloors.push(currentFloor.value)
      battleLogs.value.push(`恭喜你通过第 ${currentFloor.value} 层，获得额外奖励：500培养丹！`)
    }
    // 如果当前层数大于最高层数
    if (currentFloor.value > player.value.highestTowerFloor) {
      player.value.highestTowerFloor = currentFloor.value
      setStatMax(player.value, 'highestTowerFloor', currentFloor.value)
    }
    checkAchievements(player.value, 'battle')
    // 日志
    battleLogs.value.push(`成功通过第 ${currentFloor.value - 1} 层，自动前往第 ${currentFloor.value} 层`)
    // 生成新的怪物（下一层）
    generateMonster()
  }

  // 处理玩家被击败的情况
  const handlePlayerDefeat = () => {
    recordStat(player.value, 'deathCount')
    checkAchievements(player.value, 'battle')
    if (isAutoFighting.value) {
      battleLogs.value.push('你被击败了，自动对战为你回满气血并继续挑战。')
      battleLogs.value.push(`${monster.value.name}: ${boss.drawPrize(monster.value.level).text}`)
      player.value.health = player.value.maxHealth
      generateMonster()
      return
    }
    // 日志
    battleLogs.value.push('你被击败了！挑战结束。')
    battleLogs.value.push(`${monster.value.name}: ${boss.drawPrize(monster.value.level).text}`)
    // 关闭自动战斗
    isAutoFighting.value = false
    // 停止自动战斗
    stopAutoFight()
  }
  // 切换自动战斗状态
  const toggleAutoFight = () => {
    // 切换自动战斗状态
    isAutoFighting.value = !isAutoFighting.value
    // 启动自动战斗
    if (isAutoFighting.value) autoFightInterval.value = setInterval(fight, 1000)
    // 停止自动战斗
    else stopAutoFight()
  }

  // 停止自动战斗
  const stopAutoFight = () => {
    clearInterval(autoFightInterval.value)
    autoFightInterval.value = null
  }

  // 撤退
  const retreat = () => {
    // 关闭自动战斗
    isAutoFighting.value = false
    // 停止自动战斗
    stopAutoFight()
    router.push('/home')
  }

  // 随机获得装备
  const getRandomEquipment = () => {
    let equipItem = {}
    let exp = Math.floor(player.value.maxCultivation / 100)
    exp = exp ? exp : 1
    const randomInt = equip.getRandomInt(1, 4)
    // 神兵
    if (randomInt == 1) equipItem = equip.equip_Weapons(player.value.level)
    // 护甲
    else if (randomInt == 2) equipItem = equip.equip_Armors(player.value.level)
    // 灵宝
    else if (randomInt == 3) equipItem = equip.equip_Accessorys(player.value.level)
    // 法器
    else if (randomInt == 4) equipItem = equip.equip_Sutras(player.value.level)
    battleLogs.value.push(
      `你发现了一个宝箱，打开后获得${levels[equipItem.quality]}${equipItem.name}(${genre[equipItem.type]})`
    )
    // 如果背包满了就不增加装备
    if (player.value.inventory.length >= player.value.backpackCapacity)
      battleLogs.value.push(`当前装备背包容量已满, 该装备自动丢弃, 转生可增加背包容量`)
    else {
      player.value.inventory.push(equipItem)
      recordEquipmentGain(player.value, equipItem)
      checkAchievements(player.value, 'forge', player.value)
    }
  }

  // 执行扫荡（冷却机制）
  const executeSweep = () => {
    const reincarnation = player.value.reincarnation || 0
    const sweepHours = 1 + reincarnation
    const totalSettlements = sweepHours * 120 // 每小时120次结算（每30秒一次）

    // 计算产出
    const expPerSettlement = Math.floor(currentFloor.value * 10)
    const moneyPerSettlement = Math.floor(currentFloor.value * 10)
    const totalExp = expPerSettlement * totalSettlements
    const totalMoney = moneyPerSettlement * totalSettlements

    // 发放修为和灵石
    player.value.cultivation += totalExp
    player.value.props.money += totalMoney
    player.value.jishaNum += totalSettlements
    recordStat(player.value, 'exploreKills', totalSettlements)

    // 装备掉落：10%概率，背包满则丢弃
    let equipmentGained = 0
    let equipmentDropped = 0
    for (let i = 0; i < totalSettlements; i++) {
      if (Math.random() < 0.1) {
        if (player.value.inventory.length < player.value.backpackCapacity) {
          getRandomEquipment()
          equipmentGained++
        } else {
          equipmentDropped++
        }
      }
    }

    // 更新扫荡结果（显示用）
    sweepResults.value = { expGain: totalExp, moneyGain: totalMoney, equipmentGained }

    // 设置冷却
    player.value.sweepCooldownEnd = Date.now() + sweepHours * 3600 * 1000

    // 日志
    battleLogs.value.push(
      `扫荡完成！${sweepHours}小时产出：${formatNumberToChineseUnit(totalExp)}修为、${formatNumberToChineseUnit(totalMoney)}灵石、${equipmentGained}件装备${equipmentDropped > 0 ? `（${equipmentDropped}件因背包已满丢弃）` : ''}`
    )
    checkAchievements(player.value, 'battle')
    checkAchievements(player.value, 'forge', player.value)
  }

  const setupObserver = () => {
    const element = scrollbar.value?.wrapRef
    if (element) {
      observer.value = new MutationObserver(() => smoothScrollToBottom(element))
      observer.value.observe(element, { subtree: true, childList: true })
    }
  }
  const stopObserving = () => {
    if (observer.value) {
      observer.value.disconnect()
      observer.value = null
    }
  }

  const formatTime = seconds => {
    if (seconds < 60) {
      return `${seconds}秒`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}分钟${remainingSeconds}秒`
    } else {
      const hours = Math.floor(seconds / 3600)
      seconds %= 3600
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${hours}小时${minutes}分钟${remainingSeconds}秒`
    }
  }

  onMounted(() => {
    //检查成就
    const newAchievements = checkAchievements(player.value, 'battle')
    newAchievements.forEach(achievement => {
      gameNotifys({
        title: '获得成就提示',
        message: `恭喜你完成了${achievement.name}成就`
      })
    })
    // 当前层数
    currentFloor.value = player.value.highestTowerFloor > 1 ? player.value.highestTowerFloor - 1 : 1
    setStatMax(player.value, 'highestTowerFloor', player.value.highestTowerFloor || 1)
    // 生成日志
    battleLogs.value.push(
      `欢迎来到无尽塔, 这里是无尽塔的第${currentFloor.value}层, 你的爬塔最高记录为${player.value.highestTowerFloor}层`
    )
    // 生成怪物
    generateMonster()
    // 冷却倒计时驱动
    tickTimer = setInterval(() => { now.value = Date.now() }, 1000)
  })

  onUnmounted(() => {
    // 停止自动战斗
    stopAutoFight()
    clearInterval(tickTimer)
    stopObserving()
  })
</script>

<style scoped>
  .battle-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .player-info,
  .monster-info {
    width: 45%;
  }

  .name {
    margin-bottom: 10px;
  }

  .vs {
    font-size: 24px;
    font-weight: bold;
    color: var(--el-color-info);
  }

  .actions {
    display: flex;
    justify-content: space-between;
    margin: 20px 0;
  }

  .actions .el-button {
    flex: 1;
    margin: 0 5px;
  }

  .sweep-info {
    margin: 20px 0;
  }

  .sweep-info p {
    margin: 5px 0;
    font-size: 14px;
  }

  .battle-log {
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 5px;
  }

  .battle-log p {
    margin: 5px 0;
    font-size: 14px;
    color: var(--el-color-info);
  }

  @media (max-width: 768px) {
    .player-info,
    .monster-info {
      width: 100%;
      margin-bottom: 20px;
    }

    .vs {
      margin: 0 10px;
    }

    .actions {
      flex-wrap: wrap;
    }

    .actions .el-button {
      flex: 1 0 40%;
      margin: 5px;
    }
  }
</style>
