require "rails_helper"

RSpec.describe WorkoutCreationService, type: :service do
  let(:user)       { create(:user) }
  let(:body_part)  { create(:body_part) }
  let(:exercise)   { create(:exercise, body_part: body_part, user: user) }
  let(:date)       { Date.current }

  describe "#call" do
    context "when 正常なパラメータの場合" do
      let(:valid_sets_params) do
        {
          "0" => { weight: "60", reps: "10", memo: "warmup" },
          "1" => { weight: "80", reps: "8",  memo: "main" }
        }
      end

      let(:service) do
        described_class.new(
          user: user,
          date: date,
          exercise_id: exercise.id,
          sets_params: valid_sets_params
        )
      end

      it "Workout を1件作成する" do
        expect { service.call }.to change(Workout, :count).by(1)
      end

      it "WorkoutSet を2件作成する" do
        expect { service.call }.to change(WorkoutSet, :count).by(2)
      end

      it "返された Workout とセット内容が正しい" do
        workout = nil

        expect do
          workout = service.call
        end.to change(WorkoutSet, :count).by(2)

        sets = workout.workout_sets

        expect(sets.size).to eq(2)
        expect(sets.pluck(:exercise_id).uniq).to eq([exercise.id])

        expect(sets.first.weight).to eq(60)
        expect(sets.first.reps).to eq(10)
        expect(sets.first.memo).to eq("warmup")
      end
    end

    context "when 空行が含まれる場合" do
      let(:empty_sets_params) do
        {
          "0" => { weight: nil, reps: nil, memo: nil },  # ← skip 対象
          "1" => { weight: "50", reps: "8", memo: "ok" } # ← 有効
        }
      end

      let(:service) do
        described_class.new(
          user: user,
          date: date,
          exercise_id: exercise.id,
          sets_params: empty_sets_params
        )
      end

      it "空行はスキップされ、有効行のみ作成される" do
        workout = nil

        expect do
          workout = service.call
        end.to change(WorkoutSet, :count).by(1)

        sets = workout.workout_sets
        expect(sets.size).to eq(1)
        expect(sets.first.weight).to eq(50)
        expect(sets.first.reps).to eq(8)
      end
    end

    context "when 同じ日付に2回呼び出された場合" do
      let(:sets_params_first) do
        { "0" => { weight: "60", reps: "10", memo: "first" } }
      end

      let(:sets_params_second) do
        { "0" => { weight: "70", reps: "8", memo: "second" } }
      end

      it "1回目はWorkout作成、2回目は既存Workoutを再利用する" do
        first_service = described_class.new(user: user, date: date, exercise_id: exercise.id, sets_params: sets_params_first)

        first_workout = nil

        expect do
          first_workout = first_service.call
        end.to change(Workout, :count).by(1).and change(WorkoutSet, :count).by(1)

        second_service = described_class.new(user: user, date: date, exercise_id: exercise.id, sets_params: sets_params_second)

        second_workout = nil

        expect { second_workout = second_service.call }.to change(WorkoutSet, :count).by(1)
        expect(Workout.count).to eq(1)
        expect(second_workout.id).to eq(first_workout.id)
        expect(first_workout.workout_sets.count).to eq(2)

        last_set = first_workout.workout_sets.order(:id).last
        expect(last_set.weight).to eq(70)
        expect(last_set.reps).to eq(8)
      end
    end

    context "when セット作成中に例外が発生した場合" do
      let(:valid_sets_params) do
        {
          "0" => { weight: "60", reps: "10", memo: "warmup" }
        }
      end

      let(:service) do
        described_class.new(
          user: user,
          date: date,
          exercise_id: exercise.id,
          sets_params: valid_sets_params
        )
      end

      before do
        # create_sets! を強制的に例外を起こすようにする
        allow_any_instance_of(described_class)
          .to receive(:create_sets!)
          .and_raise(StandardError.new("forced error"))
      end

      it "トランザクションが rollback され、Workout も WorkoutSet も保存されない" do
        expect do
          service.call
        end.to raise_error(WorkoutCreationService::CreationError)

        expect(Workout.count).to eq(0)
        expect(WorkoutSet.count).to eq(0)
      end
    end
  end
end
