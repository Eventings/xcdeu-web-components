<template>
  <section>
    <div class="user-container">
      <div @click.prevent="showInput">
        <el-tag
          v-for="tag in dynamicTags"
          :key="tag"
          :closable="!disabled"
          :disable-transitions="false"
          @close="handleClose(tag)"
        >
          {{ tag }}
        </el-tag>
        <el-autocomplete
          v-if="inputVisible && allowWrite"
          ref="saveTagInput"
          v-model="inputVal"
          class="input-new-tag"
          size="small"
          :highlight-first-item="true"
          :fetch-suggestions="querySearchAsync"
          :select-when-unmatched="false"
          @select="handleSelect"
          @change="changeSelect"
        >
          <template slot-scope="{ item }">
            <div class="name">{{ item.name }} {{ item.orgName }}</div>
          </template>
        </el-autocomplete>
      </div>
      <el-button class="btn-append" :disabled="disabled" @click.native="chooseUser">···</el-button>
    </div>
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      width="1000"
      top="0"
      class="abow_dialog"
      :fullscreen="isFullScreen"
      @open="openChooseUserModal"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="choose-selector">
        <!-- <el-button
          type="text"
          style="position: absolute; right: 0; top: 0; z-index: 1"
          @click="clearAll"
        >全部清空</el-button>-->

        <el-tabs v-model="activeName">
          <el-tab-pane v-if="tabRoles.includes('orgUser')" label="组织" name="orgUser">
            <div class="choose-selector-select-container">
              <el-autocomplete
                ref="orgUserSearchInput"
                v-model="orgUserSearchValue"
                popper-class="my-autocomplete"
                :fetch-suggestions="treeSearch"
                :select-when-unmatched="true"
                placeholder="快速查找组织与人"
                @select="(item) => handleTreeSelect(item, 'orgUser')"
                clearable
                @clear="handleClearSearchValue('orgUser')"
                :validate-event="false"
              >
                <i slot="prefix" class="el-icon-search el-input__icon" @click="handleIconClick" />
                <template slot-scope="{ item }">
                  <div>{{ item.name }}&lt;{{ item.orgName }}&gt;</div>
                </template>
              </el-autocomplete>
              <div class="round-border-wrapper">
                <tree
                  class="round-border-content"
                  ref="orgUserNodes"
                  :nodes="orgUserNodes"
                  :setting="setting"
                  @onCheck="onCheck"
                  @onCreated="(treeObj) => handleCreated(treeObj, 'orgUserTree')"
                  @onClick="(e, treeId, treeNode) => clickNode(e, treeId, treeNode, 'orgUserTree')"
                />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="tabRoles.includes('group')" label="群组" name="group">
            <div class="choose-selector-select-container">
              <el-autocomplete
                ref="groupSearchInput"
                popper-class="my-autocomplete"
                :select-when-unmatched="true"
                placeholder="快速查找群组"
                @select="(item) => handleTreeSelect(item, 'group')"
                clearable
                @clear="handleClearSearchValue('group')"
                :validate-event="false"
                style="visibility: hidden;"
              >
                <i slot="prefix" class="el-icon-search el-input__icon" @click="handleIconClick" />
                <template slot-scope="{ item }">
                  <div>{{ item.name }}&lt;{{ item.orgName }}&gt;</div>
                </template>
              </el-autocomplete>
              <div class="round-border-wrapper">
                <tree
                  class="round-border-content"
                  ref="groupNodes"
                  :nodes="groupNodes"
                  :setting="setting"
                  @onCheck="onCheck"
                  @onCreated="(treeObj) => handleCreated(treeObj, 'groupTree')"
                  @onClick="(e, treeId, treeNode) => clickNode(e, treeId, treeNode, 'groupTree')"
                />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="tabRoles.includes('grade')" label="年级" name="grade">
            <div class="choose-selector-select-container">
              <el-autocomplete
                ref="gradeSearchInput"
                popper-class="my-autocomplete"
                :select-when-unmatched="true"
                placeholder="快速查找年级"
                @select="(item) => handleTreeSelect(item, 'grade')"
                clearable
                @clear="handleClearSearchValue('grade')"
                :validate-event="false"
                style="visibility: hidden;"
              >
                <i slot="prefix" class="el-icon-search el-input__icon" @click="handleIconClick" />
                <template slot-scope="{ item }">
                  <div>{{ item.name }}&lt;{{ item.orgName }}&gt;</div>
                </template>
              </el-autocomplete>
              <div class="round-border-wrapper">
                <tree
                  class="round-border-content"
                  ref="gradeNodes"
                  :nodes="gradeNodes"
                  :setting="setting"
                  @onCheck="onCheck"
                  @onCreated="(treeObj) => handleCreated(treeObj, 'gradeTree')"
                  @onClick="(e, treeId, treeNode) => clickNode(e, treeId, treeNode, 'gradeTree')"
                />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="tabRoles.includes('myGroup')" label="我的群组" name="myGroup">
            <div class="choose-selector-select-container">
              <el-autocomplete
                ref="myGroupSearchInput"
                popper-class="my-autocomplete"
                :select-when-unmatched="true"
                placeholder="快速查找我的群组"
                @select="(item) => handleTreeSelect(item, 'myGroup')"
                clearable
                @clear="handleClearSearchValue('myGroup')"
                :validate-event="false"
                style="visibility: hidden;"
              >
                <i slot="prefix" class="el-icon-search el-input__icon" @click="handleIconClick" />
                <template slot-scope="{ item }">
                  <div>{{ item.name }}&lt;{{ item.orgName }}&gt;</div>
                </template>
              </el-autocomplete>
              <div class="round-border-wrapper">
                <tree
                  class="round-border-content"
                  ref="myGroupNodes"
                  :nodes="myGroupNodes"
                  :setting="setting"
                  @onCheck="onCheck"
                  @onCreated="(treeObj) => handleCreated(treeObj, 'myGroupTree')"
                  @onClick="(e, treeId, treeNode) => clickNode(e, treeId, treeNode, 'myGroupTree')"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
        <div class="choose-selector-selected-container">
          <el-input
            class="ipt"
            v-model="selectedSearchValue"
            placeholder="快速查找"
            clearable
            :validate-event="false"
          >
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
          <el-button
            type="text"
            style="position: absolute; right: 0; top: 0; z-index: 1"
            @click="clearAll"
          >全部清空</el-button>
          <div class="round-border-wrapper selected-box">
            <div class="round-border-content">
              <p v-for="(item, index) in filterSelectedList" :key="index" class="selected-item">
                <span>
                  <i :class="'icon-' + item.iconSkin " />
                  <em :title="item.fullOrgName">{{ item.name }}</em>
                </span>
                <i class="icon-close-x" @click="delItem(index, item.id)" />
              </p>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitSelectedValue">确 定</el-button>
        <i class="icon-fullscreen" />
      </span>
    </el-dialog>
  </section>
</template>
<script>
import tree from 'vue-giant-tree'
import { getChooseUserDataByParams, getSearchListByValue } from '@/api/index'
export default {
  name: 'chooseUser',
  components: { tree },
  props: {
    allowWrite: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: function () {
        return []
      }
    },
    selectRole: {
      type: Array,
      default: function () {
        return []
      }
    },
    getUser: {
      type: Function,
      default: getChooseUserDataByParams
    },
    getSearchList: {
      type: Function,
      default: getSearchListByValue
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // 单选
    single: {
      type: Boolean,
      default: false
    },
    // 只选人不选组织
    usersOnly: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '选择成员对象'
    },
    // 只选年级不选校区
    gradeOnly: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      orgUserSearchValue: '',
      selectedSearchValue: '',
      dialogVisible: false,
      activeName: '',
      orgUserNodes: [],
      orgUserSearchNodes: [],
      orgUserTree: null,
      groupNodes: [],
      groupSearchNodes: [],
      groupTree: null,
      myGroupNodes: [],
      myGroupSearchNodes: [],
      myGroupTree: null,
      gradeNodes: [],
      gradeSearchNodes: [],
      gradeTree: null,
      inputVisible: false,
      inputVal: '',
      inputSearchList: [],
      selectedArr: [],
      selelctedFilterArr: [],
      tabRoles: [],
      setting: {
        dblClickExpand: false,
        check: {
          enable: true,
          chkboxType: {
            Y: '',
            N: ''
          },
          chkStyle: this.single ? 'radio' : 'checkbox',
          radioType: "all"
        },
        data: {
          key: {
            name: 'name'
          },
          simpleData: {
            enable: true,
            pIdKey: 'pId'
          }
        },
        view: {
          showIcon: false,
          addDiyDom: this.addDiyDom
        }
      },
      isFullScreen: false
    }
  },
  computed: {
    dynamicTags: function () {
      const arr = []
      const selectArr = this.selectedArr
      for (let i = 0; i < selectArr.length; i++) {
        arr.push(selectArr[i].name + (selectArr[i].orgName ? '<' + selectArr[i].orgName + '>' : ''))
      }
      return arr
    },
    filterSelectedList: function () {
      const value = this.selectedSearchValue
      if (value) {
        return this.selelctedFilterArr.filter(function (item) {
          return (item.name.toString().indexOf(value) !== -1)
        })
      }
      return this.selelctedFilterArr
    }
  },
  watch: {
    // 正确给 cData 赋值的 方法
    value: function (newVal, oldVal) {
      this.value = newVal // newVal即是chartData
      this.selectedArr = this.value
    }
  },
  mounted () {
    this.tabRoles = this.selectRole
    this.loadTreeData()
    this.selectedArr = this.value
  },
  methods: {
    changeSelect (value) {
      // eslint-disable-next-line no-console
      console.log(value)
    },
    handleTreeSelect (item, treeName) {
      if (item.value === '') {
        this[treeName + 'Nodes'] = this[treeName + 'SearchNodes']
      } else if (item.value) {
        this[treeName + 'SearchValue'] = item.value
      } else {
        this[treeName + 'SearchValue'] = item.name + '<' + item.orgName + '>'
      }
      if (this[treeName + 'SearchValue']) {
        let value = this[treeName + 'SearchValue']
        value = value.indexOf('<') !== -1 ? value.substring(0, value.indexOf('<')) : value
        this.searchTree(value, treeName)
      }
    },
    searchTree (queryString, treeName) {
      // const treeObj = this[treeName + 'Tree']
      // this[treeName + 'Nodes'] = treeObj.getNodesByParamFuzzy('name', queryString, null)
      const inputSearchList = this[treeName + 'SearchNodes']
      this[treeName + 'Nodes'] = queryString ? inputSearchList.filter(this.createFilter(queryString)) : inputSearchList
    },
    handleIconClick () {

    },
    treeSearch (queryString, cb) {
      const inputSearchList = this.orgUserSearchNodes
      const results = queryString ? inputSearchList.filter(this.createFilter(queryString)) : inputSearchList
      // 如果搜索了就将结果加上组织信息便于辨认
      this.setting.data.key.name = queryString ? 'fullOrgName' : 'name'
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter (queryString) {
      return (restaurant) => {
        return (restaurant.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    // 打开模态框 重新渲染已经选择的用户
    openChooseUserModal () {
      this.activeName = this.tabRoles[0]
      this.selelctedFilterArr = JSON.parse(JSON.stringify(this.selectedArr))
      this.canceSelectAllBtns()
      for (const role of this.tabRoles) {
        this.initTreeCheck(this[role + 'Tree'])
      }
    },
    // 全部清空
    clearAll () {
      this.selelctedFilterArr = []
      this.canceSelectAllBtns()
      for (const role of this.tabRoles) {
        this.initTreeCheck(this[role + 'Tree'])
      }
    },
    // 清除所有树节点全选
    canceSelectAllBtns () {
      const checkboxArr = document.querySelectorAll('input.selectAllBtn')
      for (const checkbox of checkboxArr) {
        checkbox.checked = false
      }
    },
    // 分别加载 所有树的数据
    loadTreeData () {
      for (const cmp of this.tabRoles) {
        const params = {
          type: cmp
        }
        this.getUser(params).then(res => {
          this.addFullOrgName(res)
          this[cmp + 'Nodes'] = res
          this[cmp + 'SearchNodes'] = res
        })
      }
    },
    // 给数据添加完整组织供搜索时展示
    addFullOrgName (dataArr) {
      for (let i = 0; i < dataArr.length; i++) {
        var pId = dataArr[i].pId
        var fullOrgName = []
        while (pId !== '-1' && pId !== '') {
          for (let j = 0; j < dataArr.length; j++) {
            if (pId === dataArr[j].id) {
              fullOrgName.push(dataArr[j].name)
              pId = dataArr[j].pId
              break
            }
          }
        }
        dataArr[i].fullOrgName = dataArr[i].name
        if (fullOrgName.length) {
          dataArr[i].fullOrgName += ' <' + fullOrgName.reverse().join('-') + '>'
        }
      }
    },
    // 初始化树 的全选 节点
    addDiyDom (treeId, treeNode) {
      if (this.single) {
        return;
      }
      if (treeNode.isParent) {
        // 如果该节点为父节点 则在该节点后 新增全选按钮 点击全选 下面的子节点 全部被选中
        const allSelect = document.createElement('label')
        const checkbox = document.createElement('input')
        const text = document.createElement('span')
        text.innerHTML = '全选'
        checkbox.setAttribute('type', 'checkbox')
        checkbox.setAttribute('class', 'selectAllBtn')
        allSelect.appendChild(checkbox)
        allSelect.appendChild(text)
        const selectNode = document.getElementById(treeNode.tId)
        selectNode.appendChild(allSelect)
        const treeObj = window.jQuery.fn.zTree.getZTreeObj(treeId)
        checkbox.onclick = function () {
          const check = this.checked
          const treeNodes = treeNode.children
          if (check) {
            for (const node of treeNodes) {
              treeObj.checkNode(node, true, false, true)
            }
          } else {
            for (const node of treeNodes) {
              treeObj.checkNode(node, false, false, true)
            }
          }
        }
      }
    },
    // 单击节点 选中 checkbox
    clickNode (evt, treeId, treeNode, cmd) {
      if (treeNode.checked) { // 已被勾选，取消勾选
        this[cmd].checkNode(treeNode, false, false, true)
      } else { // 勾选
        this[cmd].checkNode(treeNode, true, false, true)
      }
    },
    handleCreated (ztreeObj, cmd) {
      this[cmd] = ztreeObj
      // 初始化设置禁用
      let nodes_all = ztreeObj.getNodes(); //获取根节点下的子节点
      nodes_all = ztreeObj.transformToArray(nodes_all);
      if (this.usersOnly) {
        // 遍历所有的节点，如果该节点popcode != user则禁用单/复选框
        for (let i = 0; i < nodes_all.length; i++) {
          if (nodes_all[i].popcode !== 'user') {
            ztreeObj.setChkDisabled(nodes_all[i], true, false, false);
          }
        }
      }
      if (this.gradeOnly) {
        // 遍历所有的节点，如果该节点popcode != grade则禁用单/复选框
        for (let i = 0; i < nodes_all.length; i++) {
          if (nodes_all[i].popcode !== 'grade') {
            ztreeObj.setChkDisabled(nodes_all[i], true, false, false);
          }
        }
      }
      this.initTreeCheck(ztreeObj)
    },
    // 初始化ztree选项
    initTreeCheck (ztreeObj) {
      if (ztreeObj) {
        ztreeObj.checkAllNodes(false)
        // 清空单选框
        if (this.single) {
          let nodes = ztreeObj.getSelectedNodes()
          if (nodes.length) {
            ztreeObj.checkNode(nodes[0], false, false, true)
          }
        }
        const selectArr = this.selelctedFilterArr
        for (let i = 0; i < selectArr.length; i++) {
          const nodes = ztreeObj.getNodesByParam('id', selectArr[i].id, null)
          if ( nodes.length > 0 ) {
            for(let j = 0; j < nodes.length; j++) {
              ztreeObj.checkNode(nodes[j], true, false, false)
              if (nodes[j].getParentNode() !== null) {
                let parentNode = nodes[j].getParentNode() //获取父节点
                ztreeObj.expandNode(parentNode, true, false, false, false)
              }
            }
          }
        }
      }
    },
    // 选择autocomplate 列表选项的回调
    handleSelect (item) {
      this.inputVisible = false
      let isSelected = false
      for (const selectedItem of this.selectedArr) {
        if (selectedItem.id === item.id) {
          isSelected = true
          break
        }
      }
      if (!isSelected) {
        this.selectedArr.push(item)
      }
    },
    // 返回autocomplete 的结果集
    querySearchAsync (queryString, cb) {
      let inputSearchList
      this.getSearchList({ searchName: queryString }).then(res => {
        inputSearchList = res
        const results = queryString ? inputSearchList.filter(this.createStateFilter(queryString)) : inputSearchList
        cb(results)
        if (results.length === 0) {
          this.inputVal = ''
        }
      })
    },
    // 创建autocomplete 的filter
    createStateFilter (queryString) {
      return (inputVal) => {
        return (inputVal.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    // tag 删除
    handleClose (tag) {
      this.selectedArr.splice(this.dynamicTags.indexOf(tag), 1)
      this.$emit('input', this.selectedArr)
    },
    // 搜索显示输入框
    showInput () {
      if (this.disabled) {
        return
      }
      if (this.allowWrite) {
        this.inputVisible = true
        this.$nextTick(function () {
          this.$refs.saveTagInput.focus()
        })
      } else {
        this.chooseUser()
      }
    },
    // 打开选人模态框
    chooseUser () {
      this.orgUserSearchValue = ''
      this.selectedSearchValue = ''
      this.handleTreeSelect({ value: '' }, 'orgUser')
      this.dialogVisible = true
    },
    // ztree checkbox 选中
    onCheck (event, treeId, treeNode) {
      if (treeNode.checked) {
        // 如果同一人有多个组织，不重复添加
        for (let i = 0; i < this.selelctedFilterArr.length; i++) {
          if (this.selelctedFilterArr[i].id === treeNode.id) {
            return
          }
        }
        if (this.single) {
          this.selelctedFilterArr = []
        }
        const node = {
          id: treeNode.id,
          pid: treeNode.pId,
          name: treeNode.name,
          popcode: treeNode.popcode,
          orgName: treeNode.orgName,
          iconSkin: treeNode.iconSkin,
          canSelect: treeNode.canSelect,
          open: treeNode.open,
          fullOrgName: treeNode.fullOrgName
        }
        this.selelctedFilterArr.push(node)
      } else {
        // 如果同一人有多个组织，取消选择该人时取消所有
        this.cancelTreeSelected(window.jQuery.fn.zTree.getZTreeObj(treeId), treeNode.id)
        for (let i = 0; i < this.selelctedFilterArr.length; i++) {
          if (treeNode.id === this.selelctedFilterArr[i].id) {
            this.selelctedFilterArr.splice(i, 1)
            break
          }
        }
      }
    },
    // 选人列表删除选项
    delItem (index, id) {
      for (let i = 0; i < this.selelctedFilterArr.length; i++) {
        if (this.selelctedFilterArr[i].id === id) {
          this.selelctedFilterArr.splice(i, 1)
          break
        }
      }
      for (const role of this.tabRoles) {
        if (this[role + 'Tree']) {
          this.cancelTreeSelected(this[role + 'Tree'], id)
          return
        }
      }
    },
    cancelTreeSelected (ztreeObj, id) {
      const nodes = ztreeObj.getNodesByParam('id', id, null)
      if ( nodes.length > 0 ) {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].checked) {
            ztreeObj.checkNode(nodes[i], false, false, false)
          }
        }
      }
    },
    // 点击确定关闭模态框
    submitSelectedValue () {
      this.selectedArr = this.selelctedFilterArr
      this.$emit('input', this.selectedArr)
      this.dialogVisible = false
    },
    handleClearSearchValue (name) {
      this.$refs[name + 'SearchInput'].activated = true
    }
  }
}
</script>
<style lang="scss" scoped>
.user-container {
  border-radius: 4px;
  background-color: #fff;
  border: 1px solid #ededed;
  .btn-append {
    border: none;
    border-left: 1px solid #ededed;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
.user-container>div {
  border: none;
}
.choose-selector-select-container {
  width: 40%;
  padding-right: 0;
}
.ipt {
  width: 215px;
}
.choose-selector {
  >>> .el-tab-pane {
    padding-left: 5%;
  }
  .choose-selector-selected-container {
    right: 5%;
    .selected-box {
      .selected-item {
        height: 22px;
      }
    }
  }
}
.round-border-wrapper {
  border: 1px solid #ccc;
  border-radius: 3%;
  margin-top: 9px;
  height: 300px;
  overflow: hidden;
}
.round-border-content {
  height: 100%;
  overflow: auto;
  padding: 15px;
}
.choose-selector-selected-container>div:last-child {
  height: 300px;
  padding: 0;
}
</style>
