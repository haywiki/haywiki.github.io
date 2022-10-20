source "https://rubygems.org"

gem "minima", "~> 2.0"
gem "github-pages", group: :jekyll_plugins
gem 'jekyll-sitemap'

# If you have any plugins, put them here!
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.6"
end

install_if -> { RUBY_PLATFORM =~ %r!mingw|mswin|java! } do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1.0", :install_if => Gem.win_platform?
gem "kramdown-parser-gfm"
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]
