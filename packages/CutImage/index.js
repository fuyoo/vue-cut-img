import CutImage from "./src/index.vue"
const install = app => app.component(CutImage.name, CutImage)
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue)
}
export default {
    install,
    CutImage
}