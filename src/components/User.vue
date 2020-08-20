<template>
  <div v-if="user" class="app-testBank-header-btns">
    <el-avatar v-if="avatarUrl" :src="avatarUrl" size="medium" />
    <el-avatar v-else size="medium" class="bgcolor"> {{ user.name && user.name.slice(-2) || '' }} </el-avatar>
    <!-- <i class="icon icon-home color" /> -->
    <!-- <i class="icon icon-logout color" /> -->
  </div>
</template>
<script>
import { getUserInfo } from '@/api/index'

export default {
  name: 'User',
  data () {
    return {
      user: null
    }
  },
  computed: {
    avatarUrl: function () {
      if (!this.user || !this.user.avatar) {
        return ''
      }
      var href = window.location.href
      var spstr = '//'
      var prefix = href.indexOf(spstr) + spstr.length
      var aim = href.substring(prefix)
      var url = href.substring(0, prefix) + aim.substring(0, aim.indexOf('/'))
      return url + '/api/v1/' + this.user.avatar
    }
  },
  mounted () {
    const userInfo = window.webStorage.getItem('userInfo')
    if (userInfo) {
      this.user = JSON.parse(userInfo)
    } else {
      getUserInfo().then(res => {
        this.user = res
      })
    }
  }
}
</script>
