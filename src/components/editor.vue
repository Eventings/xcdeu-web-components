<template>
  <section>
    <editor
      :value="htmlContent"
      :init="{
        height: 500,
        language: 'zh_CN',
        language_url: publicPath + 'tinymce/langs/zh_CN.js',
        skin: 'oxide',
        skin_url: publicPath + 'tinymce/skins/ui/oxide',
        content_css: publicPath + 'tinymce/skins/content/default/content.css',
        menubar: true,
        toolbar:
          'undo redo | formatselect | bold italic backcolor | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat | \
          image | wordcount',
        plugins: 'image wordcount',
        image_description: false,
        images_reuse_filename: true,
        images_upload_handler: fileUpLoad,
        elementpath: false,
        branding: false
      }"
      @input="editorChange"
      :disabled="disabled"
    />
  </section>
</template>

<script>
import { getOSSKey } from '@/api/index'
// Import TinyMCE
import 'tinymce/tinymce'
// Default icons are required for TinyMCE 5.3 or above
import 'tinymce/icons/default'
// A theme is also required
import 'tinymce/themes/silver'
// Any plugins you want to use has to be imported
import 'tinymce/plugins/image'
import 'tinymce/plugins/wordcount'
import editor from '@tinymce/tinymce-vue'

import OSS from 'ali-oss'
import { v4 as uuidv4 } from 'uuid'

let PATH = null
const region = 'oss-cn-shenzhen'
const bucket = 'gtyzfile'

export default {
  name: 'Editor',
  components: {
    editor: editor
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      publicPath: window.XcComponents.path + 'public/',
      client: null,
      htmlContent: ''
    }
  },
  watch: {
    value: function (val) {
      this.htmlContent = val
    }
  },
  mounted () {
    this.htmlContent = this.value
  },
  methods: {
    editorChange (value) {
      this.$emit('input', value)
    },
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
    fileUpLoad (blobInfo, success, failure, progress) {
      if (!PATH) {
        PATH = 'tinyMCE/img/'
      }
      this.getClient().then(client => {
        const id = uuidv4().replace(/-/g, '')
        const rawFile = blobInfo.blob()
        const fileName = id + rawFile.name.substring(rawFile.name.lastIndexOf('.'))
        client.multipartUpload(PATH + fileName, rawFile, {
          progress: p => {
            progress(p * 100)
          }
        }).then(res => {
          success(res.res.requestUrls[0].replace(/\?.*/g, ''))
        }).catch(err => {
          failure('Image upload failed due to a XHR Transport error. Code: ' + err)
        })
      })
    }
  }
}
</script>
