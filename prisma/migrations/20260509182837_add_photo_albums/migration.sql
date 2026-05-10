-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "images" TEXT NOT NULL DEFAULT '[]',
    "photoAlbums" TEXT NOT NULL DEFAULT '[]',
    "ownerId" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "stripeSessionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "avgRating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Shop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Shop" ("address", "avgRating", "category", "city", "country", "createdAt", "description", "id", "images", "instagram", "isPaid", "lat", "lng", "name", "ownerId", "phone", "reviewCount", "stripeSessionId", "updatedAt", "website") SELECT "address", "avgRating", "category", "city", "country", "createdAt", "description", "id", "images", "instagram", "isPaid", "lat", "lng", "name", "ownerId", "phone", "reviewCount", "stripeSessionId", "updatedAt", "website" FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
