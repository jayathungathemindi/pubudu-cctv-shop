-- Lets a product have more than one image (main image + extra photos)
USE ElectricShop;
GO

IF OBJECT_ID('ProductImages') IS NULL
BEGIN
    CREATE TABLE ProductImages (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ProductId INT NOT NULL
            REFERENCES Products(Id) ON DELETE CASCADE,
        Url NVARCHAR(255) NOT NULL,     -- e.g. /images/samsung-tv-side.jpg
        SortOrder INT NOT NULL DEFAULT 0 -- 0 = main image
    );
    CREATE INDEX IX_ProductImages_ProductId ON ProductImages(ProductId);
END
GO

-- Copy each product's current image in as its main image
INSERT INTO ProductImages (ProductId, Url, SortOrder)
SELECT p.Id, p.Image, 0
FROM Products p
WHERE p.Image IS NOT NULL AND p.Image <> ''
  AND NOT EXISTS (SELECT 1 FROM ProductImages i WHERE i.ProductId = p.Id);
GO
