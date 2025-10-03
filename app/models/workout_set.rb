class WorkoutSet < ApplicationRecord
  belongs_to :workout
  belongs_to :exercise
end
