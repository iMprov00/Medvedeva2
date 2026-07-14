# Middleware: кеширование статических файлов (Cache-Control, Last-Modified, 304)
# Подключается в app.rb (configure). При любой ошибке запрос передаётся приложению.
module Rack
  class StaticCache
    def initialize(app, options = {})
      @app = app
      @root = options[:root] || File.expand_path('public', __dir__)
      @urls = options[:urls] || ['/css', '/js', '/images', '/favicon', '/apple-touch-icon', '/yandex', '/google']
      @max_age = options[:max_age] || 86400          # 1 день для CSS/JS
      @max_age_images = options[:max_age_images] || 604800  # 7 дней для картинок
    end

    def call(env)
      return @app.call(env) unless env['REQUEST_METHOD'] == 'GET'

      path = env['PATH_INFO'].to_s.dup
      return @app.call(env) unless @urls.any? { |u| path.start_with?(u) }

      path = path.gsub(/^\//, '')
      path = 'index.html' if path.empty?
      path = Rack::Utils.unescape_path(path)
      return @app.call(env) if path.include?('..')

      full_path = File.join(@root, path)
      return @app.call(env) unless File.file?(full_path) && File.readable?(full_path)

      mtime = File.mtime(full_path)
      last_modified = mtime.httpdate

      # Проверка If-Modified-Since -> 304
      if env['HTTP_IF_MODIFIED_SINCE']
        begin
          since = Time.httpdate(env['HTTP_IF_MODIFIED_SINCE'].strip)
          if mtime.to_i <= since.to_i
            return [304, {
              'Last-Modified' => last_modified,
              'Cache-Control' => cache_control(path)
            }, []]
          end
        rescue ArgumentError
          # невалидная дата - отдаём 200
        end
      end

      # Отдаём файл через приложение (Sinatra static), только добавляем заголовки кеша
      status, headers, body = @app.call(env)
      return [status, headers, body] if status != 200

      # Копируем заголовки (не мутировать исходный хеш — в продакшене может быть frozen)
      new_headers = headers.respond_to?(:to_h) ? headers.to_h.dup : headers.dup
      new_headers['Last-Modified'] = last_modified
      new_headers['Cache-Control'] = cache_control(path)
      [status, new_headers, body]
    rescue => e
      # При любой ошибке — отдаём запрос приложению без кеширования
      @app.call(env)
    end

    private

    def cache_control(path)
      if path =~ %r{/images/}
        "public, max-age=#{@max_age_images}"
      else
        "public, max-age=#{@max_age}"
      end
    end
  end
end
