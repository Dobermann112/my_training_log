module WorkoutSets
  class UpdateOneService
    Result = Struct.new(:success?, :workout_set, :errors, :workout_deleted?)

    def self.call(workout_set:, params:)
      new(workout_set, params).call
    end

    def initialize(workout_set, params)
      @workout_set = workout_set
      @params = params
      @workout = workout_set.workout
    end

    def call
      ActiveRecord::Base.transaction do
        if empty_params?
          destroy_flow
        else
          update_flow
        end
      end
    rescue ActiveRecord::RecordInvalid => e
      Result.new(false, @workout_set, [e.message], false)
    end

    private

    def empty_params?
      merged_weight = @params.key?(:weight) ? @params[:weight] : @workout_set.weight
      merged_reps   = @params.key?(:reps)   ? @params[:reps]   : @workout_set.reps

      merged_weight.blank? && merged_reps.blank?
    end


    def update_flow
      if @workout_set.update(@params)
        Result.new(true, @workout_set, nil, false)
      else
        Result.new(false, @workout_set, @workout_set.errors.full_messages, false)
      end
    end

    def destroy_flow
      @workout_set.destroy!

      if @workout.workout_sets.exists?
        Result.new(true, nil, nil, false)
      else
        @workout.destroy!
        Result.new(true, nil, nil, true)
      end
    end
  end
end
