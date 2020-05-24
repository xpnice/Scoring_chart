<template>
  <div>
    <el-table :data="tableData"
              border
              v-loading="fetching"
              :span-method="arraySpanMethod"
              size="mini"
              style="width: 100%"
              :row-class-name="tableRowClassName">
      <el-table-column :label="name"
                       align="center">
        <el-table-column v-if="auth"
                         label="管理"
                         width="50"
                         type="expand">
          <template slot-scope="props">
            <el-card>
              <div slot="header"
                   class="clearfix">
                <span style="font-size: 14px;">{{props.row.item}}扣分控制面板</span>
                <el-button style="float: right; padding: 3px 0"
                           type="text"
                           size="small"
                           @click="handleCreate(props.$index)">新建扣分</el-button>
              </div>
              <div>
                <el-table :data="props.row.issues"
                          border
                          size="mini"
                          style="width: 100%">
                  <el-table-column label="扣分"
                                   prop="minusScore"
                                   width="80">
                  </el-table-column>
                  <el-table-column label="扣分原因"
                                   prop="reason">
                  </el-table-column>
                  <el-table-column label="操作"
                                   width="180"
                                   fixed="right">
                    <template slot-scope="scope">
                      <el-button size="mini"
                                 @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                      <el-button size="mini"
                                 type="danger"
                                 @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </template>
        </el-table-column>
        <el-table-column prop="serial"
                         label="序号"
                         align="center"
                         width="50">
        </el-table-column>
        <el-table-column prop="item"
                         show-overflow-tooltip
                         label="评分指标"
                         align="center"
                         width="150">
        </el-table-column>
        <el-table-column prop="standardScore"
                         label="标准分值"
                         align="center"
                         width="70">
        </el-table-column>
        <el-table-column prop="explanation"
                         show-overflow-tooltip
                         label="考核内容及评分标准"
                         header-align="center"
                         min-width="150"
                         width="150">
        </el-table-column>
        <el-table-column prop="minusScore"
                         label="总扣分"
                         align="center"
                         width="60">
        </el-table-column>
        <el-table-column label="扣分项"
                         align="center">
          <el-table-column label="扣分"
                           :resizable="false"
                           align="center"
                           width="110">
          </el-table-column>
          <el-table-column prop="issues"
                           label="扣分原因"
                           align="center"
                           min-width="300">
            <template slot-scope="scope">
              <el-table :data="scope.row.issues"
                        :show-header="false"
                        border
                        size="mini"
                        style="width: 100%;">
                <el-table-column prop="minusScore"
                                 label="扣分"
                                 width="100">
                </el-table-column>
                <el-table-column prop="reason"
                                 :show-overflow-tooltip="true"
                                 label="扣分原因"
                                 min-width="300">
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table-column>
    </el-table>
    <el-dialog title="新建扣分"
               cdestroy-on-close
               @close="close"
               :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="建议扣分"
                      :label-width="formLabelWidth">
          <el-input-number :value="form.region!==''?tableData[selected].standards[form.region].score:0"
                           :disabled="true"></el-input-number>
        </el-form-item>
        <el-form-item label="评分标准"
                      :label-width="formLabelWidth"
                      style="width: 100%">
          <el-select v-model="form.region"
                     v-if="tableData[selected]!=undefined"
                     allow-create
                     filterable
                     :disabled="editing"
                     v-on:change="changeSelection"
                     placeholder="请选择评分标准">
            <el-option v-for="standard in tableData[selected].standards"
                       v-bind:key="standard.index"
                       :value="standard.index"
                       :label="standard.reason"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="扣分"
                      :label-width="formLabelWidth">
          <el-input-number v-model="form.num"
                           :precision="2"
                           :step="0.5"
                           :max="10"></el-input-number>
        </el-form-item>
        <el-form-item label="备注"
                      :label-width="formLabelWidth">
          <el-input v-model="form.name"
                    autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary"
                   :disabled="form.region===''"
                   @click="confirmCreate">确 定</el-button>
      </div>
    </el-dialog>
    <el-button style="margin-top:20px;margin-bottom:20px;"
               @click="confirmdispatch"
               v-show="!fetching"
               :loading="dispatching"
               type="primary">{{this.auth?'发布评价表':'管理员模式'}}</el-button>
    <div v-if="1-auth">
      <el-select v-model=" select_index1"
                 clearable
                 placeholder="选择板块">
        <el-option v-for="item in first_chart"
                   :key="item.index"
                   :label="item.name"
                   :value="item.index">
        </el-option>
      </el-select>
      <el-select v-model=" select_index2"
                 clearable
                 placeholder="选择评分指标"
                 :disabled="select_index1===''">
        <el-option v-for="item in second_chart[select_index1]"
                   :key="item.index"
                   :label="item.name"
                   :value="item.index">
        </el-option>
      </el-select>
      <div id="first"
           :hidden="select_index1!==''"
           style="margin-top:20px;margin:20px auto;width: 900px;height:400px;">
      </div>
      <div id="second"
           :hidden="select_index1===''||select_index2!==''"
           style="margin-top:20px;margin:20px auto;width: 900px;height:400px;">
      </div>
      <div id="third"
           :hidden="select_index1===''||select_index2===''"
           style="margin-top:20px;margin:20px auto;width: 900px;height:400px;">
      </div>
    </div>
  </div>
</template>
<script>
/**
 * @Description: 综评系统的打分部分
 * @author YANPENGLEE
 * @date 2020/5/10
 */
import res from './response.json'
import { fetchTableById, dispatchScore } from '@/api/remote-search'
const dev = false
const _fetchtable = function (body, timeout = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(body)
    }, timeout)
  })
}
export default {
  data () {
    return {
      auth: 1, // 1未发布0已发布
      editing: false, // 仍在编辑扣分项
      selected: 0, // 选择的行
      dialogFormVisible: false, // 是否显示新建扣分模态框
      select_index1: '', // 板块扣分索引
      select_index2: '', // 标准扣分索引
      form: { // 扣分项表单
        num: 0,
        note: '',
        region: ''
      },
      formLabelWidth: '120px', // 新建扣分的输入栏宽度
      name: '', // 打分表名称
      dispatching: false, // 发布正在加载
      fetching: true, // 正在从后台获取表单
      tableData: [], // 表单树
      first_chart: [], // 板块扣分数组
      second_chart: [] // 标准扣分数组
    }
  },
  async mounted () {
    let response
    if (dev) {
      response = await _fetchtable(res)
    } else {
      response = await fetchTableById('YPJ4')
      response = response.data
    }
    this.name = response.name
    this.tableData = response.tableData
    for (let table of this.tableData) {
      if (table.serial === 'title') {
        if (table.hasOwnProperty('score')) {
          table.explanation = table.item.concat(`（${table.score}分）`)
        } else {
          table.explanation = table.item.concat('（额外扣分项）')
        }
      } else {
        for (let index in table.standards) {
          table.standards[index].index = parseInt(index, 10)
        }
      }
    }
    this.fetching = false
  },
  watch: {
    auth: async function () { // 切换管理员模式
      this.select_index2 = this.select_index1 = '' // 清空选择器
    },
    select_index1 () {
      if (this.select_index1 !== '') {
        this.select_index2 = ''
        this.drawChart2()
      }
    },
    select_index2 () {
      if (this.select_index2 !== '') {
        this.drawChart3()
      }
    },
    form: function () { console.log(this.form) }
  },
  methods: {
    async confirmdispatch () {
      if (this.auth === 1) {
        this.dispatching = true
        if (dev) { // 开发模式
          this.auth = 0
          await this.calChart() // 计算表格
          await this.drawChart1() // 绘制按板块划分的图
        } else { // 后端模式
          let response = await dispatchScore({
            'data': JSON.stringify(this.tableData),
            'projectID': 10,
            'filename': 'YJ-4',
            'score': 20
          }).catch((err) => { console.log(err) })
          if (!!response) {
            this.auth = 0
            await this.calChart() // 计算表格
            await this.drawChart1() // 绘制按板块划分的图
          }
        }
        this.dispatching = false
      } else this.auth = 1
    },
    /**
    *  绘制按板块划分的echarts
    */
    drawChart1 () {
      // 基于准备好的dom，初始化echarts实例
      let myChart1 = this.$echarts.init(document.getElementById('first'))
      // 指定图表的配置项和数据
      let option1 = {
        title: {
          text: this.name
        },
        tooltip: {},
        legend: {
          data: ['扣分', '总分']
        },
        xAxis: {
          data: this.first_chart.map((data) => {
            return data.name
          })
        },
        yAxis: {},
        series: [
          {
            name: '扣分',
            type: 'bar',
            data: this.first_chart.map((data) => {
              return data.minusScore
            })
          },
          {
            name: '总分',
            type: 'bar',
            data: this.first_chart.map((data) => {
              return data.standardScore
            })
          }

        ]
      }
      // 使用刚指定的配置项和数据显示图表。
      myChart1.setOption(option1)
    },
    /**
    *  绘制按评分标准的echarts
    */
    drawChart2 () {
      // 基于准备好的dom，初始化echarts实例
      let myChart2 = this.$echarts.init(document.getElementById('second'))
      // 指定图表的配置项和数据
      let option2 = {
        title: {
          text: this.name
        },
        tooltip: {},
        legend: {
          data: ['扣分', '总分']
        },
        xAxis: {
          data: this.second_chart[this.select_index1].map((data) => {
            return data.name
          })
        },
        yAxis: {},
        series: [
          {
            name: '扣分',
            type: 'bar',
            data: this.second_chart[this.select_index1].map((data) => {
              return data.minusScore
            })
          },
          {
            name: '总分',
            type: 'bar',
            data: this.second_chart[this.select_index1].map((data) => {
              return data.standardScore
            })
          }

        ]
      }
      // 使用刚指定的配置项和数据显示图表。
      myChart2.setOption(option2)
    },
    /**
    *  绘制按扣分项目的echarts
    */
    drawChart3 () {
      // 基于准备好的dom，初始化echarts实例
      let myChart3 = this.$echarts.init(document.getElementById('third'))
      // 指定图表的配置项和数据
      let option3 = {
        title: {
          text: this.name
        },
        tooltip: {},
        legend: {
          data: ['扣分']
        },
        xAxis: {
          data: this.second_chart[this.select_index1][this.select_index2].issues.map((data) => {
            return data.reason
          })
        },
        yAxis: {},
        series: [
          {
            name: '扣分',
            type: 'bar',
            data: this.second_chart[this.select_index1][this.select_index2].issues.map((data) => {
              return data.minusScore
            })
          }
        ]
      }
      // 使用刚指定的配置项和数据显示图表。
      myChart3.setOption(option3)
    },
    /**
    *  行列合并函数
    *  @param object 你好
    */
    arraySpanMethod ({ row, column, rowIndex, columnIndex }) {
      if (row.serial === 'title') {
        if (columnIndex === this.auth + 3) {
          return [1, 8]
        } else {
          return [0, 0]
        }
      }
      if (columnIndex === this.auth + 6) {
        return [1, 2]
      } else if (columnIndex === this.auth + 5) {
        return [0, 0]
      }
      if (columnIndex <= this.auth + 2 && columnIndex > 0) {
        if ((rowIndex < this.tableData.length - 1) && row.serial === this.tableData[rowIndex + 1].serial) {
          return [2, 1]
        }
        if ((rowIndex > 0) && row.serial === this.tableData[rowIndex - 1].serial) {
          return [0, 0]
        }
      }
    },
    tableRowClassName ({ row, rowIndex }) { // 板块列的高亮
      if (row.serial === 'title') {
        return 'success-row'
      }
      return ''
    },
    close () {
      // 新建扣分dialog打开时执行的回调
      this.form = {
        num: 0,
        note: '',
        region: ''
      }
    },
    calChart () {
      this.first_chart = []
      this.second_chart = []
      let temp = { minusScore: 0, standardScore: 0 }
      let arr = []
      let name = this.tableData[0].item
      let indexTitle = 0
      let indexItem = 0
      for (let i = 1; i <= this.tableData.length; i++) {
        if (i === this.tableData.length || this.tableData[i].serial === 'title') {
          this.first_chart.push(Object.assign({}, temp, { name, index: indexTitle }))
          if (i !== this.tableData.length) {
            name = this.tableData[i].item
          }
          this.second_chart.push(arr)
          indexTitle++
          indexItem = 0
          arr = []
          temp = { minusScore: 0, standardScore: 0 }
        } else {
          arr.push({
            standardScore: this.tableData[i].standardScore,
            minusScore: this.tableData[i].minusScore,
            name: this.tableData[i].item,
            index: indexItem++,
            issues: this.tableData[i].issues
          })
          temp.minusScore += this.tableData[i].minusScore
          temp.standardScore += this.tableData[i].standardScore
        }
      }
    },
    /**
    *  点击新建扣分
    *  @method (handleCreate)
    *  @param {number} index 你好
    */
    handleCreate (index) {
      // 点击新建扣分
      this.selected = index
      this.dialogFormVisible = true
    },
    handleEdit (index, row) {
      // 点击编辑的回调
      let parent = this.tableData[row.father]
      this.selected = row.father
      this.form.num = row.minusScore
      this.form.region = parent.standards.filter((data) => { if (data.reason === row.reason) return data })[0].index
      this.editing = true
      this.dialogFormVisible = true
    },
    handleDelete (index, row) {
      // 删除扣分项
      let parent = this.tableData[row.father]
      parent.issues.splice(index, 1)
      parent.minusScore = this.computedScore(row.father)
    },
    computedScore (index) {
      // 计算当前评分指标的得分
      return this.tableData[index].issues.reduce((sum, data) => { return (sum + data.minusScore) }, 0)
    },
    changeSelection () {
      // 切换评分标准时的回调
      if (this.form.region !== '') {
        this.form.num = this.tableData[this.selected].standards.filter((data) => { if (data.index === this.form.region) return data })[0].score
      }
    },
    confirmCreate () {
      // 确认新建后执行的回调
      let parent = this.tableData[this.selected]
      if (this.editing) {
        let reason = parent.standards.filter((data) => { if (data.index === this.form.region) return data })[0].reason
        parent.issues.filter((data) => { if (data.reason === reason) return data })[0].minusScore = this.form.num
        parent.minusScore = this.computedScore(this.selected)
        this.editing = false
      } else {
        let issue = {}
        issue.minusScore = this.form.num
        issue.reason = parent.standards.filter((data) => { if (data.index === this.form.region) return data })[0].reason
        issue.father = this.selected
        let flag = parent.issues.filter((data) => { if (data.reason === issue.reason) return data }).length
        if (flag) {
          alert('已存在同名扣分项')
          this.dialogFormVisible = false
          return
        }
        parent.issues.push(issue)
        console.log(parent.issues)
        parent.minusScore += issue.minusScore
        // parent.minusScore < 0 && (parent.minusScore = 0)
      }
      this.dialogFormVisible = false
    }
  }
}
</script>
<style >
.el-input__inner {
  height: 40px;
  line-height: 40px;
  outline: none;
  padding: 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: '';
}
.clearfix:after {
  clear: both;
}
.el-table .success-row {
  background: #f0f9eb;
}
</style>
