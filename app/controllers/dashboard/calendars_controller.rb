module Dashboard
  class CalendarsController < ApplicationController
    def index
      render "calendars/index"
    end
  end
end
