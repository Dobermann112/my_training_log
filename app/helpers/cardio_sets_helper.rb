module CardioSetsHelper
  def pace_parts(pace)
    return [nil, nil] if pace.blank?

    m = pace.floor
    s = ((pace - m) * 60).round
    if s == 60
      m += 1
      s = 0
    end

    [m.to_s, format("%02d", s)]
  end

  def format_pace_min_per_km(pace)
    min, sec = pace_parts(pace)
    return nil if min.nil? || sec.nil?
    "#{min}:#{sec}"
  end
end
