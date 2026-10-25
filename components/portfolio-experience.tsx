"use client";

import * as THREE from "three";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import BookReader from "@/components/book-reader";
import { BOOKS } from "@/lib/portfolio-data";

// Almanac theme colors (OKLCH)
const PAPER = 0xd6d3cc;         // oklch(84% 0.012 245) — cool slate stock
const PAPER_2 = 0xcecbd3;       // oklch(81% 0.012 245)
const PAPER_3 = 0xc4c0cb;       // oklch(77% 0.012 245)
const INK = 0x292430;           // oklch(16% 0.020 245) — blue-black ink
const INK_2 = 0x3d3545;         // oklch(24% 0.018 245)
const MUTE = 0x60596e;          // oklch(38% 0.016 245)
const RULE = 0xbab3c7;          // oklch(73% 0.013 240)
const RULE_2 = 0x524a6b;        // oklch(32% 0.018 240)
const MAGENTA = 0x8c3a6b;       // oklch(45% 0.180 350) — chart magenta
const MAGENTA_DEEP = 0x703058;  // oklch(37% 0.160 350)
const SHEET = 0xeeedf3;         // oklch(93.5% 0.008 245) — pale printed sheet

const BOOK_WIDTH = 3.3;
const BOOK_DEPTH = 2.3;
const X_OFFSETS = [0.1, -0.15, 0.18, -0.08, 0.12];
const ROTATIONS = [0.03, -0.04, 0.05, -0.02, 0.04];

type SceneActions = {
  closeBook: () => void;
};

export default function PortfolioExperience() {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sceneActionsRef = useRef<SceneActions>({ closeBook: () => undefined });
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [readerVisible, setReaderVisible] = useState(false);
  const [photo, setPhoto] = useState("");
  const [hintVisible, setHintVisible] = useState(true);

  const choosePhoto = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const closeReader = useCallback(() => {
    sceneActionsRef.current.closeBook();
  }, []);

  const handlePhotoChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
    event.currentTarget.value = "";
  }, []);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "portfolio-canvas";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.6, 13);
    camera.lookAt(0, 0, 0);

    // Neutral, editorial lighting — no warm brass tint
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
    keyLight.position.set(4, 8, 7);
    keyLight.castShadow = true;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-4, 4, -6);
    scene.add(fillLight);

    const bookStack = new THREE.Group();
    scene.add(bookStack);

    function createSpineTexture(book: (typeof BOOKS)[number]): THREE.CanvasTexture {
      const width = 640;
      const height = 128;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return new THREE.CanvasTexture(canvas);

      // Cover color as background
      context.fillStyle = `#${new THREE.Color(book.color).getHexString()}`;
      context.fillRect(0, 0, width, height);

      // Hairline rules (ink color)
      context.fillStyle = `#${new THREE.Color(INK).getHexString()}`;
      [26, 34, width - 36, width - 28].forEach((x) => context.fillRect(x, 0, 3, height));
      context.fillRect(0, 10, width, 2);
      context.fillRect(0, height - 12, width, 2);

      // Title in Hanken Grotesk (display weight, sentence case)
      context.textBaseline = "middle";
      context.font = '600 54px "Hanken Grotesk", sans-serif';
      context.fillStyle = `#${new THREE.Color(INK).getHexString()}`;
      context.fillText(book.title, 70, height / 2 + 2);

      // Subtitle in Newsreader (agate size)
      context.font = '500 22px "Newsreader", serif';
      context.textAlign = "right";
      context.fillStyle = `#${new THREE.Color(MAGENTA).getHexString()}`;
      context.fillText(book.subtitle, width - 70, height / 2 + 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 8;
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    function createCoverTexture(color: THREE.Color): THREE.CanvasTexture {
      const w = 1024, h = 1024;
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const g = canvas.getContext("2d")!;

      g.fillStyle = `#${color.getHexString()}`;
      g.fillRect(0, 0, w, h);

      // Subtle cool slate fiber texture
      const imgData = g.createImageData(w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 3;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        data[i + 3] = 255;
      }
      g.putImageData(imgData, 0, 0);

const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      tex.anisotropy = 8;
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    function createBook(book: (typeof BOOKS)[number], index: number) {
      const group = new THREE.Group();
      const height = book.height;
      const coverColor = new THREE.Color(book.color);

      const coverMaterial = new THREE.MeshStandardMaterial({
        color: coverColor,
        roughness: 0.85,
        metalness: 0.02,
        map: createCoverTexture(coverColor),
      });

      const pageMaterial = new THREE.MeshStandardMaterial({
        color: SHEET,
        roughness: 0.95,
        metalness: 0,
        side: THREE.DoubleSide,
      });

      const spineMaterial = new THREE.MeshStandardMaterial({
        map: createSpineTexture(book),
        roughness: 0.5,
        metalness: 0.02,
      });

      const endpaperMaterial = new THREE.MeshStandardMaterial({
        color: PAPER_2,
        roughness: 0.9,
        metalness: 0,
      });

      const addMesh = (
        parent: THREE.Group,
        geometry: THREE.BufferGeometry,
        material: THREE.Material | THREE.Material[],
        x: number,
        y: number,
        z: number,
      ) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
      };

      // Main book block (covers) - no dark edge strips
      addMesh(
        group,
        new THREE.BoxGeometry(BOOK_WIDTH, height, 0.08),
        [coverMaterial, coverMaterial, coverMaterial, coverMaterial, spineMaterial, coverMaterial],
        0,
        0,
        BOOK_DEPTH / 2 - 0.04,
      );
      // Bottom board
      addMesh(group, new THREE.BoxGeometry(BOOK_WIDTH, 0.05, BOOK_DEPTH), coverMaterial, 0, -height / 2 + 0.025, 0);
      // Page block
      addMesh(
        group,
        new THREE.BoxGeometry(BOOK_WIDTH - 0.14, height - 0.1, BOOK_DEPTH - 0.12),
        pageMaterial,
        0,
        0,
        -0.05,
      );

      const cover = new THREE.Group();
      cover.position.set(0, height / 2 - 0.025, BOOK_DEPTH / 2);
      group.add(cover);
      addMesh(
        cover,
        new THREE.BoxGeometry(BOOK_WIDTH, 0.05, BOOK_DEPTH),
        [coverMaterial, coverMaterial, coverMaterial, endpaperMaterial, coverMaterial, coverMaterial],
        0,
        0,
        -BOOK_DEPTH / 2,
      );

      group.userData = {
        idx: index,
        bx: X_OFFSETS[index],
        br: ROTATIONS[index],
        by: 0,
        cover,
        originalQuaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ROTATIONS[index], 0)),
      };
      return group;
    }

    function buildBookStack() {
      const totalHeight = BOOKS.reduce((sum, book) => sum + book.height, 0);
      let y = -totalHeight / 2;
      BOOKS.forEach((book, index) => {
        const group = createBook(book, index);
        y += book.height / 2;
        group.position.set(X_OFFSETS[index], y, 0);
        group.quaternion.copy(group.userData.originalQuaternion as THREE.Quaternion);
        group.userData.by = y;
        y += book.height / 2;
        bookStack.add(group);
      });

      // Base — cool slate ground
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(2.9, 3.1, 0.3, 64),
        new THREE.MeshStandardMaterial({ color: 0x3a3542, roughness: 0.7 }),
      );
      base.position.y = -totalHeight / 2 - 0.15;
      base.receiveShadow = true;
      bookStack.add(base);

      // Ring — chart magenta signal
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.95, 0.03, 8, 64),
        new THREE.MeshStandardMaterial({ color: MAGENTA, metalness: 0.2, roughness: 0.5 }),
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -totalHeight / 2;
      bookStack.add(ring);
    }

    let rotationY = 0;
    let velocity = 0;
    let dragging = false;
    let movedDistance = 0;
    let lastX = 0;
    let selectedIndex = -1;
    let currentBookIndex = -1;
    let hoveredIndex = -1;
    let elapsed = 0;
    let coverProgress = 0;
    let readerWasShown = false;
    let disposed = false;
    let animationFrame = 0;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const canvas = renderer.domElement;
    const selectedQuaternion = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(-1, 0, 0),
      ),
    );

    function pickBook(event: PointerEvent) {
      pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const intersection = raycaster.intersectObjects(bookStack.children, true)[0];
      if (!intersection) return -1;

      let object: THREE.Object3D | null = intersection.object;
      while (object && object.userData.idx === undefined) object = object.parent;
      return typeof object?.userData.idx === "number" ? (object.userData.idx as number) : -1;
    }

    function openBook(index: number) {
      selectedIndex = currentBookIndex = index;
      readerWasShown = false;
      setSelectedBook(index);
      setReaderVisible(false);
    }

    function closeBook() {
      selectedIndex = -1;
      readerWasShown = false;
      setReaderVisible(false);
      setSelectedBook(null);
    }

    sceneActionsRef.current.closeBook = closeBook;

    function handlePointerDown(event: PointerEvent) {
      if (selectedIndex >= 0) return;
      dragging = true;
      movedDistance = 0;
      lastX = event.clientX;
      velocity = 0;
      canvas.setPointerCapture(event.pointerId);
      setHintVisible(false);
    }

    function handlePointerMove(event: PointerEvent) {
      if (dragging) {
        const deltaX = event.clientX - lastX;
        lastX = event.clientX;
        movedDistance += Math.abs(deltaX);
        rotationY += deltaX * 0.008;
        velocity = deltaX * 0.008;
      } else if (selectedIndex < 0) {
        hoveredIndex = pickBook(event);
        canvas.style.cursor = hoveredIndex >= 0 ? "pointer" : "grab";
      }
    }

    function handlePointerUp(event: PointerEvent) {
      if (!dragging) return;
      dragging = false;
      if (movedDistance < 6) {
        const index = pickBook(event);
        if (index >= 0) openBook(index);
      }
    }

    function handlePointerLeave() {
      if (!dragging) hoveredIndex = -1;
    }

    function resizeRenderer() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }

    const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

    function renderFrame() {
      if (disposed) return;
      animationFrame = window.requestAnimationFrame(renderFrame);
      elapsed += 0.016;

      const scale = camera.aspect < 1 ? Math.min(1, camera.aspect * 1.3) : 1;
      bookStack.scale.setScalar(lerp(bookStack.scale.x, scale, 0.1));

      if (!dragging) {
        rotationY += velocity;
        velocity *= 0.94;
        if (Math.abs(velocity) < 0.003 || selectedIndex >= 0) {
          const home = Math.round(rotationY / (Math.PI * 2)) * Math.PI * 2;
          rotationY = lerp(
            rotationY,
            home + ((reducedMotion || selectedIndex >= 0) ? 0 : Math.sin(elapsed * 0.6) * 0.12),
            0.05,
          );
        }
      }

      bookStack.rotation.y = rotationY;
      const targetZ = 4.5 / scale;

      bookStack.children.forEach((child) => {
        const userData = child.userData;
        if (userData.idx === undefined) return;

        const index = userData.idx as number;
        const active = index === currentBookIndex && (selectedIndex >= 0 || coverProgress > 0.03);
        let targetPosition: [number, number, number];
        if (active) {
          targetPosition = [coverProgress * 1.15, 0, targetZ];
          if (selectedIndex >= 0 && child.position.z > targetZ - 0.4) {
            coverProgress = Math.min(1, coverProgress + 0.022);
          } else if (selectedIndex < 0) {
            coverProgress = Math.max(0, coverProgress - 0.05);
          }
          (userData.cover as THREE.Group).rotation.x = coverProgress * 3;
        } else {
          targetPosition = [userData.bx as number, userData.by as number, index === hoveredIndex ? 0.3 : 0];
        }

        child.position.x = lerp(child.position.x, targetPosition[0], 0.1);
        child.position.y = lerp(child.position.y, targetPosition[1], 0.1);
        child.position.z = lerp(child.position.z, targetPosition[2], 0.1);
        child.quaternion.slerp(
          active ? selectedQuaternion : (userData.originalQuaternion as THREE.Quaternion),
          0.1,
        );
      });

      if (selectedIndex >= 0 && coverProgress >= 0.97 && !readerWasShown) {
        readerWasShown = true;
        setReaderVisible(true);
      }

      renderer.render(scene, camera);
    }

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", resizeRenderer);

    resizeRenderer();
    const start = async () => {
      if ("fonts" in document) {
        await Promise.race([
          document.fonts.load('700 54px "Zilla Slab"'),
          new Promise<void>((resolve) => window.setTimeout(resolve, 1500)),
        ]).catch(() => undefined);
      }
      if (disposed) return;
      buildBookStack();
      renderFrame();
    };
    void start();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", resizeRenderer);
      sceneActionsRef.current.closeBook = () => undefined;

      bookStack.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if ("map" in material && material.map instanceof THREE.Texture) material.map.dispose();
            material.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <main>
      <div className="canvas-host" ref={canvasHostRef} aria-label="Interactive 3D book stack" />
      <header className="site-header">
        <h1>Nishchay Sinha</h1>
        <p>Software engineer. Pull a book from the stack.</p>
      </header>
      <div className="interaction-hint" style={{ opacity: hintVisible ? 1 : 0 }}>
        Drag to turn the stack. Click a book to open it.
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handlePhotoChange}
        aria-label="Choose a profile photo"
      />
      {selectedBook !== null ? (
        <BookReader
          key={selectedBook}
          bookIndex={selectedBook}
          photo={photo}
          visible={readerVisible}
          onClose={closeReader}
          onChoosePhoto={choosePhoto}
        />
      ) : null}
    </main>
  );
}