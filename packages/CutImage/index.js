import VueCutImg from "./src/index.vue"
const install = app => app.component(VueCutImg.name, VueCutImg)
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue)
}
export default {
    install,
    VueCutImg
}