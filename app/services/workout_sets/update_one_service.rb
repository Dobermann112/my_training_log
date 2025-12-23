module WorkoutSets
  class UpdateOneService
    Result = Struct.new(:success?, :workout_set, :errors, :destroyed?)

    def self.call(workout_set:, params:)
      new(workout_set, params).call
    end

    def initialize(workout_set, params)
      @workout_set = workout_set
      @params = params
    end

    def call
      if empty_params?
        destroy_flow
      else
        update_flow
      end
    end

    private

    def empty_params?
      @params[:weight].blank? && @params[:reps].blank?
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
      Result.new(true, nil, nil, true)
    end
  end
end
