import { IServiceAdmin, SettingsCommentsPluginConfig } from "../../../types";
import { Comment } from "../../../types/contentTypes";
import { setupStrapi, resetStrapi } from "../../../__mocks__/initSetup";
import { APPROVAL_STATUS } from "../../utils/constants";
import { getPluginService } from "../../utils/functions";

jest.mock;

afterEach(resetStrapi);

describe("Test Comments service - Admin", () => {
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
      threadOf: 1,
      related,
      authorId: 1,
      authorName: "Joe Doe",
      authorEmail: "joe@example.com",
    },
    {
      id: 4,
      content: "IKL",
      threadOf: 1,
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
  const reportEntity = { id: 1, related: db[0].id, content: "Abuse report", reason: "OTHER" };
  const adminUser = { id: 1, username: "Admin", email: "admin@example.com" }

  describe("Admin API", () => {
    describe("Config", () => {

      const expectRegex = result => {
        expect(result).toHaveProperty(["regex", "email"], "/\\S+@\\S+\\.\\S+/");
        expect(result).toHaveProperty(["regex", "relatedUid"], "/^(?<uid>[a-z0-9-]+\\:{2}[a-z0-9-]+\\.[a-z0-9-]+)\\:{1}(?<id>[a-z0-9-]+)$/i");
        expect(result).toHaveProperty(["regex", "sorting"], "/^(?<path>[a-z0-9-_\\:\\.]+)\\:+(asc|desc)$/i");
        expect(result).toHaveProperty(["regex", "uid"], "/^(?<type>[a-z0-9-]+)\\:{2}(?<api>[a-z0-9-]+)\\.{1}(?<contentType>[a-z0-9-]+)$/i");
      };

      describe("Read", () => {
        describe("Default", () => {
          beforeEach(() =>
            setupStrapi({}, undefined, {
              "plugins::comments": db,
              "api::collection": [
                relatedEntity,
                { id: 2, title: "Test 2", uid: collection },
              ],
            })
          );
  
          test("Moderation panel", async () => {
            const result = await getPluginService<IServiceAdmin>("admin").config();
            
            expect(result).toHaveProperty(["approvalFlow", 0], "api::blog-post.blog-post");
            expect(result).toHaveProperty(["entryLabel", "api::blog-post.blog-post", 0], "alternative_subject");
            expect(result).toHaveProperty("isGQLPluginEnabled", undefined);
            expectRegex(result);
            expect(result).not.toHaveProperty("moderatorRoles");
          });

          test("Settings page", async () => {
            const result = await getPluginService<IServiceAdmin>("admin").config(true);
            
            expect(result).toHaveProperty(["approvalFlow", 0], "api::blog-post.blog-post");
            expect(result).toHaveProperty(["entryLabel", "api::blog-post.blog-post", 0], "alternative_subject");
            expect(result).toHaveProperty("isGQLPluginEnabled", true);
            expect(result).toHaveProperty("moderatorRoles");
            expectRegex(result);
          });
  
        });
  
        describe("Config stored", () => {
          beforeEach(() =>
            setupStrapi({ enabledCollections: [collection], isGQLPluginEnabled: true, moderatorRoles: ['editor'] }, true, {
              "plugins::comments": db,
              "api::collection": [
                relatedEntity,
                { id: 2, title: "Test 2", uid: collection },
              ],
            })
          );


          test("Moderation panel", async () => {
            const result = await getPluginService<IServiceAdmin>("admin").config();
            
            expect(result).toHaveProperty(["enabledCollections", 0], collection);
            expect(result).toHaveProperty(["moderatorRoles", 0], "editor");
            expect(result).toHaveProperty("isGQLPluginEnabled", undefined);
            expectRegex(result);
            expect(result).not.toHaveProperty("entryLabel");
          });

          test("Settings page", async () => {
            const result = await getPluginService<IServiceAdmin>("admin").config(true);
            
            expect(result).toHaveProperty(["enabledCollections", 0], collection);
            expect(result).toHaveProperty("isGQLPluginEnabled", true);
            expect(result).toHaveProperty(["moderatorRoles", 0], "editor");
            expectRegex(result);
            expect(result).not.toHaveProperty("entryLabel");
          });

        });

      });

      describe("Update", () => {
        beforeEach(() =>
          setupStrapi({ enabledCollections: [collection], isGQLPluginEnabled: true, moderatorRoles: ['editor'] }, true, {
            "plugins::comments": db,
            "api::collection": [
              relatedEntity,
              { id: 2, title: "Test 2", uid: collection },
            ],
          })
        );


        test("Config has been stored", async () => {
          const payload = {
            enabledCollections: [],
            moderatorRoles: ['super_admin'],
            gql: { 
              auth: true,
            },
            client: {
              url: 'https://sample.url'
            }
          } as SettingsCommentsPluginConfig;
          await getPluginService<IServiceAdmin>("admin").updateConfig(payload);
          const result = await getPluginService<IServiceAdmin>("admin").config();
          
          expect(result).toHaveProperty(["enabledCollections"], payload.enabledCollections);
          expect(result).toHaveProperty(["moderatorRoles", 0], payload.moderatorRoles[0]);
          expect(result).toHaveProperty(["client", "url"], payload.client.url);
          expect(result).toHaveProperty(["gql", "auth"], payload.gql.auth);
          expect(result).not.toHaveProperty("entryLabel");
        });

      });

      describe("Restore", () => {
        beforeEach(() =>
          setupStrapi({ enabledCollections: [collection], isGQLPluginEnabled: true, moderatorRoles: ['editor'] }, true, {
            "plugins::comments": db,
            "api::collection": [
              relatedEntity,
              { id: 2, title: "Test 2", uid: collection },
            ],
          })
        );


        test("Config has been restored to default", async () => {
          await getPluginService<IServiceAdmin>("admin").restoreConfig();
          const result = await getPluginService<IServiceAdmin>("admin").config();
          
          expect(result).toHaveProperty(["approvalFlow", 0], "api::blog-post.blog-post");
          expect(result).toHaveProperty(["entryLabel", "api::blog-post.blog-post", 0], "alternative_subject");
          expect(result).not.toHaveProperty("moderatorRoles");
        });

      });

    });

    describe("Find all", () => {

      beforeEach(() =>
        setupStrapi({ enabledCollections: [collection] }, true, {
          "plugins::comments": db,
          "api::collection": [
            relatedEntity,
            { id: 2, title: "Test 2", uid: collection },
          ],
        })
      );

      test("Should return all the comments in proper pagination format", async () => {
        const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation( (type: string) => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve(db[0]);
                      case "plugins::comments.report":
                        return resolve(reportEntity);
                      default:
                        return resolve(relatedEntity);
                    }
                  }),
                findMany: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve(db);
                      case "plugins::comments.report":
                        return resolve([reportEntity]);
                      default:
                        return resolve([relatedEntity]);
                    }
                  }),
                count: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve(db.length);
                      case "plugins::comments.report":
                        return resolve(1);
                      default:
                        return resolve(1);
                    }
                  })
              }));
              
          const { result, pagination } = await getPluginService<IServiceAdmin>("admin").findAll({});

          expect(result.length).toBe(db.length);
          expect(pagination).toHaveProperty(["page"], 1);
          expect(pagination).toHaveProperty(["pageCount"], 1);
          expect(pagination).toHaveProperty(["pageSize"], 10);
          expect(pagination).toHaveProperty(["total"], db.length);

          spy.mockRestore();
      });

    });

    describe("Find one and thread", () => {

      beforeEach(() =>
        setupStrapi({ enabledCollections: [collection] }, true, {
          "plugins::comments": db,
          "api::collection": [
            relatedEntity,
            { id: 2, title: "Test 2", uid: collection },
          ],
        })
      );

      test("Should return a thread with all the details", async () => {
        const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation( (type: string) => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve({
                          ...db[1],
                          threadOf: db[0]
                        });
                      case "plugins::comments.report":
                        return resolve(reportEntity);
                      default:
                        return resolve(relatedEntity);
                    }
                  }),
                findMany: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve([db[1], db[2], db[3]]);
                      case "plugins::comments.report":
                        return resolve([reportEntity]);
                      default:
                        return resolve([relatedEntity]);
                    }
                  }),
                findWithCount: async (_: any) =>
                  new Promise((resolve) => {
                    if (_.where.threadOf === 1) {
                      switch (type) {
                        case "plugins::comments.comment":
                          return resolve([[db[1], db[2], db[3]], 3] );
                        case "plugins::comments.report":
                          return resolve([[reportEntity], 1]);
                        default:
                          return resolve([[relatedEntity], 1]);
                      }
                    }
                    return resolve([[], 0]);
                  })
              }));
          const idToSelect = 2;
          const { entity, selected, level } = await getPluginService<IServiceAdmin>("admin").findOneAndThread(idToSelect, {});
          expect(entity).toHaveProperty(["uid"], relatedEntity.uid);
          expect(selected).toHaveProperty(["id"], idToSelect);
          expect(level.length).toBe(3);

          spy.mockRestore();
      });

    });

    describe("Blocking comments & threads", () => {

      beforeEach(() =>
        setupStrapi({ enabledCollections: [collection] }, true, {
          "plugins::comments": db,
          "api::collection": [
            relatedEntity,
            { id: 2, title: "Test 2", uid: collection },
          ],
        })
      );

      test("Should mark comment as blocked", async () => {
        const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation( (type: string) => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve(db[0]);
                      case "plugins::comments.report":
                        return resolve(reportEntity);
                      default:
                        return resolve(relatedEntity);
                    }
                  }),
                update: async (_: any) => 
                  new Promise((resolve) => {
                    return resolve({
                      ...db[0],
                      ..._.data,
                    });
                  })
              }));
          const result = await getPluginService<IServiceAdmin>("admin").blockComment(db[0].id);
          expect(result).toHaveProperty(["id"], db[0].id);
          expect(result).toHaveProperty(["blocked"],true);

          spy.mockRestore();
      });

      test("Should mark comment as unblocked", async () => {
        const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation( (type: string) => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve({
                          ...db[0],
                          blocked: true,
                        });
                      case "plugins::comments.report":
                        return resolve(reportEntity);
                      default:
                        return resolve(relatedEntity);
                    }
                  }),
                update: async (_: any) => 
                  new Promise((resolve) => {
                    return resolve({
                      ...db[0],
                      ..._.data,
                    });
                  })
              }));
          const result = await getPluginService<IServiceAdmin>("admin").blockComment(db[0].id);
          expect(result).toHaveProperty(["id"], db[0].id);
          expect(result).toHaveProperty(["blocked"], false);

          spy.mockRestore();
      });

      test("Should mark thread as blocked", async () => {
        const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation( (type: string) => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve(db[0]);
                      case "plugins::comments.report":
                        return resolve(reportEntity);
                      default:
                        return resolve(relatedEntity);
                    }
                  }),
                update: async (_: any) => 
                  new Promise((resolve) => {
                    return resolve({
                      ...db[0],
                      ..._.data,
                    });
                  })
              }));
          const result = await getPluginService<IServiceAdmin>("admin").blockCommentThread(db[0].id);
          expect(result).toHaveProperty(["id"], db[0].id);
          expect(result).toHaveProperty(["blocked"],true);
          expect(result).toHaveProperty(["blockedThread"],true);

          spy.mockRestore();
      });

      test("Should mark thread as unblocked", async () => {
        const spy = jest
              .spyOn(global.strapi.db, "query")
              // @ts-ignore
              .mockImplementation( (type: string) => ({
                findOne: async (_: any) =>
                  new Promise((resolve) => {
                    switch (type) {
                      case "plugins::comments.comment":
                        return resolve({
                          ...db[0],
                          blocked: true,
                          blockedThread: true,
                        });
                      case "plugins::comments.report":
                        return resolve(reportEntity);
                      default:
                        return resolve(relatedEntity);
                    }
                  }),
                update: async (_: any) => 
                  new Promise((resolve) => {
                    return resolve({
                      ...db[0],
                      ..._.data,
                    });
                  })
              }));
          const result = await getPluginService<IServiceAdmin>("admin").blockCommentThread(db[0].id);
          expect(result).toHaveProperty(["id"], db[0].id);
          expect(result).toHaveProperty(["blocked"], false);
          expect(result).toHaveProperty(["blockedThread"], false);

          spy.mockRestore();
      });

    });


    describe("Approval flow", () => {

      beforeEach(() =>
        setupStrapi({ enabledCollections: [collection] }, true, {
          "plugins::comments": db,
          "api::collection": [
            relatedEntity,
            { id: 2, title: "Test 2", uid: collection },
          ],
        })
      );

      test("Should approve comment", async () => {
        const spy = jest
          .spyOn(global.strapi.db, "query")
          // @ts-ignore
          .mockImplementation( (type: string) => ({
            findOne: async (_: any) =>
              new Promise((resolve) => {
                switch (type) {
                  case "plugins::comments.comment":
                    return resolve(db[0]);
                  case "plugins::comments.report":
                    return resolve(reportEntity);
                  default:
                    return resolve(relatedEntity);
                }
              }),
            update: async (_: any) => 
              new Promise((resolve) => {
                return resolve({
                  ...db[0],
                  ..._.data,
                });
              })
          }));

          const result = await getPluginService<IServiceAdmin>("admin").approveComment(db[0].id);
          expect(result).toHaveProperty(["id"], db[0].id);
          expect(result).toHaveProperty(["approvalStatus"], APPROVAL_STATUS.APPROVED);

          spy.mockRestore();
      });

      test("Should reject comment", async () => {
        const spy = jest
          .spyOn(global.strapi.db, "query")
          // @ts-ignore
          .mockImplementation( (type: string) => ({
            findOne: async (_: any) =>
              new Promise((resolve) => {
                switch (type) {
                  case "plugins::comments.comment":
                    return resolve(db[0]);
                  case "plugins::comments.report":
                    return resolve(reportEntity);
                  default:
                    return resolve(relatedEntity);
                }
              }),
            update: async (_: any) => 
              new Promise((resolve) => {
                return resolve({
                  ...db[0],
                  ..._.data,
                });
              })
          }));
        const result = await getPluginService<IServiceAdmin>("admin").rejectComment(db[0].id);
        expect(result).toHaveProperty(["id"], db[0].id);
        expect(result).toHaveProperty(["approvalStatus"], APPROVAL_STATUS.REJECTED);

        spy.mockRestore();
      });
    });

    describe("Reports resolution", () => {

      beforeEach(() =>
        setupStrapi({ enabledCollections: [collection] }, true, {
          "plugins::comments": db,
          "plugins::comments-reports": [reportEntity],
          "api::collection": [
            relatedEntity,
            { id: 2, title: "Test 2", uid: collection },
          ],
        })
      );

      test("Should resolve comment", async () => {
        const spy = jest
          .spyOn(global.strapi.db, "query")
          // @ts-ignore
          .mockImplementation( (type: string) => ({
            findOne: async (_: any) =>
              new Promise((resolve) => {
                switch (type) {
                  case "plugins::comments.comment":
                    return resolve(db[0]);
                  case "plugins::comments.report":
                    return resolve(reportEntity);
                  default:
                    return resolve(relatedEntity);
                }
              }),
            update: async (_: any) => 
              new Promise((resolve) => {
                return resolve({
                  ...reportEntity,
                  ..._.data,
                });
              })
          }));

          const result = await getPluginService<IServiceAdmin>("admin").resolveAbuseReport(reportEntity.id, db[0].id);
          expect(result).toHaveProperty(["id"], reportEntity.id);
          expect(result).toHaveProperty(["resolved"], true);
          expect(result).toHaveProperty(["reason"], 'OTHER');

          spy.mockRestore();
      });

      test("Should resolve multiple reports", async () => {
        const spy = jest
          .spyOn(global.strapi.db, "query")
          // @ts-ignore
          .mockImplementation( (type: string) => ({
            findOne: async (_: any) =>
              new Promise((resolve) => {
                switch (type) {
                  case "plugins::comments.comment":
                    return resolve(db[0]);
                  case "plugins::comments.report":
                    return resolve(reportEntity);
                  default:
                    return resolve(relatedEntity);
                }
              }),
            findMany: async (_: any) =>
              new Promise((resolve) => {
                switch (type) {
                  case "plugins::comments.comment":
                    return resolve([db[0]]);
                  case "plugins::comments.report":
                    return resolve([reportEntity]);
                  default:
                    return resolve([relatedEntity]);
                }
              }),
            updateMany: async (_: any) => 
              new Promise((resolve) => {
                return resolve([{
                  ...reportEntity,
                  ..._.data,
                }]);
              })
          }));
        const result = await getPluginService<IServiceAdmin>("admin").resolveMultipleAbuseReports([reportEntity.id], db[0].id);
        expect(result).toHaveProperty([0, "id"], reportEntity.id);
        expect(result).toHaveProperty([0, "resolved"], true);
        expect(result).toHaveProperty([0, "reason"], 'OTHER');

        spy.mockRestore();
      });
    });
  });
});
