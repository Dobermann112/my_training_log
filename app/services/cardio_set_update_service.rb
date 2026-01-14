class CardioSetUpdateService
  class UpdateError < StandardError; end
  Result = Struct.new(:cardio_workout_deleted?)

  def initialize(cardio_workout:, sets_params:)
    @cardio_workout = cardio_workout
    @sets_params = sets_params || {}
  end

  def call
    ActiveRecord::Base.transaction do
      @sets_params.each do |key, attrs|
        next if skip?(attrs)

        if persisted?(key)
          update_set(key, attrs)
        else
          create_set(attrs)
        end
      end

      cleanup_if_empty
    end
  rescue StandardError => e
    raise UpdateError, e.message
  end

  private

  def persisted?(key)
    @cardio_workout.cardio_sets.exists?(id: key)
  end

  def skip?(attrs)
    return false if destroy?(attrs)
    attrs[:duration].blank?
  end

  def create_set(attrs)
    next_number =
      @cardio_workout.cardio_sets.maximum(:set_number).to_i + 1

    @cardio_workout.cardio_sets.create!(
      distance:   attrs[:distance],
      duration:   attrs[:duration],
      calories:   attrs[:calories],
      pace:       attrs[:pace],
      memo:       attrs[:memo],
      set_number: next_number
    )
  end

  def update_set(id, attrs)
    set = @cardio_workout.cardio_sets.find(id)

    if destroy?(attrs)
      set.destroy!
    else
      set.update!(
        distance: attrs[:distance],
        duration: attrs[:duration],
        calories: attrs[:calories],
        pace:     attrs[:pace],
        memo:     attrs[:memo]
      )
    end
  end

  def destroy?(attrs)
    attrs[:_destroy] == "1"
  end

  def cleanup_if_empty
    return Result.new(false) if @cardio_workout.cardio_sets.exists?

    date = @cardio_workout.performed_on
    user = @cardio_workout.user
    @cardio_workout.destroy!
    WorkoutCleanupService.call(user: user, date: date)
    Result.new(true)
  end
end
