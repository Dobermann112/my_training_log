import { Controller } from "@hotwired/stimulus"
import ApexCharts from "apexcharts"

export default class extends Controller {
  static targets = [
    "line",
    "pie",
    "bar",
    "range",
    "bodyPart",
    "mode",
    "summarySets",
    "summaryReps",
    "summaryStreak",
    "summaryLabel1",
    "summaryLabel2"
  ]

  connect() {
    this._charts = { line: null, pie: null, bar: null }
    this.currentRange = "month" // ←　月表示がデフォルト
    this.currentBodyPart = "" // ←　全身がデフォルト
    this.currentMode = "strength"
    this.load()
    window.addEventListener("turbo:before-render", () => this._destroyAll())
  }

  updateSummary(summary) {
    if (!summary) return
    this.summarySetsTarget.textContent = summary.total_sets
    this.summaryRepsTarget.textContent = summary.total_reps
    this.summaryStreakTarget.textContent = summary.streak_days
  }

  updateCardioSummary(summary) {
    if (!summary) return
    this.summarySetsTarget.textContent = `${summary.total_duration} 分`
    this.summaryRepsTarget.textContent = `${summary.total_distance} km`
    this.summaryStreakTarget.textContent = summary.streak_days
  }

  setStrengthSummaryLabels() {
    this.summaryLabel1Target.textContent = "総セット"
    this.summaryLabel2Target.textContent = "総レップ"
  }

  setCardioSummaryLabels() {
    this.summaryLabel1Target.textContent = "合計時間"
    this.summaryLabel2Target.textContent = "合計距離"
  }  
  
  disconnect() { this._destroyAll() }

  changeRange() {
    this.currentRange = this.rangeTarget.value
    this.load()
  }
  
  changeMode() {
    this.currentMode = this.modeTarget.value
  
    if (this.currentMode === "cardio") {
      this.currentBodyPart = ""
      this.bodyPartTarget.value = ""
      this.bodyPartTarget.disabled = true
      this.setCardioSummaryLabels()
    } else {
      this.bodyPartTarget.disabled = false
      this.setStrengthSummaryLabels()
    }
  
    this.load()
  }  

  changeBodyPart() {
    this.currentBodyPart = this.bodyPartTarget.value
    this.load()
  }

  async load() {
    if (this.currentMode === "cardio") {
      await this._loadCardio()
    } else {
      await this._loadStrength()
    }
  }
  
  async _loadStrength() {
    const params = new URLSearchParams({
      range: this.currentRange,
      body_part_id: this.currentBodyPart
    })
  
    try {
      const res = await fetch(`/stats/graphs?${params.toString()}`, {
        headers: { Accept: "application/json" }
      })
      const data = await res.json()
  
      this._renderLine(data.line_daily_volume || [])
      this._renderPie(data.pie_by_body_part || [])
      this._renderBar(data.bar_by_exercise || [])
  
      this.updateSummary(data.summary)
    } catch (e) {
      console.error("筋トレグラフ取得失敗:", e)
    }
  }

  async _loadCardio() {
    const params = new URLSearchParams({
      range: this.currentRange
    })
  
    try {
      const res = await fetch(`/stats/cardio_graphs?${params.toString()}`, {
        headers: { Accept: "application/json" }
      })
      const data = await res.json()

      // line：時間推移
      this._renderLineCardio(data.line_duration || [])
  
      // bar：種目傾向
      this._renderBarCardio(data.bar_by_exercise || [])
  
      // pie 
      this._renderPieCardio(data.bar_by_exercise || [])
  
      this.updateCardioSummary(data.summary)
    } catch (e) {
      console.error("有酸素グラフ取得失敗:", e)
    }
  }  

  _renderLine(seriesData) {
    const isScoreMode = seriesData.length > 0 && seriesData[0].ratio !== undefined

    const options = {
      chart: {
        type: "line",
        height: 300,
        toolbar: { show: false },
        animations: { enabled: false },
        foreColor: "#e0e1dd"
      },
      series: [{
        name: isScoreMode ? "スコア" : "総ボリューム",
        data: seriesData.map(d => [d.x, d.y])
      }],
      title: {
        text: isScoreMode
          ? "トレーニング量スコアの推移"
          : "トレーニング量の推移",
        align: "left",
        style: { color: "#e0e1dd", fontSize: "15px" }
      },
      xaxis: {
        type: "datetime",
        labels: { style: { colors: "#e0e1dd" } }
      },
      yaxis: {
        title: { text: isScoreMode ? "スコア (pt)" : "重量 (kg)" },
        min: isScoreMode ? 0 : undefined,
        labels: { style: { colors: "#e0e1dd" } }
      },
      // ✅ スコアモード時のみ100pt基準線を追加
      annotations: {
        yaxis: isScoreMode
          ? [{
              y: 100,
              borderColor: "#888",
              strokeDashArray: 4,
              label: {
                text: "基準 (100pt)",
                style: { color: "#fff", background: "#555" }
              }
            }]
          : []
      },
      stroke: {
        width: 3,
        curve: "smooth",
        colors: [isScoreMode ? "#3a86ff" : "#06d6a0"]
      },
      tooltip: {
        enabled: true,
        theme: "dark",
        x: { show: true, format: "yyyy/MM/dd" },
        y: {
          title: {
            formatter: () => (isScoreMode ? "トレーニングスコア" : "総ボリューム")
          },
          formatter: (val, { dataPointIndex }) => {
            if (isScoreMode) {
              const ratio = seriesData[dataPointIndex].ratio
              const sign = ratio >= 0 ? "+" : ""
              return `${val} pt (${sign}${ratio}%)`
            } else {
              const part = seriesData[dataPointIndex].main_part
              const suffix = part ? ` (${part}) ` : ""
              return `${Number(val).toLocaleString()} kg ${suffix}`
            }
          }
        }
      },
      markers: {
        size: 4,
        colors: ["#fff"],
        strokeColors: isScoreMode ? "#3a86ff" : "#06d6a0",
        strokeWidth: 2
      },
      noData: { text: "データがありません", align: "center" }
    }
    this._mount("line", this.lineTarget, options)
  }

  _renderPie(items) {
    // 値の大きい順に並び替え（時計回り）
    const sortedItems = [...items].sort((a, b) => b.value - a.value)
  
    const options = {
      chart: {
        type: "donut",
        height: 320,
        toolbar: { show: false },
        animations: { enabled: false },
        foreColor: "#e0e1dd"
      },
      title: {
        text: "部位バランス",
        align: "left",
        style: { color: "#e0e1dd", fontSize: "15px" }
      },
      labels: sortedItems.map(i => i.label),
      series: sortedItems.map(i => i.value),
      legend: {
        position: "bottom",
        labels: { colors: "#e0e1dd" },
        fontSize: "13px"
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "11px",
          colors: ["#e0e1dd"]
        },
        formatter: function (val, opts) {
          if (!opts?.globals?.seriesTotals) return ''
          const total = opts.globals.seriesTotals.reduce((a, b) => a + b, 0)
          if (total === 0) return ''
          const value = opts.w.globals.series[opts.seriesIndex]
          const percent = ((value / total) * 100).toFixed(1)
          return `${percent}%`
        },
        dropShadow: { enabled: false }
      },
      tooltip: {
        enabled: window.innerWidth >= 768, // ← PC時のみホバー有効
        theme: "dark",
        y: {
          formatter: (val, opts) => {
            if (!opts?.globals?.seriesTotals) return ''
            const total = opts.globals.seriesTotals.reduce((a, b) => a + b, 0)
            const percent = ((val / total) * 100).toFixed(1)
            return `${percent}%`
          },
          title: { formatter: (label) => label }
        }
      },
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          expandOnClick: false,
          donut: { size: "65%" }
        }
      },
      states: {
        hover: { filter: { type: "lighten", value: 0.1 } },
        active: { filter: { type: "none" } }
      },
      noData: { text: "データがありません", align: "center" }
    }
    this._mount("pie", this.pieTarget, options)
  }  

  _renderBar(items) {
    const options = {
      chart: {
        type: "bar",
        height: 320,
        toolbar: { show: false },
        animations: { enabled: false },
        foreColor: "#e0e1dd"
      },
      title: {
        text: "種目傾向",
        align: "left",
        style: { color: "#e0e1dd", fontSize: "15px" }
      },
      series: [{ name: "セット数", data: items.map(i => i.y) }],
      xaxis: {
        categories: items.map(i => i.x),
        labels: { style: { colors: "#e0e1dd" } }
      },
      yaxis: { labels: { style: { colors: "#e0e1dd" } } },
      dataLabels: { enabled: false },
      tooltip: {
        enabled: true,
        theme: "dark",
        y: { formatter: val => `${val} 回` }
      },
      noData: { text: "データがありません", align: "center" }
    }
    this._mount("bar", this.barTarget, options)
  }  

  _renderLineCardio(items) {
    if (this._charts.line) {
      this._charts.line.destroy()
      this._charts.line = null
    }

    const options = {
      chart: {
        type: "line",
        height: 300,
        toolbar: { show: false },
        animations: { enabled: false },
        foreColor: "#e0e1dd"
      },
      series: [{
        name: "有酸素トレーニング時間",
        data: items.map(d => [d.x, d.y])
      }],
      title: {
        text: "有酸素トレーニング時間の推移",
        align: "left",
        style: { color: "#e0e1dd", fontSize: "15px" }
      },
      xaxis: {
        type: "datetime",
        labels: { style: { colors: "#e0e1dd" } }
      },
      yaxis: {
        title: { text: "時間（分）" },
        labels: { style: { colors: "#e0e1dd" } }
      },
      stroke: {
        width: 3,
        curve: "smooth",
        colors: ["#3a86ff"]
      },
      tooltip: {
        theme: "dark",
        x: { format: "yyyy/MM/dd" },
        y: { formatter: val => `${val} 分` }
      },
      markers: {
        size: 4,
        strokeWidth: 2
      },
      noData: { text: "データがありません" }
    }
  
    this._mount("line", this.lineTarget, options)
  }  

  _renderBarCardio(items) {
    const options = {
      chart: {
        type: "bar",
        height: 320,
        toolbar: { show: false },
        animations: { enabled: false },
        foreColor: "#e0e1dd"
      },
      title: {
        text: "種目別 有酸素トレーニング時間",
        align: "left",
        style: { color: "#e0e1dd", fontSize: "15px" }
      },
      series: [{
        name: "合計時間（分）",
        data: items.map(i => i.y)
      }],
      xaxis: {
        categories: items.map(i => i.x),
        labels: { style: { colors: "#e0e1dd" } }
      },
      yaxis: {
        labels: { style: { colors: "#e0e1dd" } }
      },
      tooltip: {
        theme: "dark",
        y: { formatter: val => `${val} 分` }
      },
      noData: { text: "データがありません" }
    }
  
    this._mount("bar", this.barTarget, options)
  }  

  _renderPieCardio(items) {
    const normalized = items.map(i => ({ label: i.x, value: Number(i.y) }))
    const sortedItems = normalized.filter(i => !Number.isNaN(i.value)).sort((a, b) => b.value - a.value)
  
    const options = {
      chart: {
        type: "donut",
        height: 320,
        toolbar: { show: false },
        animations: { enabled: false },
        foreColor: "#e0e1dd"
      },
      title: {
        text: "有酸素 種目バランス",
        align: "left",
        style: { color: "#e0e1dd", fontSize: "15px" }
      },
      labels: sortedItems.map(i => i.label),
      series: sortedItems.map(i => i.value),
      legend: {
        position: "bottom",
        labels: { colors: "#e0e1dd" }
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: val => `${val} 分`
        }
      },
      noData: { text: "有酸素データがありません", align: "center" }
    }
  
    this._mount("pie", this.pieTarget, options)
  }  

  _mount(key, el, options) {
    if (this._charts[key]) this._charts[key].destroy()
    this._charts[key] = new ApexCharts(el, options)
    this._charts[key].render()
  }

  _destroyAll() {
    Object.values(this._charts).forEach(c => c && c.destroy())
    this._charts = { line: null, pie: null, bar: null }
  }
}
