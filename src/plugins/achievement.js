const achievement = {
  all() {
    return [
      { name: '修炼', type: 'cultivate', data: this.cultivate() },
      { name: '伴侣', type: 'companion', data: this.companion() },
      { name: '战斗', type: 'battle', data: this.battle() },
      { name: '炼器', type: 'forge', data: this.forge() }
    ]
  },
  cultivate() {
    return [
      this.create(1, '初入仙途', '人物境界达到天仙一层', 'stats', { playerLevel: 36 }, { dodge: 0.002 }, 2000, 'level'),
      this.create(2, '小有所成', '人物境界达到金仙一层', 'stats', { playerLevel: 81 }, { critical: 0.003 }, 5000, 'level'),
      this.create(3, '大道将成', '人物境界达到九天玄仙九层', 'stats', { playerLevel: 144 }, { dodge: 0.005 }, 15000, 'level'),
      this.create(4, '一转入道', '人物转生1次', 'stats', { playerReincarnation: 1 }, { critical: 0.003 }, 5000, 'reincarnation'),
      this.create(5, '三转归真', '人物转生3次', 'stats', { playerReincarnation: 3 }, { dodge: 0.005 }, 15000, 'reincarnation'),
      this.create(6, '五转证道', '人物转生5次', 'stats', { playerReincarnation: 5 }, { dodge: 0.005, critical: 0.005 }, 30000, 'reincarnation'),
      this.create(7, '百岁修仙', '寿元达到100岁', 'stats', { age: 100 }, { critical: 0.001 }, 1000, 'age'),
      this.create(8, '千岁长生', '寿元达到1000岁', 'stats', { age: 1000 }, { dodge: 0.003 }, 10000, 'age'),
      this.create(9, '万岁不老', '寿元达到10000岁', 'stats', { age: 10000 }, { critical: 0.005 }, 20000, 'age'),
      this.create(10, '天雷初临', '打坐被雷劈10次', 'stats', { thunderStruck: 10 }, { dodge: 0.002 }, 3000, 'thunder'),
      this.create(11, '雷劫洗礼', '打坐被雷劈50次', 'stats', { thunderStruck: 50 }, { critical: 0.004 }, 8000, 'thunder'),
      this.create(12, '雷劫淬体', '打坐被雷劈200次', 'stats', { thunderStruck: 200 }, { dodge: 0.005 }, 15000, 'thunder'),
      this.create(13, '万雷不灭', '打坐被雷劈1000次', 'stats', { thunderStruck: 1000 }, { critical: 0.008 }, 30000, 'thunder'),
      this.create(14, '雷道大成', '打坐被雷劈5000次', 'stats', { thunderStruck: 5000 }, { dodge: 0.01 }, 50000, 'thunder')
    ]
  },
  companion() {
    return [
      this.create(1, '气血神宠', '灵宠气血达到23500', 'pet', { health: 23500 }, { critical: 0.005 }, 1000, 'petStat'),
      this.create(2, '攻击神宠', '灵宠攻击达到7050', 'pet', { attack: 7050 }, { dodge: 0.005 }, 1000, 'petStat'),
      this.create(3, '防御神宠', '灵宠防御达到705', 'pet', { defense: 705 }, { dodge: 0.003 }, 1000, 'petStat'),
      this.create(4, '闪避神宠', '灵宠闪避率达到47%', 'pet', { dodge: 0.47 }, { dodge: 0.01 }, 1000, 'petStat'),
      this.create(5, '暴击神宠', '灵宠暴击率达到47%', 'pet', { critical: 0.47 }, { critical: 0.01 }, 1000, 'petStat'),
      this.create(
        6, '灵宠天花板', '灵宠全属性达标', 'pet',
        { dodge: 0.47, health: 23500, attack: 7050, defense: 705, critical: 0.47 },
        { dodge: 0.005, critical: 0.005 }, 10000, 'petStat'
      ),
      this.create(7, '灵宠初境', '灵宠境界达到50', 'stats', { petLevel: 50 }, { critical: 0.002 }, 2000, 'petLevel'),
      this.create(8, '灵宠大成', '灵宠境界达到满级', 'stats', { petLevel: 144 }, { dodge: 0.005 }, 8000, 'petLevel'),
      this.create(9, '灵宠一转', '灵宠转生1次', 'stats', { petReincarnation: 1 }, { critical: 0.002 }, 3000, 'petReincarnation'),
      this.create(10, '灵宠五转', '灵宠转生5次', 'stats', { petReincarnation: 5 }, { dodge: 0.005 }, 15000, 'petReincarnation'),
      this.create(11, '情定今生', '拥有1位道侣', 'stats', { wifeCount: 1 }, { dodge: 0.002 }, 3000, 'wifeCount'),
      this.create(12, '风流仙人', '拥有3位道侣', 'stats', { wifeCount: 3 }, { critical: 0.003 }, 5000, 'wifeCount'),
      this.create(13, '情场得意', '拥有5位道侣', 'stats', { wifeCount: 5 }, { dodge: 0.005 }, 10000, 'wifeCount'),
      this.create(14, '坐拥佳丽', '拥有10位道侣', 'stats', { wifeCount: 10 }, { dodge: 0.008, critical: 0.005 }, 20000, 'wifeCount'),
      this.create(15, '道侣初境', '道侣境界达到50', 'stats', { wifeLevel: 50 }, { critical: 0.002 }, 2000, 'wifeLevel'),
      this.create(16, '道侣大成', '道侣境界达到满级', 'stats', { wifeLevel: 144 }, { dodge: 0.004 }, 8000, 'wifeLevel'),
      this.create(17, '道侣一转', '道侣转生1次', 'stats', { wifeReincarnation: 1 }, { critical: 0.003 }, 5000, 'wifeReincarnation'),
      this.create(18, '道侣五转', '道侣转生5次', 'stats', { wifeReincarnation: 5 }, { dodge: 0.006 }, 12000, 'wifeReincarnation')
    ]
  },
  battle() {
    return [
      this.create(1, '斩妖新锐', '击杀100个怪物', 'stats', { exploreKills: 100 }, { critical: 0.002 }, 3000, 'kills'),
      this.create(2, '斩妖有成', '击杀500个怪物', 'stats', { exploreKills: 500 }, { dodge: 0.003 }, 8000, 'kills'),
      this.create(3, '斩妖宗师', '击杀2000个怪物', 'stats', { exploreKills: 2000 }, { critical: 0.005 }, 15000, 'kills'),
      this.create(4, '斩妖无极', '击杀10000个怪物', 'stats', { exploreKills: 10000 }, { dodge: 0.005 }, 25000, 'kills'),
      this.create(5, '万妖屠戮', '击杀100000个怪物', 'stats', { exploreKills: 100000 }, { critical: 0.008 }, 50000, 'kills'),
      this.create(6, '初斩魔尊', '击败世界Boss1次', 'stats', { bossDefeated: 1 }, { dodge: 0.002 }, 5000, 'boss'),
      this.create(7, 'Boss猎手', '击败世界Boss10次', 'stats', { bossDefeated: 10 }, { critical: 0.004 }, 12000, 'boss'),
      this.create(8, 'Boss克星', '击败世界Boss50次', 'stats', { bossDefeated: 50 }, { dodge: 0.006 }, 30000, 'boss'),
      this.create(9, '挑战者', '通关无尽塔100层', 'stats', { highestTowerFloor: 100 }, { critical: 0.005 }, 10000, 'tower'),
      this.create(10, '征服者', '通关无尽塔500层', 'stats', { highestTowerFloor: 500 }, { dodge: 0.005 }, 15000, 'tower'),
      this.create(11, '无尽之巅', '通关无尽塔1000层', 'stats', { highestTowerFloor: 1000 }, { critical: 0.01 }, 30000, 'tower'),
      this.create(12, '秘境行者', '探索移动100步', 'stats', { mapSteps: 100 }, { dodge: 0.002 }, 3000, 'map'),
      this.create(13, '秘境老手', '探索移动500步', 'stats', { mapSteps: 500 }, { critical: 0.003 }, 8000, 'map'),
      this.create(14, '秘境传奇', '探索移动2000步', 'stats', { mapSteps: 2000 }, { dodge: 0.005 }, 15000, 'map'),
      this.create(15, '足迹遍野', '探索移动10000步', 'stats', { mapSteps: 10000 }, { critical: 0.006 }, 25000, 'map'),
      this.create(16, '万步踏天', '探索移动100000步', 'stats', { mapSteps: 100000 }, { dodge: 0.008 }, 40000, 'map'),
      this.create(17, '渔夫', '累计钓鱼50次', 'player', { fishCount: 50 }, { dodge: 0.002 }, 3000, 'fish'),
      this.create(18, '钓鱼大师', '累计钓鱼200次', 'player', { fishCount: 200 }, { critical: 0.004 }, 8000, 'fish'),
      this.create(19, '钓鱼宗师', '累计钓鱼500次', 'player', { fishCount: 500 }, { dodge: 0.006 }, 15000, 'fish'),
      this.create(20, '大鱼传说', '钓到超过20斤的鱼', 'player', { maxFishWeight: 20 }, { critical: 0.003 }, 5000, 'fish'),
      this.create(21, '海王', '钓到超过30斤的鱼', 'player', { maxFishWeight: 30 }, { dodge: 0.005 }, 10000, 'fish'),
      this.create(22, '幸运之星', '小游戏胜利10次', 'player', { gameWins: 10 }, { dodge: 0.002 }, 5000, 'game'),
      this.create(23, '天选之子', '小游戏胜利100次', 'player', { gameWins: 100 }, { critical: 0.005 }, 10000, 'game'),
      this.create(24, '死中求道', '累计死亡10次', 'stats', { deathCount: 10 }, { dodge: 0.003 }, 3000, 'death'),
      this.create(25, '百折不回', '累计死亡100次', 'stats', { deathCount: 100 }, { critical: 0.006 }, 12000, 'death')
    ]
  },
  forge() {
    return [
      this.create(1, '初试分解', '分解10件装备', 'stats', { equipmentDecomposed: 10 }, { dodge: 0.002 }, 2000, 'decompose'),
      this.create(2, '分解专家', '分解50件装备', 'stats', { equipmentDecomposed: 50 }, { critical: 0.003 }, 5000, 'decompose'),
      this.create(3, '化整为零', '分解200件装备', 'stats', { equipmentDecomposed: 200 }, { dodge: 0.005 }, 12000, 'decompose'),
      this.create(4, '拆解大师', '分解2000件装备', 'stats', { equipmentDecomposed: 2000 }, { critical: 0.008 }, 30000, 'decompose'),
      this.create(5, '粉碎虚空', '分解20000件装备', 'stats', { equipmentDecomposed: 20000 }, { dodge: 0.01 }, 60000, 'decompose'),
      this.create(6, '炼器入门', '炼器成功10次', 'stats', { enhanceSuccess: 10 }, { critical: 0.002 }, 3000, 'enhance'),
      this.create(7, '百炼成钢', '炼器成功100次', 'stats', { enhanceSuccess: 100 }, { dodge: 0.004 }, 10000, 'enhance'),
      this.create(8, '炼器大师', '炼器成功500次', 'stats', { enhanceSuccess: 500 }, { critical: 0.006 }, 25000, 'enhance'),
      this.create(9, '屡败屡炼', '炼器失败50次', 'stats', { enhanceFail: 50 }, { dodge: 0.003 }, 5000, 'enhanceFail'),
      this.create(10, '失败是成功之母', '炼器失败200次', 'stats', { enhanceFail: 200 }, { critical: 0.005 }, 10000, 'enhanceFail'),
      this.create(11, '千锤百炼', '累计提升炼器等级100级', 'stats', { enhanceLevelTotal: 100 }, { dodge: 0.004 }, 12000, 'enhanceLevel'),
      this.create(12, '万锻之魂', '累计提升炼器等级500级', 'stats', { enhanceLevelTotal: 500 }, { critical: 0.007 }, 25000, 'enhanceLevel'),
      this.create(13, '仙器猎人', '获得1件仙阶装备', 'stats', { 'equipmentQualityGained.pink': 1 }, { critical: 0.003 }, 10000, 'qualityPink'),
      this.create(14, '仙器收藏家', '获得5件仙阶装备', 'stats', { 'equipmentQualityGained.pink': 5 }, { dodge: 0.005 }, 50000, 'qualityPink'),
      this.create(15, '玄阶收藏', '获得20件玄阶装备', 'stats', { 'equipmentQualityGained.success': 20 }, { critical: 0.002 }, 2000, 'quality'),
      this.create(16, '地阶收藏', '获得20件地阶装备', 'stats', { 'equipmentQualityGained.primary': 20 }, { dodge: 0.002 }, 3000, 'quality'),
      this.create(17, '天阶收藏', '获得10件天阶装备', 'stats', { 'equipmentQualityGained.purple': 10 }, { critical: 0.003 }, 5000, 'quality'),
      this.create(18, '帝阶收藏', '获得10件帝阶装备', 'stats', { 'equipmentQualityGained.warning': 10 }, { dodge: 0.004 }, 8000, 'quality'),
      this.create(19, '神阶收藏', '获得5件神阶装备', 'stats', { 'equipmentQualityGained.danger': 5 }, { critical: 0.005 }, 10000, 'quality')
    ]
  },
  create(id, name, desc, conditionSource, condition, titleBonus, award, group) {
    return { id, name, desc, award, titleBonus, conditionSource, condition, group }
  }
}

export default achievement
