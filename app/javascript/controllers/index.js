// Import and register all your controllers from the importmap via controllers/**/*_controller
import { application } from "./application"

// 個別に読み込む Stimulus コントローラ
import ConfirmController from "./confirm_controller"
import FlashController from "./flash_controller"
import CalendarController from "./calendar_controller"

application.register("confirm", ConfirmController)
application.register("flash", FlashController)
application.register("calendar", CalendarController)

export { application }
