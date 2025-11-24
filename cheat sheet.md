-------------------------------------------------------
Работа с GitHub
-------------------------------------------------------
# Настройка Git (один раз)
git config --global user.name "Ваше имя"
git config --global user.email "email@example.com"
# Создание нового репозитория на GitHub
# В корне проекта
git init
git add .
git commit -m "Initial commit"
git branch -M main
# Добавляем удалённый репозиторий GitHub
git remote add origin https://github.com/USERNAME/REPO.git
# Отправляем на GitHub
git push -u origin main
# Добавление изменений и коммит
git add <файл или .>
git commit -m "Сообщение коммита"
# Отправка изменений на GitHub:
git push origin main
# Получение изменений с GitHub:
git pull origin main
# Полезные команды для просмотра
git status       # Состояние репозитория
git log          # История коммитов
git diff         # Изменения перед коммитом
git branch       # Список веток
git remote -v    # Список удалённых репозиториев
-------------------------------------------------------
Запуск Prisma студии (программа для баз данных)
-------------------------------------------------------
# Откроется браузер на http://localhost:5555
cd ~/mysterymeet/backend
npx prisma studio
-------------------------------------------------------
Запуск Backend и Frontend
-------------------------------------------------------
# Запуск сервера
cd ~/mysterymeet/backend
npm start
# Запуск эмулятора и Expo Go
cd ~/mysterymeet/mobile
npm start
# Создать новый проект Expo (TypeScript)
npx create-expo-app my-app --template blank-typescript
# Создать новый проект Expo (JavaScript)
npx create-expo-app my-app
# Зайти в проект
cd my-app
# Открыть в VS Code
code .
# Очистить кеш Expo
npx expo start --clear
# Очистить кеш Metro
npm start -- --reset-cache
# Удалить node_modules и переустановить
rm -rf node_modules package-lock.json
npm install
# Очистить кеш npm
npm cache clean --force
# Очистить кеш watchman
watchman watch-del-all
# Полная очистка (все кеши)
rm -rf node_modules package-lock.json
npm cache clean --force
watchman watch-del-all
npm install
npm start -- --reset-cache
# Удалить папки сборки Android
rm -rf android/build
rm -rf android/app/build
# Удалить папки сборки iOS
rm -rf ios/build
-------------------------------------------------------
EAS Build
-------------------------------------------------------
# Установить EAS CLI
npm install -g eas-cli
# Войти в аккаунт Expo
eas login
# Настроить проект для EAS
eas build:configure
# Собрать APK для Android (тестирование)
eas build --platform android --profile preview
# Собрать AAB для Android (Google Play)
eas build --platform android --profile production
# Собрать IPA для iOS (App Store)
eas build --platform ios --profile production
# Собрать для обеих платформ
eas build --platform all
# Посмотреть список сборок
eas build:list
# Скачать последнюю сборку
eas build:download --platform android --profile preview
# Посмотреть статус сборки
eas build:view
# Отменить сборку
eas build:cancel
# Файлы хранятся в облаке Expo
# Ссылка на скачивание приходит после сборки
# Посмотреть все сборки онлайн:
https://expo.dev/accounts/[твой-аккаунт]/projects/[твой-проект]/builds
# Или через команду:
eas build:list
# Скачать локально:
eas build:download --platform android
# Файл сохранится в текущую папку
-------------------------------------------------------
Локальная сборка
-------------------------------------------------------
# Android - собрать APK (отладочная версия)
cd android
./gradlew assembleDebug
APK будет в: android/app/build/outputs/apk/debug/app-debug.apk
# Android - собрать APK (релизная версия)
cd android
./gradlew assembleRelease
APK будет в: android/app/build/outputs/apk/release/app-release.apk
# Android - собрать AAB (для Google Play)
cd android
./gradlew bundleRelease
AAB будет в: android/app/build/outputs/bundle/release/app-release.aab
# Android - очистить сборку
cd android
./gradlew clean
# iOS - собрать через Xcode (Mac только)
cd ios
pod install
xcodebuild -workspace ИмяПроекта.xcworkspace -scheme ИмяПроекта archive
# Archive будет в:
~/Library/Developer/Xcode/Archives/
-------------------------------------------------------
ОТЛАДКА И ЛОГИ
-------------------------------------------------------
# Показать логи в реальном времени (Android)
npx react-native log-android
# Показать логи в реальном времени (iOS)
npx react-native log-ios
# Показать логи Metro
# (автоматически при npm start)
# Открыть React DevTools
npx react-devtools
# Проверить что установлено
npm list
# Проверить глобальные пакеты
npm list -g --depth=0
# Запустить с детальными логами
npm start -- --verbose