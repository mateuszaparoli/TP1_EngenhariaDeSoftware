# Diagramas UML - Sistema de Biblioteca Digital

## Diagrama de Classes - Modelo de Domínio Completo

```mermaid
classDiagram
    class Event {
        +int id
        +CharField name[255]
        +TextField description
        +DateTime created_at
        +DateTime updated_at
        +__str__() string
        +get_absolute_url() string
    }

    class Edition {
        +int id
        +PositiveIntegerField year
        +CharField location[255]
        +DateField start_date
        +DateField end_date
        +DateTime created_at
        +DateTime updated_at
        +ForeignKey event
        +__str__() string
        +get_duration() int
        +is_current() bool
    }

    class Author {
        +int id
        +CharField name[255]
        +EmailField email
        +TextField bio
        +URLField website
        +DateTime created_at
        +DateTime updated_at
        +__str__() string
        +get_article_count() int
        +get_slug() string
    }

    class Article {
        +int id
        +CharField title[500]
        +TextField abstract
        +CharField pdf_url[500]
        +FileField pdf_file
        +TextField bibtex
        +DateTime created_at
        +DateTime updated_at
        +ForeignKey edition
        +ManyToManyField authors
        +__str__() string
        +get_absolute_url() string
        +get_file_size() int
        +has_pdf() bool
    }

    class Subscription {
        +int id
        +EmailField email
        +ForeignKey author
        +ForeignKey event
        +BooleanField is_active
        +DateTime created_at
        +DateTime updated_at
        +__str__() string
        +get_subscription_type() string
        +deactivate() void
    }

    class NotificationLog {
        +int id
        +ForeignKey article
        +EmailField recipient
        +CharField status[20]
        +TextField error_message
        +DateTime sent_at
        +DateTime created_at
    }

    %% Relacionamentos
    Event "1" --> "*" Edition : has many
    Event "1" --> "*" Subscription : receives subscriptions
    Edition "1" --> "*" Article : contains
    Author "*" --> "*" Article : writes
    Author "1" --> "*" Subscription : subscribes to
    Article "1" --> "*" NotificationLog : generates notifications
    Subscription "1" --> "*" NotificationLog : receives notifications
```

## Diagrama de Classes - Sistema de Notificações

```mermaid
classDiagram
    class NotificationService {
        <<service>>
        +send_article_notification(article) void
        +find_subscribers(article) list
        +build_email_content(article, subscriber) dict
        +send_email(recipient, content) bool
        +log_notification(article, recipient, status) void
        -_get_event_subscribers(event) list
        -_get_author_subscribers(authors) list
        -_get_general_subscribers() list
        -_format_email_template(article) string
    }

    class SignalHandler {
        <<singleton>>
        +notify_subscribers_on_article(sender, instance, created) void
        -_is_notification_enabled() bool
        -_should_notify(article) bool
    }

    class EmailBackend {
        <<interface>>
        +send_mail(subject, message, from_email, recipients) bool
        +configure_smtp() void
        +validate_email(email) bool
    }

    class SMTPEmailBackend {
        +send_mail(subject, message, from_email, recipients) bool
        +configure_smtp() void
        +validate_email(email) bool
        -_connect_to_server() SMTPConnection
        -_authenticate() bool
    }

    class ConsoleEmailBackend {
        +send_mail(subject, message, from_email, recipients) bool
        +configure_smtp() void
        +validate_email(email) bool
        -_print_to_console(email_data) void
    }

    class SubscriptionManager {
        +create_subscription(email, target) Subscription
        +delete_subscription(email, target) bool
        +get_active_subscriptions(target) list
        +validate_subscription_data(data) bool
        -_check_duplicate(email, target) bool
        -_sanitize_email(email) string
    }

    %% Relacionamentos
    SignalHandler --> NotificationService : triggers
    NotificationService --> EmailBackend : uses
    NotificationService --> SubscriptionManager : queries
    EmailBackend <|-- SMTPEmailBackend
    EmailBackend <|-- ConsoleEmailBackend
    NotificationService --> Article : observes
    NotificationService --> Subscription : reads
```

## Diagrama de Sequência - Sistema de Notificações

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant System as Sistema Django
    participant Signal as Signal Handler
    participant NotifSvc as Notification Service
    participant SubMgr as Subscription Manager
    participant Email as Email Backend
    participant DB as Database

    Admin->>System: Cria novo artigo
    System->>DB: Salva Article
    DB-->>System: Confirma salvamento
    
    System->>Signal: post_save signal
    Signal->>Signal: Verifica se é criação (created=True)
    
    Signal->>NotifSvc: notify_subscribers_on_article(article)
    NotifSvc->>SubMgr: find_subscribers(article)
    
    SubMgr->>DB: Busca subscriptions por evento
    DB-->>SubMgr: Lista de event subscriptions
    
    SubMgr->>DB: Busca subscriptions por autores
    DB-->>SubMgr: Lista de author subscriptions
    
    SubMgr->>DB: Busca subscriptions gerais
    DB-->>SubMgr: Lista de general subscriptions
    
    SubMgr-->>NotifSvc: Lista única de emails
    
    loop Para cada subscriber
        NotifSvc->>NotifSvc: build_email_content(article, email)
        NotifSvc->>Email: send_mail(subject, content, recipients)
        
        alt Email enviado com sucesso
            Email-->>NotifSvc: Success
            NotifSvc->>DB: Log notification (status: sent)
        else Falha no envio
            Email-->>NotifSvc: Error
            NotifSvc->>DB: Log notification (status: failed)
        end
    end
    
    NotifSvc-->>Signal: Relatório de envio
    Signal-->>System: Notificações processadas
```

## Diagrama de Sequência - Importação Bulk com Validação

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant Frontend as React Frontend
    participant API as Bulk Import API
    participant Parser as BibTeX Parser
    participant Validator as Data Validator
    participant FileProc as File Processor
    participant DB as Database
    participant NotifSys as Notification System

    Admin->>Frontend: Seleciona arquivos (BibTeX + ZIP)
    Admin->>Frontend: Escolhe edição
    Admin->>Frontend: Inicia importação
    
    Frontend->>API: POST /api/articles/bulk-import/
    Note over Frontend,API: multipart/form-data:<br/>bibtex_file, pdf_zip, edition_id
    
    API->>FileProc: extract_pdfs_from_zip(zip_file)
    FileProc-->>API: Dict[filename -> ContentFile]
    
    API->>Parser: parse_bibtex(bibtex_content)
    Parser-->>API: List[article_data]
    
    loop Para cada entrada BibTeX
        API->>Validator: validate_article_data(entry, index)
        Validator-->>API: ValidationResult
        
        alt Validação OK
            API->>FileProc: find_matching_pdf(entry, pdf_files)
            FileProc-->>API: ContentFile ou None
            
            API->>DB: Create Article
            DB-->>API: Article instance
            
            alt PDF encontrado
                API->>DB: Attach PDF file
            end
            
            loop Para cada autor
                API->>DB: get_or_create Author
                DB-->>API: Author instance
                API->>DB: Add author to article
            end
            
            API->>DB: Save final article
            DB-->>NotifSys: Trigger post_save signal
            NotifSys->>NotifSys: Process notifications
            
        else Validação falhou
            API->>API: Add to skipped_list
        end
    end
    
    API->>API: generate_import_report(results)
    API-->>Frontend: JsonResponse com relatório
    Frontend-->>Admin: Exibe relatório detalhado
```

## Diagrama de Estados - Ciclo de Vida do Artigo

```mermaid
stateDiagram-v2
    [*] --> Draft : Admin inicia cadastro
    
    Draft --> Validating : Submete formulário
    Validating --> Draft : Dados inválidos
    Validating --> Processing : Dados válidos
    
    Processing --> PendingFiles : Salvando metadados
    PendingFiles --> Processing : Erro no upload
    PendingFiles --> PendingAuthors : PDF processado
    
    PendingAuthors --> PendingNotification : Autores vinculados
    PendingNotification --> Published : Notificações enviadas
    
    Published --> Updating : Admin edita
    Updating --> Published : Atualização salva
    Updating --> Error : Erro na atualização
    
    Error --> Draft : Corrigir dados
    Error --> Published : Ignorar erro
    
    Published --> Archived : Admin arquiva
    Archived --> Published : Admin restaura
    
    Published --> [*] : Admin deleta
    
    note right of Draft
        Artigo sendo criado
        Dados ainda não validados
    end note
    
    note right of Published
        Artigo visível publicamente
        Notificações enviadas
        PDF disponível
    end note
    
    note right of Error
        Estado de erro
        Requer intervenção
    end note
```
