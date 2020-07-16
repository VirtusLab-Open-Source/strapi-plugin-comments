# Strapi - Comments plugin

A plugin for [Strapi Headless CMS](https://github.com/strapi/strapi) that provides end to end comments feature with their moderation panel, bad words filtering, abuse reporting and more.

### ⏳ Installation

Install Strapi with this **Quickstart** command to create a Strapi project instantly:

(Use **yarn** to install this plugin within your Strapi project (recommended). [Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/).)

```bash
yarn add strapi-plugin-comments@latest
```


Enjoy 🎉

### 🖐 Requirements

Complete installation requirements are exact same as for Strapi itself and can be found in the documentation under <a href="https://strapi.io/documentation/v3.x/installation/cli.html#step-1-make-sure-requirements-are-met">Installation Requirements</a>.

**Supported Strapi versions**:

- Strapi v3.0.5 (recently tested)
- Strapi v3.x

(This plugin may work with the older Strapi versions, but these are not tested nor officially supported at this time.)

**We recommend always using the latest version of Strapi to start your new projects**.

## Features

- **Comments Public API:** Elegant, entirely customizable and a fully extensible admin panel.
- **Strapi &amp generic users:** Support for built-in &amp; also generic non-Strapi users that might be the comments authors.
- **Any Content Type relation:** Comments can by linked to any of your Content Types by default. Simply, you're controlling it.
- **Moderation Panel:** Search & Filter through the bucket with your auditory comments. Manage them by blocking single ones or full threads. All in combined list &amp; hierarchical tree view of threads.
- **Automated Bad Words filtering:** By detault end users are not allowed to post abusing comments where bad words have been used.
- **Abuse Reporting & Reviewing:** Built on top of Node.js, Strapi delivers amazing performance.

## Public API Comment model

### Generic (non Strapi User)
```
{
    "id": 1,
    "content": "My comment content",
    "blocked": null,
    "blockedThread": true,
    "blockReason": null,
    "points": 1,
    "authorUser": null,
    "authorId": "PLE12345678",
    "authorName": "Joe Doe",
    "authorEmail": "jdoe@sample.com",
    "authorAvatar": null,
    "created_at": "2020-07-14T20:13:01.649Z",
    "updated_at": "2020-07-14T20:13:01.670Z"
}
```
### Strapi User
```
{
    "id": 1,
    "content": "My comment content",
    "blocked": true,
    "blockedThread": null,
    "blockReason": null,
    "points": null,
    "authorUser": {
        "id": 1,
        "username": "Sample User",
        "email": "user@sample.com",
        "provider": "local",
        "confirmed": true,
        "blocked": false,
        "role": 1,
        "created_at": "2020-07-10T08:38:03.157Z",
        "updated_at": "2020-07-10T08:38:03.170Z"
    },
    "authorId": null,
    "authorName": null,
    "authorEmail": null,
    "authorAvatar": null,
    "created_at": "2020-07-14T20:13:01.649Z",
    "updated_at": "2020-07-14T20:13:01.670Z"
}

```

## Public API specification

### Get Comments

`GET <host>/comments/<content-type>:<id>`

Return a hierarchical tree structure of comments for specified instance of Content Type like for example `Article` with `ID: 1`

**Example URL**: `https://localhost:1337/comments/article:1`

**Example response body**

```
[
    {
        -- Comment Model fields ---,
        children: [
            {
                -- Comment Model fields ---,
                children: [...]
            },
            ...
        ]
    },
    ...
]
```

**Possible response codes**
- `200` - Successful. Response with list of comments (can be empty)
- `400` - Bad Request. Requested list for not valid / not existing Content Type

### Post a Comment

`POST <host>/comments/<content-type>:<id>`

Posts a Comment related to specified instance of Content Type like for example `Article` with `ID: 1`

**Example URL**: `https://localhost:1337/comments/article:1`

**Example request body**

*Generic (non Strapi User)*
```
{
	"authorId": "<any ID like value>",
	"authorName": "Joe Doe",
	"authorEmail": "jdoe@sample.com",
	"content": "My sample response",
	"threadOf": 2, // id of comment we would like to start / continue the thread (Optional)
	"related": [{
		"refId": 1,
		"ref": "article",
		"field": "comments"
	}] 
}
```

*Strapi user*
```
{
	"authorUser": 1,
	"content": "My sample response",
	"threadOf": 2, // id of comment we would like to start / continue the thread (Optional)
	"related": [{
		"refId": 1,
		"ref": "article",
		"field": "comments"
	}] 
}
```

**Example response body**

```
{
    -- Comment Model fields ---
}
```

**Possible response codes**
- `200` - Successful. Response with created Comment Model
- `400` - Bad Request. Missing field values or bad words check fails. Error message will provide relevant reason.

### Update Comment

`PUT <host>/comments/<content-type>:<id>/comment/<commentId>`

Updates a specified Comment content based on it `commentId` and related to specified instance of Content Type like for example `Article` with `ID: 1`

**Example URL**: `https://localhost:1337/comments/article:1/comment/2`

**Example request body**

*Generic (non Strapi User)*
```
{
	"authorId": "<any ID like value>",
	"authorName": "Joe Doe",
	"authorEmail": "jdoe@sample.com",
	"content": "My sample response"
}
```

*Strapi user*
```
{
	"authorUser": 1,
	"content": "My sample response"
}
```

**Example response body**

```
{
    -- Comment Model fields ---
}
```

**Possible response codes**
- `200` - Successful. Response with updated Comment Model
- `400` - Bad Request. Missing field values or bad words check fails. Error message will provide relevant reason.
- `409` - Conflict. Occurs when trying to update a non existing or not own comment. Possible cause might be that `authorId` or `authorUser` mismatch with existing comment.

### Like Comment

`PATCH <host>/comments/<content-type>:<id>/comment/<commentId>/like`

Likes a specified Comment based on it `commentId` and related to specified instance of Content Type like for example `Article` with `ID: 1`.

**Example URL**: `https://localhost:1337/comments/article:1/comment/2/like`

**Example response body**

```
{
    -- Comment Model fields ---
}
```

**Possible response codes**
- `200` - Successful. Response with liked Comment Model.
- `409` - Conflict. Occurs when trying to like a non existing comment.

### Report abuse in the Comment

`POST <host>/comments/<content-type>:<id>/comment/<commentId>/report-abuse`

Reports abuse in specified Comment content based on it `commentId` and related to specified instance of Content Type like for example `Article` with `ID: 1` and requests moderator attention.

**Example URL**: `https://localhost:1337/comments/article:1/comment/2/report-abuse`

**Example request body**

```
{
	"reason": "<reason enum>",
	"content": "This comment is not relevant"
}
```

*Available reason enums:* `OTHER`, `BAD_WORDS`, `DISCRIMINATION`

**Example response body**

```
{
    -- Comment Abuse Report fields ---
}
```

**Possible response codes**
- `200` - Successful. Response with reported abuse.
- `409` - Conflict. Occurs when trying to report an abuse to a non existing comment.

## Contributing

Feel free to fork and make a Pull Request to this plugin project. All the input is warmly welcome!

## Community support

For general help using Strapi, please refer to [the official Strapi documentation](https://strapi.io/documentation/). For additional help, you can use one of these channels to ask a question:

- [Slack](http://slack.strapi.io) We're present on official Strapi slack workspace. Look for @cyp3r and DM.
- [GitHub](https://github.com/VirtusLab/strapi-plugin-comments/issues) (Bug reports, Contributions, Questions and Discussions)

## License

[MIT License](LICENSE.md) Copyright (c) 2020 [VirtusLab Sp. z o.o.](https://virtuslab.com/) &amp; [Strapi Solutions](https://strapi.io/).