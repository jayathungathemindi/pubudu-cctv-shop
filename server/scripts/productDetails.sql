-- Adds product description and specifications (Capacity, Color, Weight ...)
USE ElectricShop;
GO

IF COL_LENGTH('Products', 'Description') IS NULL
    ALTER TABLE Products ADD Description NVARCHAR(MAX) NULL;
GO

IF OBJECT_ID('ProductSpecs') IS NULL
BEGIN
    CREATE TABLE ProductSpecs (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ProductId INT NOT NULL
            REFERENCES Products(Id) ON DELETE CASCADE,
        Label NVARCHAR(100) NOT NULL,   -- e.g. Capacity
        Value NVARCHAR(1000) NOT NULL,  -- e.g. 1.6 Liters
        SortOrder INT NOT NULL DEFAULT 0
    );
    CREATE INDEX IX_ProductSpecs_ProductId ON ProductSpecs(ProductId);
END
GO
