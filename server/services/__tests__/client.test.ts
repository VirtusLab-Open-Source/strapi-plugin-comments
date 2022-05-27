import { StrapiUser } from "strapi-typed";
import { IServiceClient } from "../../../types";
import { Comment } from "../../../types/contentTypes";
import { setupStrapi, resetStrapi } from "../../../__mocks__/initSetup";
import { APPROVAL_STATUS } from "../../utils/constants";
import PluginError from "../../utils/error";
import { getPluginService } from "../../utils/functions";

jest.mock;

afterEach(resetStrapi);

describe("Test Comments service - Client", () => {
  const collection = "api::collection.test";
  const related = `${collection}:1`;
  const db: Array<Comment> = [
    {
      id: 1,
      content: "ABC",
      threadOf: null,
      related,
      authorId: 1,
      authorName: "Joe Doe",
      authorEmail: "joe@example.com",
    },
    {
      id: 2,
      content: "DEF",
      threadOf: 1,
      related,
      authorId: 1,
      authorName: "Joe Doe",
      authorEmail: "joe@example.com",
      blockedThread: true,
    },
    {
      id: 3,
      content: "GHJ",
      threadOf: null,
      related,
      authorId: 1,
      authorName: "Joe Doe",
      authorEmail: "joe@example.com",
    },
    {
      id: 4,
      content: "IKL",
      threadOf: 2,
      related,
      authorUser: {
        id: 1,
        username: "Joe Doe",
        email: "joe@example.com",
        avatar: {
          id: 1,
          url: "http://example.com",
        },
      },
    },
  ];
  const relatedEntity = { id: 1, title: "Test", uid: collection };
  const adminUser = { id: 1, username: "Admin", email: "admin@example.com" }

  const errorThrown = (e: unknown, message: string, status: number = 400) => {
    expect(e).toBeInstanceOf(PluginError);
    expect(e).toHaveProperty("status", status);
    expect(e).toHaveProperty("name", "Strapi:Plugin:Comments");
    expect(e).toHaveProperty("message", message);
  };

  describe("Client API", () => {
    describe("Create", () => {
      describe("Common behaviours", () => {
        beforeEach(() =>
          setupStrapi({ enabledCollections: [collection] }, true, {
            "plugins::comments": db,
            "api::collection": [
              relatedEntity,
              { id: 2, title: "Test 2", uid: collection },
            ],
          })
        );

        describe("Validations & error handling", () => {
          test("Should fail with 400 because of malformed relation format", async () => {
            try {
              await getPluginService<IServiceClient>("client").create(
                "api::not-valid-relation",
                {
                  content: "Test content",
                },
                undefined
              );
            } catch (e) {
              errorThrown(
                e,
                'Field "related" got incorrect format, use format like "api::<collection name>.<content type name>:<entity id>"'
              );
            }
          });

          test("Should fail with 403 because of not enabled collection", async () => {
            try {
              await getPluginService<IServiceClient>("client").create(
                "api::not-enabled.relation:1",
                {
                  content: "Test content",
                },
                undefined
              );
            } catch (e) {
              errorThrown(
                e,
                "Action not allowed for collection 'api::not-enabled.relation'. Use one of: api::collection.test",
                403
              );
            }
          });

          test("Should fail with 400 because of not existing relation", async () => {
            const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation(() => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => resolve(null)),
              }));

            try {
              await getPluginService<IServiceClient>("client").create(
                `${collection}:100`,
                {
                  content: "Test content",
                },
                undefined
              );
            } catch (e) {
              errorThrown(
                e,
                'Relation for field "related" does not exist. Check your payload please.'
              );
            }
            spy.mockRestore();
          });

          test("Should fail with 400 because of not existing thread", async () => {
            const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation((type: string) => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve(null);
                      default:
                        return resolve(related);
                    }
                  }),
              }));

            try {
              await getPluginService<IServiceClient>("client").create(
                related,
                {
                  content: "Test content",
                  threadOf: 100,
                },
                undefined
              );
            } catch (e) {
              errorThrown(e, "Thread does not exist");
            }
            spy.mockRestore();
          });

          test("Should fail with 400 because of not valid author field", async () => {
            const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation((type: string) => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve(db[0]);
                      default:
                        return resolve(related);
                    }
                  }),
              }));

            try {
              await getPluginService<IServiceClient>("client").create(
                related,
                {
                  content: "Test content",
                },
                undefined
              );
            } catch (e) {
              errorThrown(
                e,
                'Not able to recognise author of a comment. Make sure you\'ve provided "author" property in a payload or authenticated your request properly.'
              );
            }

            try {
              await getPluginService<IServiceClient>("client").create(
                related,
                {
                  content: "Test content",
                  author: {
                    name: "Author",
                  },
                },
                undefined
              );
            } catch (e) {
              errorThrown(
                e,
                'Not able to recognise author of a comment. Make sure you\'ve provided "author" property in a payload or authenticated your request properly.'
              );
            }

            try {
              await getPluginService<IServiceClient>("client").create(
                related,
                {
                  content: "Test content",
                  threadOf: 1,
                  author: {
                    id: 1,
                    email: "not-valid-value@com",
                    name: "Author",
                  },
                },
                undefined
              );
            } catch (e) {
              errorThrown(
                e,
                'Field: "author.email". Author e-mail is not valid value. Check your payload'
              );
            }
            spy.mockRestore();
          });

          test("Should fail with 400 because of lack of content provided", async () => {
            const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation((type: string) => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve(db[0]);
                      default:
                        return resolve(related);
                    }
                  }),
              }));

            try {
              await getPluginService<IServiceClient>("client").create(
                related,
                {
                  author: {
                    id: 1,
                    email: "example@example.com",
                    name: "Author",
                  },
                },
                undefined
              );
            } catch (e) {
              errorThrown(e, "No content received");
            }
            spy.mockRestore();
          });
        });
      });

      describe("Approval flow", () => {
        beforeEach(() =>
          setupStrapi(
            {
              enabledCollections: [collection],
              approvalFlow: [collection],
            },
            true,
            {
              "plugins::comments": db,
              "api::collection": [
                relatedEntity,
                { id: 2, title: "Test 2", uid: collection },
              ],
            }
          )
        );

        describe("Validations & error handling", () => {
          test("Should fail with 400 because of not valid approvalStatus field", async () => {
            const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation((type: string) => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve(db[0]);
                      default:
                        return resolve(related);
                    }
                  }),
              }));

            try {
              await getPluginService<IServiceClient>("client").create(
                related,
                {
                  content: "Test content",
                  author: {
                    id: 1,
                    email: "test@example.com",
                  },
                  approvalStatus: APPROVAL_STATUS.APPROVED,
                },
                undefined
              );
            } catch (e) {
              errorThrown(e, "Invalid approval status");
            }

            spy.mockRestore();
          });
        });

        describe("Successful path", () => {
          test("Should create a comment for generic user", async () => {
            const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation((type: string) => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve(db[0]);
                      default:
                        return resolve(related);
                    }
                  }),
                create: async (args: any) =>
                  new Promise((resolve) => {
                    return resolve({
                      id: 100,
                      ...args?.data,
                    });
                  }),
              }));

            try {
              const payload = {
                content: "Test content",
                author: {
                  id: 1,
                  email: "test@example.com",
                },
                approvalStatus: APPROVAL_STATUS.PENDING,
              };
              const result = await getPluginService<IServiceClient>(
                "client"
              ).create(related, payload, undefined);

              expect(result).toHaveProperty(["id"], 100);
              expect(result).toHaveProperty(["content"], payload.content);
              expect(result).toHaveProperty(["authorId"], payload.author.id);
              expect(result).toHaveProperty(
                ["authorEmail"],
                payload.author.email
              );
              expect(result).toHaveProperty(
                ["approvalStatus"],
                APPROVAL_STATUS.PENDING
              );
            } catch (e) {}

            spy.mockRestore();
          });

          test("Should create a comment for strapi user", async () => {
            const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation((type: string) => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve(db[0]);
                      default:
                        return resolve(related);
                    }
                  }),
                create: async (args: any) =>
                  new Promise((resolve) => {
                    return resolve({
                      id: 100,
                      ...args?.data,
                    });
                  }),
              }));

            try {
              const payload = {
                content: "Test content",
                approvalStatus: APPROVAL_STATUS.PENDING,
              };
              const user = {
                id: 1,
                username: "Author",
                email: "example@example.com",
              };

              const result = await getPluginService<IServiceClient>(
                "client"
              ).create(related, payload, user);

              expect(result).toHaveProperty(["id"], 100);
              expect(result).toHaveProperty(["content"], payload.content);
              expect(result).toHaveProperty(["authorUser"], user.id);
              expect(result).toHaveProperty(
                ["approvalStatus"],
                APPROVAL_STATUS.PENDING
              );
            } catch (e) {}

            spy.mockRestore();
          });
        });
      });

      describe("Non-approval flow", () => {
        beforeEach(() =>
          setupStrapi(
            {
              enabledCollections: [collection],
              approvalFlow: [collection],
            },
            true,
            {
              "plugins::comments": db,
              "api::collection": [
                relatedEntity,
                { id: 2, title: "Test 2", uid: collection },
              ],
            }
          )
        );

        describe("Successful path", () => {
          test("Should create a comment for generic user", async () => {
            const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation((type: string) => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve(db[0]);
                      default:
                        return resolve(related);
                    }
                  }),
                create: async (args: any) =>
                  new Promise((resolve) => {
                    return resolve({
                      id: 100,
                      ...args?.data,
                    });
                  }),
              }));

            const payload = {
              content: "Test content",
              author: {
                id: 1,
                name: "Author",
                email: "test@example.com",
              },
              approvalStatus: APPROVAL_STATUS.PENDING,
            };
            const result = await getPluginService<IServiceClient>(
              "client"
            ).create(related, payload, undefined);

            expect(result).toHaveProperty(["id"], 100);
            expect(result).toHaveProperty(["related"], related);
            expect(result).toHaveProperty(["content"], payload.content);
            expect(result).toHaveProperty(["author", "id"], payload.author.id);
            expect(result).toHaveProperty(
              ["author", "name"],
              payload.author.name
            );
            expect(result).toHaveProperty(
              ["author", "email"],
              payload.author.email
            );
            expect(result).toHaveProperty(
              ["approvalStatus"],
              APPROVAL_STATUS.PENDING
            );

            spy.mockRestore();
          });

          test("Should create a comment for strapi user", async () => {
            const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation((type: string) => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve(db[0]);
                      default:
                        return resolve(related);
                    }
                  }),
                create: async (args: any) =>
                  new Promise((resolve) => {
                    return resolve({
                      id: 100,
                      ...args?.data,
                      authorUser: user,
                    });
                  }),
              }));

            const payload = {
              content: "Test content",
              approvalStatus: APPROVAL_STATUS.PENDING,
            };
            const user = {
              id: 1,
              username: "Author",
              email: "example@example.com",
            };

            const result = await getPluginService<IServiceClient>(
              "client"
            ).create(related, payload, user);

            expect(result).toHaveProperty(["id"], 100);
            expect(result).toHaveProperty(["related"], related);
            expect(result).toHaveProperty(["content"], payload.content);
            expect(result).toHaveProperty(["author", "id"], user.id);
            expect(result).toHaveProperty(["author", "name"], user.username);
            expect(result).toHaveProperty(["author", "email"], user.email);
            expect(result).toHaveProperty(
              ["approvalStatus"],
              APPROVAL_STATUS.PENDING
            );

            spy.mockRestore();
          });
        });
      });
    });

    describe("Update", () => {
      beforeEach(() =>
        setupStrapi({ enabledCollections: [collection] }, true, {
          "plugins::comments": db,
          "api::collection": [
            relatedEntity,
            { id: 2, title: "Test 2", uid: collection },
          ],
        })
      );

      describe("Validations & error handling", () => {
        test("Should fail with 400 because of malformed relation format", async () => {
          try {
            await getPluginService<IServiceClient>("client").update(
              1,
              "api::not-valid-relation",
              {
                content: "Test content",
              },
              undefined
            );
          } catch (e) {
            errorThrown(
              e,
              'Request property "relation" got incorrect format, use format like "api::<collection name>.<content type name>:<entity id>"'
            );
          }
        });

        test("Should fail with 403 because of not enabled collection", async () => {
          try {
            await getPluginService<IServiceClient>("client").update(
              1,
              "api::not-enabled.relation:1",
              {
                content: "Test content",
              },
              undefined
            );
          } catch (e) {
            errorThrown(
              e,
              "Action not allowed for collection 'api::not-enabled.relation'. Use one of: api::collection.test",
              403
            );
          }
        });

        test("Should fail with 403 because of try to modify not owned comment by generic user", async () => {
          const spy = jest
            .spyOn(global.strapi.db, "query")
            // @ts-ignore
            .mockImplementation((type: string) => ({
              findOne: async (_: any) =>
                new Promise((resolve) => {
                  switch (type) {
                    case "plugins::comments.comment":
                      return resolve(db[0]);
                    default:
                      return resolve(related);
                  }
                }),
            }));

          try {
            await getPluginService<IServiceClient>("client").update(
              1,
              related,
              {
                content: "Test content",
              },
              undefined
            );
          } catch (e) {
            errorThrown(
              e,
              "You're not allowed to take an action on that entity. Make sure you've provided \"author\" property in a payload or authenticated your request properly.",
              403
            );
          }

          try {
            await getPluginService<IServiceClient>("client").update(
              1,
              related,
              {
                content: "Test content",
                author: {
                  authorId: 2,
                },
              },
              undefined
            );
          } catch (e) {
            errorThrown(
              e,
              "You're not allowed to take an action on that entity. Make sure you've provided \"author\" property in a payload or authenticated your request properly.",
              403
            );
          }

          spy.mockRestore();
        });

        test("Should fail with 403 because of try to modify not owned comment by strapi user", async () => {
          const user: StrapiUser = {
            id: 100,
            email: "example@example.com",
            username: "I'm not an author",
          };

          const spy = jest
            .spyOn(global.strapi.db, "query")
            // @ts-ignore
            .mockImplementation((type: string) => ({
              findOne: async (_: any) =>
                new Promise((resolve) => {
                  switch (type) {
                    case "plugins::comments.comment":
                      return resolve(db[3]);
                    default:
                      return resolve(related);
                  }
                }),
            }));

          try {
            await getPluginService<IServiceClient>("client").update(
              1,
              related,
              {
                content: "Test content",
              },
              user
            );
          } catch (e) {
            errorThrown(
              e,
              "You're not allowed to take an action on that entity. Make sure you've provided \"author\" property in a payload or authenticated your request properly.",
              403
            );
          }

          spy.mockRestore();
        });
      });

      describe("Successful path", () => {
        test("Should update a comment for generic user", async () => {
          const spy = jest
            .spyOn(global.strapi.db, "query")
            // @ts-ignore
            .mockImplementation((type: string) => ({
              findOne: async (_: any) =>
                new Promise((resolve) => {
                  switch (type) {
                    case "plugins::comments.comment":
                      return resolve(db[0]);
                    default:
                      return resolve(related);
                  }
                }),
              update: async (args: any) =>
                new Promise((resolve) => {
                  return resolve({
                    ...db[0],
                    ...args?.data,
                  });
                }),
            }));

          const payload = {
            content: "Changed content",
            threadOf: 2,
            author: {
              id: 1,
            },
          };
          const result = await getPluginService<IServiceClient>(
            "client"
          ).update(1, related, payload, undefined);

          expect(result).toHaveProperty(["id"], 1);
          expect(result).toHaveProperty(["related"], related);
          expect(result).toHaveProperty(["content"], payload.content);
          expect(result).toHaveProperty(["threadOf"], db[0].threadOf);
          expect(result).toHaveProperty(["author", "id"], db[0].authorId);
          expect(result).toHaveProperty(["author", "email"], db[0].authorEmail);

          spy.mockRestore();
        });

        test("Should update a comment for strapi user", async () => {
          const spy = jest
            .spyOn(global.strapi.db, "query")
            // @ts-ignore
            .mockImplementation((type: string) => ({
              findOne: async (_: any) =>
                new Promise((resolve) => {
                  switch (type) {
                    case "plugins::comments.comment":
                      return resolve(db[3]);
                    default:
                      return resolve(related);
                  }
                }),
              update: async (args: any) =>
                new Promise((resolve) => {
                  return resolve({
                    ...db[3],
                    ...args?.data,
                    authorUser: user,
                  });
                }),
            }));

          const payload = {
            content: "Changed content",
            threadOf: 2,
          };
          const user = {
            id: 1,
            username: "Author",
            email: "example@example.com",
          };

          const result = await getPluginService<IServiceClient>(
            "client"
          ).update(4, related, payload, user);

          expect(result).toHaveProperty(["id"], db[3].id);
          expect(result).toHaveProperty(["related"], related);
          expect(result).toHaveProperty(["content"], payload.content);
          expect(result).toHaveProperty(["threadOf"], db[3].threadOf);
          expect(result).toHaveProperty(["author", "id"], user.id);
          expect(result).toHaveProperty(["author", "email"], user.email);

          spy.mockRestore();
        });
      });
    });

    describe("Remove", () => {
      beforeEach(() =>
        setupStrapi({ enabledCollections: [collection] }, true, {
          "plugins::comments": db,
          "api::collection": [
            relatedEntity,
            { id: 2, title: "Test 2", uid: collection },
          ],
        })
      );

      describe("Validations & error handling", () => {
        test("Should fail with 403 because of not provided user context", async () => {
          try {
            await getPluginService<IServiceClient>("client").markAsRemoved(
              1,
              "api::not-enabled.relation:1",
              undefined,
              undefined
            );
          } catch (e) {
            errorThrown(
              e,
              "You're not allowed to take an action on that entity. Make sure that you've provided proper \"authorId\" or authenticated your request properly.",
              403
            );
          }
        });

        test("Should fail with 403 because of not enabled collection", async () => {
          try {
            await getPluginService<IServiceClient>("client").markAsRemoved(
              1,
              "api::not-enabled.relation:1",
              1,
              undefined
            );
          } catch (e) {
            errorThrown(
              e,
              "Action not allowed for collection 'api::not-enabled.relation'. Use one of: api::collection.test",
              403
            );
          }
        });

        test("Should fail with 404 because of try to remove not existing comment or not associated author", async () => {
          const spy = jest
            .spyOn(global.strapi.db, "query")
            // @ts-ignore
            .mockImplementation((type: string) => ({
              findOne: async (_: any) =>
                new Promise((resolve) => {
                  switch (type) {
                    case "plugins::comments.comment":
                      return resolve(null);
                    default:
                      return resolve(related);
                  }
                }),
            }));

          try {
            await getPluginService<IServiceClient>("client").markAsRemoved(
              1,
              related,
              1,
              undefined
            );
          } catch (e) {
            errorThrown(
              e,
              "Entity does not exist or you're not allowed to take an action on it",
              404
            );
          }

          spy.mockRestore();
        });
      });

      describe("Successful path", () => {
        test("Should remove a comment for generic user", async () => {
          const spy = jest
            .spyOn(global.strapi.db, "query")
            // @ts-ignore
            .mockImplementation((type: string) => ({
              findOne: async (_: any) =>
                new Promise((resolve) => {
                  switch (type) {
                    case "plugins::comments.comment":
                      return resolve(db[0]);
                    default:
                      return resolve(related);
                  }
                }),
              update: async (args: any) =>
                new Promise((resolve) => {
                  return resolve({
                    ...db[0],
                    ...args?.data,
                  });
                }),
            }));

          const result = await getPluginService<IServiceClient>(
            "client"
          ).markAsRemoved(1, related, 1, undefined);

          expect(result).toHaveProperty(["id"], 1);
          expect(result).toHaveProperty(["related"], related);
          expect(result).toHaveProperty(["author", "id"], 1);
          expect(result).toHaveProperty(["removed"], true);

          spy.mockRestore();
        });

        test("Should remove a comment for strapi user", async () => {
          const user: StrapiUser = {
            id: 1,
            email: "example@example.com",
            username: "Author",
          };

          const spy = jest
            .spyOn(global.strapi.db, "query")
            // @ts-ignore
            .mockImplementation((type: string) => ({
              findOne: async (_: any) =>
                new Promise((resolve) => {
                  switch (type) {
                    case "plugins::comments.comment":
                      return resolve(db[3]);
                    default:
                      return resolve(related);
                  }
                }),
              update: async (args: any) =>
                new Promise((resolve) => {
                  return resolve({
                    ...db[3],
                    ...args?.data,
                  });
                }),
            }));

          const result = await getPluginService<IServiceClient>(
            "client"
          ).markAsRemoved(1, related, undefined, user);

          expect(result).toHaveProperty(["id"], 4);
          expect(result).toHaveProperty(["related"], related);
          expect(result).toHaveProperty(["author", "id"], user.id);
          expect(result).toHaveProperty(["removed"], true);

          spy.mockRestore();
        });
      });
    });

    describe("Report abuse", () => {
      beforeEach(() =>
        setupStrapi({ enabledCollections: [collection] }, true, {
          "plugins::comments": db,
          "api::collection": [
            relatedEntity,
            { id: 2, title: "Test 2", uid: collection },
          ],
        })
      );

      describe("Validations & error handling", () => {
        test("Should fail with 403 because of not enabled collection", async () => {
          try {
            await getPluginService<IServiceClient>("client").reportAbuse(
              1,
              "api::not-enabled.relation:1",
              {
                content: "Test content",
                reason: "BAD_LANGUAGE",
              },
              undefined
            );
          } catch (e) {
            errorThrown(
              e,
              "Action not allowed for collection 'api::not-enabled.relation'. Use one of: api::collection.test",
              403
            );
          }
        });

        test("Should fail with 403 because of try to add report against not existing comment", async () => {
          const spy = jest
            .spyOn(global.strapi.db, "query")
            // @ts-ignore
            .mockImplementation((type: string) => ({
              findOne: async (_: any) =>
                new Promise((resolve) => {
                  switch (type) {
                    case "plugins::comments.comment":
                      return resolve(null);
                    default:
                      return resolve(related);
                  }
                }),
            }));

          try {
            await getPluginService<IServiceClient>("client").reportAbuse(
              1,
              related,
              {
                content: "Test content",
                reason: "BAD_LANGUAGE",
              },
              undefined
            );
          } catch (e) {
            errorThrown(
              e,
              "You're not allowed to take an action on that entity. Make sure that comment exist or you've authenticated your request properly.",
              403
            );
          }

          spy.mockRestore();
        });
      });

      describe("Successful path", () => {
        test("Should create a report against comment", async () => {
          const payload = {
            content: "Test content",
            reason: "BAD_LANGUAGE",
          };

          const spyQuery = jest
            .spyOn(global.strapi.db, "query")
            // @ts-ignore
            .mockImplementation((type: string) => ({
              findOne: async (_: any) =>
                new Promise((resolve) => {
                  switch (type) {
                    case "plugins::comments.comment":
                      return resolve(db[0]);
                    case "admin::user":
                      return resolve(adminUser);
                    default:
                      return resolve(related);
                  }
                }),
              findMany: async (_: any) =>
                new Promise((resolve) => {
                  switch (type) {
                    case "plugins::comments.comment":
                      return resolve(db);
                    case "admin::user":
                      return resolve([adminUser]);
                    default:
                      return resolve([related]);
                  }
              }),  
              create: async (args: any) =>
                new Promise((resolve) => {
                  return resolve({
                    id: 1,
                    ...args?.data,
                  });
                }),
            }));

          const spyPluginEmail = jest
            .spyOn(global.strapi.plugins.email.services.email, 'send')
            // @ts-ignore
            .mockImplementation((args: any) => ({
                status: 200,
                params: args,
              })  
            );

          const result = await getPluginService<IServiceClient>(
            "client"
          ).reportAbuse(1, related, payload, undefined);

          expect(result).toHaveProperty(["id"], 1);
          expect(result).toHaveProperty(["related", "id"], 1);
          expect(result).toHaveProperty(["content"], payload.content);
          expect(result).toHaveProperty(["reason"], payload.reason);

          expect(spyPluginEmail).toHaveBeenCalledTimes(1);
          expect(spyPluginEmail.mock.results[0].value.params).toHaveProperty(["from"], adminUser.email);
          expect(spyPluginEmail.mock.results[0].value.params).toHaveProperty(["to", 0], adminUser.email);
          expect(spyPluginEmail.mock.results[0].value.params).toHaveProperty(["subject"], "New abuse report on comment");

          spyQuery.mockRestore();
          spyPluginEmail.mockRestore();
        });
      });
    });

    describe("Inform about response", () => {
      const clientSettings = {
        url: 'http://testsite.com',
        contactEmail: 'contact@example.com',
      };

      beforeEach(() =>
        setupStrapi({ enabledCollections: [collection], client: { ...clientSettings } }, true, {
          "plugins::comments": db,
          "api::collection": [
            relatedEntity,
            { id: 2, title: "Test 2", uid: collection },
          ],
        })
      );

      describe("Successful path", () => {

        test("Should sent e-mail with proper content to comment author", async () => {

          const spyQuery = jest
            .spyOn(global.strapi.db, "query")
            // @ts-ignore
            .mockImplementation((type: string) => ({
              findOne: async (_: any) =>
                new Promise((resolve) => {
                  switch (type) {
                    case "plugins::comments.comment":
                      return resolve(db[0]);
                    case "admin::user":
                      return resolve(adminUser);
                    default:
                      return resolve(related);
                  }
                }),
              findMany: async (_: any) =>
                new Promise((resolve) => {
                  switch (type) {
                    case "plugins::comments.comment":
                      return resolve(db);
                    case "admin::user":
                      return resolve([adminUser]);
                    default:
                      return resolve([related]);
                  }
              }),  
            }));

          const spyPluginEmail = jest
            .spyOn(global.strapi.plugins.email.services.email, 'send')
            // @ts-ignore
            .mockImplementation((args: any) => ({
                status: 200,
                params: args,
              })  
            );

          const result = await getPluginService<IServiceClient>(
            "client"
          ).sendResponseNotification(db[1]);

          expect(spyPluginEmail).toHaveBeenCalledTimes(1);
          expect(spyPluginEmail.mock.results[0].value.params).toHaveProperty(["from"], clientSettings.contactEmail);
          expect(spyPluginEmail.mock.results[0].value.params).toHaveProperty(["to", 0], db[0].authorEmail);
          expect(spyPluginEmail.mock.results[0].value.params).toHaveProperty(["subject"], "You've got a new response to your comment");
          expect(spyPluginEmail.mock.results[0].value.params.text).toContain(db[0].authorName);
          expect(spyPluginEmail.mock.results[0].value.params.text).toContain(db[1].authorName);
          expect(spyPluginEmail.mock.results[0].value.params.text).toContain(clientSettings.url);

          spyQuery.mockRestore();
          spyPluginEmail.mockRestore();
        });
      });
    });
  });
});
