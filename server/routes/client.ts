import { StrapiRoute } from "strapi-typed";

const routes: StrapiRoute[] = [
  {
    method: "GET",
    path: "/:relation",
    handler: "client.findAllInHierarchy",
    config: {
      policies: [],
      description:
        "Find all comments related to configured Collection / Single Type and return them in a nested structure",
      tag: {
        plugin: "comments",
        name: "Comments",
        actionType: "find",
      },
    },
  },
  {
    method: "POST",
    path: "/:relation",
    handler: "client.post",
    config: {
      policies: [],
      description: "Post a comment against configured Collection / Single Type",
      tag: {
        plugin: "comments",
        name: "Comments",
        actionType: "create",
      },
    },
  },
  {
    method: "GET",
    path: "/:relation/flat",
    handler: "client.findAllFlat",
    config: {
      policies: [],
      description:
        "Find all comments related to configured Collection / Single Type and return them in a flat structure for further processing",
      tag: {
        plugin: "comments",
        name: "Comments",
        actionType: "find",
      },
    },
  },
  {
    method: "PUT",
    path: "/:relation/comment/:commentId",
    handler: "client.put",
    config: {
      policies: [],
      description:
        "Update comment related to configured Collection / Single Type if user is the author",
      tag: {
        plugin: "comments",
        name: "Comments",
        actionType: "update",
      },
    },
  },
  {
    method: "POST",
    path: "/:relation/comment/:commentId/report-abuse",
    handler: "client.reportAbuse",
    config: {
      policies: [],
      description:
        "Report an abuse against comment for configured Collection / Single Type",
      tag: {
        plugin: "comments",
        name: "Comments",
        actionType: "create",
      },
    },
  },
  {
    method: "DELETE",
    path: "/:relation/comment/:commentId",
    handler: "client.removeComment",
    config: {
      policies: [],
      description:
        "Remove comment related to configured Collection / Single Type if user is the author",
      tag: {
        plugin: "comments",
        name: "Comments",
        actionType: "delete",
      },
    },
  },
  {
    method: "GET",
    path: "/author/:id",
    handler: "client.findAllPerAuthor",
    config: {
      policies: [],
      description:
        "Find all comments created by Strapi user",
      tag: {
        plugin: "comments",
        name: "Comments",
        actionType: "find",
      },
    },
  },
  {
    method: "GET",
    path: "/author/:id/:type",
    handler: "client.findAllPerAuthor",
    config: {
      policies: [],
      description:
        "Find all comments created by specified type of user",
      tag: {
        plugin: "comments",
        name: "Comments",
        actionType: "find",
      },
    },
  },
];

export default routes;
