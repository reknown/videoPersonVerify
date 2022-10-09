<template>
 <div>
   <div class="list">
     <div class="list-item" @click="verifyWithoutMask">无蒙版</div>
     <div class="list-item" @click="verifyWithMask">有蒙版(兼容性差)</div>
   </div>
   <video-verify ref="videoVerify" @on-success="verifySuccess"></video-verify>
   <video-verify2 ref="videoVerify2" @on-success="verifySuccess"></video-verify2>
 </div>
</template>

<script>
import VideoVerify from '@/components/VideoVerify'
import VideoVerify2 from '@/components/VideoVerify2'

export default {
  name: "index",
  components: {
    VideoVerify,
    VideoVerify2
  },
  methods: {
    verifyWithoutMask() {
      this.$refs.videoVerify.showChoose({
        name: '姓名',
        idnum: '身份证号码'
      })
    },
    verifyWithMask() {
      this.$refs.videoVerify2.showChoose({
        name: '姓名',
        idnum: '身份证号码'
      })
    },
    verifySuccess(data) {
      console.log('验证成功')
    }
  }
}
</script>

<style scoped lang="less">
.list {
  padding: 50px 30px;
  &-item {
    text-align: center;
    line-height: 40px;
    font-size: 14px;
    background-color: #2b6814;
    color: #fff;
    cursor: pointer;
    & + .list-item {
      margin-top: 30px;
    }
  }
}
</style>
