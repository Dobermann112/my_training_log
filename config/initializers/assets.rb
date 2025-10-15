# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = "1.0"

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path

# ✅ jsbundling-railsで生成されたビルドファイルをRailsに認識させる
Rails.application.config.assets.paths << Rails.root.join("app/assets/builds")

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in the app/assets
# folder are already added.
# Rails.application.config.assets.precompile += %w( admin.js admin.css )

# ✅ 念のため明示的にプリコンパイル対象を追加
Rails.application.config.assets.precompile += %w( application.js application.css )
