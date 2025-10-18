# frozen_string_literal: true

require "active_support/all"
require "nokogiri"
require "open-uri"
require "json"
require "fileutils"
require "time"

module Helpers
  extend ActiveSupport::NumberHelper
end

module Jekyll
  class GoogleScholarCitationsTag < Liquid::Tag
    # --- Configuration ---
    CACHE_FILE_PATH   = File.join(Dir.pwd, "_cache", "scholar_citations.json")
    WINDOW_SECONDS    = 12 * 60 * 60 # 固定 12 小时窗口
    USER_AGENT        = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "\
                        "(KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"

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
      begin
        # 温和请求节流
        sleep(rand(5.5..7.5))

        article_url = "https://scholar.google.com/citations?view_op=view_citation&hl=en"\
                      "&user=#{scholar_id}&citation_for_view=#{scholar_id}:#{article_id}"
        headers = {
          "User-Agent" => USER_AGENT,
          "Accept" => "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "Accept-Language" => "en-US,en;q=0.9"
        }

        doc = Nokogiri::HTML(URI.open(article_url, headers))
        citation_count_raw = 0

        description_meta = doc.at('meta[name="description"]') || doc.at('meta[property="og:description"]')
        if description_meta
          cited_by_text = description_meta["content"]
          if (m = cited_by_text.match(/Cited by (\d+[,\d]*)/))
            citation_count_raw = m[1].delete(",").to_i
          end
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
      rescue StandardError => e
        # 抓取失败：若有旧值则回退旧值；否则提示错误（不更新 refreshed_at）
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
          data
        rescue JSON::ParserError
          puts "Warning: Could not parse scholar citations cache file. A new one will be created."
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

      # 是否处于 12 小时锁定窗口
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
