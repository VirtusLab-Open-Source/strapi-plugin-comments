export const clientPaths = {
    "/:relation": {
        get: {
            responses: {200: {description: "Find all comments related to configured Collection / Single Type and return them in a nested structure"}}
        }
    },
    "/:relation": {
        post: {
            responses: {200: {description: "Post a comment against configured Collection / Single Type"}}
        }
    },
    "/:relation/flat": {
        get: {
            responses: {200: {description: "Find all comments related to configured Collection / Single Type and return them in a flat structure for further processing"}}
        }
    },
    "/:relation/comment/:commentId": {
        put: {
            responses: {200: {description: "Update comment related to configured Collection / Single Type if user is the author"}}
        }
    },
    "/:relation/comment/:commentId/report-abuse": {
        post: {
            responses: {200: {description: "Report an abuse against comment for configured Collection / Single Type"}}
        }
    },
    "/:relation/comment/:commentId": {
        delete: {
            responses: {200: {description: "Remove comment related to configured Collection / Single Type if user is the author"}}
        }
    },
    "/author/:id": {
        get: {
            responses: {200: {description: "Find all comments created by Strapi user"}}
        }
    },
    "/author/:id/:type": {
        get: {
            responses: {200: {description: "Find all comments created by specified type of user"}}
        }
    }
}