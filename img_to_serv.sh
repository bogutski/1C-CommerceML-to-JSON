#!/bin/bash

#Инициализируем переменные

RemoteSSHUser="root"
RemoteSSHIP="138.197.209.55"
RemoteSiteDir="/var/www/html/drupal/sites/default/files/import_files/"
lclSiteDir="/Users/m/sites/js/node1/in_xml/import_files/"

#===== НА СЕРВЕР ===============================================================================

echo "=== TO SERVER ==="
echo "=== Очистка папки с картинками на сервере ==="
ssh es "rm -rf $RemoteSiteDir/*"

echo "=== Синхронизация файлов"
rsync -avz  --no-perms $lclSiteDir $RemoteSSHUser@$RemoteSSHIP:$RemoteSiteDir
echo "=== ФАЙЛЫ синхронизирована"