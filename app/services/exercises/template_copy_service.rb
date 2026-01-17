module Exercises
  class TemplateCopyService
    def self.call(user)
      new(user).call
    end

    def initialize(user)
      @user = user
    end

    def call
      templates = Exercise.where(user_id: nil)
      existing_keys = user_exercise_keys

      templates_to_copy = templates.reject do |template|
        existing_keys.include?(key(template.body_part_id, template.name))
      end

      templates_to_copy.each do |template|
        copy_template(template)
      end
    end

    private

    attr_reader :user

    def user_exercise_keys
      Exercise
        .where(user_id: user.id)
        .pluck(:body_part_id, :name)
        .map { |body_part_id, name| key(body_part_id, name) }
    end

    def copy_template(template)
      exercise = template.dup
      exercise.user_id = user.id
      exercise.save!
    end

    def key(body_part_id, name)
      "#{body_part_id}-#{name.downcase}"
    end
  end
end
