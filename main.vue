<template>
  <div>
    <div class="verify-placeholder">
      <div class="verify-placeholder-img"></div>
      <p class="verify-placeholder-text">正面平视手机、保证光线充足<br>请勿遮挡面部</p>
    </div>
    <div class="verify-bottom">
      <ul class="verify-process">
        <li>
          <span class="num">1</span>
          <p class="text">人脸放入框内，点击开始录制</p>
        </li>
        <li>
          <span class="num">2</span>
          <p class="text">录制倒计时<span class="text-tips">（8s）</span>，点击立即结束</p>
        </li>
        <li>
          <span class="num">3</span>
          <p class="text">完成录制，等待验证结果</p>
        </li>
      </ul>
      <mt-button
        class="verify-btn"
        @click.native="getCamera"
      >开始录制</mt-button>
    </div>
    <div
      class="btn-submit"
    >
      <mt-button
        class="app-button-warning"
        size="small"
        @click.native="$router.back(-1)"
      >上一步</mt-button
      >
      <mt-button
        type="primary"
        size="small"
        class="btn"
      >下一步</mt-button
      >
    </div>
    <!--    人脸检测-->
    <div class="video" v-show="showVideo">
      <div class="video-cover"></div>
      <video :src="url" ref="videoRef" autoplay playsinline x5-video-player-type="h5"></video>
      <!-- 关闭按钮 -->
      <mt-button class="video-close" @click.native="closeVideo"
      >×</mt-button>
      <mt-button
        class="video-save"
        @click.native="saveVideo"
      >{{ isAlreadyRecord ? '结束录制(' + count + 's)' : '开始录制' }}</mt-button>
    </div>
    <video ref="videob" controls=""  name="media"  v-show="!showVideo" width="100%" height="400"></video>
  </div>
</template>

<script>
  export default {
    name: 'VideoVerify',
    data() {
      return {
        url: '',
        showVideo: false,
        mediaRecorder: null,
        MediaStreamTrack: null,
        isAlreadyRecord: false,
        count: 8,
        countTimer: null,
        recordedBlobs: []
      }
    },
    mounted() {

    },
    beforeDestroy() {
      this.MediaStreamTrack && this.MediaStreamTrack.stop()
      this.countTimer && clearTimeout(this.countTimer)
    },
    methods: {
      // 调用摄像头 开始录制
      getCamera () {
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
              this.$messageBox.alert('该浏览器不支持getUserMedia，请使用其他浏览器')
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
            this.MediaStreamTrack = typeof stream.stop === 'function' ? stream : stream.getTracks()[0]
            console.log(stream)
            console.log(this.MediaStreamTrack)
            // 显示录制框
            this.showVideo = true
            this.isAlreadyRecord = false
            let winURL = window.URL || window.webkitURL
            if ('srcObject' in this.$refs.videoRef) {
              this.$refs.videoRef.srcObject = stream
            } else {
              this.$refs.videoRef.src = winURL.createObjectURL(stream)
            }
            console.log(this.$refs.videoRef)
            this.$refs.videoRef.onloadedmetadata = e => {
              // 播放视频
              this.$refs.videoRef.play()
            }

            let options = {
              videoBitsPerSecond: 2500000
            }
            this.mediaRecorder = new MediaRecorder(stream, options)
          })
          .catch((err) => {
            console.log(err)
            this.$messageBox.alert('摄像头开启失败，请检查摄像头是否授权或是否可用！')
          })
      },
      // 关闭活体检测
      closeVideo() {
        this.recordedBlobs = ''
        this.isAlreadyRecord = false
        this.MediaStreamTrack && this.MediaStreamTrack.stop()
        this.countTimer && clearTimeout(this.countTimer)
        this.$router.go(0)
      },
      // 录制倒计时
      countDown() {
        let that = this
        let sendTime = Math.round(+new Date() / 1000)

        return function walk() {
          that.countTimer = setTimeout(function() {
            that.countTimer && clearTimeout(that.countTimer)
            let diff = sendTime + 8 - Math.round(+new Date() / 1000)
            if (diff > 0) {
              that.count = diff
              walk()
            } else {
              console.log('倒计时结束')
              this.showVideo = false
              console.log(this.url)
              console.log(this.MediaStreamTrack)

            }
          }, 1000)
        }
      },
      // 保存录制视频
      saveVideo() {
        if (this.isAlreadyRecord) {
          this.countTimer && clearTimeout(this.countTimer)
          this.showVideo = false
          //当录制的数据可用时
          this.mediaRecorder.ondataavailable = (e) => {
            console.log(e.data)
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
              this.$refs.videob.src = reader.result
            }
          }, 1000)


        } else {
          this.count = 8
          this.isAlreadyRecord = true
          this.mediaRecorder.start(8000)
          this.countDown()()
        }
      },

      changeVideo(e) {
        let file = this.$refs.videoFile.files
        console.log(file)
      }
    }
  }
</script>

<style scoped>
  .verify-placeholder {
    padding: .5rem 1.5rem 1rem;
    text-align: center;
    background-color: #f4f4f4;
  }

  .verify-placeholder-img {
    margin: 0 auto;
    width: 11rem;
    height: 15.6rem;
    background: url(~@/assets/images/sketch.png) top center no-repeat;
    background-size: 100% auto;
  }

  .verify-placeholder-text {
    margin: .6rem 0 0;
    line-height: 1.4rem;
    font-size: .9rem;
    color: #999;
  }

  .verify-bottom {
    background-color: #fff;
    box-shadow: 0 -6px 12px -4px #e8e8e8;
  }

  .verify-process {
    margin: 0;
    padding: 0;
  }
  .verify-process li {
    display: flex;
    align-items: center;
  }

  .verify-process .num {
    margin-right: .6rem;
    width: 16px;
    height: 16px;
    line-height: 16px;
    text-align: center;
    font-size: 13px;
    color: #277faf;
    border: 1px solid #277faf;
    border-radius: 100%;
  }

  .verify-process .text {
    flex: 0 0 auto;
    margin: 0;
    line-height: 24px;
    font-size: 16px;
    color: #333;
  }

  .verify-process .text-tips {
    font-size: 12px;
    color: #999;
  }

  .btn-submit {
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    background-color: #fff;
    box-shadow: 0 -2px 4px #f2f2f2;
  }
  .btn-submit .btn {
    margin: .5rem 1.5rem;
    padding: 0 1rem;
    font-size: 14px;
  }

  .video {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
  }

  .video-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url(~@/assets/images/cover.png) center center no-repeat;
    object-fit: cover;
    background-size: 100% 100%;
    z-index: 99;
  }

  .video video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    z-index: 0;
  }

  .video-close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    line-height: 30px;
    padding: 0;
    text-align: center;
    color: #000;
    font-size: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px #fff;
    border-radius: 100%;
    z-index: 100;
  }

  .video-save {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    height: 35px;
    font-size: 16px;
    box-sizing: content-box;
    z-index: 100;
  }
</style>
