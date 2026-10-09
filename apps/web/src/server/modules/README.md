# API modules

Business features belong here. Each module uses `domain`, `application`, `infrastructure`, and `presentation/http` boundaries. Route handlers in `src/app/api` adapt HTTP requests to application use cases and must not contain business rules or direct database queries.
