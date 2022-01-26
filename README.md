# Strapi v4 - Comments plugin - BETA

<p align="center">
  <a href="https://www.npmjs.org/package/strapi-plugin-comments">
    <img src="https://img.shields.io/npm/v/strapi-plugin-comments/latest.svg" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.org/package/strapi-plugin-comments">
    <img src="https://img.shields.io/npm/dm/strapi-plugin-comments.svg" alt="Monthly download on NPM" />
  </a>
  <a href="https://circleci.com/gh/VirtusLab-Open-Source/strapi-plugin-comments">
    <img src="https://circleci.com/gh/VirtusLab-Open-Source/strapi-plugin-comments.svg?style=shield" alt="CircleCI" />
  </a>
  <a href="https://codecov.io/gh/VirtusLab-Open-Source/strapi-plugin-comments">
    <img src="https://codecov.io/gh/VirtusLab-Open-Source/strapi-plugin-comments/coverage.svg?branch=master" alt="codecov.io" />
  </a>
</p>

A plugin for [Strapi Headless CMS](https://github.com/strapi/strapi) that provides end to end comments feature with their moderation panel, bad words filtering, abuse reporting and more.

### Versions
- **Strapi v4** - (current) - [v2.x](https://github.com/VirtusLab-Open-Source/strapi-plugin-comments)
- **Strapi v3** - [v1.x](https://github.com/VirtusLab-Open-Source/strapi-plugin-comments/tree/strapi-v3)

### Versions
- **Stable** - [v1.0.4](https://github.com/VirtusLab-Open-Source/strapi-plugin-comments)
- **Beta** - v4 support - [v2.0.0-beta.x](https://github.com/VirtusLab-Open-Source/strapi-plugin-comments/tree/feat/strapi-v4)

### ⏳ Installation

(Use **yarn** to install this plugin within your Strapi project (recommended). [Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/).)

```bash
yarn add strapi-plugin-comments@latest
```

After successful installation you've to build a fresh package that includes  plugin UI. To archive that simply use:

```bash
yarn build
yarn develop
```

or just run Strapi in the development mode with `--watch-admin` option:

```bash
yarn develop --watch-admin
```

The **Comments** plugin should appear in the **Plugins** section of Strapi sidebar after you run app again.

Enjoy 🎉

### 🖐 Requirements

Complete installation requirements are exact same as for Strapi itself and can be found in the documentation under [Installation Requirements](https://docs.strapi.io/developer-docs/latest/getting-started/introduction.html).

**Minimum environment requirements**
- Node.js `>=14.x.x`
- NPM `>=7.x.x`

In our minimum support we're following [official Node.js releases timelines](https://nodejs.org/en/about/releases/).

**Supported Strapi versions**:

- Strapi v4.0.5 (recently tested)
- Strapi v4.x

(This plugin is not working with v3.x and not may work with the older Strapi v4 versions, but these are not tested nor officially supported at this time.)

**We recommend always using the latest version of Strapi to start your new projects**.

## Features

- **Comments Public API:** Elegant, entirely customizable and a fully extensible admin panel.
- **Strapi &amp; generic users:** Support for built-in &amp; also generic non-Strapi users that might be the comments authors.
- **Any Content Type relation:** Comments can by linked to any of your Content Types by default. Simply, you're controlling it.
- **Moderation Panel:** Search & Filter through the bucket with your auditory comments. Manage them by blocking single ones or full threads. All in combined list &amp; hierarchical tree view of threads.
- **Automated Bad Words filtering:** By detault end users are not allowed to post abusing comments where bad words have been used.
- **Abuse Reporting & Reviewing:** Don't allow inferior language, react to reports from your community, send email notifiactions about abuse reports

## Configuration
To setup amend default plugin configuration we recommend to put following snippet as part of `config/plugins.js` or `config/<env>/plugins.js` file. If the file does not exist yet, you have to create it manually. If you've got already configurations for other plugins stores by this way, use just the `comments` part within exising `plugins` item.


```js
    ...
    comments: {
        badWords: false,
        moderatorRoles: ["Authenticated"],
        approvalFlow: ['api::page.page'],
        entryLabel: {
            '*': ['Title', 'title', 'Name', 'name', 'Subject', 'subject'],
            'api::page.page': ['MyField'],
        },
        reportReasons: {
            'MY_CUSTOM_REASON': 'MY_CUSTOM_REASON',
        },
    },
    ...
```

### Properties
- `badWords` - Enabled support for [bad words filtering](https://www.npmjs.com/package/bad-words). Can be turned off or overwritten using [options reference](https://www.npmjs.com/package/bad-words#constructor). Default value: `true`. 
- `moderatorRoles` - Optional list of names of roles. Users with those roles will be notified by email when a new abuse report is created. This feature requires a built-in [Strapi email plugin](https://docs.strapi.io/developer-docs/latest/plugins/email.html) configured.
- `approvalFlow` - list of Content Types which are supporting approval flow. Values must be in format like `'api::<collection name>.<content type name>'`. For not included, posted comments are going to be immediately visible. 
- `entryLabel` - ordered list of property names per Content Type to generate related entity label. Keys must be in format like `'api::<collection name>.<content type name>'`. Default formatting set as `*`.
- `reportReasons` - set of enums you would like to use for issuing abuse reports. Provided by default `'BAD_LANGUAGE'`, `'DISCRIMINATION'` and `'OTHER'`.

## Additional GQL Configuration
All you need to do is to install and enable `@strapi/plugin-graphql` for you instance based on the **[official Strapi v4 docs](https://docs.strapi.io/developer-docs/latest/plugins/graphql.html#configurations)**.

See [available GQL specification section](#public-graphql-specification).

## RBAC
Plugin provides granular permissions based on Strapi RBAC functionality.

### Mandatory permissions
For any role different than **Super Admin**, to access the **Comments panel** you must set following permissions:
- _Plugins_ -> _Content-type-builder_ -> _Read_ - gives you ability to fetch Content Type schema
- _Plugins_ -> _Comments_ -> _Comments: Read_ - gives you the basic read access to **Comments Panel**

### Optional permissions
Feature / Capability focused permissions:
- _Plugins_ -> _Comments_ -> _Comments: Moderate_ - allows you to block, unblock, approve &amp; reject comments
- _Plugins_ -> _Comments_ -> _Reports: Read_ - allows you to see the list of issued abuse reports against comments
- _Plugins_ -> _Comments_ -> _Reports: Moderate_ - allows you to review (resolve) issued abuse reports against comments

## Public API Comment model

### Generic (non Strapi User)
```json
{
    "id": 1,
    "content": "My comment content",
    "blocked": null,
    "blockedThread": true,
    "blockReason": null,
    "authorUser": null,
    "removed": null,
    "approvalStatus": "APPROVED", // Only in case of enabled approval flow. Default: null
    "author": {
        "id": "207ccfdc-94ba-45eb-979c-790f6f49c392",
        "name": "Joe Doe",
        "email": "jdoe@sample.com",
        "avatar": null,
    },
    "createdAt": "2020-07-14T20:13:01.649Z",
    "updatedAt": "2020-07-14T20:13:01.670Z",
    "related": {}, // Related content type entity
    "reports": [] // Reports issued against this comment
}
```
### Strapi User
```json
{
    "id": 1,
    "content": "My comment content",
    "blocked": true,
    "blockedThread": null,
    "blockReason": null,
    "removed": null,
    "approvalStatus": "REJECTED", // Only in case of enabled approval flow. Default: null
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
    "createdAt": "2020-07-14T20:13:01.649Z",
    "updatedAt": "2020-07-14T20:13:01.670Z",
    "related": {}, // Related content type entity
    "reports": [] // Reports issued against this comment
}

```

## Public API specification

### Get Comments

`GET <host>/comments/api::<collection name>.<content type name>:<entity id>`

Return a hierarchical tree structure of comments for specified instance of Content Type like for example `Page` with `ID: 1`

**Example URL**: `https://localhost:1337/comments/api::page.page:1`

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

### Get Comments (flat structure)

`GET <host>/comments/api::<collection name>.<content type name>:<entity id>/flat`

Return a flat structure of comments for specified instance of Content Type like for example `Page` with `ID: 1`

**Example URL**: `https://localhost:1337/comments/api::page.page:1/flat`

**Example response body**

```
[
    {
        -- Comment Model fields ---
    },
    {
        -- Comment Model fields ---
    },
    ...
]
```

**Possible response codes**
- `200` - Successful. Response with list of comments (can be empty)
- `400` - Bad Request. Requested list for not valid / not existing Content Type

### Post a Comment

`POST <host>/comments/api::<collection name>.<content type name>:<entity id>`

Posts a Comment related to specified instance of Content Type like for example `Page` with `ID: 1`

**Example URL**: `https://localhost:1337/comments/api::page.page:1`

**Example request body**

*Generic (non Strapi User)*
```
{
    "author": {
        "id": "<any ID like value>",
        "name": "Joe Doe",
        "email": "jdoe@sample.com",
        "avatar": "<any image url>"
    },
	"content": "My sample response",
	"threadOf": 2, // id of comment we would like to start / continue the thread (Optional)
}
```

*Strapi user*
```
{
	"authorUser": 1, // id of a author user. Optional in case of 'enableUsers: true' in the plugin configuration
	"content": "My sample response",
	"threadOf": 2, // id of comment we would like to start / continue the thread (Optional)
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

`PUT <host>/comments/api::<collection name>.<content type name>:<entity id>/comment/<commentId>`

Updates a specified Comment content based on it `commentId` and related to specified instance of Content Type like for example `Page` with `ID: 1`

**Example URL**: `https://localhost:1337/comments/api::page.page:1/comment/2`

**Example request body**

*Generic (non Strapi User)*
```
{
    "author": {
        "id": "<any ID like value>"
    },
	"content": "My sample response"
}
```

*Strapi user*
```
{
	"authorUser": 1, // id of a author user. Optional in case of 'enableUsers: true' in the plugin configuration
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

### Delete Comment

`DELETE <host>/comments/api::<collection name>.<content type name>:<entity id>/<commentId>?authorId=<authorId>`

Deletes a specified Comment based on it `commentId` and related to specified instance of Content Type like for example `Page` with `ID: 1`.

**Example URL**: `https://localhost:1337/comments/api::page.page:1/comment/1?authorId=1`

**Example response body**

```
{
    -- Empty Response ---
}
```

**Possible response codes**
- `200` - Successful with blank Response.
- `409` - Conflict. Occurs when trying to delete a non existing comment.


### Issue Abuse Report against specified Comment

`POST <host>/comments/api::<collection name>.<content type name>:<entity id>/comment/<commentId>/report-abuse`

Reports abuse in specified Comment content based on it `commentId` and related to specified instance of Content Type like for example `Page` with `ID: 1` and requests moderator attention.

**Example URL**: `https://localhost:1337/comments/api::page.page:1/comment/2/report-abuse`

**Example request body**

```
{
	"reason": "<reason enum>",
	"content": "This comment is not relevant"
}
```

*Available reason enums:* `BAD_WORDS`, `OTHER`, `DISCRIMINATION` (want more? See [configuration section](#configuration).)

**Example response body**

```
{
    -- Comment Abuse Report fields ---
}
```

**Possible response codes**
- `200` - Successful. Response with reported abuse.
- `409` - Conflict. Occurs when trying to report an abuse to a non existing comment.

## Public GraphQL specification

> *To test all queries and understand the schemas use GraphQL Playground exposed by `@strapi/plugin-graphql` on `http://localhost:1337/graphql`*

### Get Comments

*REST API equivalent: [Public API -> Get Comments](#get-comments)*

**Example request**

```graphql
query {
  findAllFlat(
    relation: "api::page.page:1"
    filters: { content: { contains: "Test" } }
  ) {
        id
        content
        blocked
        threadOf {
            id
        }
        author {
            id
            name
        }
    }
}
```

**Example response**

```json
{
  "data": {
    "findAllFlat": [
      {
        "id": 3,  
        "content": "Test",
        "blocked": false,
        "threadOf": null,
        "author": {
          "id": "123456",
          "name": "Joe Doe"
        }
      },
      //...
    ]
  }
```

### Get Comments (flat structure)

*REST API equivalent: [Public API -> Get Comments (flat structure)](#get-comments-flat-structure)*

**Example request**

```graphql
query {
  findAllInHierarchy(relation: "api::page.page:1") {
    id
    content
    blocked
    children {
      id
      content
    }
    threadOf {
      id
    }
    author {
      id
      name
    }
  }
}
```

**Example response**

```json
{
  "data": {
    "findAllInHierarchy": [
      {
        "id": 1,
        "content": "Test",
        "blocked": false,
        "children": [
          {
            "id": 6,
            "content": "Text to search for"
          },
          //...
        ],
        "threadOf": null,
        "author": {
          "id": "123456",
          "name": "Joe Doe"
        }
      },
      //...
    ]
  }
}
```

### Post a Comment

*REST API equivalent: [Public API -> Post a Comment](#post-a-comment)*

**Example request**

```graphql
mutation createComment {
  createComment(
    input: {
      relation: "api::page.page:1"
      content: "Hello World!"
      threadOf: 3
      author: { id: "12345678", name: "John Wick", email: "test@test.pl" }
    }
  ) {
    id
    content
    threadOf {
      id
    }
    author {
      id
      name
    }
  }
}
```

**Example response**

```json
{
  "data": {
    "createComment": {
      "id": 34,
      "content": "Hello World!",
      "threadOf": {
        "id": 3
      },
      "author": {
        "id": "12345678",
        "name": "John Wick"
      }
    }
  }
}
```

### Update Comment

*REST API equivalent: [Public API -> Update Comment](#update-comment)*

**Example request**

```graphql
mutation updateComment {
  updateComment(
    input: {
      id: 34
      relation: "api::page.page:1"
      content: "I've changed it!"
      author: { id: "12345678" }
    }
  ) {
    id
    content
    threadOf {
      id
    }
    author {
      id
      name
    }
    createdAt
    updatedAt
  }
}
```

**Example response**

```json
{
  "data": {
    "updateComment": {
      "id": 34,
      "content": "I've changed it!",
      "threadOf": {
        "id": 3
      },
      "author": {
        "id": "12345678",
        "name": "John Wick"
      },
      "createdAt": "2022-01-26T07:45:35.978Z",
      "updatedAt": "2022-01-26T07:47:44.659Z"
    }
  }
}
```

### Delete Comment

*REST API equivalent: [Public API -> Delete Comment](#delete-comment)*

**Example request**

```graphql
mutation removeComment {
  removeComment(
    input: { id: 33, relation: "api::page.page:1", author: { id: "12345678" } }
  ) {
    id
    removed
  }
}
```

**Example response**

```json
{
  "data": {
    "removeComment": {
      "id": 33,
      "removed": true
    }
  }
}
```

### Issue Abuse Report against specified Comment

*REST API equivalent: [Public API -> Issue Abuse Report against specified Comment](#issue-abuse-report-against-specified-comment)*

**Example request body**

```graphql
mutation createAbuseReport {
  createAbuseReport(
    input: {
      commentId: 34
      relation: "api::page.page:1"
      reason: BAD_LANGUAGE
      content: "Rude language"
    }
  ) {
    id
    reason
    content
    related {
      id
      author {
        id
        name
      }
    }
  }
}
```

*Available reason enums:* `BAD_WORDS`, `OTHER`, `DISCRIMINATION` (want more? See [configuration section](#configuration).)

**Example response**

```json
{
  "data": {
    "createAbuseReport": {
      "id": 28,
      "content": "Rude language",
      "reason": "DISCRIMINATION",
      "related": {
        "id": 34,
        "author": {
          "id": "12345678",
          "name": "John Wick"
        }
      }
    }
  }
}
```

## Examples

Live example of plugin usage can be found in the [VirtusLab Strapi Examples](https://github.com/VirtusLab/strapi-examples/tree/master/strapi-plugin-comments) repository.

## Contributing

Feel free to fork and make a Pull Request to this plugin project. All the input is warmly welcome!

## Community support

For general help using Strapi, please refer to [the official Strapi documentation](https://strapi.io/documentation/). For additional help, you can use one of these channels to ask a question:

- [Discord](https://discord.strapi.io/) We're present on official Strapi Discord workspace. Look for @cyp3r and DM.
- [Slack - VirtusLab Open Source](https://virtuslab-oss.slack.com) We're present on a public channel #strapi-molecules
- [GitHub](https://github.com/VirtusLab-Open-Source/strapi-plugin-comments/issues) (Bug reports, Contributions, Questions and Discussions)

## License

[MIT License](LICENSE.md) Copyright (c) [VirtusLab Sp. z o.o.](https://virtuslab.com/) &amp; [Strapi Solutions](https://strapi.io/).
