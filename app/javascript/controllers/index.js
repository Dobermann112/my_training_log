// Import and register all your controllers from the importmap via controllers/**/*_controller
import { application } from "./application"

// Stimulusの自動読込を停止（import.meta.globを使わない）
export { application }
