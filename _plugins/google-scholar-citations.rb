# frozen_string_literal: true

require "active_support/all"
require "nokogiri"
require "open-uri"
require "json"
require "fileutils"
require "time"
require "timeout"

module Helpers
  extend ActiveSupport::NumberHelper
end

module Jekyll
  class GoogleScholarCitationsTag < Liquid::Tag
    # --- Configuration ---
    CACHE_FILE_PATH   = File.join(Dir.pwd, "_cache", "scholar_citations.json")
    WINDOW_SECONDS    = 24 * 60 * 60 # 固定 24 小时窗口（每天刷新）
    MAX_RETRIES       = 3 # 最大重试次数
    RETRY_DELAY       = 10 # 重试延迟（秒）
    REQUEST_TIMEOUT   = 30 # 请求超时（秒）
    # 使用更新的 User-Agent 列表，随机选择以降低被检测风险
    USER_AGENTS = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15"
    ]

    # 进程级缓存（本次构建内常驻）
    @@cache = nil

    def initialize(tag_name, params, tokens)
      super
      splitted = params.split(" ").map(&:strip)
      @scholar_id_var = splitted[0]
      @article_id_var = splitted[1]
    end

    def render(context)
      # 1) 只在首个调用时读文件缓存
      @@cache ||= self.class.load_cache

      article_id = context[@article_id_var]
      scholar_id = context[@scholar_id_var]

      # 2) 判断是否处于“锁定窗口期”
      locked = self.class.locked_window?(@@cache)

      # 3) 窗口内：严格只读缓存；无则返回 "N/A"
      if locked
        cached = self.class.get_cached(@@cache, article_id)
        return cached if cached
        return "N/A"
      end

      # 4) 窗口外（需刷新）：尝试抓取；成功后更新缓存与 refreshed_at
      # 温和请求节流（在首次请求前）
      sleep(rand(5.5..7.5))

      retries = 0
      begin
        article_url = "https://scholar.google.com/citations?view_op=view_citation&hl=en"\
                      "&user=#{scholar_id}&citation_for_view=#{scholar_id}:#{article_id}"
        
        # 随机选择 User-Agent
        user_agent = USER_AGENTS.sample
        
        # 更完整的请求头，模拟真实浏览器
        headers = {
          "User-Agent" => user_agent,
          "Accept" => "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language" => "en-US,en;q=0.9",
          "Accept-Encoding" => "gzip, deflate, br",
          "Connection" => "keep-alive",
          "Upgrade-Insecure-Requests" => "1",
          "Sec-Fetch-Dest" => "document",
          "Sec-Fetch-Mode" => "navigate",
          "Sec-Fetch-Site" => "none",
          "Sec-Fetch-User" => "?1",
          "Referer" => "https://scholar.google.com/"
        }

        # 使用超时设置打开URL
        # URI.open 的第二个参数直接传递 headers 哈希
        # 使用 Timeout 包装以确保超时控制
        html_content = Timeout.timeout(REQUEST_TIMEOUT) do
          URI.open(article_url, headers).read
        end
        doc = Nokogiri::HTML(html_content)
        citation_count_raw = 0

        description_meta = doc.at('meta[name="description"]') || doc.at('meta[property="og:description"]')
        if description_meta
          cited_by_text = description_meta["content"]
          if (m = cited_by_text.match(/Cited by (\d+[,\d]*)/))
            citation_count_raw = m[1].delete(",").to_i
          end
        end

        # 检查是否被重定向到验证页面或错误页面
        page_title = doc.at('title')&.text&.downcase || ""
        if page_title.include?("sorry") || page_title.include?("unusual traffic") || 
           page_title.include?("captcha") || page_title.include?("verify")
          raise "Google Scholar 检测到异常流量，请稍后重试"
        end

        formatted = Helpers.number_to_human(
          citation_count_raw,
          format: "%n%u",
          precision: 2,
          units: { thousand: "K", million: "M", billion: "B" }
        )

        # 写入条目
        self.class.set_cached(@@cache, article_id, formatted)

        # **关键：刷新窗口起点** —— 仅在真正抓到一次数据后更新
        self.class.set_refreshed!(@@cache)

        # 持久化到文件
        self.class.save_cache(@@cache)

        return formatted
      rescue OpenURI::HTTPError => e
        # HTTP 错误处理
        status_code = e.io.status[0].to_i rescue nil
        if status_code == 429 || status_code == 503
          # 429 Too Many Requests 或 503 Service Unavailable
          if retries < MAX_RETRIES
            retries += 1
            puts "Warning: HTTP #{status_code} for #{article_id}, retrying (#{retries}/#{MAX_RETRIES}) after #{RETRY_DELAY}s..."
            sleep(RETRY_DELAY + rand(0..5)) # 增加随机延迟
            retry
          else
            puts "Error: HTTP #{status_code} for #{article_id} after #{MAX_RETRIES} retries"
            cached = self.class.get_cached(@@cache, article_id)
            return cached if cached
            return "请求被限制，请稍后重试"
          end
        else
          puts "Error: HTTP #{status_code || 'unknown'} for #{article_id}: #{e.message}"
          cached = self.class.get_cached(@@cache, article_id)
          return cached if cached
          return "HTTP错误: #{status_code || 'unknown'}"
        end
      rescue Timeout::Error, Errno::ETIMEDOUT => e
        # 超时错误
        if retries < MAX_RETRIES
          retries += 1
          puts "Warning: Timeout for #{article_id}, retrying (#{retries}/#{MAX_RETRIES}) after #{RETRY_DELAY}s..."
          sleep(RETRY_DELAY + rand(0..5))
          retry
        else
          puts "Error: Timeout for #{article_id} after #{MAX_RETRIES} retries"
          cached = self.class.get_cached(@@cache, article_id)
          return cached if cached
          return "请求超时"
        end
      rescue StandardError => e
        # 其他错误
        puts "Error fetching citation count for #{article_id}: #{e.class} - #{e.message}"
        cached = self.class.get_cached(@@cache, article_id)
        return cached if cached
        return "抓取失败: #{e.message}"
      end
    end

    # --- Cache helpers ---
    class << self
      def load_cache
        return fresh_cache unless File.exist?(CACHE_FILE_PATH)
        begin
          data = JSON.parse(File.read(CACHE_FILE_PATH))
          # 兼容旧结构：没有 _meta 视为需立即刷新
          data["_meta"] ||= {}
          # 验证数据结构
          unless data.is_a?(Hash)
            raise JSON::ParserError, "Invalid cache structure"
          end
          data
        rescue JSON::ParserError, TypeError => e
          puts "Warning: Could not parse scholar citations cache file (#{e.message}). A new one will be created."
          # 备份损坏的缓存文件
          backup_path = "#{CACHE_FILE_PATH}.backup.#{Time.now.to_i}"
          begin
            FileUtils.cp(CACHE_FILE_PATH, backup_path) if File.exist?(CACHE_FILE_PATH)
            puts "Backed up corrupted cache to #{backup_path}"
          rescue => backup_error
            puts "Warning: Could not backup cache file: #{backup_error.message}"
          end
          fresh_cache
        end
      end

      def save_cache(data)
        FileUtils.mkdir_p(File.dirname(CACHE_FILE_PATH))
        File.open(CACHE_FILE_PATH, "w") { |f| f.write(JSON.pretty_generate(data)) }
      end

      def fresh_cache
        { "_meta" => { "refreshed_at" => nil } }
      end

      # 是否处于 24 小时锁定窗口
      def locked_window?(cache)
        refreshed_at_str = cache.dig("_meta", "refreshed_at")
        return false if refreshed_at_str.nil? # 从未刷新过 -> 需要刷新
        refreshed_at = Time.parse(refreshed_at_str) rescue nil
        return false unless refreshed_at
        (Time.now - refreshed_at) < WINDOW_SECONDS
      end

      def set_refreshed!(cache)
        cache["_meta"] ||= {}
        cache["_meta"]["refreshed_at"] = Time.now.iso8601
      end

      def get_cached(cache, article_id)
        entry = cache[article_id]
        entry && entry["count"]
      end

      def set_cached(cache, article_id, formatted_count)
        cache[article_id] = {
          "count" => formatted_count,
          # 为兼容历史分析需要，条目里仍保留单条时间戳（非控制刷新逻辑）
          "timestamp" => Time.now.iso8601
        }
      end
    end
  end
end

Liquid::Template.register_tag('google_scholar_citations', Jekyll::GoogleScholarCitationsTag)
