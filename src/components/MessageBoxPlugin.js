import Vue from 'vue'
import MessageBox from "../components/MessageBox"

const UMessageBoxComponent = Vue.extend(MessageBox)

class UMessageBox {
  constructor () {
    this.$vm = new UMessageBoxComponent({
      el: document.createElement('div')
    })

    document.body.appendChild(this.$vm.$el)
  }

  show (options) {
    let defaults = {}

    for (let i in this.$vm.$options.props) {
      if (i !== 'value') {
        defaults[i] = this.$vm.$options.props[i].default
      }
    }

    let _options = Object.assign({}, defaults, options)

    for (let i in _options) {
      this.$vm[i] = _options[i]
    }

    this.$vm.$off('on-confirm')
    this.$vm.$off('on-cancel')
    this.$vm.$on('on-confirm', msg => {
      options && options.onConfirm && options.onConfirm(msg)
    })
    this.$vm.$on('on-cancel', msg => {
      options && options.onCancel && options.onCancel(msg)
    })

    this.$vm.popupVisible = true
  }
  hide () {
    this.$vm.popupVisible = false
  }
}

export default {
  install (Vue) {
    Vue.prototype.$uMessageBox = new UMessageBox
  }
}
