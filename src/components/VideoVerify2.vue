<template>
  <van-popup
      v-model="show"
      position="center"
      class="face-popup"
      :close-on-click-overlay="false"
  >
    <!--  活体提示 -->
    <div class="face-tips" v-if="step === 1">
      <div class="title">多动作活体验证</div>
      <div class="img">
        <div class="img-bg"></div>
        <div class="img-line"></div>
        <img src="../images/face_tips4.png" alt="">
      </div>
      <div class="content">
        <p>请根据动作提示，按动作顺序</p>
        <p>录制 <span class="red-text">1-3秒动作</span> 视频</p>
        <p>请正对手机摄像头，确保面部光源充足</p>
      </div>
      <van-button class="btn" @click.native="nextStep">开始验证</van-button>
    </div>
    <!--  活体视频录制 -->
    <div class="face-box" v-show="step === 2">
      <div class="title">多动作活体验证</div>
      <div class="action-box">
        <div class="action-box-p" v-if="actionVal.length > 1"><span class="txt">先{{ actionList[actionVal[0]].text }}、后{{ actionList[actionVal[1]].text }}</span></div>
        <div class="action-box-list">
          <div class="item" v-for="(item, index) in actionVal" :key="index">
            <img :src="actionList[item].icon" alt="">
          </div>
        </div>
      </div>
      <video :src="url" ref="videoRef" autoplay playsinline x5-video-player-type="h5"></video>

      <div class="btn" @click="saveVideo">{{ recordStatus === 0 ? '开始录制' : '结束录制(' + recordCount +  's)' }}</div>
    </div>
    <!--  成功 -->
    <div class="face-tips" v-if="step === 3">
      <div class="title">多动作活体验证</div>
      <div class="face-success">
        <div class="face-success-img">
          <img :src="'data:image/jpeg;base64,' + videoImg" alt="">
        </div>
      </div>
      <van-button class="btn" @click.native="successBack">确定</van-button>
    </div>
    <!--   失败 -->
    <div class="face-tips" v-if="step === 4">
      <div class="title">多动作活体验证</div>
      <div class="error-wrap">
        <div class="error-tips">{{ errorTips }}</div>
        <div class="error-p">请确保本人操作，并避免以下问题</div>
        <ul class="error-list">
          <li>
            <img src="../images/face_error1.jpg" alt="">
            <p>没有对焦</p>
          </li>
          <li>
            <img src="../images/face_error2.jpg" alt="">
            <p>遮挡人脸</p>
          </li>
          <li>
            <img src="../images/face_error3.jpg" alt="">
            <p>光照不均</p>
          </li>
          <li>
            <img src="../images/face_error4.jpg" alt="">
            <p>手机晃动</p>
          </li>
        </ul>
      </div>
      <van-button class="btn" @click.native="again">重新检测</van-button>
    </div>
  </van-popup>
</template>

<script>
export default {
  name: "VideoVerify",
  data() {
    return {
      show: false,
      step: 1, // 1 提示 2 录制 3 成功 4 失败
      name: '',
      idnum: '',
      actionList: {
        1: {
          text: '眨眼',
          icon: require('../images/face_tips1.png')
        },
        2: {
          text: '张嘴',
          icon: require('../images/face_tips2.png')
        },
        5: {
          text: '转头',
          icon: require('../images/face_tips3.png')
        },
      },
      actionVal: [],

      url: '',
      mediaRecorder: null,
      MediaStreamTrack: null,
      recordStatus: 0, // 0 未开始 1 正在录制
      recordCount: 5,
      recordedBlobs: [],

      errorTips: '',
      videoImg: '' // 人像识别图片
    }
  },
  mounted() {},
  beforeDestroy() {
    this.MediaStreamTrack && this.MediaStreamTrack.stop()
    this.countTimer && clearTimeout(this.countTimer)
  },
  methods: {
    showChoose(data) {
      this.again()
      this.show = true
      this.name = data.name
      this.idnum = data.idnum
    },
    cancelChoose() {
      this.show = false
      this.name = ''
      this.idnum = ''
    },
    // 下一步
    nextStep() {
      this.getCamera()
    },
    // 调用摄像头 开始录制
    getCamera () {
      let that = this
      // 注意本例需要在HTTPS协议网站中运行，新版本Chrome中getUserMedia接口在http下不再支持。
      let constraints = {
        audio: false,
        video: {
          facingMode: 'user' // 优先调前置摄像头
        }
      }

      // 老的浏览器可能根本没有实现 mediaDevices，所以我们可以先设置一个空的对象
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {}
      }

      // 一些浏览器部分支持 mediaDevices。我们不能直接给对象设置 getUserMedia
      // 因为这样可能会覆盖已有的属性。这里我们只会在没有getUserMedia属性的时候添加它。
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
          // 首先，如果有getUserMedia的话，就获得它
          //   var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
          var getUserMedia = navigator.getUserMedia ||
              navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia

          // 一些浏览器根本没实现它 - 那么就返回一个error到promise的reject来保持一个统一的接口
          if (!getUserMedia) {
            that.$uMessageBox.show({
              message: "该浏览器不支持getUserMedia，请使用其他浏览器",
              closeOnClickOverlay: false,
              hideCancel: true,
              onConfirm: () => {
                that.cancelChoose()
              }
            })
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
          }

          // 否则，为老的navigator.getUserMedia方法包裹一个Promise
          return new Promise(function (resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject)
          })
        }
      }

      navigator.mediaDevices.getUserMedia(constraints)
          .then((stream) => {
            that.MediaStreamTrack = typeof stream.stop === 'function' ? stream : stream.getTracks()[0]
            console.log(stream)
            console.log(that.MediaStreamTrack)
            let winURL = window.URL || window.webkitURL
            if ('srcObject' in that.$refs.videoRef) {
              that.$refs.videoRef.srcObject = stream
            } else {
              that.$refs.videoRef.src = winURL.createObjectURL(stream)
            }
            console.log(that.$refs.videoRef)
            that.$refs.videoRef.onloadedmetadata = e => {
              // 播放视频
              that.$refs.videoRef.play()
            }

            let options = {
              videoBitsPerSecond: 2500000
            }
            that.mediaRecorder = new MediaRecorder(stream, options)

            this.getActionData()
          })
          .catch((err) => {
            console.log(err)
            that.$uMessageBox.show({
              message: "摄像头开启失败，请检查摄像头是否授权或是否可用！",
              closeOnClickOverlay: false,
              hideCancel: true,
              onConfirm: () => {
                that.cancelChoose()
              }
            })
          })
    },
    // 生成随机动作组
    getActionData() {
      this.actionVal = [1, 5]
      // 显示录制框
      this.step = 2
      this.recordStatus = 0
    },
    // 录制倒计时
    countDown() {
      let that = this
      let sendTime = Math.round(+new Date() / 1000)

      return function walk() {
        that.countTimer = setTimeout(function() {
          that.countTimer && clearTimeout(that.countTimer)
          let diff = sendTime + 5 - Math.round(+new Date() / 1000)
          if (diff > 0) {
            that.recordCount = diff
            walk()
          } else {
            console.log('倒计时结束')
            that.recordStatus = 1
            that.saveVideo()
          }
        }, 1000)
      }
    },
    // 保存录制视频
    saveVideo() {
      if (this.recordStatus === 1) {
        this.countTimer && clearTimeout(this.countTimer)
        //当录制的数据可用时
        this.mediaRecorder.ondataavailable = (e) => {
          console.log(e)
          if (e.data && e.data.size > 0) {
            this.recordedBlobs.push(e.data)
          }
        }
        this.mediaRecorder.stop()

        setTimeout(() => {
          var blob = new Blob(this.recordedBlobs, {type: 'video/mp4'})
          console.log(blob)
          this.isAlreadyRecord = false
          this.MediaStreamTrack && this.MediaStreamTrack.stop()

          var reader = new FileReader();
          reader.readAsDataURL(blob, 'utf-8')
          reader.onload = () => {
            console.log(reader.result); // base64格式
            let result = reader.result.replace(/^data:video\/\w+;base64,/, '')
            this.faceReco(result)
          }
        }, 1000)


      } else {
        this.count = 8
        this.recordStatus = 1
        this.mediaRecorder.start(5000)
        this.countDown()()
      }
    },
    // 视频识别活检比对
    faceReco(video) {
      let that = this

      that.$toast.loading({
        message: '验证中...',
        duration: 0,
        forbidClick: true
      })
      setTimeout(() => {
        let random_boolean = Math.random() < 0.5;
        // 随机返回结果
        if (random_boolean) {
          this.$toast.clear()
          this.step = 3
          this.videoImg = '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'
        } else {
          this.$toast.clear()
          this.step = 4
          this.errorTips = '人像不完整'
        }
        this.recordedBlobs = []
        this.recordStatus = 0
        this.MediaStreamTrack && this.MediaStreamTrack.stop()
        this.countTimer && clearTimeout(this.countTimer)
      }, 2000)

    },
    // 人脸失败、重试
    again() {
      this.step = 1
      this.actionVal = []
      this.errorTips = ''
      this.videoImg = ''
    },
    // 人脸成功返回
    successBack() {
      this.$emit('on-success', {
        photo: this.videoImg
      })
      this.cancelChoose()
    }
  }
}
</script>

<style scoped lang="less">
.face-popup {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  transform: none;
  box-sizing: border-box;
}
.face-box,
.face-tips {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-align: center;
  box-sizing: border-box;
}
.face-tips {
  padding: 30px;
}
.face-box {
  padding: 20px 0;
}
.title {
  text-align: center;
  line-height: 1.2;
  font-size: 20px;
  color: #333;
  font-weight: 600;
}
.img {
  position: relative;
  margin: 7vh auto;
  width: 260px;
  height: 260px;
}
@keyframes bgmove {
  from {
    height: 0;
  }
  to {
    height: 225px;
  }
}
.img-bg,
.img-line {
  position: absolute;
  top: 17px;
  left: 17px;
  width: 225px;
  overflow: hidden;
}
.img-bg {
  animation: bgmove 4s linear infinite;
  animation-direction: alternate;
  z-index: 1;
}
.img-bg:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 225px;
  height: 225px;
  background: linear-gradient(0deg, transparent 0%, rgba(104, 24, 133, .3) 50%, transparent 100%);
  border-radius: 50%;
}
.img-line {
  z-index: 6;
  height: 225px;
  border-radius: 50%;
}
.img-line:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  border-bottom: 2px solid #2b6814;
  animation: bgmove 4s linear infinite;
  animation-direction: alternate;
}
.img img {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
}
.content {
  flex: 1;
  min-height: 0;
  text-align: center;
  font-size: 15px;
  line-height: 1.8;
  color: #999;
  font-weight: 300;
}
.red-text {
  color: #f00;
}
.btn {
  height: 45px;
  line-height: 45px;
  text-align: center;
  font-size: 18px;
  color: #fff;
  background-color: #2b6814;
  border-radius: 45px;
}
.face-success {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.face-success-img {
  position: relative;
  width: 225px;
  height: 225px;
  padding: 20px;
}
.face-success-img:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  background: url('data:image/png;base64,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') center center / 100% 100% no-repeat;
}
.face-success-img img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
}
.error-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.error-tips {
  margin: 25px 0;
  line-height: 1.4;
  font-size: 20px;
  color: #f54d55;
  letter-spacing: 2px;
  width: 100%;
}
.error-p {
  line-height: 1.6;
  font-size: 16px;
  color: #d05b63;
  letter-spacing: 2px;
  width: 100%;
}
.error-list {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  li {
    padding: 20px;
    width: 50%;
    box-sizing: border-box;
  }
  img {
    width: 75px;
    height: 75px;
    margin: 0 auto 8px;
  }
  p {
    line-height: 1.4;
    font-size: 14px;
    color: #d05b63;
  }
}
.action-box {
  margin-top: 20px;
  padding: 10px 60px;
  background-color: #ededed;
  &-p {
    margin-bottom: 10px;
    font-size: 14px;
    overflow: hidden;
    color: #e84968;
    .text {
      position: relative;
      &:before,
      &:after {
        content: '';
        position: absolute;
        top: 50%;
        margin-top: -8px;
        width: 170px;
        height: 170px;
        background: url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUEBAQEAwUEBAQGBQUGCA0ICAcHCBALDAkNExAUExIQEhIUFx0ZFBYcFhISGiMaHB4fISEhFBkkJyQgJh0gISD/2wBDAQUGBggHCA8ICA8gFRIVICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/wgARCAARAKkDAREAAhEBAxEB/8QAGwAAAwEAAwEAAAAAAAAAAAAABgcIBQADBAL/xAAbAQACAgMBAAAAAAAAAAAAAAAEBQMGAAIHAf/aAAwDAQACEAMQAAAAp0cuJEfW3ixpaSBuboKqKkGtbROqq1EsrBnrQKNYzMpGMCPd8pNkQsvXsH9YRn+6bGng1khfIEC+G14XQZ1AuYvo0MilQKC+YxyBZA2Nrsasn1ltczCnpJfcXkxpaHV3h/NqJP6u/wBCNefzor6BR7Hn03LegUqz55MqzollueSGbJBBKDqlEko5+jsbt9UJ/DWvgS9wk60jCt8KdfMLaTQizo2F6ImfrIUY8DktmRBUD8+lQLAS0W+85HyWL//EACgQAAICAgEDAwMFAAAAAAAAAAQGBQcAAwIBCDcWNTYQERUTFCMyNP/aAAgBAQABCACemgV2ALmZFhmzGhoMmjKgXBFJTMfp1tZD21mLmzqWWRYCEMsKdc2stvaSpcqlFMYUMt+nn9u3uLbvP50gnfz7niYshy5uLbtK4UeldD5Xk2ydou3Jta/vopVJ/PT3JiPth59VNXUYGm0j1Mz9ZU65nnqxNHWFCqRI5tbZxLLu15/OTXpqOqlI5ODbx/c3i79DzeCfE1qm73Ft1C8vTUJl3Pn5yc4q4FZpOxybOA267HbgUbqTIivE7e5tuoHLncNOrhqRYRHUinFtFitV0tQ0VGDIEGoKpjc0aIgS3WQVZV9FfQKsunNTKLCx9psIiUlDIMAvwxjHPBw4FiTIVbVuIkwMNFGTkwPFgOcmJVFXaFeFjgSZeU0RwrCaLUNV6oGOHHJkTtQwxu8SnKl4iaOHAqRP/T410mjpqnoB+h/v0nnbz8amMn/f5PO27/ax45+QGDO3L3Ofyy/Jk/nbv8plctryjPZ28/Nj8ufyTJ5QnkXbl7eTyco7ymNncD5M4ZTflOKzuH+WgZVHk+FzuL98hcr7yFDZw/p9P//EADsQAAECAwMIBwYFBQAAAAAAAAIBAwAEERIxQQUhIyVUYrGyIkJRcYGC4hATMlJTwhUkYbPDNGRykqL/2gAIAQEACT8Ae91LSwKRcEFK3qqrRIMrc0SqOKACZhHwRKRoLbOh3GfVBkhOkqAF6NNIuYIAmNGasK5cDXWODIWi6Eu1g20i5hgEalmBNJQnd3MbvEYOko3VqVbusNV4rHQk5O0kqrlxlcbncMHq+Wq1KjuYn3lAUkJA9BgJu+mHSXJ0naalew63n5oDVmTSqG+96Ye1Vk5SbZ3z65wGqpChkODrt4hEzqrJ1Q6FzjuJeEN6pkKG8WDp4Nw7q/Jx0cULnXfTDVvJcnR2Z3+wPGHaSch/UWLjPAPLAF+Gy9HZo+Ad5RkyW/0SHqyMgalMb7vpgNXStHpk9zAO8oOknJWSmP8APAPLAfk2qOzR3WArxWLDUrKiKzSN/wDDfh8UVSXTSTDnyNV4rGhBsBWasXAF7bcV0nSdPBttFzlGg0Qo9YvBpLg80BV10+k51QbvU1jQk+zYd3GsfMcATsxMmgpjQcSX9ETPDtJyaasW+ujXXPvKAtzEyaAA8VX9Exg9ZTgKHvbj33fHCAJ2ZmXBAA7SVaJ4dsHridAkF3f67sNk/MvmgACZyMlWieKrFgsuTg/Hibq3n3DFp6ZmTzVqRKarf3qsBWbcocwfa4vs2hzisbSHJG1v/ulH9v8AyRtr3OsfIz98bWfFY2cOePrfZGxfeMdjXIMbKUbO1yx9BzljYGudyPnc/acjYP5Dj6hcpRs588bU37f/xAAgEQACAgMBAAMBAQAAAAAAAAAAAgMEEiIyARETQhAx/9oACAECAQE/AJpsVPZmZiv6yrkw9h2bUh9dVycknbLFSvmq5MTWGy1K7PjkxLYZmxKyvjkS2WyxUr5sTzsrYqV/XbdixYZdVK3rt0TztyhXzcmmZdSJnY+GLTsVYWdiy35UhiZm2J31xUiiZm2LD4pipHEzMTNguKkcTMxL6yR6iRM7kj/VHqIrO2w3uCiozsZ/RGYM7Ce/RGL6zsVkx6PlCfopFjog6H6Iv9J+iHotdKQFnlSt0WvyV+iblSv0WeVK/RPyV+hP5//EADERAAEDAgMFBgYDAQAAAAAAAAIAAwUBBBITMxEUIjHwBiEyUWFxNEGBodHxEBUkkf/aAAgBAwEBPwCzYcfdEBVrGW7TXENPt+FJZT74ssjRWsYy0wIYe/6fhTOU66NtbDTr2UXFtNMDmDTb16KZcbNwbe2GnXso+IaaYHMHv69FNG1i3dkabVExLTbI4x7+vRTpsh/nZGm3ryUREADGJwe+vXkp02WsLLI02qCiAFrG6O2tfP8AS7QOssDlMjTb9FAxQZWa8PPz/SnN3t2sADTFX2UBEDgzHB5+f6UyVrbNEAjTFX2UDDiY5zw9f8UyNuw3hEafZZwLs/ZAwOYXNSsiLDHDzqoKyxFvDqlJAbVrh5qCtBNzeXiUpfhbMFhJQVqNy6Vw8Skb5q1Y8SiLben94eJXl4FqwRiVFD2++Pbw98vNXN63bMkWKijmt/us5zlRPXbVqzi8lZBWTus50u6nXqnrlq2a4ditx/s7vMMu6nXqnLhq2a4fkm6FJXeIi4evdETVszw7FKyJXLpCuJWGiKnObaiNFdoeYqL0RU1pioPRU9pioXSU3pKE0lM6KgPCSmPhSXZ7wkpL4cl2f8RKQ0SUJqEr3SJPahfx/9k=') center center / contain no-repeat;
      }
      &:before {
        right: calc(100% + 25rpx);
      }
      &:after {
        left: calc(100% + 25rpx)
      }
    }
  }
  &-list {
    display: flex;
    justify-content: center;
    .item {
      width: 60px;
      height: 60px;
      margin: 0 20px;
      img {
        display: block;
        height: 100%;
        width: auto;
      }
    }
  }
}
.face-box {
  video {
    flex: 1;
    min-height: 0;
    object-fit: cover;
  }
  .btn {
    margin: 20px 20px 0;
  }
}
</style>
