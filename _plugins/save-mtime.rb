#!/usr/bin/env ruby

Jekyll::Hooks.register [ :pages, :posts ], :post_init do |page|
  if File.file?(page.path)
    commit_num = `git rev-list --count HEAD "#{ page.path }"`
    if commit_num.to_i > 1
      date = `git log -1 --pretty="%ad" --date=iso "#{ page.path }"`
      page.data['last_modified_at'] = Time.parse(date)
    end
  end
end

Jekyll::Hooks.register [ :pages, :posts ], :post_write do |page|
  if File.file?(page.path)
    dest = page.destination("")
    Jekyll.logger.info '       Modify time: ' + dest + ' > ' + page.data['last_modified_at'].to_s
    FileUtils.touch dest, :mtime => page.data['last_modified_at_v2']
  end
end

