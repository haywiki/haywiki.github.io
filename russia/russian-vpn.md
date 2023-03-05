---
title: VPN для доступа к российским сайтам из-за рубежа
layout: page
display_toc: false
---

С весны 2022 года многие российские сайты закрыли доступ из-за рубежа. Например, [mos.ru](http://mos.ru/), сайт Мосэнергосбыта,
сайты Почты России и Почта Банка и многие другие. Периодически недоступными становились также Госуслуги и [nalog.gov.ru](http://nalog.gov.ru/).
Последние два ресурса могут быть очень важны для эмигрантов как минимум в первые год-два, поэтому возникает вопрос, как наименьшими усилиями получить доступ к этим ресурсам.

Вариантов для обхода гео-блокировок масса. Некоторые из них требуют определённой технической грамотности (SSH туннели до
серверов или домашних компьютеров в РФ, например). Способным воспользоваться такими средствами не нужен этот пост,
поэтому мы опишем варианты которые доступны подавляющему большинству: VPN со включением одной кнопкой и HTTP/SOCKS5
прокси с браузерными расширениями.

## VPN с серверами в РФ

Обратите внимание, что некоторые сайты определяют заход через VPN и все равно блокируют доступ, поэтому прежде чем оплачивать сервис —
проверьте, работают ли там нужные вам ресурсы.

- [Paper VPN](https://paperpaper.ru/vpn-paper/)
- [AdGuard VPN](https://adguard-vpn.com/en/server-locations.html)
- [AmanVPN](https://amanvpn.com/servers.html)
- [TouchVPN](https://touchvpn.net/)
- [X VPN](https://xvpn.io/)

Чуть сложнее в настройке:

- [VPN Наоборот](https://vpn-naoborot.online/) (OpenVPN клиент с предоставляемыми shared серверами в РФ)
- [размещение Outline Manager](https://getoutline.org/ru/get-started/#step-1) на собственном компьютере или виртуальном сервере в РФ с последующим подключением с помощью приложения [Outline Client](https://getoutline.org/ru/get-started/#step-3)

## HiLoad VPN

С помощью сервиса можно получить бесплатный доступ к серверам в РФ. Официальный сайт сервиса [hi-l.im](https://hi-l.im/), официальный канал в телеграме [@highloadofficial](https://t.me/highloadofficial).
Есть инструкции по настройке сервиса для [различных устройств](https://telegra.ph/HighLoad-VPN-Poshagovaya-instrukciya-06-08-2).

## Дешевле и ограниченнее: HTTP/SOCKS5 прокси

Более дешевой, но в более ограниченной альтернативой VPN будет прокси для браузера. Стоят такие прокси в разы дешевле,
как правило, предлагают заметно более низкую скорость работы, но для доступа к ресурсам вроде [nalog.gov.ru](http://nalog.gov.ru/)
этого более чем достаточно.

Используются прокси следующим образом:

- Покупаете прокси с адресом в РФ. Например, у [proxyline.net](http://proxyline.net/) месяц доступа к shared прокси стоит около ₽ 65, или ≈ USD 1
- Устанавливается расширение для браузера, например, FoxyProxy ([Chrome](https://chrome.google.com/webstore/detail/foxyproxy-standard/gcknhkkoolaabfmlnjonogaaifnjlfnp?hl=en), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/foxyproxy-standard/)), или настройки прокси указываются прямо на уровне операционной системы ([Safari на macOS](https://help.getfoxyproxy.org/index.php/knowledge-base/how-to-use-your-proxy-services-with-safari/))
- Включаете прокси, для всех или отдельных URL, и выключаете его по мере необходимости

## Источники информации

- [Армения: ВНЖ, банки, налоги](https://am-banking-and-immigration.notion.site/am-banking-and-immigration/VPN-03b9f6c3dbe24615a49e0812a36fb42d)
