// Import and register all your controllers from the importmap via controllers/**/*_controller
import { application } from "./application"

// Stimulus controllerを自動登録
const controllers = import.meta.globEager("./**/*_controller.js")

for (const path in controllers) {
  const name = path
    .split("/")
    .pop()
    .replace("_controller.js", "")
  application.register(name, controllers[path].default)
}
