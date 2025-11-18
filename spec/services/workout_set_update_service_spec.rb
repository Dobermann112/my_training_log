require "rails_helper"

RSpec.describe WorkoutSetUpdateService, type: :service do
  let(:user)      { create(:user) }
  let(:workout)   { create(:workout, user: user) }
  let(:body_part) { create(:body_part) }
  let(:exercise)  { create(:exercise, body_part: body_part) }

  describe "#call" do

    context "既存セットを更新する場合" do
      let!(:set1) do
        create(:workout_set, workout: workout, exercise: exercise, weight: 60, reps: 10, memo: "old")
      end

      let(:params) do
        {
          set1.id => { weight: "70", reps: "8", memo: "updated" }
        }
      end

      let(:service) do
        WorkoutSetUpdateService.new(
          workout: workout,
          exercise: exercise,
          sets_params: params
        )
      end

      it "既存セットが正しく更新される" do
        service.call

        expect(set1.reload.weight).to eq(70)
        expect(set1.reps).to eq(8)
        expect(set1.memo).to eq("updated")
      end
    end

    context "new_x の新しい行が含まれる場合" do
      let(:params) do
        {
          "new_0" => { weight: "40", reps: "12", memo: "added" }
        }
      end

      let(:service) do
        WorkoutSetUpdateService.new(
          workout: workout,
          exercise: exercise,
          sets_params: params
        )
      end

      it "新規 WorkoutSet が作成される" do
        expect do
          service.call
        end.to change { WorkoutSet.count }.by(1)

        new_set = workout.workout_sets.last
        expect(new_set.weight).to eq(40)
        expect(new_set.reps).to eq(12)
        expect(new_set.memo).to eq("added")
      end
    end

    context "空行が含まれる場合" do
      let(:params) do
        {
          "new_0" => { weight: nil, reps: nil, memo: nil },    # skip対象
          "new_1" => { weight: "50", reps: "5", memo: "ok" }   # 作成される
        }
      end

      let(:service) do
        WorkoutSetUpdateService.new(
          workout: workout,
          exercise: exercise,
          sets_params: params
        )
      end

      it "空行はスキップされ、有効行のみ作成される" do
        expect do
          service.call
        end.to change { WorkoutSet.count }.by(1)

        new_set = workout.workout_sets.last
        expect(new_set.weight).to eq(50)
        expect(new_set.reps).to eq(5)
      end
    end

    context "既存セットと new_x が混在する場合" do
      let!(:set1) do
        create(:workout_set, workout: workout, exercise: exercise, weight: 60, reps: 10)
      end

      let(:params) do
        {
          set1.id => { weight: "70", reps: "8", memo: "updated" },
          "new_0" => { weight: "40", reps: "12", memo: "added" }
        }
      end

      let(:service) do
        WorkoutSetUpdateService.new(
          workout: workout,
          exercise: exercise,
          sets_params: params
        )
      end

      it "既存は update、新規行は create される" do
        expect do
          service.call
        end.to change { WorkoutSet.count }.by(1)

        expect(set1.reload.weight).to eq(70)
        expect(set1.reps).to eq(8)

        new_set = workout.workout_sets.where.not(id: set1.id).first
        expect(new_set.weight).to eq(40)
        expect(new_set.reps).to eq(12)
      end
    end

    context "異常が発生した場合" do
      let!(:set1) do
        create(:workout_set, workout: workout, exercise: exercise, weight: 60, reps: 10)
      end

      let(:params) do
        {
          set1.id => { weight: "70", reps: "8", memo: "ok" },
          "new_0" => { weight: "40", reps: "12", memo: "added" }
        }
      end

      let(:service) do
        WorkoutSetUpdateService.new(
          workout: workout,
          exercise: exercise,
          sets_params: params
        )
      end

      before do
        # update_set を強制的に失敗させる
        allow_any_instance_of(WorkoutSet)
          .to receive(:update!)
          .and_raise(StandardError.new("forced error"))
      end

      it "トランザクションが rollback され、変更が一切反映されない" do
        expect do
          expect { service.call }.to raise_error(WorkoutSetUpdateService::UpdateError)
        end.to change { WorkoutSet.count }.by(0)
         .and change { set1.reload.weight }.by(0)
      end
    end

  end
end
