<template>
  <img v-if="logo" :src="logoUrl" alt="" style="height: 40px;">
</template>
<script>
import { getUserInfo } from '@/api/index'

export default {
  name: 'Logo',
  data () {
    return {
      logo: ''
    }
  },
  computed: {
    logoUrl: function () {
      if (!this.logo) {
        return ''
      }
      var href = window.location.href
      var spstr = '//'
      var prefix = href.indexOf(spstr) + spstr.length
      var aim = href.substring(prefix)
      var url = href.substring(0, prefix) + aim.substring(0, aim.indexOf('/'))
      return url + '/api/v1/' + this.logo
    }
  },
  mounted () {
    const userInfo = window.webStorage.getItem('userInfo')
    if (userInfo) {
      this.logo = JSON.parse(userInfo).logo
    } else {
      getUserInfo().then(res => {
        this.logo = res.logo
      })
    }
  }
}
</script>
