#!/usr/bin/env ruby

Jekyll::Hooks.register :pages, :post_init do |page|
  if File.file?(page.path)
      page.data['last_modified_at_v2'] = File.mtime ( page.path )
  end
end

Jekyll::Hooks.register :pages, :post_write do |page|
  if File.file?(page.path)
    dest = page.destination("")
    Jekyll.logger.info '       Modify time: ' + dest + ' > ' + page.data['last_modified_at_v2'].to_s
    FileUtils.touch dest, :mtime => page.data['last_modified_at_v2']
  end
end

