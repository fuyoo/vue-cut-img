<template>
  <div class="CutImage">
    <slot name="header">
      <div class="header">
        <span>{{ title }}</span>
        <span class="close" @click="closeFn" v-if="showClose">&times;</span>
      </div>
    </slot>
    <canvas class="cvs" ref="cvs" width="300" height="300" style="background: #fff"></canvas>
    <p style="padding: 5px;margin: 0"></p>
    <input style="width: 100%" :disabled="!img" @input="scaleFn" v-model="scaleOri" type="range" step="0.1" max="500"
           min="1"/>
    <div class="action">
      <button class="btn btn_flash btn_primary" @click="chooseImg">{{ chooseBtn }}</button>
      <span style="padding: 5px"></span>
      <button :disabled="!file" class="btn btn_flash btn_primary" @click="cutFn">{{ cutBtn }}</button>
      <span style="padding: 5px"></span>
    </div>
  </div>
</template>

<script>

export default {
  name: 'VueCutImg',
  props: {
    blob: {
      type: Boolean,
      default: false
    },
    showClose: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: '裁剪图片'
    },
    chooseBtn: {
      type: String,
      default: '选择图片'
    },
    cutBtn: {
      type: String,
      default: '裁剪'
    }
  },
  components: {},
  data() {
    return {
      cvs: null,
      scale: 1,
      scaleOri: 50,
      offset: [0, 0],
      img: null,
      file:null,
    }
  },
  watch: {},
  computed: {},
  created() {
  },
  mounted() {
    this.initCvs()
  },
  methods: {
    chooseImg() {
      this.offset = [0, 0]
      if (this.cvs) {
        this.initCvs()
      }
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.click()
      const _this = this
      input.onchange = function () {
        _this.file = this.files[ 0 ]
        if(_this.file.type.indexOf('image') === -1) {
         return _this.$emit('error',_this.file)
        }
        const f = new FileReader()
        f.onloadend = e => {
          _this.initCvs.call(_this, e.target.result)
        }
        f.readAsDataURL(this.files[ 0 ])
      }
    },
    scaleFn() {
      this.scale = this.scaleOri / 50
      this.cvs.save()
      const { width, height } = this.img
      this.cvs.scale(this.scale, this.scale)
      this.cvs.clearRect(0, 0, 400 / this.scale, 400 / this.scale)
      let [x, y] = this.offset
      this.cvs.translate(x / this.scale, y / this.scale)
      this.cvs.drawImage(this.img, 0, 0, width, height)
      this.cvs.restore()
      this.drawMask()
    },
    initCvs(image) {
      const ctx = this.$refs.cvs.getContext('2d')
      this.cvs = ctx
      if (!image) {
        this.file = null
        ctx.clearRect(0, 0, 400, 400)
        this.drawMask()
        return
      }
      ctx.clearRect(0, 0, 300, 300)
      let scale = this.scale
      let _this = this
      const img = new Image()
      img.src = image
      img.onload = () => {
        this.img = img
        const { width, height } = img
        let pos = this.offset
        ctx.save()
        ctx.scale(scale, scale)
        ctx.drawImage(img, 0, 0, width, height)
        ctx.restore()
        this.drawMask()
        let move = false
        let start = []
        this.$refs.cvs.onmousedown = function (e) {
          scale = _this.scale
          const { clientX, clientY } = e
          start = [clientX, clientY]
          move = true
          this.style.cursor = 'grabbing'
        }
        this.$refs.cvs.onmouseup = function (e) {
          const { clientX, clientY } = e
          const [startX, startY] = start
          let x = (clientX - startX + pos[ 0 ])
          let y = (clientY - startY + pos[ 1 ])
          pos = [x, y]
          move = false
          _this.offset = pos
          this.style.cursor = 'grab'
        }
        window.onmousemove = function (e) {
          const { clientX, clientY } = e
          const [startX, startY] = start
          if (move) {
            ctx.clearRect(0, 0, 400, 400)
            let x = (clientX - startX + pos[ 0 ]) / scale
            let y = (clientY - startY + pos[ 1 ]) / scale
            ctx.save()
            ctx.scale(scale, scale)
            ctx.translate(x, y)
            ctx.drawImage(img, 0, 0, width, height)
            ctx.restore()
            _this.drawMask()
          }
        }
      }

      this.$refs.cvs.onmousewheel = evt => {
        const {wheelDelta} = evt
        if(wheelDelta > 0) {
          this.scaleOri += 0.1
        } else {
          this.scaleOri -= 0.1
        }
        this.scaleFn()
      }
    },
    cutFn() {
      const cvs = document.createElement('canvas')
      cvs.width = 150
      cvs.height = 150
      const ctx = cvs.getContext('2d')
      ctx.drawImage(this.$refs.cvs, 50, 50, 250, 250, 0, 0, 200, 200)
      let res = cvs.toDataURL('image/png')
      if (this.blob) {
        return cvs.toBlob((data) => {
          this.$emit('data', {
            file: this.file,
            blob: data
          })
        }, 'image/png')
      }
      this.$emit('data', res)
    },
    drawMask() {
      const ctx = this.cvs
      const color = `#00000031`
      ctx.beginPath()
      ctx.fillStyle = color
      ctx.rect(0, 0, 300, 50)
      ctx.fill()
      ctx.closePath()
      ctx.beginPath()
      ctx.fillStyle = color
      ctx.rect(0, 50, 50, 300)
      ctx.fill()
      ctx.closePath()
      ctx.beginPath()
      ctx.fillStyle = color
      ctx.rect(50, 250, 250, 250)
      ctx.fill()
      ctx.closePath()
      ctx.beginPath()
      ctx.fillStyle = color
      ctx.rect(250, 50, 200, 200)
      ctx.fill()
      ctx.closePath()
    },
    closeFn() {
      this.$emit('close')
    }
  },
  setup() {
  }
}
</script>

<style scoped lang="scss">
.CutImage {
  background: #fff;
  width: 320px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);

  .header {
    padding: 15px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: -10px;

    .close {
      padding: 0 10px;
      cursor: pointer;
      margin-right: -20px;
      user-select: none;

      &:hover {
        color: #f60;
      }
    }
  }

  .cvs {
    &:hover {
      cursor: grab;
    }
  }

  .action {
    display: flex;
    justify-content: space-around;
    flex-direction: column;
    padding-top: 10px;

    .btn_primary {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 30px;
      border: none;
      background: #f60;
      border-radius: 4px;
      color: #fff;
      cursor: pointer;
      transition: 0.1s;

      &:hover {
        opacity: 0.8;
      }

      &:active {
        opacity: 1;
      }
    }
  }
}

</style>
