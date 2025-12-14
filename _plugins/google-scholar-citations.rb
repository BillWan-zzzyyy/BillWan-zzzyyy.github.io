# frozen_string_literal: true

require "active_support/all"
require "nokogiri"
require "open-uri"
require "json"
require "fileutils"
require "time"
require "timeout"
require "cgi"

module Helpers
  extend ActiveSupport::NumberHelper
end

module Jekyll
  class GoogleScholarCitationsTag < Liquid::Tag
    # --- Configuration ---
    CACHE_FILE_PATH   = File.join(Dir.pwd, "_cache", "scholar_citations.json")
    WINDOW_SECONDS    = 24 * 60 * 60 # 固定 24 小时窗口（每天刷新）
    MAX_RETRIES       = 2 # 最大重试次数（降低以避免过度请求）
    RETRY_DELAY       = 15 # 重试延迟（秒，增加以避免被拦截）
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
    # 记录上次请求时间，用于控制请求频率
    @@last_request_time = nil

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

      # 3) 窗口内：优先使用缓存；如果缓存中没有该文章，也尝试抓取（新文章）
      if locked
        cached = self.class.get_cached(@@cache, article_id)
        if cached
          return cached
        else
          # 窗口内但缓存中没有该文章，可能是新添加的，允许抓取一次
          puts "Info: Article #{article_id} not in cache during locked window, attempting fetch..."
        end
      end

      # 4) 窗口外（需刷新）：尝试抓取；成功后更新缓存与 refreshed_at
      # 控制请求频率：确保每次请求之间至少间隔一定时间
      if @@last_request_time
        time_since_last = Time.now - @@last_request_time
        min_interval = 10.0 # 最小间隔10秒
        if time_since_last < min_interval
          sleep_time = min_interval - time_since_last + rand(2.0..5.0)
          puts "Info: Waiting #{sleep_time.round(1)}s before next request to avoid rate limiting..."
          sleep(sleep_time)
        end
      else
        # 首次请求前的延迟
        sleep(rand(5.0..8.0))
      end
      @@last_request_time = Time.now

      retries = 0
      begin
        article_url = "https://scholar.google.com/citations?view_op=view_citation&hl=en"\
                      "&user=#{scholar_id}&citation_for_view=#{scholar_id}:#{article_id}"
        
        # 随机选择 User-Agent
        user_agent = USER_AGENTS.sample
        
        # 简化请求头，移除可能暴露爬虫特征的头部
        # 只保留最必要的头部，避免过度模拟
        headers = {
          "User-Agent" => user_agent,
          "Accept" => "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language" => "en-US,en;q=0.9",
          "Accept-Encoding" => "gzip, deflate",
          "Connection" => "keep-alive",
          "Referer" => "https://scholar.google.com/",
          "DNT" => "1"
        }

        # 使用超时设置打开URL
        # URI.open 的第二个参数直接传递 headers 哈希
        # 使用 Timeout 包装以确保超时控制
        html_content = Timeout.timeout(REQUEST_TIMEOUT) do
          URI.open(article_url, headers).read
        end
        doc = Nokogiri::HTML(html_content)
        citation_count_raw = 0

        # 方法1: 从 meta description 标签提取
        description_meta = doc.at('meta[name="description"]') || doc.at('meta[property="og:description"]')
        if description_meta
          cited_by_text = description_meta["content"] || ""
          if (m = cited_by_text.match(/Cited by (\d+[,\d]*)/i))
            citation_count_raw = m[1].delete(",").to_i
            puts "Info: Found citation count #{citation_count_raw} from meta description for #{article_id}"
          end
        end

        # 方法2: 如果方法1失败，尝试从页面文本中提取
        if citation_count_raw == 0
          # 查找包含 "Cited by" 的文本节点
          doc.css('*').each do |element|
            text = element.text
            if text =~ /Cited by\s+(\d+[,\d]*)/i
              citation_count_raw = $1.delete(",").to_i
              puts "Info: Found citation count #{citation_count_raw} from page text for #{article_id}"
              break
            end
          end
        end

        # 方法3: 尝试从 gsc_oci_value 类中提取（Google Scholar 使用的类名）
        if citation_count_raw == 0
          citation_elem = doc.at('.gsc_oci_value') || doc.at('[class*="gsc_oci"]')
          if citation_elem
            text = citation_elem.text.strip
            if text =~ /(\d+[,\d]*)/
              citation_count_raw = $1.delete(",").to_i
              puts "Info: Found citation count #{citation_count_raw} from gsc_oci element for #{article_id}"
            end
          end
        end

        # 如果仍然为0，记录警告但继续处理（可能是真的0引用）
        if citation_count_raw == 0
          puts "Warning: Could not extract citation count for #{article_id}, defaulting to 0"
        end

        # 检查是否被重定向到验证页面或错误页面
        page_title = doc.at('title')&.text&.downcase || ""
        if page_title.include?("sorry") || page_title.include?("unusual traffic") || 
           page_title.include?("captcha") || page_title.include?("verify")
          raise "Google Scholar 检测到异常流量，请稍后重试"
        end

        # 格式化引用数（小于1000的直接显示数字）
        if citation_count_raw < 1000
          formatted = citation_count_raw.to_s
        else
          formatted = Helpers.number_to_human(
            citation_count_raw,
            format: "%n%u",
            precision: 2,
            units: { thousand: "K", million: "M", billion: "B" }
          )
        end

        # 确保返回值是 URL 安全的（移除空格和特殊字符，用于 shields.io badge）
        formatted = formatted.strip.gsub(/\s+/, "")

        # 写入条目
        self.class.set_cached(@@cache, article_id, formatted)

        # **关键：刷新窗口起点** —— 仅在窗口外（需要全局刷新）时更新
        # 如果在窗口内抓取新文章，不更新全局刷新时间，避免重置窗口
        unless locked
          self.class.set_refreshed!(@@cache)
        end

        # 持久化到文件
        self.class.save_cache(@@cache)

        return formatted
      rescue OpenURI::HTTPError => e
        # HTTP 错误处理
        status_code = e.io.status[0].to_i rescue nil
        if status_code == 403
          # 403 Forbidden - 被 Google Scholar 拦截
          puts "Warning: HTTP 403 (Forbidden) for #{article_id} - Google Scholar blocked the request"
          if retries < MAX_RETRIES
            retries += 1
            # 403 错误时增加更长的延迟
            delay = RETRY_DELAY * 2 + rand(5..15)
            puts "Retrying (#{retries}/#{MAX_RETRIES}) after #{delay}s with different approach..."
            sleep(delay)
            # 尝试使用不同的 User-Agent
            retry
          else
            puts "Error: HTTP 403 for #{article_id} after #{MAX_RETRIES} retries - Google Scholar is blocking requests"
            cached = self.class.get_cached(@@cache, article_id)
            return cached if cached
            return "N/A"  # 返回 URL 安全的值
          end
        elsif status_code == 429 || status_code == 503
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
            return "N/A"  # 返回 URL 安全的值
          end
        else
          puts "Error: HTTP #{status_code || 'unknown'} for #{article_id}: #{e.message}"
          cached = self.class.get_cached(@@cache, article_id)
          return cached if cached
          return "N/A"  # 返回 URL 安全的值
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
          return "N/A"  # 返回 URL 安全的值
        end
      rescue StandardError => e
        # 其他错误
        puts "Error fetching citation count for #{article_id}: #{e.class} - #{e.message}"
        cached = self.class.get_cached(@@cache, article_id)
        return cached if cached
        return "N/A"  # 返回 URL 安全的值，避免在 badge URL 中出现特殊字符
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
