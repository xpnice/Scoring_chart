<template>
  <div>
    <el-table :data="tableData"
              border
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
        <el-table-column prop="confrimedScore"
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
                     :disabled="
                     editing"
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
    <el-button style="margin-top:20px"
               @click="auth=1-auth"
               type="primary">{{this.auth?'发布评价表':'管理员模式'}}</el-button>
    <div id="main"
         v-show="auth===0"
         style="margin-top:20px;width: 900px;height:400px;"></div>
  </div>
</template>
<script>
import res from './response.json'
const fetchtable = function (body, timeout = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(body)
    }, timeout)
  })
}
export default {
  data () {
    return {
      auth: 1,
      editing: false,
      selected: 0,
      dialogFormVisible: false,
      form: {
        num: 0,
        note: '',
        region: ''
      },
      formLabelWidth: '120px',
      name: '',
      tableData: []
    }
  },
  async mounted () {
    let response = await fetchtable(res)
    this.name = response.name
    this.tableData = response.tableData
    for (let table of this.tableData) {
      if (table.serial === 'title') {
        table.explanation = table.explanation.concat(`（${table.score}分）`)
      } else {
        for (let index in table.standards) {
          table.standards[index].index = parseInt(index, 10)
        }
        console.log(table.standards)
      }
    }
  },
  watch: {
    auth: function () { this.drawChart() },
    form: function () { console.log(this.form) }
  },
  methods: {
    drawChart () {
      // 基于准备好的dom，初始化echarts实例
      let myChart = this.$echarts.init(document.getElementById('main'))
      // 指定图表的配置项和数据
      let option = {
        title: {
          text: this.name
        },
        tooltip: {},
        legend: {
          data: ['扣分', '总分']
        },
        xAxis: {
          data: this.tableData.filter((data) => {
            return (data.serial !== 'title')
          }).map((data) => { return data.item })
        },
        yAxis: {},
        series: [
          {
            name: '扣分',
            type: 'bar',
            data: this.tableData.filter((data) => {
              return (data.serial !== 'title')
            }).map((data) => { return data.confrimedScore })
          },
          {
            name: '总分',
            type: 'bar',
            data: this.tableData.filter((data) => {
              return (data.serial !== 'title')
            }).map((data) => { return data.standardScore })
          }

        ]
      }
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option)
    },
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
    tableRowClassName ({ row, rowIndex }) {
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
      parent.confrimedScore = this.computedScore(row.father)
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
        parent.confrimedScore = this.computedScore(this.selected)
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
        parent.confrimedScore += issue.minusScore
        // parent.confrimedScore < 0 && (parent.confrimedScore = 0)
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
