param(
    [string]$OutputPath = "ShopApp_Final_Documentation.docx"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Escape-Xml([string]$Text) {
    if ($null -eq $Text) { return "" }
    return [System.Security.SecurityElement]::Escape($Text)
}

function Paragraph([string]$Text, [int]$Size = 24, [bool]$Bold = $false) {
    $boldXml = if ($Bold) { "<w:b/>" } else { "" }
    return @"
<w:p>
  <w:r>
    <w:rPr>$boldXml<w:sz w:val="$Size"/><w:szCs w:val="$Size"/></w:rPr>
    <w:t xml:space="preserve">$(Escape-Xml $Text)</w:t>
  </w:r>
</w:p>
"@
}

function Heading([string]$Text, [int]$Level = 1) {
    $size = if ($Level -eq 1) { 32 } elseif ($Level -eq 2) { 28 } else { 24 }
    return @"
<w:p>
  <w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
  <w:r>
    <w:rPr><w:b/><w:color w:val="0F766E"/><w:sz w:val="$size"/><w:szCs w:val="$size"/></w:rPr>
    <w:t xml:space="preserve">$(Escape-Xml $Text)</w:t>
  </w:r>
</w:p>
"@
}

function Bullet([string]$Text) {
    return @"
<w:p>
  <w:pPr><w:ind w:left="360" w:hanging="180"/></w:pPr>
  <w:r><w:t xml:space="preserve">• $(Escape-Xml $Text)</w:t></w:r>
</w:p>
"@
}

function CodeBlock([string]$Text) {
    $lines = $Text -split "`r?`n"
    $content = ""
    foreach ($line in $lines) {
        $content += @"
<w:p>
  <w:pPr><w:shd w:fill="F3F4F6"/><w:spacing w:before="0" w:after="0"/></w:pPr>
  <w:r>
    <w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:eastAsia="Consolas"/><w:sz w:val="20"/></w:rPr>
    <w:t xml:space="preserve">$(Escape-Xml $line)</w:t>
  </w:r>
</w:p>
"@
    }
    return $content
}

function TableXml([string[]]$Headers, [object[][]]$Rows) {
    $xml = @"
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="0" w:type="auto"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="6" w:space="0" w:color="D0D5DD"/>
      <w:left w:val="single" w:sz="6" w:space="0" w:color="D0D5DD"/>
      <w:bottom w:val="single" w:sz="6" w:space="0" w:color="D0D5DD"/>
      <w:right w:val="single" w:sz="6" w:space="0" w:color="D0D5DD"/>
      <w:insideH w:val="single" w:sz="6" w:space="0" w:color="D0D5DD"/>
      <w:insideV w:val="single" w:sz="6" w:space="0" w:color="D0D5DD"/>
    </w:tblBorders>
  </w:tblPr>
"@
    $xml += "<w:tr>"
    foreach ($header in $Headers) {
        $xml += "<w:tc><w:tcPr><w:shd w:fill=""E6F4F1""/></w:tcPr><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>$(Escape-Xml $header)</w:t></w:r></w:p></w:tc>"
    }
    $xml += "</w:tr>"
    foreach ($row in $Rows) {
        $xml += "<w:tr>"
        foreach ($cell in $row) {
            $xml += "<w:tc><w:p><w:r><w:t xml:space=""preserve"">$(Escape-Xml ([string]$cell))</w:t></w:r></w:p></w:tc>"
        }
        $xml += "</w:tr>"
    }
    $xml += "</w:tbl>"
    return $xml
}

function ImageXml([string]$RelationshipId, [string]$Title, [int]$DocPrId) {
    return @"
<w:p>
  <w:pPr><w:jc w:val="center"/></w:pPr>
  <w:r>
    <w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0">
        <wp:extent cx="5486400" cy="3086100"/>
        <wp:effectExtent l="0" t="0" r="0" b="0"/>
        <wp:docPr id="$DocPrId" name="$(Escape-Xml $Title)"/>
        <wp:cNvGraphicFramePr>
          <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
        </wp:cNvGraphicFramePr>
        <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:nvPicPr>
                <pic:cNvPr id="$DocPrId" name="$(Escape-Xml $Title)"/>
                <pic:cNvPicPr/>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip r:embed="$RelationshipId"/>
                <a:stretch><a:fillRect/></a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm><a:off x="0" y="0"/><a:ext cx="5486400" cy="3086100"/></a:xfrm>
                <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>
"@
}

$body = ""
$body += Heading "ShopApp: документация финального проекта" 1
$body += Paragraph "Тема проекта: интернет-магазин на Java Spring Boot." 24
$body += Paragraph "Документ описывает назначение сайта, архитектуру, роли пользователей, структуру базы данных, связи между таблицами и основные сценарии работы системы." 24

$body += Heading "1. О чем сайт" 1
$body += Paragraph "ShopApp — это веб-приложение интернет-магазина. Пользователь может открыть каталог, посмотреть товары по категориям, найти товар через поиск, зарегистрироваться, войти в аккаунт, оформить заказ и оставить отзыв о товаре." 24
$body += Paragraph "Администратор управляет товарами и категориями, видит пользователей и заказы, а также может менять статус заказа. Проект показывает полный backend на Spring Boot и простой frontend, который открывается по адресу http://localhost:8080/." 24

$body += Heading "2. Технологии" 1
$body += TableXml @("Технология", "Назначение") @(
    @("Java 17", "Основной язык разработки"),
    @("Spring Boot", "Запуск и конфигурация приложения"),
    @("Spring Web", "REST API и frontend static resources"),
    @("Spring Data JPA", "Работа с базой через Repository и Entity"),
    @("Spring Security + JWT", "Авторизация, роли USER и ADMIN"),
    @("PostgreSQL", "Реляционная база данных"),
    @("Lombok", "Уменьшение boilerplate-кода"),
    @("Springdoc OpenAPI", "Swagger UI для тестирования API")
)

$body += Heading "3. Архитектура приложения" 1
$body += Paragraph "Проект построен по классической многослойной архитектуре Controller → Service → Repository → Database." 24
$body += Bullet "Controller принимает HTTP-запросы и возвращает JSON-ответы."
$body += Bullet "Service содержит бизнес-логику: создание заказа, расчет суммы, проверка склада, права доступа, регистрация и вход."
$body += Bullet "Repository работает с PostgreSQL через Spring Data JPA."
$body += Bullet "Model описывает таблицы базы данных как JPA Entity."
$body += Bullet "Security проверяет JWT token и роли пользователя."
$body += Heading "Архитектурная схема" 2
$body += ImageXml "rId1" "architecture.png" 1

$body += Heading "4. Роли и права доступа" 1
$body += Paragraph "В системе есть две роли: USER и ADMIN. Роль хранится в таблице users в поле role." 24
$body += TableXml @("Роль", "Права") @(
    @("Гость", "Просмотр каталога, категорий, товаров, отзывов. Регистрация и вход."),
    @("USER", "Все права гостя, оформление заказов, просмотр своих заказов, создание отзывов, просмотр профиля."),
    @("ADMIN", "Все права USER, создание/изменение/удаление категорий и товаров, просмотр всех заказов и пользователей, изменение статуса заказа, удаление пользователей и отзывов.")
)

$body += Heading "5. Схема базы данных" 1
$body += Paragraph "В базе данных используются основные таблицы: users, categories, products, orders, order_items, reviews." 24
$body += Heading "ER-диаграмма" 2
$body += ImageXml "rId2" "er-diagram.png" 2
$body += Heading "UML class diagram" 2
$body += ImageXml "rId3" "class-diagram.png" 3
$body += Heading "Use case diagram" 2
$body += ImageXml "rId4" "use-case.png" 4
$body += Heading "Sequence diagram: создание заказа" 2
$body += ImageXml "rId5" "sequence-order.png" 5

$body += Heading "6. Описание таблиц" 1
$body += Heading "6.1 users" 2
$body += Paragraph "Таблица пользователей. Используется для регистрации, входа, определения роли и связи пользователя с заказами и отзывами." 24
$body += TableXml @("Поле", "Тип", "Описание") @(
    @("id", "bigint, PK", "Уникальный идентификатор пользователя"),
    @("username", "varchar(50), unique", "Логин пользователя"),
    @("email", "varchar(100), unique", "Email пользователя"),
    @("password", "varchar(255)", "Зашифрованный пароль BCrypt"),
    @("role", "varchar", "USER или ADMIN"),
    @("created_at", "timestamp", "Дата создания пользователя")
)

$body += Heading "6.2 categories" 2
$body += Paragraph "Таблица категорий товаров. Каждая категория может содержать много товаров." 24
$body += TableXml @("Поле", "Тип", "Описание") @(
    @("id", "bigint, PK", "Уникальный идентификатор категории"),
    @("name", "varchar(100), unique", "Название категории"),
    @("description", "text", "Описание категории")
)

$body += Heading "6.3 products" 2
$body += Paragraph "Таблица товаров интернет-магазина. Каждый товар связан с одной категорией через category_id." 24
$body += TableXml @("Поле", "Тип", "Описание") @(
    @("id", "bigint, PK", "Уникальный идентификатор товара"),
    @("name", "varchar(200)", "Название товара"),
    @("description", "text", "Описание товара"),
    @("price", "numeric(10,2)", "Цена товара"),
    @("stock", "integer", "Количество товара на складе"),
    @("image_url", "varchar(500)", "Ссылка на изображение"),
    @("category_id", "bigint, FK", "Ссылка на categories.id"),
    @("created_at", "timestamp", "Дата создания товара")
)

$body += Heading "6.4 orders" 2
$body += Paragraph "Таблица заказов. Один пользователь может иметь много заказов. Заказ хранит статус, сумму и адрес доставки." 24
$body += TableXml @("Поле", "Тип", "Описание") @(
    @("id", "bigint, PK", "Уникальный идентификатор заказа"),
    @("user_id", "bigint, FK", "Ссылка на users.id"),
    @("status", "varchar", "PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED"),
    @("total_price", "numeric(10,2)", "Итоговая сумма заказа"),
    @("address", "text", "Адрес доставки"),
    @("created_at", "timestamp", "Дата создания заказа")
)

$body += Heading "6.5 order_items" 2
$body += Paragraph "Таблица позиций заказа. Она связывает orders и products, потому что один заказ может содержать много товаров, а один товар может встречаться в разных заказах." 24
$body += TableXml @("Поле", "Тип", "Описание") @(
    @("id", "bigint, PK", "Уникальный идентификатор позиции"),
    @("order_id", "bigint, FK", "Ссылка на orders.id"),
    @("product_id", "bigint, FK", "Ссылка на products.id"),
    @("quantity", "integer", "Количество единиц товара"),
    @("price", "numeric(10,2)", "Цена товара на момент заказа")
)

$body += Heading "6.6 reviews" 2
$body += Paragraph "Таблица отзывов. Отзыв связывает пользователя и товар, содержит оценку и комментарий." 24
$body += TableXml @("Поле", "Тип", "Описание") @(
    @("id", "bigint, PK", "Уникальный идентификатор отзыва"),
    @("user_id", "bigint, FK", "Ссылка на users.id"),
    @("product_id", "bigint, FK", "Ссылка на products.id"),
    @("rating", "integer", "Оценка от 1 до 5"),
    @("comment", "text", "Текст отзыва"),
    @("created_at", "timestamp", "Дата создания отзыва")
)

$body += Heading "7. Связи между таблицами" 1
$body += CodeBlock @"
users.id        -> orders.user_id
users.id        -> reviews.user_id
categories.id   -> products.category_id
orders.id       -> order_items.order_id
products.id     -> order_items.product_id
products.id     -> reviews.product_id
"@
$body += Paragraph "Главная бизнес-связь интернет-магазина находится между orders, order_items и products. Заказ не хранит товары напрямую: товары заказа лежат в order_items. Это правильная нормализованная структура для корзины и заказов." 24

$body += Heading "8. Основные сценарии работы" 1
$body += Heading "Регистрация и вход" 2
$body += Bullet "Пользователь отправляет username, email и password."
$body += Bullet "Backend проверяет уникальность username и email."
$body += Bullet "Пароль шифруется через PasswordEncoder."
$body += Bullet "Пользователь сохраняется в users с ролью USER."
$body += Bullet "Backend возвращает JWT token."

$body += Heading "Просмотр каталога" 2
$body += Bullet "Frontend вызывает GET /api/categories и GET /api/products."
$body += Bullet "Пользователь может фильтровать товары по категории и искать по названию."
$body += Bullet "Backend возвращает Page<ProductResponse> с пагинацией."

$body += Heading "Создание заказа" 2
$body += Bullet "Пользователь должен быть авторизован."
$body += Bullet "Frontend отправляет адрес и список товаров."
$body += Bullet "Backend проверяет остатки stock."
$body += Bullet "Создается запись в orders и несколько записей в order_items."
$body += Bullet "total_price считается автоматически."
$body += Bullet "Количество товаров на складе уменьшается."

$body += Heading "Отзывы" 2
$body += Bullet "Отзывы товара доступны публично."
$body += Bullet "Создать отзыв может только авторизованный пользователь."
$body += Bullet "Удалить отзыв может автор отзыва или ADMIN."

$body += Heading "9. REST API" 1
$body += TableXml @("Метод", "URL", "Назначение", "Доступ") @(
    @("POST", "/api/auth/register", "Регистрация", "Public"),
    @("POST", "/api/auth/login", "Вход и получение JWT", "Public"),
    @("GET", "/api/categories", "Список категорий", "Public"),
    @("POST/PUT/DELETE", "/api/categories", "CRUD категорий", "ADMIN"),
    @("GET", "/api/products", "Каталог товаров с пагинацией", "Public"),
    @("GET", "/api/products/search", "Поиск товаров", "Public"),
    @("POST/PUT/DELETE", "/api/products", "CRUD товаров", "ADMIN"),
    @("POST", "/api/orders", "Создать заказ", "USER/ADMIN"),
    @("GET", "/api/orders/my", "Мои заказы", "USER/ADMIN"),
    @("GET", "/api/orders", "Все заказы", "ADMIN"),
    @("PUT", "/api/orders/{id}/status", "Изменить статус заказа", "ADMIN"),
    @("GET", "/api/products/{productId}/reviews", "Отзывы товара", "Public"),
    @("POST", "/api/products/{productId}/reviews", "Создать отзыв", "USER/ADMIN"),
    @("DELETE", "/api/reviews/{id}", "Удалить отзыв", "Owner/ADMIN")
)

$body += Heading "10. Начальные данные" 1
$body += Paragraph "Файл src/main/resources/data.sql добавляет 5 категорий и 10 товаров. Используются INSERT ... ON CONFLICT DO NOTHING и дополнительные проверки NOT EXISTS, чтобы данные не дублировались при перезапуске приложения." 24
$body += Bullet "Категории: Электроника, Одежда, Книги, Спорт, Дом и сад."
$body += Bullet "Товары: iPhone 15, Samsung Galaxy S24, MacBook Pro M3, Nike Air Max, Levi's 501, Clean Code, Spring in Action, гантели, коврик для йоги, кофемашина DeLonghi."

$body += Heading "11. Что показывать на защите" 1
$body += Bullet "Открыть http://localhost:8080/ и показать frontend."
$body += Bullet "Показать каталог, категории, поиск, корзину и оформление заказа."
$body += Bullet "Открыть Swagger UI: http://localhost:8080/swagger-ui.html."
$body += Bullet "Показать docs/diagrams.md и PNG-диаграммы."
$body += Bullet "Объяснить связи users → orders, categories → products, orders → order_items, products → reviews."
$body += Bullet "Показать GitHub-коммиты от всех участников."

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <w:body>
    $body
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>
"@

$rootRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"@

$documentRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/architecture.png"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/er-diagram.png"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/class-diagram.png"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/use-case.png"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/sequence-order.png"/>
</Relationships>
"@

$fullOutput = Join-Path (Get-Location) $OutputPath
if (Test-Path $fullOutput) {
    Remove-Item -LiteralPath $fullOutput -Force
}

function Add-TextEntry($Zip, [string]$EntryName, [string]$Text) {
    $entry = $Zip.CreateEntry($EntryName, [System.IO.Compression.CompressionLevel]::Optimal)
    $stream = $entry.Open()
    $writer = New-Object System.IO.StreamWriter($stream, (New-Object System.Text.UTF8Encoding($false)))
    $writer.Write($Text)
    $writer.Dispose()
}

function Add-FileEntry($Zip, [string]$EntryName, [string]$FilePath) {
    $entry = $Zip.CreateEntry($EntryName, [System.IO.Compression.CompressionLevel]::Optimal)
    $entryStream = $entry.Open()
    $fileStream = [System.IO.File]::OpenRead((Resolve-Path $FilePath))
    $fileStream.CopyTo($entryStream)
    $fileStream.Dispose()
    $entryStream.Dispose()
}

$zip = [System.IO.Compression.ZipFile]::Open($fullOutput, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    Add-TextEntry $zip "[Content_Types].xml" $contentTypes
    Add-TextEntry $zip "_rels/.rels" $rootRels
    Add-TextEntry $zip "word/document.xml" $documentXml
    Add-TextEntry $zip "word/_rels/document.xml.rels" $documentRels
    Add-FileEntry $zip "word/media/architecture.png" "docs\architecture.png"
    Add-FileEntry $zip "word/media/er-diagram.png" "docs\er-diagram.png"
    Add-FileEntry $zip "word/media/class-diagram.png" "docs\class-diagram.png"
    Add-FileEntry $zip "word/media/use-case.png" "docs\use-case.png"
    Add-FileEntry $zip "word/media/sequence-order.png" "docs\sequence-order.png"
}
finally {
    $zip.Dispose()
}

Write-Host "Created $fullOutput"
