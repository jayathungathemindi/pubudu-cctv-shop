-- Lets a product have a sub-category, e.g. Kitchen Appliances → Kettle
USE ElectricShop;
GO

IF COL_LENGTH('Products', 'SubCategory') IS NULL
    ALTER TABLE Products ADD SubCategory NVARCHAR(100) NULL;
GO
