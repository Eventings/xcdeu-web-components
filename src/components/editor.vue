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
          image link | wordcount',
        plugins: 'image link wordcount',
        image_description: false,
        images_reuse_filename: true,
        images_upload_handler: fileUpLoad,
        file_picker_types: 'file',
        file_picker_callback: filePickerCallback,
        elementpath: false,
        branding: false
      }"
      @input="editorChange"
      :disabled="disabled"
    />
    <el-dialog
      v-if="attachPercentage !== -1"
      title="正在上传..."
      :visible="attachPercentage !== -1"
      width="30%"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body>
      <div class="tx-c">
        <el-progress type="circle" :percentage="attachPercentage"></el-progress>
      </div>
      <div class="tx-c margin-top-size-nomal">
        <el-button @click="attachCancelHandler">取 消</el-button>
      </div>
    </el-dialog>
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
import 'tinymce/plugins/link'
import 'tinymce/plugins/wordcount'
import editor from '@tinymce/tinymce-vue'

import OSS from 'ali-oss'
import { v4 as uuidv4 } from 'uuid'

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
      htmlContent: '',
      attachPercentage: -1
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
    fileUpLoad (blobInfo, success, failure, progress, type) {
      let path = 'tinyMCE/img/'
      if (type === 'attach') {
        path = 'tinyMCE/file/'
      }
      this.getClient().then(client => {
        const id = uuidv4().replace(/-/g, '')
        const rawFile = blobInfo.blob()
        const fileName = id + rawFile.name.substring(rawFile.name.lastIndexOf('.'))
        client.multipartUpload(path + fileName, rawFile, {
          progress: p => {
            progress(p * 100)
          }
        }).then(res => {
          success(res.res.requestUrls[0].replace(/\?.*/g, ''))
        }).catch(err => {
          failure('Image upload failed due to a XHR Transport error. Code: ' + err)
        })
      })
    },
    filePickerCallback (cb, value, meta) {
      var that = this;
      var input = document.createElement('input');
      input.setAttribute('type', 'file');
      // input.setAttribute('accept', 'image/*');

      /*
        Note: In modern browsers input[type="file"] is functional without
        even adding it to the DOM, but that might not be the case in some older
        or quirky browsers like IE, so you might want to add it to the DOM
        just in case, and visually hide it. And do not forget do remove it
        once you do not need it anymore.
      */
      input.style.display = 'none';
      document.body.appendChild(input);

      input.onchange = function () {
        var file = this.files[0];

        var reader = new FileReader();
        reader.onload = function () {
          /*
            Note: Now we need to register the blob in TinyMCEs image blob
            registry. In the next release this part hopefully won't be
            necessary, as we are looking to handle it internally.
          */
          var id = 'blobid' + (new Date()).getTime();
          var blobCache = tinymce.activeEditor.editorUpload.blobCache;
          var base64 = reader.result.split(',')[1];
          var blobInfo = blobCache.create(id, file, base64);
          // blobCache.add(blobInfo);
          that.fileUpLoad(blobInfo, function (url) {
            /* call the callback and populate the Text field with the file name */
            cb(url, { text: file.name });
            that.attachPercentage = -1
            document.body.removeChild(input);
          }, function () {
            cb('', { text: '附件上传失败，请重试' });
            that.attachPercentage = -1
            document.body.removeChild(input);
          }, function (percentage) {
            that.attachPercentage = percentage
          }, 'attach');
        };
        reader.readAsDataURL(file);
      };

      input.click();
    },
    attachCancelHandler () {
      // 暂停分片上传。
      this.client.cancel();
      this.attachPercentage = -1
    }
  }
}
</script>
