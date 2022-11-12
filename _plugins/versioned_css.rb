module Jekyll
  module VersionFilter
    def versioned_url(input)
      "#{input}?#{Time.now.to_i}"
    end
  end
end

Liquid::Template.register_filter(Jekyll::VersionFilter)
