import { createI18n } from "vue-i18n";
import messages from './index'

const i18n = createI18n({
    locale: localStorage.lang || 'zh', //默认中文
    messages: {
        zh: Object.assign(messages.zh, messages.ZhLocale),
        en: Object.assign(messages.en, messages.EhLocale),
        de: Object.assign(messages.de, messages.DeLocale),
    },
    globalInjection: true, // 允许组件级别的国际化
})

export default i18n
