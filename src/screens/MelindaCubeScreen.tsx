import {Canvas, useLoader} from "@react-three/fiber";
import {
  forwardRef,
  Ref,
  useEffect, useMemo,
  useRef,
  useState
} from "react";
import {
  BufferAttribute,
  DoubleSide, Euler,
  Matrix4,
  Mesh,
  Vector3
} from "three";
import {Edges, Outlines, TrackballControls} from '@react-three/drei'
import "./MelindaCubeScreen.css"
import {button, folder, Leva, useControls} from "leva";
import {cubieVertices, STICKERS, stickerTypes} from "./melindaCube";

interface CubieProps {
  id: number;
  position: Vector3;
  rotation: Euler
  highlighted: boolean;
  colors: { r: number, g: number, b: number }[];
}

const Cubie = forwardRef(({
                            position,
                            rotation,
                            id,
                            highlighted,
                            colors
                          }: CubieProps, ref: Ref<Mesh>) => {
  const colorRef = useRef<BufferAttribute>(null!);

  useEffect(() => {
    colorRef.current.array = new Float32Array(stickerTypes.flatMap(type => {
      const colorId = STICKERS[id][type];
      if (colorId === 0) return [0, 0, 0, 0, 0, 0, 0, 0, 0]
      const rgb = Object.values(colors[colorId - 1]).map(v => v / 255);
      return [...rgb, ...rgb, ...rgb];
    }))
    colorRef.current.needsUpdate = true;
  }, [colors])


  return (
    <mesh
      ref={ref}
      position={position}
      scale={0.95}
      rotation={rotation}
    >
      <bufferGeometry attach="geometry">
        <bufferAttribute attach="attributes-position" array={cubieVertices} itemSize={3} count={36}/>
        <bufferAttribute ref={colorRef} attach="attributes-color" array={new Float32Array(36)} itemSize={3} count={36} />
      </bufferGeometry>
      <meshStandardMaterial attach="material"  vertexColors side={DoubleSide}/>
      <Edges color={highlighted ? "gray" : "black"}/>
    </mesh>
  );
})

interface SlabControllerProps {
  position: Vector3;
  scale: Vector3;
  onHover: () => void;
  onExit: () => void;
  onClick: () => void;
  onContextMenu: () => void;
}

const SlabController = forwardRef(({
                                     position,
                                     scale,
                                     onHover: handleHover,
                                     onExit: handleExit,
                                     onClick: handleClick,
                                     onContextMenu: handleContextMenu
                                   }: SlabControllerProps, ref: Ref<Mesh>) => {

  return (
    <mesh
      ref={ref}
      position={position}
      scale={scale}
      onPointerOver={(event) => {
        event.stopPropagation();
        handleHover()
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        handleExit()
      }}
      onClick={(event) => {
        event.stopPropagation();
        handleClick();
      }}
      onContextMenu={(event) => {
        event.stopPropagation();
        handleContextMenu();
      }}
    >
      <boxGeometry/>
      <meshStandardMaterial transparent opacity={0}/>
    </mesh>
  )
})

const cubieId = (x: number, y: number, z: number) => {
  return x + 4 * y + 8 * z;
}

const FPS = 60;

type CellOrientation = "L" | "R" | null;
type SlabOrientation = "F" | "B" | "U" | "D" | "I" | "O" | null;

const MelindaCubeScreen = () => {
  const cubieRef = useRef<Array<Mesh | null>>([])
  const controllerRef = useRef<Array<Mesh | null>>([])
  const [state, setState] = useState<number[]>([])
  const [selected, setSelected] = useState<boolean[]>([])
  const [position, setPosition] = useState<Vector3[]>([])
  const [rotation, setRotation] = useState<Euler[]>([])
  const [controllerPosition, setControllerPosition] = useState<Vector3[]>([])
  const [isShiftDown, setShiftDown] = useState(false);
  const [isSpaceDown, setSpaceDown] = useState(false);
  const [hoveredSlab, setHoveredSlab] = useState<SlabOrientation>(null);
  const [hoveredCell, setHoveredCell] = useState<CellOrientation>(null);
  const [isSeparate, setIsSeparate] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState(false);

  const scramble = () => {
    for (let i = 0; i < 100; i++) {
      if (i % 5 === 0) {
        setTimeout(() => {
          restackLong(true);
        }, 100 * i)
      } else if (i % 5 === 1) {
        setTimeout(() => {
          restackShort(true);
        }, 100 * i)
      } else {
        setTimeout(() => {
          const randL = Math.floor(Math.random() * 3);
          const randR = Math.floor(Math.random() * 3);
          cellTwist(new Vector3(randL === 0 ? 1 : 0, randL === 1 ? 1 : 0, randL === 2 ? 1 : 0), "L", true);
          cellTwist(new Vector3(randR === 0 ? 1 : 0, randR === 1 ? 1 : 0, randR === 2 ? 1 : 0), "R", true);
        }, 100 * i)
      }
    }
  }

  useEffect(() => {
    const xyz: [number, number, number][] = [];
    Array.from(Array(4).keys()).map(x => {
      return Array.from(Array(2).keys()).map(y => {
        return Array.from(Array(2).keys()).map(z => xyz.push([x, y, z])
        )
      })
    })
    const initPos = new Array<Vector3>(16);
    const initRot = new Array<Euler>(16);
    setState(xyz.map(([x, y, z]) => cubieId(x, y, z)));
    xyz.forEach(([x, y, z]) => initPos[cubieId(x, y, z)] = new Vector3((x - 2) * 2 + 1, (y - 1) * 2 + 1, (z - 1) * 2 + 1));
    xyz.forEach(([x, y, z]) => initRot[cubieId(x, y, z)] = new Euler(((x+y+z)%2)*Math.PI/2, 0, 0));
    setPosition(initPos)
    setRotation(initRot)
    console.log(xyz.map(([x, y, z]) => cubieId(x, y, z)))
    setSelected(new Array(16).fill(false));

    setControllerPosition((["L", "R"] as Exclude<CellOrientation, null>[]).flatMap((cell, i) => {
      return (["F", "B", "U", "D", "I", "O"] as Exclude<SlabOrientation, null>[]).map((slab, j) => (
        new Vector3(
          (cell === "L" ? -1 : 1) * (slab === "I" ? 0.15 : slab === "O" ? 3.9 : 2),
          (slab === "U" ? 1.9 : slab === "D" ? -1.9 : 0),
          (slab === "F" ? 1.9 : slab === "B" ? -1.9 : 0),
        )))
    }))

    cubieRef.current = cubieRef.current.slice(0, 16);
    controllerRef.current = controllerRef.current.slice(0, 12);
  }, []);

  let colors = useMemo(() => {
    console.log("AAA")
    return {
      color1: {value: {r: 255, b: 255, g: 255}, label: "Color 1"},
      color2: {value: {r: 255, b: 0, g: 255}, label: "Color 2"},
      color3: {value: {r: 255, b: 0, g: 0}, label: "Color 3"},
      color4: {value: {r: 255, b: 0, g: 125}, label: "Color 4"},
      color5: {value: {r: 0, b: 255, g: 0}, label: "Color 5"},
      color6: {value: {r: 0, b: 0, g: 255}, label: "Color 6"},
      color7: {value: {r: 100, b: 200, g: 0}, label: "Color 7"},
      color8: {value: {r: 255, b: 255, g: 0}, label: "Color 8"},
    }
  }, [])

  let {DURATION, color1, color2, color3, color4, color5, color6, color7, color8} = useControls({
    DURATION: {value: 250, min: 50, max: 2000, label: "Speed (ms)"},
    Scramble: button(() => scramble()),
    Colors: folder(colors, {})
  });


  const handleHover = () => {
    if (!isShiftDown) {
      if (hoveredCell === "L") {
        setSelected(prevState => prevState.map((_, i) => isLeft(state, i)))
      } else {
        setSelected(prevState => prevState.map((_, i) => !isLeft(state, i)))
      }
    } else {
      switch (hoveredSlab) {
        case "F":
          setSelected(prevState => prevState.map((_, i) => isFront(state, i)));
          break;
        case "B":
          setSelected(prevState => prevState.map((_, i) => !isFront(state, i)));
          break;
        case "U":
          setSelected(prevState => prevState.map((_, i) => isUp(state, i)));
          break;
        case "D":
          setSelected(prevState => prevState.map((_, i) => !isUp(state, i)));
          break;
        case "I":
          setSelected(prevState => prevState.map((_, i) => isIn(state, i)));
          break;
        case "O":
          setSelected(prevState => prevState.map((_, i) => !isIn(state, i)));
          break;
        default:
          return;
      }
    }
  }

  useEffect(() => {
    if (hoveredCell == null) {
      setSelected(new Array(16).fill(false));
      return;
    }
    handleHover();
  }, [isShiftDown, hoveredSlab, hoveredCell]);

  const getLeft = (state: number[]) => {
    return state.slice(0, 8);
  }
  const getRight = (state: number[]) => {
    return state.slice(8);
  }
  const getFront = (state: number[]) => {
    return state.filter((_, i) => i % 2 === 1);
  }
  const getBack = (state: number[]) => {
    return state.filter((_, i) => i % 2 === 0);
  }
  const getUp = (state: number[]) => {
    return state.filter((_, i) => Math.floor((i % 4) / 2) === 1);
  }
  const getDown = (state: number[]) => {
    return state.filter((_, i) => Math.floor((i % 4) / 2) === 0);
  }
  const getIn = (state: number[]) => {
    return state.filter((_, i) => 3 < i && i < 12);
  }
  const getOut = (state: number[]) => {
    return state.filter((_, i) => !(3 < i && i < 12));
  }

  const isLeft = (state: number[], id: number) => {
    return getLeft(state).includes(id);
  }
  const isFront = (state: number[], id: number) => {
    return getFront(state).includes(id);
  }
  const isUp = (state: number[], id: number) => {
    return getUp(state).includes(id);
  }
  const isIn = (state: number[], id: number) => {
    return getIn(state).includes(id);
  }

  useEffect(() => {
    if(isMoving) return;

    if (isSpaceDown === isSeparate) return;
    setIsSeparate(isSpaceDown);

    const STEPS = Math.floor(DURATION / 2 / 1000 * FPS);

    const leftCubies = getLeft(state);
    const rightCubies = getRight(state);

    const leftMatrix = new Matrix4();
    const rightMatrix = new Matrix4();
    leftMatrix.makeTranslation(-2 / STEPS * (isSpaceDown ? 1 : -1), 0, 0);
    rightMatrix.makeTranslation(2 / STEPS * (isSpaceDown ? 1 : -1), 0, 0);
    let frame = 0;


    setIsMoving(true);
    const animation = setInterval(() => {
      controllerRef.current.forEach((controller, i) => {
        if (i < 6) {
          controller?.applyMatrix4(leftMatrix)
        } else {
          controller?.applyMatrix4(rightMatrix)
        }
      })

      leftCubies.forEach(cubieId => {
        const cubie = cubieRef.current[cubieId];
        cubie?.applyMatrix4(leftMatrix)
      })
      rightCubies.forEach(cubieId => {
        const cubie = cubieRef.current[cubieId];
        cubie?.applyMatrix4(rightMatrix)
      })

      if (++frame === STEPS) {
        clearInterval(animation);
        setIsMoving(false);
      }

    }, DURATION / 2 / STEPS);


  }, [isSpaceDown, isSeparate, state, isMoving]);

  const cellTwist = (axis: Vector3, cell: CellOrientation, isScrable: boolean = false) => {
    let duration = DURATION;
    if (isScrable) duration = 50;
    setState(state => {
      const isLeftCell = cell === "L"
      const ids = isLeftCell ? getLeft(state) : getRight(state);
      const mult = isLeftCell ? 1 : -1;
      const STEPS = Math.floor(duration / 1000 * FPS);
      const angle = Math.PI / 2 / STEPS;

      ids.forEach(id => {
        const delta = isSeparate ? 2 : 0
        const cubie = cubieRef.current[id];
        if (!cubie) return;

        let offset = 0;
        let count = 0;

        const interval = setInterval(() => {
          const matrix = new Matrix4();

          matrix.makeTranslation((2 + offset + delta) * mult, 0, 0);
          cubie.position.applyMatrix4(matrix); // center

          matrix.makeRotationAxis(axis, angle);
          cubie.rotateOnWorldAxis(axis, angle);
          cubie.position.applyMatrix4(matrix); // rotate

          offset = (-Math.abs(count - STEPS / 2) + STEPS / 2) * 3 / STEPS;

          matrix.makeTranslation(-(2 + offset + delta) * mult, 0, 0);
          cubie.position.applyMatrix4(matrix); // back to original position
          if (++count === STEPS) {
            matrix.makeTranslation(offset * mult, 0, 0);
            cubie.position.applyMatrix4(matrix);
            setState([...state])
            setIsMoving(false)
            clearInterval(interval);
          }

        }, duration / STEPS)
      });

      let first: (i: number) => number, second: (i: number) => number;
      const ordering = axis.dot(new Vector3(1, -1, 1)) > 0 ? [1, 3, 0, 2] : [2, 0, 3, 1];
      const delta = isLeftCell ? 0 : 8;
      if (Math.round(axis.x) !== 0) {
        first = (i: number) => i;
        second = (i: number) => i + 4;
      } else if (Math.round(axis.y) !== 0) {
        first = (i: number) => Math.floor(i / 2) * 4 + i % 2;
        second = (i: number) => Math.floor(i / 2) * 4 + i % 2 + 2
      } else if (Math.round(axis.z) !== 0) {
        first = (i: number) => i * 2
        second = (i: number) => i * 2 + 1
      } else {
        return state;
      }

      return updateCellState(state, ids, first, second, ordering, delta);
    })
  }

  const updateCellState = (
    state: number[],
    ids: number[],
    first: (i: number) => number,
    second: (i: number) => number,
    ordering: number[],
    delta: number,
    inout: "I" | "O" | null = null,
  ) => {
    const clustered = Array.from(Array(4).keys()).map(i => [ids[first(i)], ids[second(i)]])
    const rotated = ordering.map(i => clustered[i]);
    rotated.forEach(([a, b], i) => {
      if (inout) {
        const l = inout === "O" ? 0 : 4
        const r = inout === "O" ? 8 : 4
        state[(delta + l + first(i)) % 16] = a;
        state[(delta + r + second(i)) % 16] = b;
      } else {
        state[delta + first(i)] = a;
        state[delta + second(i)] = b;
      }
    })
    return state;
  }

  const slabTwist = (axis: Vector3, slabOrient: SlabOrientation, isScramble: boolean = false) => {
    const STEPS = Math.floor(DURATION / 1000 * FPS);
    let duration = DURATION;
    if (isScramble) duration = 50
    setState(state => {
      let angle = Math.PI / STEPS;
      let slab;
      switch (slabOrient) {
        case "F":
          slab = getFront(state);
          break;
        case "B":
          slab = getBack(state);
          break
        case "U":
          slab = getUp(state);
          break;
        case "D":
          slab = getDown(state);
          break;
        case "I":
          slab = getIn(state);
          break;
        case "O":
          slab = getOut(state);
          break;
        default:
          return state;
      }

      if (slabOrient === "I" || slabOrient === "O") {
        angle /= 2;
      }

      slab.forEach(id => {
        const cubie = cubieRef.current[id];
        if (!cubie) return;
        let count = 0;
        const animation  = setInterval(() => {
          const matrix = new Matrix4();
          matrix.makeRotationAxis(axis, angle);
          cubie.rotateOnWorldAxis(axis, angle);
          cubie.position.applyMatrix4(matrix)
          if (++count === STEPS) {
            setIsMoving(false);
            clearInterval(animation)
          }
        }, duration / STEPS)

      });

      let isInSlab;
      switch (slabOrient) {
        case "F":
          isInSlab = (id: number) => isFront(state, id);
          break;
        case "B":
          isInSlab = (id: number) => !isFront(state, id);
          break;
        case "U":
          isInSlab = (id: number) => isUp(state, id);
          break;
        case "D":
          isInSlab = (id: number) => !isUp(state, id);
          break;
        case "I":
          isInSlab = (id: number) => isIn(state, id);
          break;
        case "O":
          isInSlab = (id: number) => !isIn(state, id);
          break;
      }

      if (slabOrient === "I" || slabOrient === "O") {
        return updateCellState(
          state,
          slabOrient === "I" ? getIn(state) : getOut(state),
          (i: number) => i,
          (i: number) => i + 4,
          axis.dot(new Vector3(1, -1, 1)) > 0 ? [1, 3, 0, 2] : [2, 0, 3, 1],
          0,
          slabOrient,
        );
      } else {
        const start = slab.filter((_, i) => i % 2 === 0).reverse();
        const end = slab.filter((_, i) => i % 2 === 1).reverse();
        const rotated = Array.from({
            length: 4,
          },
          (_, i) => [end, start].map(r => r[i])
        ).flat()
        let curr = 0;
        for (let i = 0; i < 16; i++) {
          if (isInSlab(state[i])) {
            state[i] = rotated[curr++];
          }
        }
      }

      return [...state];
    })
  }

  const handleRotation = (axis: Vector3) => {
    if (hoveredCell == null || isMoving) return;
    setIsMoving(true);
    if (!isShiftDown) {
      cellTwist(axis, hoveredCell);
    } else {
      slabTwist(axis, hoveredSlab)
    }
  }

  window.onkeydown = (e) => {
    setShiftDown(e.shiftKey);
    if (e.key === " ") {
      setSpaceDown(true)
    }
  }
  window.onkeyup = (e) => {
    setShiftDown(e.shiftKey);
    if (e.key === " ") {
      setSpaceDown(false)
    }
  }

  const setHovered = (cell: CellOrientation, slab: SlabOrientation) => {
    setHoveredCell(cell);
    setHoveredSlab(slab);
  }

  const restackLong = (isScramble: boolean = false) => {
    const STEPS = Math.floor(DURATION / 1000 * FPS);
    let duration = DURATION;
    if (isScramble) duration = 50;
    setState(state => {
      const layer = state.slice(0, 4);
      const block = state.slice(4);

      const moves = [
        {cubies: layer, distance: 6},
        {cubies: block, distance: -2}
      ];

      moves.forEach(({cubies, distance}) => {
        cubies.forEach(id => {
          const cubie = cubieRef.current[id];
          if (!cubie) return;
          const t = new Matrix4();
          cubie.position.applyMatrix4(t);
          let count = 0;
          const offset = distance / STEPS;

          const interval = setInterval(() => {
            const matrix = new Matrix4();

            matrix.makeTranslation(offset, 0, 0);
            cubie.position.applyMatrix4(matrix); // center

            if (++count === STEPS) {
              clearInterval(interval);
            }

          }, duration / STEPS)
        });
      })
      return [...block, ...layer];
    })
  }

  const restackShort = (isScramble: boolean = false) => {
    const STEPS = Math.floor(DURATION / 1000 * FPS);
    let duration = DURATION;
    if (isScramble) duration = 50;

    setState(state => {
      const front = getFront(state);
      const back = getBack(state);

      const moves = [
        {cubies: front, distance: -2},
        {cubies: back, distance: 2}
      ];

      moves.forEach(({cubies, distance}) => {
        cubies.forEach(id => {
          const cubie = cubieRef.current[id];
          if (!cubie) return;
          const t = new Matrix4();
          cubie.position.applyMatrix4(t);
          let count = 0;
          const offset = distance / STEPS;

          const interval = setInterval(() => {
            const matrix = new Matrix4();

            matrix.makeTranslation(0, 0, offset);
            cubie.position.applyMatrix4(matrix); // center

            if (++count === STEPS) {
              clearInterval(interval);
            }

          }, duration / STEPS)
        });
      })
      const rotated = Array.from({
          length: 8,
        },
        (_, i) => [front, back].map(r => r[i])
      ).flat()

      return [...rotated];
    })
  }

  return (
    <div style={{display: "flex", justifyContent: "center", backgroundColor: "#444444"}}>
      <div style={{height: "calc(100vh - 64px)", width: "100vw", position: "relative"}}>
        <div style={{
          position: "absolute",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          bottom: 8,
          zIndex: 1
        }}>
          <button onClick={() => restackLong()}>Long Restack</button>
          <button onClick={() => restackShort()}>Short Restack</button>
        </div>
        <Canvas camera={{position: new Vector3(-5, 5, 5)}}>
          <ambientLight intensity={Math.PI/2}/>

          {(["L", "R"] as Exclude<CellOrientation, null>[]).map((cell, i) => {
            return (["F", "B", "U", "D", "I", "O"] as Exclude<SlabOrientation, null>[]).map((slab, j) => (
              <SlabController
                ref={el => controllerRef.current[i * 6 + j] = el}
                key={cell + slab}
                position={controllerPosition[i * 6 + j]}
                scale={new Vector3(
                  (slab === "I" || slab === "O" ? 0.1 : 3.75),
                  (slab === "U" || slab === "D" ? 0.1 : 3.75),
                  (slab === "F" || slab === "B" ? 0.1 : 3.75),
                )}
                onHover={() => setHovered(cell, slab)}
                onExit={() => setHovered(null, null)}
                onClick={() => handleRotation(new Vector3(
                  (slab === "I" || slab === "O" ? 1 : 0),
                  (slab === "U" ? 1 : slab === "D" ? -1 : 0),
                  (slab === "F" ? 1 : slab === "B" ? -1 : 0),
                ).multiplyScalar((slab === "O" && cell === "L") || (slab === "I" && cell === "R") ? -1 : 1))}
                onContextMenu={() => handleRotation(new Vector3(
                  (slab === "I" || slab === "O" ? 1 : 0),
                  (slab === "U" ? 1 : slab === "D" ? -1 : 0),
                  (slab === "F" ? 1 : slab === "B" ? -1 : 0),
                ).multiplyScalar((slab === "O" && cell === "L") || (slab === "I" && cell === "R") ? 1 : -1))}
              />
            ))
          })}

          {Array.from(Array(4).keys()).map(x => {
            return Array.from(Array(2).keys()).map(y => {
              return Array.from(Array(2).keys()).map(z =>
                cubieId(x, y, z))
                .map(id => (
                    <Cubie
                      key={id}
                      ref={el => cubieRef.current[id] = el}
                      position={position[id]}
                      rotation={rotation[id]}
                      id={id}
                      highlighted={selected[id]}
                      colors={[color1, color2, color3, color4, color5, color6, color7, color8]}
                    />
                  )
                )
            })
          })
          }

          <TrackballControls noPan position={new Vector3(7, 5, 0)} rotateSpeed={5} minDistance={7} maxDistance={20}/>
        </Canvas>

      </div>
    </div>
  )
}

export default MelindaCubeScreen