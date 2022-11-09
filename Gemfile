source "https://rubygems.org"

group :jekyll_plugins do
  gem "jekyll-remote-theme"
  gem "minima", "~> 2.0"
  gem 'jekyll-sitemap'
  gem 'jekyll-relative-links'
end

install_if -> { RUBY_PLATFORM =~ %r!mingw|mswin|java! } do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1.0", :install_if => Gem.win_platform?
gem "kramdown-parser-gfm"
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]
gem "nokogiri", ">= 1.13.9"
gem "faraday-retry"
