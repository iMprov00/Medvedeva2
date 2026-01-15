# Rakefile

# 1. Устанавливаем переменную окружения для подключения к БД.
# Это гарантирует, что Rake-задачи будут знать, к какой БД подключаться.
ENV['DATABASE_URL'] = "sqlite3:db/#{ENV['RACK_ENV'] || 'development'}.sqlite3"

# 2. Подключаем задачи ActiveRecord
require 'sinatra/activerecord/rake'

# 3. Указываем Rake-задачам, что им нужно сделать перед запуском.
# Они должны загрузить наше приложение, чтобы получить доступ к моделям.
namespace :db do
  task :load_config do
    require './app'
  end
end