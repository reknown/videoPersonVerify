<template>
  <van-popup
    v-model="popupVisible"
    position="center"
    class="msg-popup"
    :close-on-click-overlay="closeOnClickOverlay"
  >
    <div class="msg-popup-title">{{ title }}</div>
    <div :class="['msg-popup-icon', 'icon-' + icon]" v-if="icon"></div>
    <div class="msg-popup-text" v-if="message" v-html="message"></div>
    <div class="msg-popup-reason" v-if="reason">{{ reason }}</div>
    <div class="msg-popup-btns">
      <van-button v-if="!hideCancel" class="btn-cancel" @click.native="cancelEvent">{{ cancelText }}</van-button>
      <van-button class="btn-submit" @click.native="submitEvent">{{ submitText }}</van-button>
    </div>
  </van-popup>
</template>

<script>
  export default {
    name: 'MessageBox',
    props: {
      value: {
        type: Boolean,
        default: false
      },
      closeOnClickOverlay: {
        type: Boolean,
        default: true
      },
      icon: {
        type: String,
        default: '' // success, fail
      },
      title: {
        type: String,
        default: '提示：'
      },
      cancelText: {
        type: String,
        default: '取 消'
      },
      submitText: {
        type: String,
        default: '确 定'
      },
      message: String,
      reason: String,
      hideCancel: {
        type: Boolean,
        default: false
      },
      closeOnSubmit: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        popupVisible: false
      }
    },
    created () {
      if (this.value) {
        this.popupVisible = this.value
      }
    },
    watch: {
      value (val) {
        this.popupVisible = val
      },
      popupVisible (val) {
        this.$emit('input', val)
      }
    },
    methods: {
      cancelEvent () {
        if (!this.popupVisible) {
          return
        }
        this.popupVisible = false
        this.$emit('on-cancel')
      },
      submitEvent () {
        if (!this.popupVisible) {
          return
        }
        if (this.closeOnSubmit) {
          this.popupVisible = false
        }
        this.$emit('on-confirm')
      }
    }
  }
</script>

<style scoped lang="less">
  .msg-popup {
    padding: 15px 20px 20px;
    width: 80%;
    border-radius: 10px;
    box-sizing: border-box;
    &-title {
      line-height: 1.2;
      font-size: 18px;
      color: #2b6814;
    }
    &-icon {
      height: 50px;
      background-repeat: no-repeat;
      background-position: center center;
      background-size: auto 100%;
      &.icon-success {
        background-image: url(../images/success_icon.png);
      }
      &.icon-fail {
        background-image: url(../images/false_icon.png);
      }
      & + .msg-popup-text {
        margin-top: 8px;
      }
    }
    /deep/ .code-img {
      img {
        display: block;
        width: 100%;
      }
    }
    /deep/ .code-tips {
      line-height: 1;
      font-size: 15px;
      color: #666;
    }
    /deep/ .code-img-fail {
      padding: 10px 0;
      line-height: 1.2;
      color: #2b6814;
    }
    /deep/ .code-p {
      margin-top: 10px;
      line-height: 20px;
      font-size: 13px;
      color: #666;
    }
    /deep/ .action-p {
      margin: -15px 0 6px;
      font-size: 15px;
      color: #666;
    }
    /deep/ .action-list {
      display: flex;
      align-items: center;
      justify-content: center;
      li {
        margin: 0 8px;
        width: 60px;
      }
      img {
        display: block;
        width: 100%;
        height: auto;
      }
    }
    &-text {
      margin-top: 30px;
      text-align: center;
      line-height: 1.6;
      font-size: 16px;
      color: #000;
      & + .msg-popup-btns {
        margin-top: 20px;
      }
    }
    &-reason {
      text-align: center;
      line-height: 1.5;
      font-size: 13px;
      color: #ff4c4c;
    }
    &-btns {
      display: flex;
      justify-content: center;
      margin-top: 20px;
      text-align: center;
      .van-button {
        height: 40px;
        line-height: 40px;
        font-size: 16px;
        border: none;
        border-radius: 4px;
        &:not(:first-child) {
          margin-left: 50px;
        }
      }
    }
    .btn-submit,
    .btn-cancel {
      flex: 1;
      min-width: 0;
      max-width: 60%;
    }
    .btn-submit {
      color: #fff;
      background-color: #2b6814;
    }
    .btn-cancel {
      color: #2b6814;
      background-color: #d8ddd4;
    }
  }
</style>
