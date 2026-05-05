import App from './App.vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import router from '@/plugins/router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.use(ElementPlus)
app.mount('#app')

// 每小时检查一次 Service Worker 更新
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    setInterval(() => registration.update(), 60 * 60 * 1000)
  })
}

// 每10分钟自动领取在线礼包（金手指）
import { useMainStore } from '@/plugins/store'
import { gameNotifys } from '@/plugins/game'
const store = useMainStore()
setInterval(() => {
  if (store.player.autoOnlineGift) {
    const mult = store.player.reincarnation || 1
    store.player.props.money += 1000 * mult
    store.player.props.cultivateDan += 1000 * mult
    store.player.props.strengtheningStone += 1000 * mult
    store.player.props.qingyuan += 10 * mult
    store.player.props.flying += 10 * mult
    gameNotifys({
      title: '在线礼包',
      message: `自动领取成功！获得${1000 * mult}灵石、${1000 * mult}培养丹、${1000 * mult}炼器石、${10 * mult}情缘、${10 * mult}传送符`
    })
  }
}, 60 * 1000)
