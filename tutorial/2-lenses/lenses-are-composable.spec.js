// @flow
import {
  layerCompose,
  o,
  defaults,
  IS_DEV_MODE,
  memo,
  assign,
  coreLens,
  replace,
} from "../../src";

describe("Lenses are composable", () => {
  test("A lens definition across 2 compositions is composed", (done) => {
    const testFn = jest.fn();

    const l1 = {
      top($, _) {},
      Lens: {
        common($, _) {
          testFn("top");
        },
      },
    };

    const l2 = {
      bottom($, _) {},
      Lens: {
        common($, _) {
          testFn("bottom");
        },
      },
    };

    const C = layerCompose(l1, l2);

    C({}, (c) => {
      c.Lens((l) => {
        l.common();

        l.then(() => {
          expect(testFn).toHaveBeenNthCalledWith(1, "bottom");
          expect(testFn).toHaveBeenNthCalledWith(2, "top");

          done();
        });
      });
    });
  });
});
