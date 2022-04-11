import { StrapiRoute } from "strapi-typed";

const routes: StrapiRoute[] = [
  {
    method: "GET",
    path: "/:relation",
    handler: "client.findAllInHierarchy",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/:relation",
    handler: "client.post",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/:relation/flat",
    handler: "client.findAllFlat",
    config: {
      policies: [],
    },
  },
  {
    method: "PUT",
    path: "/:relation/comment/:commentId",
    handler: "client.put",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/:relation/comment/:commentId/report-abuse",
    handler: "client.reportAbuse",
    config: {
      policies: [],
    },
  },
  {
    method: "DELETE",
    path: "/:relation/comment/:commentId",
    handler: "client.removeComment",
    config: {
      policies: [],
    },
  },
];

export default routes;
