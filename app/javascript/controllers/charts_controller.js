import { Controller } from "@hotwired/stimulus"
import ApexCharts from "apexcharts"

// Connects to data-controller="charts"
export default class extends Controller {
  static targets = ["probe"]

  connect() {
    const options = {
      chart: { type: "line", height: 300, toolbar: { show: false }, animations: { enabled: false } },
      series: [{ name: "sample", data: [10, 20, 15, 30, 25] }],
      xacis: { categories: ["1", "2", "3", "4", "5"] },
      dataLabels: { enabled: false }
    }
    this.chart = new ApexCharts(this.probeTarget, options)
    this.chart.render()
  }

  disconnect() {
    if (this.chart) this.chart.destroy()
  }
}
