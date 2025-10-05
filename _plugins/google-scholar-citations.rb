# frozen_string_literal: true

require "active_support/all"
require "nokogiri"
require "open-uri"
require "json"
require "fileutils"

module Helpers
  extend ActiveSupport::NumberHelper
end

module Jekyll
  class GoogleScholarCitationsTag < Liquid::Tag
    # --- Configuration ---
    # Path to the cache file. It's good practice to place it in a _cache directory.
    CACHE_FILE_PATH = File.join(Dir.pwd, "_cache", "scholar_citations.json")
    # Cache expiration time in seconds (24 hours * 60 minutes * 60 seconds)
    CACHE_EXPIRATION_SECONDS = 24 * 60 * 60

    # Use a class variable to hold the cache data for the duration of the build.
    @@citations = nil

    def initialize(tag_name, params, tokens)
      super
      splitted = params.split(" ").map(&:strip)
      @scholar_id_var = splitted[0]
      @article_id_var = splitted[1]
    end

    def render(context)
      # Load cache from file only once per build process
      @@citations ||= self.class.load_cache

      article_id = context[@article_id_var]
      scholar_id = context[@scholar_id_var]

      # Check if a valid, non-expired cache entry exists
      cached_data = @@citations[article_id]
      if cached_data && (Time.now - Time.parse(cached_data["timestamp"])) < CACHE_EXPIRATION_SECONDS
        return cached_data["count"]
      end

      # If no valid cache, fetch new data
      begin
        # Sleep for a random amount of time to avoid being blocked by Google
        sleep(rand(5.5..7.5))

        article_url = "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=#{scholar_id}&citation_for_view=#{scholar_id}:#{article_id}"
        user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        headers = {
          "User-Agent" => user_agent,
          "Accept" => "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "Accept-Language" => "en-US,en;q=0.9"
        }

        doc = Nokogiri::HTML(URI.open(article_url, headers))
        
        citation_count_raw = 0
        description_meta = doc.at('meta[name="description"]') || doc.at('meta[property="og:description"]')

        if description_meta
          cited_by_text = description_meta['content']
          matches = cited_by_text.match(/Cited by (\d+[,\d]*)/)
          citation_count_raw = matches[1].delete(",").to_i if matches
        end

        # Format the number (e.g., 1234 -> 1.2K)
        citation_count_formatted = Helpers.number_to_human(citation_count_raw, format: '%n%u', precision: 2, units: { thousand: 'K', million: 'M', billion: 'B' })

        # Update cache with new data and timestamp
        @@citations[article_id] = {
          "count" => citation_count_formatted,
          "timestamp" => Time.now.iso8601 # Use ISO 8601 standard for timestamps
        }
        self.class.save_cache(@@citations)

        return citation_count_formatted

      rescue StandardError => e
        # Handle errors. Return the old cached value if it exists, otherwise return an error message.
        error_message = "抓取失败: #{e.message}"
        puts "Error fetching citation count for #{article_id}: #{e.class} - #{e.message}"
        
        # If an error occurs but we have stale data, it's better to show that than nothing.
        return cached_data["count"] if cached_data
        
        return error_message
      end
    end

    # --- Cache Helper Methods ---
    class << self
      def load_cache
        return {} unless File.exist?(CACHE_FILE_PATH)
        begin
          JSON.parse(File.read(CACHE_FILE_PATH))
        rescue JSON::ParserError
          puts "Warning: Could not parse scholar citations cache file. A new one will be created."
          {}
        end
      end

      def save_cache(data)
        # Ensure the cache directory exists
        FileUtils.mkdir_p(File.dirname(CACHE_FILE_PATH))
        # Write the updated cache back to the file
        File.open(CACHE_FILE_PATH, "w") do |f|
          f.write(JSON.pretty_generate(data))
        end
      end
    end
  end
end

Liquid::Template.register_tag('google_scholar_citations', Jekyll::GoogleScholarCitationsTag)
