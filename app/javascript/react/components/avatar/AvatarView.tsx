import { useEffect } from "react"
import { initAvatarViewer } from "../../../three/avatar/initAvatarViewer"

const AvatarView = () => {
  useEffect(() => {
    fetch("/api/avatar")
      .then(res => res.json())
      .then(levels => {
        initAvatarViewer(levels)
      })
  }, [])

  return <div id="avatar-root" />
}

export default AvatarView
