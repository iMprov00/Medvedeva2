workers 1
threads 1, 3

app_dir = File.expand_path("../..", __FILE__)
shared_dir = "#{app_dir}/shared"

rails_env = ENV['RACK_ENV'] || "production"
environment rails_env

bind "tcp://127.0.0.1:4567"
pidfile "#{shared_dir}/pids/puma.pid"
state_path "#{shared_dir}/pids/puma.state"

stdout_redirect "#{app_dir}/log/puma.stdout.log", "#{app_dir}/log/puma.stderr.log", true

activate_control_app
