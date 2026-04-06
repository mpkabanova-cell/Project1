# Настройка Firebase (обязательно!)

Без этого шага авторизация и глобальная база данных работать не будут.

## Шаг 1. Создайте проект Firebase

1. Откройте [console.firebase.google.com](https://console.firebase.google.com)
2. Нажмите **«Добавить проект»** → введите название → создайте

## Шаг 2. Включите базу данных Firestore

1. В левом меню: **Build → Firestore Database**
2. Нажмите **«Создать базу данных»**
3. Выберите **«Начать в тестовом режиме»** → выберите регион (europe-west) → Готово

## Шаг 3. Включите авторизацию

1. В левом меню: **Build → Authentication**
2. Нажмите **«Начать»**
3. Вкладка **Sign-in method** → **Email/Password** → включите → Сохранить

## Шаг 4. Получите конфигурацию

1. ⚙️ → **Project settings** (настройки проекта)
2. Прокрутите вниз до раздела **«Your apps»**
3. Нажмите иконку **Web** (`</>`)
4. Введите название приложения → Зарегистрировать
5. Скопируйте блок `firebaseConfig`

## Шаг 5. Вставьте конфигурацию в index.html

Откройте `index.html`, найдите этот блок:

```javascript
const FIREBASE_CONFIG = {
  apiKey:            "REPLACE_API_KEY",
  authDomain:        "REPLACE_PROJECT_ID.firebaseapp.com",
  projectId:         "REPLACE_PROJECT_ID",
  storageBucket:     "REPLACE_PROJECT_ID.appspot.com",
  messagingSenderId: "REPLACE_SENDER_ID",
  appId:             "REPLACE_APP_ID"
};
```

Замените все `REPLACE_*` на реальные значения из Firebase.

## Шаг 6. Правила безопасности Firestore (рекомендуется)

В Firebase Console → Firestore → Правила замените содержимое на:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /decks/{deckId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        request.resource.data.teacherId == request.auth.uid;
      allow update, delete: if request.auth != null &&
        resource.data.teacherId == request.auth.uid;
    }
    match /results/{resultId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null &&
        (resource.data.teacherId == request.auth.uid ||
         resource.data.studentId == request.auth.uid);
      allow delete: if request.auth != null &&
        resource.data.teacherId == request.auth.uid;
    }
  }
}
```

## Составной индекс (при лимите попыток)

Если в консоли появится ссылка на создание индекса для запроса результатов по полям `deckId` и `studentId`, откройте её и создайте индекс. Он нужен для проверки **лимита попыток** при старте теста учеником.

## Готово!

После этого:
- Учителя регистрируются с ролью **Учитель**
- Ученики регистрируются с ролью **Ученик**
- Наборы хранятся в облаке (доступны с любого устройства)
- Результаты учеников автоматически попадают к учителю в реальном времени
- Ссылка на тест: просто `index.html#q=ИДЕНТИФИКАТОР_НАБОРА`
