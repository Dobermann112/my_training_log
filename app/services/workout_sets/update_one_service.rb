# app/services/workout_sets/update_one_service.rb
module WorkoutSets
  class UpdateOneService
    Result = Struct.new(:success?, :workout_set, :errors)

    def self.call(workout_set:, params:)
      new(workout_set, params).call
    end

    def initialize(workout_set, params)
      @workout_set = workout_set
      @params = params
    end

    def call
      if @workout_set.update(@params)
        Result.new(true, @workout_set, nil)
      else
        Result.new(false, @workout_set, @workout_set.errors.full_messages)
      end
    end
  end
end
