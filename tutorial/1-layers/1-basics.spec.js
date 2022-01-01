// @flow
import { $, layerCompose } from "../../src";

describe("The basics of Layers", () => {
  /*
   * Layers are Plain Old Javascript Objects (POJO) that contain function definitions
   * Layers are combined into Compositions
   * Compositions are very similar to regular JS class definitions
   * */

  /*
   * Note:
   * The examples that follow do not manage state
   * LayerCompose is meant to be used to manage state
   * More realistic use cases follow in this Tutorial series
   * */

  test(
    "Creating a single layer composition",
    (done) => {
      const log = jest.fn((...args) => console.log(...args));

      /**
       * Here we define a single layer, and create a Composition
       * */

      const C = $({
        // you might be wondering what $,_ are -- more on that later
        print(
          $ /*: { [key : 'print'|'then'] : (o: ?any) => void } */,
          _ /*: { message : string , -[string]: any } */,
          o /*: ?any */
        ) {
          // ah, the classic
          log(_.message);
        },
      });

      /*
       * Then we create an instance and call our method
       * */

      C({ message: "Bye, bye" }, async (instance) => {
        instance.print(); // prints Bye, bye, world
        await instance;

        expect(log).toHaveBeenCalledTimes(1);
        expect(log).toHaveBeenCalledWith("Bye, bye");

        done();
      });
    },
    60000 * 10
  );

  test("Multi-layer composition contains functions from all 3 layers", () => {
    const log = jest.fn((...args) => console.log(...args));

    /**
     * Here we define 3 layers, each could live in a separate file
     * */

    const layer1 = {
      print1($, _) {
        log("L1");
      },
    };

    const layer2 = {
      print2($, _) {
        log("L2");
      },
    };

    const layer3 = {
      print3($, _) {
        log("L3");
      },
    };

    /*
     * Compiling all 3 Layers into a Composition
     * */

    const C = layerCompose(layer1, layer2, layer3);

    /*
     * Then we create an instance and call our methods
     * */

    const instance = C();
    instance.print1();
    instance.print2();
    instance.print3();

    expect(log).toHaveBeenCalledTimes(3);
  });

  test("Multi-layer composition with initializer", (done) => {
    const log = jest.fn((...args) => console.log(...args));

    /**
     * Here we define 3 layers, each could live in a separate file
     * */

    const topLayer = {
      print($, _) {
        log(_.key + "-top");
      },
    };

    const baseLayer = {
      print($, _) {
        log(_.key + "-base");
      },
    };

    /*
     * Compiling all 3 Layers into a Composition
     * */

    const C = $(
      // initializerLayer
      {
        _(
          $ /*: { [key : '_'|'print'|'then'] : (o: ?any) => void } */,
          _ /*: {-[string]: any } */,
          o /*: ?any */
        ) {
          _.key = "KEY";
          $.print();
        },
        print(
          $ /*: { [key : '_'|'print'|'then'] : (o: ?any) => void } */,
          _ /*: { key : string , -[string]: any } */,
          o /*: ?any */
        ) {
          log(_.key + "-initializer");
        },
      }
    )
      .$(topLayer)
      .$(baseLayer);

    /*
     * Then we create an instance
     * and notice that we rely on the initilizer to make the calls
     * */

    C({}, (instanceOfC) => {
      instanceOfC.then(() => {
        expect(log).toHaveBeenCalledTimes(3);
        expect(log).toHaveBeenNthCalledWith(1, "KEY-base");
        expect(log).toHaveBeenNthCalledWith(2, "KEY-top");

        done();
      });
    });
  });
});
