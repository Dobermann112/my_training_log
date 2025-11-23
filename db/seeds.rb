# BodyParts マスタデータ
body_parts = [
  { name: '胸', display_order: 1 },
  { name: '背中', display_order: 2 },
  { name: '脚', display_order: 3 },
  { name: '肩', display_order: 4 },
  { name: '腕', display_order: 5 },
  { name: '腹', display_order: 6 }
]

body_parts.each do |bp|
    BodyPart.find_or_create_by!(name: bp[:name]) do |part|
        part.display_order = bp[:display_order]
    end
end

# Exercises マスタデータ
exercises = {
  '胸' => ['ベンチプレス', 'ダンベルフライ'],
  '背中' => ['デッドリフト', 'ラットプルダウン'],
  '脚' => ['スクワット', 'レッグプレス'],
  '肩' => ['ショルダープレス', 'サイドレイズ'],
  '腕' => ['アームカール', 'トライセプスエクステンション'],
  '腹' => ['クランチ', 'レッグレイズ']
}

exercises.each do |body_part_name, names|
  body_part = BodyPart.find_by!(name: body_part_name)
  names.each do |exercise_name|
    Exercise.find_or_create_by!(
      name: exercise_name,
      body_part: body_part,
      is_default: true,
      user_id: nil
    )
  end
end
