<template>
  <div style="height: 100%; overflow: auto;">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
      style="margin: 20px auto; width: 1000px;"
    >
      <el-form-item label="活动名称" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="选人" prop="users">
        <chooseUser
          v-model="form.users"
          :select-role="['orgUser']"
          single
          users-only
          @input="validateField('users')"
        />
      </el-form-item>
      <el-form-item label="上传图片" prop="pictures">
        <FileUp
          ref="pictures"
          v-model="form.pictures"
          upload-type="image"
          domain-id="0"
          dir="component"
          @input="validateField('pictures')"
        />
      </el-form-item>
      <el-form-item label="上传样式" prop="upload">
        <FileUp
          v-model="form.upload"
        >
          <el-button type="text">上传文件</el-button>
          <template v-slot:list="slotProps">
            <div v-for="file in slotProps.fileList">
              名称：{{file.displayName}}， 大小：{{file.fileSize}}， id：{{file.id}}，
              url：{{file.url}}， 状态：{{file.status}}， 进度：{{file.progress}}
            </div>
          </template>
        </FileUp>
      </el-form-item>
      <el-form-item label="限制上传个数">
        <FileUp
          value="13051d29943248b19d232bcfd727bc9c"
          :limit="1"
          :on-exceed="handleExceed"
        >
        </FileUp>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <Editor v-model="form.content" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即创建</el-button>
        <el-button>取消</el-button>
        <el-button @click="onTest">测试</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      form : {
        name: '',
        users: [],
        pictures: '13051d29943248b19d232bcfd727bc9c',
        upload: '13051d29943248b19d232bcfd727bc9c',
        content: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符' }
        ],
        users: [
          { type: 'array', required: true, message: '请选择人员' }
        ],
        pictures: [
          { required: true, message: '请上传图片' }
        ],
        content: [
          { required: true, message: '请填写内容' }
        ]
      }
    }
  },
  methods: {
    validateField (type) {
      this.$refs.form.validateField(type)
    },
    handleExceed (files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    onSubmit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (!this.$refs.pictures.validateFinished()) {
            this.$message.warning('正在上传，请稍后再提交！')
            return
          }
          this.$message.success('submit!')
        }
      })
    },
    onTest () {
      this.form.pictures = '13051d29943248b19d232bcfd727bc9c'
      this.validateField('pictures')
    }
  }
}
</script>

