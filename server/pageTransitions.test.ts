import { describe, expect, it } from "vitest";
import {
  transitions,
  flipTransition,
  slideTransition,
  fadeTransition,
  curlTransition,
  zoomTransition,
  cardsTransition,
  cubeTransition,
  swingTransition,
  getTransitionById,
  getMotionVariants,
  defaultTransition,
} from "../client/src/lib/pageTransitions";

describe("pageTransitions", () => {
  it("should have exactly 8 transitions", () => {
    expect(transitions).toHaveLength(8);
  });

  it("should include all transition types", () => {
    const ids = transitions.map((t) => t.id);
    expect(ids).toContain("flip");
    expect(ids).toContain("slide");
    expect(ids).toContain("fade");
    expect(ids).toContain("curl");
    expect(ids).toContain("zoom");
    expect(ids).toContain("cards");
    expect(ids).toContain("cube");
    expect(ids).toContain("swing");
  });
});

describe("flipTransition", () => {
  it("should have correct id and name", () => {
    expect(flipTransition.id).toBe("flip");
    expect(flipTransition.name).toBe("Virar Página");
  });

  it("should have valid duration", () => {
    expect(flipTransition.duration).toBeGreaterThan(0);
    expect(flipTransition.duration).toBeLessThanOrEqual(1);
  });

  it("should have variants functions", () => {
    expect(typeof flipTransition.variants.enter).toBe("function");
    expect(typeof flipTransition.variants.exit).toBe("function");
    expect(flipTransition.variants.center).toBeDefined();
  });

  it("should generate different enter variants based on direction", () => {
    const enterForward = flipTransition.variants.enter(1);
    const enterBackward = flipTransition.variants.enter(-1);
    expect(enterForward).not.toEqual(enterBackward);
  });
});

describe("slideTransition", () => {
  it("should have correct id and name", () => {
    expect(slideTransition.id).toBe("slide");
    expect(slideTransition.name).toBe("Deslizar");
  });

  it("should have x translation in variants", () => {
    const enterForward = slideTransition.variants.enter(1);
    expect(enterForward).toHaveProperty("x");
  });
});

describe("fadeTransition", () => {
  it("should have correct id and name", () => {
    expect(fadeTransition.id).toBe("fade");
    expect(fadeTransition.name).toBe("Dissolução");
  });

  it("should have opacity in variants", () => {
    const enter = fadeTransition.variants.enter(1);
    expect(enter).toHaveProperty("opacity");
    expect((enter as any).opacity).toBe(0);
  });
});

describe("curlTransition", () => {
  it("should have correct id and name", () => {
    expect(curlTransition.id).toBe("curl");
    expect(curlTransition.name).toBe("Enrolar");
  });

  it("should have 3D rotation properties", () => {
    const enter = curlTransition.variants.enter(1);
    expect(enter).toHaveProperty("rotateY");
    expect(enter).toHaveProperty("rotateX");
  });
});

describe("zoomTransition", () => {
  it("should have correct id and name", () => {
    expect(zoomTransition.id).toBe("zoom");
    expect(zoomTransition.name).toBe("Zoom");
  });

  it("should have scale and blur in variants", () => {
    const enter = zoomTransition.variants.enter(1);
    expect(enter).toHaveProperty("scale");
    expect(enter).toHaveProperty("filter");
  });
});

describe("cardsTransition", () => {
  it("should have correct id and name", () => {
    expect(cardsTransition.id).toBe("cards");
    expect(cardsTransition.name).toBe("Cartas");
  });

  it("should have rotation in variants", () => {
    const enter = cardsTransition.variants.enter(1);
    expect(enter).toHaveProperty("rotate");
  });
});

describe("cubeTransition", () => {
  it("should have correct id and name", () => {
    expect(cubeTransition.id).toBe("cube");
    expect(cubeTransition.name).toBe("Cubo 3D");
  });

  it("should have z-axis property for 3D effect", () => {
    const enter = cubeTransition.variants.enter(1);
    expect(enter).toHaveProperty("z");
  });
});

describe("swingTransition", () => {
  it("should have correct id and name", () => {
    expect(swingTransition.id).toBe("swing");
    expect(swingTransition.name).toBe("Porta");
  });

  it("should have transformOrigin for door effect", () => {
    const enter = swingTransition.variants.enter(1);
    expect(enter).toHaveProperty("transformOrigin");
  });
});

describe("getTransitionById", () => {
  it("should return correct transition for valid id", () => {
    expect(getTransitionById("flip")).toBe(flipTransition);
    expect(getTransitionById("slide")).toBe(slideTransition);
    expect(getTransitionById("fade")).toBe(fadeTransition);
    expect(getTransitionById("curl")).toBe(curlTransition);
    expect(getTransitionById("zoom")).toBe(zoomTransition);
    expect(getTransitionById("cards")).toBe(cardsTransition);
    expect(getTransitionById("cube")).toBe(cubeTransition);
    expect(getTransitionById("swing")).toBe(swingTransition);
  });

  it("should return flip transition as default for invalid id", () => {
    expect(getTransitionById("invalid" as any)).toBe(flipTransition);
    expect(getTransitionById("" as any)).toBe(flipTransition);
  });
});

describe("getMotionVariants", () => {
  it("should generate motion variants object", () => {
    const variants = getMotionVariants(flipTransition, 1);
    
    expect(variants).toHaveProperty("initial");
    expect(variants).toHaveProperty("animate");
    expect(variants).toHaveProperty("exit");
    expect(variants).toHaveProperty("transition");
  });

  it("should include duration from transition config", () => {
    const variants = getMotionVariants(slideTransition, 1);
    expect(variants.transition.duration).toBe(slideTransition.duration);
  });

  it("should include ease curve", () => {
    const variants = getMotionVariants(fadeTransition, 1);
    expect(variants.transition.ease).toBeDefined();
    expect(Array.isArray(variants.transition.ease)).toBe(true);
  });
});

describe("defaultTransition", () => {
  it("should be flip", () => {
    expect(defaultTransition).toBe("flip");
  });
});

describe("all transitions have required properties", () => {
  transitions.forEach((transition) => {
    describe(transition.name, () => {
      it("should have an id", () => {
        expect(transition.id).toBeDefined();
        expect(typeof transition.id).toBe("string");
      });

      it("should have a name", () => {
        expect(transition.name).toBeDefined();
        expect(typeof transition.name).toBe("string");
      });

      it("should have a description", () => {
        expect(transition.description).toBeDefined();
        expect(typeof transition.description).toBe("string");
      });

      it("should have an icon", () => {
        expect(transition.icon).toBeDefined();
        expect(typeof transition.icon).toBe("string");
      });

      it("should have a positive duration", () => {
        expect(transition.duration).toBeGreaterThan(0);
      });

      it("should have variants with enter, center, and exit", () => {
        expect(transition.variants).toBeDefined();
        expect(typeof transition.variants.enter).toBe("function");
        expect(transition.variants.center).toBeDefined();
        expect(typeof transition.variants.exit).toBe("function");
      });
    });
  });
});
