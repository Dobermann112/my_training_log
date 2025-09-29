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