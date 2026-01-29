class AddBookingLinkToDoctors < ActiveRecord::Migration[6.1]
  def change
    add_column :doctors, :booking_link, :string
  end
end