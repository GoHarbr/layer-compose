// @flow
import { layerCompose, o } from "../../src";

describe("Combining layers together", () => {
  /*
   * A defining feature of "layerCompose" is that there is no traditional overriding.
   *
   * In a traditional JS class, if a child implements a function present on the parent,
   *  the child must explicitly call `super` for the parent's implementation to execute
   *
   * Not so with "layerCompose"...
   * */

  test("all functions of the same name are called (when accessed externally)", (done) => {
    const testFn = jest.fn();

    const Layer1 = {
      fn($, _) {
        testFn("Layer1");
      },
      top($, _) {
        /* debugging marker */
      },
    };

    const Layer2 = {
      fn($, _) {
        testFn("Layer2");
      },
    };

    const Composition = layerCompose(Layer1, Layer2);

    Composition({}, async (instance) => {
      await instance.fn();
      expect(testFn).toHaveBeenNthCalledWith(1, "Layer2");
      expect(testFn).toHaveBeenNthCalledWith(2, "Layer1");

      done();
    });
  });

  /*
   *
   * What is the rationale?
   *
   * We are trying to avoid some pitfalls of the "Fragile base class" problem -- https://en.wikipedia.org/wiki/Fragile_base_class
   *
   * When writing a base class, the author cannot predict how this base class will be used/overriden by the children.
   * Part of the implementation crucial the functioning of the base class could be overriden by the child, and
   *  never executed during runtime; this leads to bugs.
   *
   * To avoid this problem within "layerCompose" a higher Layer does not override functions from a lower Layer:
   *  **all defined functions are executed.**
   * */

  test.todo("functions under the same name is called in bottom-up order");

  /*
   * Debugging
   * */

  test("all functions of the same name are called (using o.$ notation)", (done) => {
    const testFn = jest.fn();

    const Layer1 = o.$({
      fn(
        $ /*: { [key : 'fn'|'then'] : (o: ?any) => void } */,
        _ /*: {-[string]: any } */,
        o /*: ?any */
      ) {
        testFn("Layer1");
      },
    });

    const Layer2 = layerCompose(
      Layer1,

      o.$({
        fn(
          $ /*: { [key : 'fn'|'then'] : (o: ?any) => void } */,
          _ /*: {-[string]: any } */,
          o /*: ?any */
        ) {
          testFn("Layer2");
        },
      })
    );

    const Composition = layerCompose(Layer2, Layer1);

    Composition({}, async (instance) => {
      await instance.fn();
      expect(testFn).toHaveBeenNthCalledWith(2, "Layer1");
      expect(testFn).toHaveBeenNthCalledWith(1, "Layer2");

      done();
    });
  });
});
