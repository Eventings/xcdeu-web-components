<template>
  <section class="xc-file-up">
    <el-upload
      v-if="!readonly"
      class="upload-demo"
      v-bind="$attrs"
      :file-list="fileList"
      action=""
      :accept="fileAccept"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="fileUpLoad"
    >
      <slot>
        <el-button type="primary" size="small">上传<i class="el-icon-upload el-icon--right" /></el-button>
      </slot>
    </el-upload>
    <em v-if="!readonly" class="size-small">{{ tip }}</em>
    <slot name="list" v-bind:fileList="fileList">
      <div class="file-container el-row">
        <template v-if="uploadType === 'file'">
          <div v-for="(file, index) in fileList" :key="file.id" class="file-item">
            <img :src="file.contentType | getFileTypeImg(publicPath)">
            <div class="file-info">
              <p>
                <span :title="file.displayName">{{ file.displayName }}</span>
                <strong>{{ file.fileSize | getFileSize }}</strong>
              </p>
              <p v-if="file.status !== 'ready'">
                <a href="javascript:void(0)" class="color" @click="download(file)">下载</a>
                <a v-if="file.displayName | checkFileView" href="javascript:void(0)" class="color" @click="previewFile(file)">预览</a>
                <a v-if="!readonly" href="javascript:void(0)" class="color" @click="delFile(index)">删除</a>
              </p>
            </div>
            <span v-if="file.progress !== -1" :style="{ width: file.progress + '%' }" class="file-process-bar" />
          </div>
        </template>
        <template v-else>
          <div v-for="(file, index) in fileList" :key="file.id" class="image-item">
            <el-image ref="imageBox" :src="file.url" :preview-src-list="[file.url]" />
            <div class="image-info">
              <div v-if="file.status !== 'ready'">
                <a href="javascript:void(0)" class="color" @click="download(file)">下载</a>
                <a href="javascript:void(0)" class="color" @click="previewImage(index)">预览</a>
                <a v-if="!readonly" href="javascript:void(0)" class="color" @click="delFile(index)">删除</a>
              </div>
            </div>
            <span v-if="file.progress !== -1" :style="{ width: file.progress + '%' }" class="file-process-bar" />
          </div>
        </template>
      </div>
    </slot>
  </section>
</template>
<script>
import { getOSSKey, uploadResource, loadDetailBatchByIds } from '@/api/index'
import { downloadAttachment } from '@/util/index'
import { tools } from 'xc-share'
import { v4 as uuidv4 } from 'uuid'

const OSS = tools.OSS
const region = 'oss-cn-shenzhen'
const bucket = 'gtyzfile'

export default {
  name: 'FileUp',
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ''
    },
    uploadType: {
      type: String,
      default: 'file'
    },
    // 上传接受文件的类型
    accept: String,
    // 上传指定目录
    dir: {
      type: String,
      default: ''
    },
    acceptTips: {
      type: String,
      default: ''
    },
    domainId: {
      type: String,
      default: ''
    },
    // 如果附件不可修改，则不显示删除按钮以及上传附件按钮
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      publicPath: window.XcComponents.path,
      client: null,
      fileList: []
    }
  },
  computed: {
    PATH: function () {
      var di = this.domainId
      if (!di) {
        var userInfo = window.webStorage.getItem('userInfo')
        di = userInfo && JSON.parse(userInfo).domainId
      }
      return  (di || 'domain') + '/' + (this.dir || 'anonymous') + '/'
    },
    tip: function () {
      if (!this.acceptTips && this.uploadType === 'image') {
        return '只能上传图片格式的文件'
      } else {
        return this.acceptTips
      }
    },
    fileAccept: function () {
      return (!this.accept && this.uploadType === 'image') ? 'image/*' : this.accept
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: function (val) {
        if (val) {
          var list = val.split(',')
          var needRefresh = false
          if (list.length !== this.fileList.length) {
            needRefresh = true
          }
          if (!needRefresh) {
            for (var i = 0; i < list.length; i++) {
              var hasFound = false
              for (var j = 0; j < this.fileList.length; j++) {
                if (list[i] === this.fileList[j].id) {
                  hasFound = true
                  break
                }
              }
              if (!hasFound) {
                needRefresh = true
                break
              }
            }
          }
          if (needRefresh) {
            loadDetailBatchByIds({ idList: val }).then(data => {
              for (var i = 0; i < data.length; i++) {
                data[i].status = 'success'
                data[i].progress = -1
              }
              this.fileList = data
            })
          }
        } else {
          if (this.fileList.length) {
            this.fileList = []
          }
        }
      }
    }
  },
  beforeDestroy () {
    this.fileList.forEach(file => {
      if (file.url && file.url.indexOf('blob:') === 0) {
        URL.revokeObjectURL(file.url)
      }
    })
  },
  filters: {
    checkFileView: function (fileDisplayName) {
      const idx = fileDisplayName.lastIndexOf('.')
      let fileSuffName = idx === -1 ? '' : fileDisplayName.substring(idx)
      fileSuffName = fileSuffName.toLowerCase()
      if (
        fileSuffName === '.pdf' ||
        fileSuffName === '.txt' ||
        fileSuffName === '.doc' ||
        fileSuffName === '.docx' ||
        fileSuffName === '.ppt' ||
        fileSuffName === '.pptx' ||
        fileSuffName === '.ppsx' ||
        fileSuffName === '.wps' ||
        fileSuffName === '.png' ||
        fileSuffName === '.jpg' ||
        fileSuffName === '.wav' ||
        fileSuffName === '.flac' ||
        fileSuffName === '.mp3' ||
        fileSuffName === '.mp4' ||
        fileSuffName === '.gif' ||
        fileSuffName === '.jpeg' ||
        fileSuffName === '.mov'
      ) {
        return true
      } else {
        return false
      }
    },
    getFileSize (size) {
      if (size / 1024 < 1) {
        return '1KB'
      } else if (size / 1024 / 1024 < 1) {
        return (size / 1024).toFixed(1) + 'KB'
      } else if (size / 1024 / 1024 / 1024 < 1) {
        return (size / 1024 / 1024).toFixed(1) + 'MB'
      } else {
        return '>1GB'
      }
    },
    getFileTypeImg (type, publicPath) {
      var picName = 'unknown.png'
      if (type.indexOf('image') === 0) {
        picName = 'image.png'
      } else if (type.indexOf('text') === 0) {
        picName = 'txt.png'
      } else if (type.indexOf('video') === 0) {
        picName = 'video.png'
      } else if (type.indexOf('audio') === 0) {
        picName = 'mp3.png'
      } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || type === 'application/msword') {
        picName = 'word.png'
      } else if (type === 'application/x-zip-compressed' || type === 'application/zip') {
        picName = 'zip.png'
      } else if (type === 'application/pdf') {
        picName = 'pdf.png'
      } else if (type === 'application/x-rar-compressed') {
        picName = 'rar.png'
      } else if (type === 'application/x-xls' || type === 'application/vnd.ms-excel' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        picName = 'excel.png'
      } else if (type === 'application/x-ppt' || type === 'application/vnd.ms-powerpoint' || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        picName = 'ppt.png'
      }
      return publicPath + 'public/file/' + picName
    }
  },
  methods: {
    getClient () {
      return new Promise((resolve, reject) => {
        if (!this.client) {
          getOSSKey().then(res => {
            this.client = new OSS({
              region: region,
              accessKeyId: res.accessKeyId,
              accessKeySecret: res.accessKeySecret,
              bucket: bucket
            })
            resolve(this.client)
          }).catch(() => reject())
        } else {
          resolve(this.client)
        }
      })
    },
    delFile (index) {
      this.$confirm('是否确认删除该' + (this.uploadType === 'image' ? '图片？' : '附件？'), '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.fileList.splice(index, 1)
        var value = []
        for (var i = 0; i < this.fileList.length; i++) {
          value.push(this.fileList[i].id)
        }
        this.$emit('input', value.join(','))
      })
    },
    // 文件添加
    beforeUpload (file) {
      if (file.name.indexOf('.') === -1) {
        this.$message.error('禁止上传无格式的文件！')
        return false
      }
      // 如果限制只能上传图片则用户选择非图片后阻止上传
      if (this.fileAccept === 'image/*') {
        if (file.type.indexOf('image/') === -1) {
          this.$message.error('只能上传图片格式的文件！')
          return false
        }
      }
    },
    // 附件上传
    fileUpLoad (http) {
      const id = uuidv4().replace(/-/g, '')
      const rawFile = http.file
      const file = {
        contentType: rawFile.type,
        displayName: rawFile.name,
        fileSize: rawFile.size,
        id: id,
        url: URL.createObjectURL(rawFile),
        status: 'ready',
        progress: 0
      }
      this.fileList.push(file)
      const fileName = id + rawFile.name.substring(rawFile.name.lastIndexOf('.'))
      this.getClient().then(client => {
        client.multipartUpload(this.PATH + fileName, rawFile, {
          progress: p => {
            file.progress = p * 100
          }
        }).then(res => {
          this.uploadOnSuccess(res, file)
        }).catch(err => {
          window.console.log(err)
        })
      })
    },
    uploadOnSuccess (res, file) {
      uploadResource({
        displayName: file.displayName,
        fileSize: file.fileSize,
        id: file.id,
        relativePath: this.PATH,
        storageLocation: 'ALIYUN'
      }).then(res2 => {
        file.status = 'success'
        file.progress = -1
        this.$emit('input', this.value ? this.value + ',' + file.id : file.id)
      })
    },
    previewImage (index) {
      this.$refs.imageBox[index].clickHandler()
    },
    download (file) {
      if (file.url.indexOf('blob:') === 0) {
        downloadAttachment(file.url, file.displayName)
      } else {
        this.getClient().then(client => {
          const result = client.signatureUrl(file.url.replace(/.*\.com\//, ''), {
            response: {
              'content-disposition': 'attachment; filename="' + file.displayName + '"'
            }
          })
          window.location = result
        })
      }
    },
    // 是否还有未完成的上传（提供外部使用）
    validateFinished () {
      for (var i = 0; i < this.fileList.length; i++) {
        if (this.fileList[i].progress !== -1) {
          return false
        }
      }
      return true
    },
    previewFile (file) {
      var href = '/mfs-testBank/detail/fileView/:url/:contentType'
      href = href.replace(':url', file.id)
      href = href.replace(':contentType', file.contentType.split('/')[0])
      window.open(href, '_blank')
    }
  }
}
</script>
<style lang="scss" scoped>
  .xc-file-up {
    line-height: 23px;
    .upload-demo {
      line-height: 40px;
    }
    .file-container {
      .file-item {
        padding: 8px;
        img {
          width: 46px;
          height: 46px;
          margin-right: 8px;
        }
        .file-info {
          width: 280px;
        }
      }
      .image-item {
        position: relative;
        float: left;
        width: 94px;
        height: 94px;
        border: 1px solid #eee;
        margin: 10px 110px 10px 0;
        >>> .el-image {
          width: 100%;
          height: 100%;
        }
        .image-info {
          position: absolute;
          left: 103px;
          bottom: 0;
          white-space: nowrap;
        }
        .file-process-bar {
          bottom: -3px;
        }
      }
    }
  }
</style>
