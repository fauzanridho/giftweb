import { TILE } from "../constants";

export interface Point {
  x: number;
  y: number;
}

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

export class GridPathfinder {
  private width: number;
  private height: number;
  private walkable: boolean[][];

  constructor(width: number, height: number, walkableGrid?: boolean[][]) {
    this.width = width;
    this.height = height;
    this.walkable =
      walkableGrid ||
      Array.from({ length: height }, () => Array(width).fill(true));
  }

  setWalkable(tileX: number, tileY: number, isWalkable: boolean) {
    if (tileX >= 0 && tileX < this.width && tileY >= 0 && tileY < this.height) {
      this.walkable[tileY][tileX] = isWalkable;
    }
  }

  isTileWalkable(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
      return false;
    }
    return this.walkable[tileY][tileX];
  }

  /**
   * Menemukan jalur terpendek dari start ke end (koordinat tile grid).
   * Menghasilkan array waypoint posisi piksel dunia.
   */
  findPath(startTile: Point, endTile: Point): Point[] {
    const startX = Math.floor(startTile.x);
    const startY = Math.floor(startTile.y);
    let targetX = Math.floor(endTile.x);
    let targetY = Math.floor(endTile.y);

    // Jika tile tujuan solid, cari tetangga terdekat yang bisa dilewati
    if (!this.isTileWalkable(targetX, targetY)) {
      const neighbors = [
        { x: targetX, y: targetY + 1 },
        { x: targetX, y: targetY - 1 },
        { x: targetX + 1, y: targetY },
        { x: targetX - 1, y: targetY },
      ];
      const validNeighbor = neighbors.find((n) => this.isTileWalkable(n.x, n.y));
      if (validNeighbor) {
        targetX = validNeighbor.x;
        targetY = validNeighbor.y;
      } else {
        return [];
      }
    }

    if (startX === targetX && startY === targetY) {
      return [];
    }

    const openList: Node[] = [];
    const closedList: boolean[][] = Array.from({ length: this.height }, () =>
      Array(this.width).fill(false)
    );

    const startNode: Node = {
      x: startX,
      y: startY,
      g: 0,
      h: Math.abs(targetX - startX) + Math.abs(targetY - startY),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    const dirs = [
      { x: 0, y: -1 }, // Atas
      { x: 0, y: 1 },  // Bawah
      { x: -1, y: 0 }, // Kiri
      { x: 1, y: 0 },  // Kanan
    ];

    while (openList.length > 0) {
      // Ambil node dengan f terkecil
      let lowestIdx = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[lowestIdx].f) {
          lowestIdx = i;
        }
      }
      const current = openList.splice(lowestIdx, 1)[0];

      // Sampai tujuan!
      if (current.x === targetX && current.y === targetY) {
        const path: Point[] = [];
        let curr: Node | null = current;
        while (curr) {
          // Titik pusat tile di koordinat pixel dunia
          path.unshift({
            x: curr.x * TILE + TILE / 2,
            y: curr.y * TILE + TILE / 2,
          });
          curr = curr.parent;
        }
        // Buang node awal (karena pemain sudah ada di sana)
        path.shift();
        return path;
      }

      closedList[current.y][current.x] = true;

      for (const d of dirs) {
        const nx = current.x + d.x;
        const ny = current.y + d.y;

        if (!this.isTileWalkable(nx, ny) || closedList[ny][nx]) {
          continue;
        }

        const gScore = current.g + 1;
        let neighbor = openList.find((n) => n.x === nx && n.y === ny);

        if (!neighbor) {
          const h = Math.abs(targetX - nx) + Math.abs(targetY - ny);
          neighbor = {
            x: nx,
            y: ny,
            g: gScore,
            h,
            f: gScore + h,
            parent: current,
          };
          openList.push(neighbor);
        } else if (gScore < neighbor.g) {
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
        }
      }
    }

    return []; // Tidak ditemukan rute
  }
}

