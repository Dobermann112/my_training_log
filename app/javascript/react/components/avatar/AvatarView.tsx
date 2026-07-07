import { useEffect } from "react"
import { initAvatarViewer } from "../../../three/avatar/initAvatarViewer"

const AvatarView = () => {
  useEffect(() => {
    // レベル取得とローディング/エラー表示はinitAvatarViewer内で行う
    initAvatarViewer()
  }, [])

  return <div id="avatar-root" />
}

export default AvatarView
