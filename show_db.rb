require 'sqlite3'

db = SQLite3::Database.new('/home/ubuntuuser/pj/Medvedeva2/db/production.sqlite3')

# Показать все таблицы
puts "Таблицы в базе:"
db.execute("SELECT name FROM sqlite_master WHERE type='table';").each do |row|
  puts "- #{row[0]}"
end

# Для каждой таблицы показать структуру
puts "\nСтруктура таблиц:"
db.execute("SELECT name FROM sqlite_master WHERE type='table';").each do |row|
  table_name = row[0]
  puts "\n#{table_name}:"
  db.execute("PRAGMA table_info(#{table_name});").each do |col|
    puts "  #{col[1]} (#{col[2]})"
  end
end