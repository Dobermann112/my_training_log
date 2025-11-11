import { Controller } from "@hotwired/stimulus"
import ApexCharts from "apexcharts"

export default class extends Controller {
  static targets = [
    "line",
    "pie",
    "bar",
    "range",
    "bodyPart",
    "summarySets",
    "summaryReps",
    "summaryStreak"
  ]

  connect() {
    this._charts = { line: null, pie: null, bar: null }
    this.currentRange = "month" // ←　月表示がデフォルト
    this.currentBodyPart = "" // ←　全身がデフォルト
    this.load()
    window.addEventListener("turbo:before-render", () => this._destroyAll())
  }

  updateSummary(summary) {
    if (!summary) return
    this.summarySetsTarget.textContent = summary.total_sets
    this.summaryRepsTarget.textContent = summary.total_reps
    this.summaryStreakTarget.textContent = summary.streak_days
  }

  disconnect() { this._destroyAll() }

  changeRange() {
    this.currentRange = this.rangeTarget.value
    this.load()
  }

  changeBodyPart() {
    this.currentBodyPart = this.bodyPartTarget.value
    this.load()
  }

  async load() {
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
      console.error("グラフデータの取得に失敗しました:", e)
    }
  }

  _renderLine(seriesData) {
    const options = {
      chart: { type: "line", height: 300, toolbar: { show: false }, animations: { enabled: false } },
      series: [{ name: "総ボリューム", data: seriesData }],
      xaxis: { type: "datetime" },
      dataLabels: { enabled: false },
      stroke: { width: 3 }
    }
    this._mount("line", this.lineTarget, options)
  }

  _renderPie(items) {
    const options = {
      chart: { type: "donut", height: 320, toolbar: { show: false }, animations: { enabled: false } },
      labels: items.map(i => i.label),
      series: items.map(i => i.value),
      legend: { position: "bottom" },
      dataLabels: { enabled: false }
    }
    this._mount("pie", this.pieTarget, options)
  }

  _renderBar(items) {
    const options = {
      chart: { type: "bar", height: 320, toolbar: { show: false }, animations: { enabled: false } },
      series: [{ name: "セット数", data: items.map(i => i.y) }], // ← total_setsに対応
      xaxis: { categories: items.map(i => i.x) },
      dataLabels: { enabled: false }
    }
    this._mount("bar", this.barTarget, options)
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
