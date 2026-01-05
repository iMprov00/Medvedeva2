# models/specialty.rb
class Specialty < ActiveRecord::Base
  has_and_belongs_to_many :doctors
  
  validates :name, presence: true, uniqueness: true
  
  default_scope { order(name: :asc) }
end