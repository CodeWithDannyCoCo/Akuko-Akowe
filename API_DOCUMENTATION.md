# Chronicle Blog API Documentation

## Base URLs

- Production: `https://chronicle-server-f2n9.onrender.com/api`
- Development: `http://localhost:8000/api`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Sign Up

```
POST /auth/signup/
Content-Type: application/json

Request:
{
    "username": "string",
    "email": "string",
    "password": "string"
}

Response:
{
    "token": "string",
    "refresh": "string",
    "user": {
        "id": "number",
        "username": "string",
        "email": "string",
        "avatar": "string"
    }
}
```

#### Login

```
POST /auth/login/
Content-Type: application/json

Request:
{
    "username": "string",
    "password": "string"
}

Response:
{
    "token": "string",
    "refresh": "string",
    "user": {
        "id": "number",
        "username": "string",
        "email": "string",
        "avatar": "string"
    }
}
```

#### Logout

```
POST /auth/logout/
Authorization: Bearer <token>

Request:
{
    "refresh_token": "string"
}

Response:
{
    "status": "logged out"
}
```

### Posts

#### List Posts

```
GET /posts/
Response: Array of Post objects
```

#### Create Post

```
POST /posts/
Authorization: Bearer <token>

Request:
{
    "title": "string",
    "content": "string",
    "image": "file (optional)"
}
```

#### Get Single Post

```
GET /posts/{id}/
Response: Post object
```

#### Update Post

```
PUT /posts/{id}/
Authorization: Bearer <token>

Request:
{
    "title": "string",
    "content": "string",
    "image": "file (optional)"
}
```

#### Delete Post

```
DELETE /posts/{id}/
Authorization: Bearer <token>
```

#### Like/Unlike Post

```
POST /posts/{id}/like/
DELETE /posts/{id}/like/
Authorization: Bearer <token>
```

#### Bookmark/Unbookmark Post

```
POST /posts/{id}/bookmark/
DELETE /posts/{id}/bookmark/
Authorization: Bearer <token>
```

### Users

#### Get Current User

```
GET /users/me/
Authorization: Bearer <token>
```

#### Get User Profile

```
GET /users/{username}/
```

#### Update User Settings

```
PUT /users/{username}/settings/
Authorization: Bearer <token>

Request:
{
    "bio": "string",
    "website": "string",
    "avatar": "file (optional)"
}
```

#### Follow/Unfollow User

```
POST /users/{username}/follow/
POST /users/{username}/unfollow/
Authorization: Bearer <token>
```

#### Get User Posts

```
GET /users/{username}/posts/
```

#### Get User Activity

```
GET /users/{username}/activity/
```

### Feed

#### Get Personalized Feed

```
GET /feed/
Authorization: Bearer <token>
```

### Comments

#### List Comments

```
GET /comments/?post={post_id}
```

#### Create Comment

```
POST /comments/
Authorization: Bearer <token>

Request:
{
    "post": "number",
    "content": "string"
}
```

#### Update Comment

```
PUT /comments/{id}/
Authorization: Bearer <token>

Request:
{
    "content": "string"
}
```

#### Delete Comment

```
DELETE /comments/{id}/
Authorization: Bearer <token>
```

### Admin Endpoints

All admin endpoints require admin user authentication.

#### Get Site Statistics

```
GET /admin/stats/
Authorization: Bearer <token>
```

#### Get Site Analytics

```
GET /admin/analytics/
Authorization: Bearer <token>
```

#### Get Site Activity

```
GET /admin/activity/
Authorization: Bearer <token>
```

#### Manage Users

```
GET /admin/users/
GET /admin/users/{id}/
PUT /admin/users/{id}/role/
Authorization: Bearer <token>
```

#### Manage Posts

```
GET /admin/posts/
Authorization: Bearer <token>
```

#### Manage Comments

```
GET /admin/comments/
Authorization: Bearer <token>
```

#### Site Settings

```
GET /admin/settings/
PUT /admin/settings/
Authorization: Bearer <token>

Request:
{
    "site_name": "string",
    "maintenance_mode": "boolean",
    "allow_registration": "boolean",
    "default_user_role": "string"
}
```

## Response Formats

### Post Object

```json
{
  "id": "number",
  "title": "string",
  "content": "string",
  "image": "string",
  "author": {
    "id": "number",
    "username": "string",
    "avatar": "string"
  },
  "created_at": "datetime",
  "updated_at": "datetime",
  "likes_count": "number",
  "comments_count": "number",
  "is_liked": "boolean",
  "is_bookmarked": "boolean"
}
```

### User Object

```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "avatar": "string",
  "bio": "string",
  "website": "string",
  "created_at": "datetime"
}
```

### Comment Object

```json
{
  "id": "number",
  "post": "number",
  "author": {
    "id": "number",
    "username": "string",
    "avatar": "string"
  },
  "content": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Notes

1. All timestamps are in ISO 8601 format
2. File uploads should use `multipart/form-data`
3. Pagination is implemented for list endpoints with `page` and `page_size` parameters
4. Error responses follow the format:

```json
{
  "detail": "Error message"
}
```
