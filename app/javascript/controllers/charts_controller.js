import { Controller } from "@hotwired/stimulus"
import ApexCharts from "apexcharts"
import { showToast } from "../utils/toast"

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
    this.beforeRenderHandler = this._destroyAll.bind(this)
    this.themeChangeHandler = this.load.bind(this)
    window.addEventListener("turbo:before-render", this.beforeRenderHandler)
    window.addEventListener("theme:change", this.themeChangeHandler)
    this.load()
  }

  disconnect() {
    window.removeEventListener("turbo:before-render", this.beforeRenderHandler)
    window.removeEventListener("theme:change", this.themeChangeHandler)
    this._destroyAll()
  }

  _cssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    return value || fallback
  }

  get isDarkTheme() {
    return (document.documentElement.getAttribute("data-theme") || "dark") !== "light"
  }

  get chartTextColor() {
    return this._cssVar("--color-text-primary", "#e0e1dd")
  }

  get chartSurfaceColor() {
    return this._cssVar("--color-surface", "#12233a")
  }

  get tooltipTheme() {
    return this.isDarkTheme ? "dark" : "light"
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
      showToast("グラフの取得に失敗しました。時間をおいて再度お試しください。", "error")
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
      showToast("グラフの取得に失敗しました。時間をおいて再度お試しください。", "error")
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
        foreColor: this.chartTextColor
      },
      series: [{
        name: isScoreMode ? "スコア" : "総ボリューム",
        data: seriesData.map(d => [d.x, d.y])
      }],
      title: {
        text: isScoreMode ? "トレーニング量スコアの推移" : "トレーニング量の推移",
        align: "left",
        style: { color: this.chartTextColor, fontSize: "15px" }
      },
      xaxis: {
        type: "datetime",
        labels: { style: { colors: this.chartTextColor } }
      },
      yaxis: {
        title: { text: isScoreMode ? "スコア (pt)" : "重量 (kg)" },
        min: isScoreMode ? 0 : undefined,
        labels: { style: { colors: this.chartTextColor } }
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
        theme: this.tooltipTheme,
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
        colors: [this.chartSurfaceColor],
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
        foreColor: this.chartTextColor
      },
      title: {
        text: "部位バランス",
        align: "left",
        style: { color: this.chartTextColor, fontSize: "15px" }
      },
      labels: sortedItems.map(i => i.label),
      series: sortedItems.map(i => i.value),
      legend: {
        position: "bottom",
        labels: { colors: this.chartTextColor },
        fontSize: "13px"
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "11px",
          colors: [this.chartTextColor]
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
        theme: this.tooltipTheme,
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
        foreColor: this.chartTextColor
      },
      title: {
        text: "種目傾向",
        align: "left",
        style: { color: this.chartTextColor, fontSize: "15px" }
      },
      series: [{ name: "セット数", data: items.map(i => i.y) }],
      xaxis: {
        categories: items.map(i => i.x),
        labels: { style: { colors: this.chartTextColor } }
      },
      yaxis: { labels: { style: { colors: this.chartTextColor } } },
      dataLabels: { enabled: false },
      tooltip: {
        enabled: true,
        theme: this.tooltipTheme,
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
        foreColor: this.chartTextColor
      },
      series: [{
        name: "有酸素トレーニング時間",
        data: items.map(d => [d.x, d.y])
      }],
      title: {
        text: "有酸素トレーニング時間の推移",
        align: "left",
        style: { color: this.chartTextColor, fontSize: "15px" }
      },
      xaxis: {
        type: "datetime",
        labels: { style: { colors: this.chartTextColor } }
      },
      yaxis: {
        title: { text: "時間（分）" },
        labels: { style: { colors: this.chartTextColor } }
      },
      stroke: {
        width: 3,
        curve: "smooth",
        colors: ["#3a86ff"]
      },
      tooltip: {
        theme: this.tooltipTheme,
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
        foreColor: this.chartTextColor
      },
      title: {
        text: "種目別 有酸素トレーニング時間",
        align: "left",
        style: { color: this.chartTextColor, fontSize: "15px" }
      },
      series: [{
        name: "合計時間（分）",
        data: items.map(i => i.y)
      }],
      xaxis: {
        categories: items.map(i => i.x),
        labels: { style: { colors: this.chartTextColor } }
      },
      yaxis: {
        labels: { style: { colors: this.chartTextColor } }
      },
      tooltip: {
        theme: this.tooltipTheme,
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
        foreColor: this.chartTextColor
      },
      title: {
        text: "有酸素 種目バランス",
        align: "left",
        style: { color: this.chartTextColor, fontSize: "15px" }
      },
      labels: sortedItems.map(i => i.label),
      series: sortedItems.map(i => i.value),
      legend: {
        position: "bottom",
        labels: { colors: this.chartTextColor }
      },
      tooltip: {
        theme: this.tooltipTheme,
        y: {
          formatter: val => `${val} 分`
        }
      },
      noData: { text: "有酸素データがありません", align: "center" }
    }
  
    this._mount("pie", this.pieTarget, options)
  }  

  _mount(key, el, options) {
    if (!el || !el.isConnected) return

    if (this._charts[key]) {
    this._charts[key].destroy()
    this._charts[key] = null
    }

    this._charts[key] = new ApexCharts(el, options)
    this._charts[key].render()
  }

  _destroyAll() {
    Object.values(this._charts).forEach(chart => {
      if (!chart) return
      chart.destroy()
    })
    this._charts = { line: null, pie: null, bar: null }
  }
}
