import { setupStrapi, resetStrapi } from "../../../__mocks__/initSetup";
import { getPluginService } from "../functions";

beforeEach(setupStrapi);
afterEach(resetStrapi);

describe("Test plugin functions utils", () => {
  describe("Get plugin service", () => {
    test("Should get common service", () => {
      expect(getPluginService("common")).toHaveProperty("findAllFlat");
    });
  });
});
